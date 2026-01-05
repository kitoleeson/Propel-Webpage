# invoice.py
"""
Orchestrates the generation and sending of student invoices.
"""

# Imports
from datetime import date
import psycopg2
from psycopg2.extras import DictCursor
import os
import logging
from collections import defaultdict
from rich.logging import RichHandler
from rich.progress import Progress, TaskID
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
import subprocess

# Module imports
from helper import format_progress_update
from send_email import send_email

logging.basicConfig(level=logging.INFO, format="%(message)s", handlers=[RichHandler()])
load_dotenv()

# Helper functions
def cleanup_latex_artifacts(directory: Path, keep_exts={".pdf", ".tex"}):
    """
    Cleanup LaTeX artifacts in the specified directory, keeping only files with specified extensions.
    Arguments:
        directory (Path): Directory to clean up
        keep_exts (set): Set of file extensions to keep
    Returns:
        None
    """
    for file in directory.iterdir():
        if file.is_file() and file.suffix not in keep_exts:
            file.unlink()

def find_sessions(biweek_start: date, biweek_end: date):
    """
    Find all sessions in the database within the specified biweekly period.
    Arguments:
        biweek_start (date): The start date of the 2-week billing period.
        biweek_end (date): The end date of the 2-week billing period.
    Returns:
        sessions_by_biller (dict): Session records sorted by biller_id
    """
    query = """
        SELECT
            sb.billing_id,
            st.student_id,
            CASE
                WHEN d.pref_name IS NOT NULL THEN d.gov_first_name || ' (' || d.pref_name || ') ' || d.gov_last_name
                ELSE d.gov_first_name || ' ' || d.gov_last_name
            END AS student_name,
            COALESCE(d.pref_name, d.gov_first_name) AS student_pref_name,
            t.tutor_id,
            COALESCE(t.pref_name, t.gov_first_name) AS tutor_name,
            s.session_date,
            s.duration_hours,
            st.hourly_rate,
            (s.duration_hours * st.hourly_rate) AS total_fee,
            st.subjects
        FROM sessions s
        JOIN student_tutor st ON s.assignment_id = st.assignment_id
        JOIN students d ON st.student_id = d.student_id
        JOIN tutors t ON st.tutor_id = t.tutor_id
        JOIN student_billing sb ON st.student_id = sb.student_id
        WHERE s.session_date >= %s AND s.session_date < %s
        ORDER BY sb.billing_id, s.session_date;
    """
    with psycopg2.connect(os.getenv("DATABASE_URL")) as conn, conn.cursor(cursor_factory=DictCursor) as cursor:
        cursor.execute(query, (biweek_start, biweek_end))
        results = cursor.fetchall()
    sessions_by_biller = defaultdict(list)
    with Progress() as progress:
        session_bar = progress.add_task(format_progress_update("Ingesting sessions from sheets", "cyan"), total=len(results))
        for session in results:
            sessions_by_biller[session['billing_id']].append({
                'student_id': session['student_id'],
                'student_name': session['student_name'],
                'student_pref_name': session['student_pref_name'],
                'subjects': session['subjects'],
                'tutor_id': session['tutor_id'],
                'tutor_name': session['tutor_name'],
                'session_date': session['session_date'],
                'duration_hours': float(session['duration_hours']),
                'hourly_rate': float(session['hourly_rate']),
                'total_fee': float(session['total_fee'])
            })
            progress.update(session_bar, advance=1)
        progress.update(session_bar, description=format_progress_update("All sessions ingested ✓", "green"))
    return sessions_by_biller

def build_invoice(billing_id: int, sessions: list, biweek_start: date, biweek_end: date):
    """
    Build and send invoices based on session data.
    Arguments:
        billing_id (int): The billing ID of the student
        sessions (list): List of session records for the student
    Returns:
        invoice_path (str): Path to the generated invoice file
    """

    # Determine invoice number and current tab
    with psycopg2.connect(os.getenv("DATABASE_URL"), cursor_factory=DictCursor) as conn, conn.cursor() as cursor:
        cursor.execute("""SELECT invoice_id FROM invoices ORDER BY invoice_id DESC LIMIT 1""")
        result = cursor.fetchone()
        invoice_number = int(result[0]) + 1 if result else 1
        query = """
            SELECT COALESCE(SUM(s.duration_hours * st.hourly_rate), 0) - COALESCE(SUM(p.amount), 0) AS current_tab
            FROM student_billing sb
            JOIN student_tutor st ON sb.student_id = st.student_id
            JOIN sessions s ON st.assignment_id = s.assignment_id
            LEFT JOIN payments p ON sb.billing_id = p.billing_id
            WHERE sb.billing_id = %s AND s.session_date < %s
            GROUP BY sb.billing_id;
        """
        cursor.execute(query, (billing_id, biweek_start))
        result = cursor.fetchone()
        current_tab = float(result[0]) if result else 0.0

    # Prepare invoice data
    invoice_data = {
        "invoice_number": invoice_number,
        "invoice_date": date.today().strftime("%B %d, %Y"),
        "biweek": f"{biweek_start.strftime('%b %d')} - {biweek_end.strftime('%b %d, %Y')}",
        "billing_id": billing_id,
        "student_name": ", ".join(sorted({session['student_name'] for session in sessions})),
        "subjects_list": ", ".join(sorted({session['subjects'] for session in sessions})),
        "sessions": sessions,
        "current_tab": current_tab,
        "propel_email": os.getenv("PROPEL_EMAIL"),
        "propel_phone": os.getenv("PROPEL_PHONE"),
    }

    # Render LaTeX template
    env = Environment(
        loader=FileSystemLoader(Path(__file__).parent / "latex_templates"),
        autoescape=False
    )
    template = env.get_template("invoice.j2")

    # Generate PDF
    output_path = Path(f"invoices/{os.getenv('CURRENT_SEMESTER')}/INV-{invoice_number:04}-{billing_id:02}.pdf")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Render and compile LaTeX
    rendered_tex = template.render(**invoice_data)
    tex_path = output_path.with_suffix(".tex")
    with open(tex_path, "w") as f:
        f.write(rendered_tex)
    subprocess.run(["pdflatex", "-interaction=batchmode", "-output-directory", str(output_path.parent), str(tex_path)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    cleanup_latex_artifacts(output_path.parent)

    return str(output_path.with_suffix(".pdf"))

def send_invoice(billing_id: int, invoice_path: str, biweek_start: date, biweek_end: date):
    """
    Send the generated invoice via email.
    Arguments:
        billing_id (int): The billing ID of the student
        invoice_path (str): Path to the generated invoice file
        biweek_start (date): The start date of the 2-week billing period.
        biweek_end (date): The end date of the 2-week billing period.
    Returns:
        None
    """
    with psycopg2.connect(os.getenv("DATABASE_URL"), cursor_factory=DictCursor) as conn, conn.cursor() as cursor:
        query = """
            SELECT email, display_name, first_invoice
            FROM billing_accounts
            WHERE billing_id = %s
        """
        cursor.execute(query, (billing_id,))
        result = cursor.fetchone()
        if not result:
            logging.error(f"No biller found for billing ID: {billing_id}. Cannot send invoice.")
            return
        email, name, first_invoice = result['email'], result['display_name'], result['first_invoice']

    if first_invoice:
        if email in os.getenv("KNOWN_EMAILS").split(", "):
            body = f"Hi {name},|I'd like to welcome you to Propel Tutoring, the expansion of my tutoring business.|For Propel, I have updated my invoicing system to handle more tutors and upgrade to a full database backend. For you, not very much changes compared to our current invoicing system:\n• Invoices are still sent biweekly directly to your email.\n• Payment is still due within 10 days from the day you receive the invoice.\n• All fees can still be paid via e-transfer to the email and phone number listed on each invoice. Please include the invoice number in the message.\nPlease do note, however, that the email for e-transfer has been changed -- I am now using the official Propel Tutoring email (propeltutoringyeg@gmail.com), so please direct your e-transfers to that address.|All future sessions are still billed in increments of 15 mins, rounded up or down to the nearest 0.25 hours; and no matter if you continue tutoring with me, another one of my tutors, or both, hourly rates per tutor remain locked in forever once set. More information on our billing policies can be found in the client agreement which you should have already signed gotten an email about.|Please find attached your first Propel Tutoring invoice, for {biweek_start.strftime('%B %d')} (inclusive) to {biweek_end.strftime('%B %d, %Y')} (exclusive).|Please feel free to reach out if you have any questions or concerns regarding invoices, payments, or scheduling. I'm here to help!\nAs always, I appreciate your continued trust and support, and I'm excited to see the progress we will achieve in this coming semester!|Kito Lee Son"
        else:
            body = f"Hello {name},|I'd like to welcome you to Propel Tutoring.|We use an automated invoicing system to keep our billing simple and consistent, and to make it easier for you to keep track of your tutoring expenses. Here's what to expect going forward:\n• Invoices are sent biweekly directly to your email, each covering a 2-week period of tutoring sessions.\n• Payment is due within 10 days from the day you receive the invoice.\n• All fees can be paid via e-transfer to the email and phone number listed on each invoice. Please include the invoice number in the message.|I'd also like to inform/remind you that my sessions are billed in increments of 15 mins, rounded up or down to the nearest 0.25 hours; and that once set, hourly rates per tutor are locked in forever. More information on our billing policies can be found in the client agreement which you have already signed.|Please find attached your first tutoring invoice for the semester, for {biweek_start.strftime('%B %d')} (inclusive) to {biweek_end.strftime('%B %d, %Y')} (exclusive).|Please feel free to reach out if you have any questions or concerns regarding invoices, payments, or scheduling. I'm here to help!\nI appreciate your trust and support, and I'm excited to see the progress this semester will bring!|Kito Lee Son"
    else:
        body = f"Hello {name},|Please find attached your tutoring invoice for the period of {biweek_start.strftime('%B %d')} (inclusive) to {biweek_end.strftime('%B %d, %Y')} (exclusive).|If you have any questions or concerns regarding invoices, payments, or scheduling, please feel free to reach out. I'm here to help!|Kito Lee Son"

    options = {
        "subject": f"Propel Tutoring Invoice",
        "from": os.getenv("PROPEL_EMAIL"),
        "to": email,
        "body": body.replace("|", "\n\n"),
        "attachments": [invoice_path]
    }
    send_email(options)

def generate_and_send_tutor_payroll(sessions_by_biller: dict, biweek_start: date, biweek_end: date, progress: Progress, payroll_bar: TaskID):
    """
    Generate and send tutor payroll summaries for the specified biweekly period.
    Arguments:
        sessions_by_biller (dict): Session records sorted by billing_id
        biweek_start (date): The start date of the 2-week billing period.
        biweek_end (date): The end date of the 2-week billing period.
        progress (Progress): Rich Progress instance for updating progress bars
        payroll_bar (TaskID): Specific progress bar for payroll generation
    Returns:
        None
    """
    # Generate tutor payroll summaries
    progress.update(payroll_bar, description=format_progress_update(f"Gathering payroll data", "yellow"))
    # Build tutor payroll data
    sessions_by_tutor = defaultdict(list)
    for session_list in sessions_by_biller.values():
        for session in session_list:
            sessions_by_tutor[session['tutor_id']].append(session)
    tutors = []
    for tutor_id, sessions in sessions_by_tutor.items():
        tutors.append({
            "tutor_id": tutor_id,
            "pref_name": sessions[0]['tutor_name'],
            "num_sessions": len(sessions),
            "num_hours": sum(session['duration_hours'] for session in sessions),
            "num_students": len(set(session['student_id'] for session in sessions)),
            "total_earned": sum(session['total_fee'] for session in sessions)
        })
    
    # Determine payroll number
    with psycopg2.connect(os.getenv("DATABASE_URL"), cursor_factory=DictCursor) as conn, conn.cursor() as cursor:
        cursor.execute("""SELECT payroll_id FROM payroll ORDER BY payroll_id DESC LIMIT 1""")
        result = cursor.fetchone()
        payroll_number = int(result[0]) + 1 if result else 1

    # Prepare payroll data
    payroll_data = {
        "payroll_number": payroll_number,
        "payroll_date": date.today().strftime("%B %d, %Y"),
        "biweek": f"{biweek_start.strftime('%b %d')} - {biweek_end.strftime('%b %d, %Y')}",
        "tutors": sorted(tutors, key=lambda t: t['tutor_id'])
    }

    progress.update(payroll_bar, advance=1, description=format_progress_update(f"Generating payroll summary", "yellow"))
    # Render LaTeX template
    env = Environment(
        loader=FileSystemLoader(Path(__file__).parent / "latex_templates"),
        autoescape=False
    )
    template = env.get_template("payroll.j2")

    # Generate PDF
    output_path = Path(f"payroll/{os.getenv('CURRENT_SEMESTER')}/PAY-{payroll_number:04}.pdf")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Render and compile LaTeX
    rendered_tex = template.render(**payroll_data)
    tex_path = output_path.with_suffix(".tex")
    with open(tex_path, "w") as f:
        f.write(rendered_tex)
    subprocess.run(["pdflatex", "-interaction=batchmode", "-output-directory", str(output_path.parent), str(tex_path)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    cleanup_latex_artifacts(output_path.parent)
    progress.update(payroll_bar, advance=1, description=format_progress_update(f"Sending email", "yellow"))

    # Send email
    options = {
        "subject": f"Payroll Summary - PAY-{payroll_number:04}",
        "from": os.getenv("PROPEL_EMAIL"),
        "to": os.getenv("PROPEL_EMAIL"),
        "body": f"Tutor payroll summary for {biweek_start.strftime('%b %d')} to {biweek_end.strftime('%b %d, %Y')}.",
        "attachments": [output_path.with_suffix(".pdf")]
    }
    send_email(options)
    progress.update(payroll_bar, advance=1)

def generate_and_send_invoices(biweek_start: date, biweek_end: date):
    """
    Generate and send student invoices for the specified biweekly period.
    Arguments:
        biweek_start (date): The start date of the 2-week billing period.
        biweek_end (date): The end date of the 2-week billing period.
    Returns:
        None
    """
    # Find sessions
    sessions_by_biller = find_sessions(biweek_start, biweek_end)

    with Progress() as progress:
        # Generate invoices
        invoice_bar = progress.add_task(format_progress_update("Generating and sending invoices", "cyan"), total=len(sessions_by_biller))
        invoices = {}
        for billing_id, session_list in sessions_by_biller.items():
            progress.update(invoice_bar, description=format_progress_update(f"Generating invoice for billing ID: {billing_id}", "yellow"))
            invoices[billing_id] = build_invoice(billing_id, session_list, biweek_start, biweek_end)
            progress.update(invoice_bar, advance=1)
        progress.update(invoice_bar, description=format_progress_update("All invoices generated ✓", "green"))

        # Send invoices
        email_bar = progress.add_task(format_progress_update("Sending invoices", "cyan"), total=len(invoices))
        for billing_id, invoice_path in invoices.items():
            progress.update(email_bar, description=format_progress_update(f"Sending invoice for billing ID: {billing_id}", "yellow"))
            send_invoice(billing_id, invoice_path, biweek_start, biweek_end)
            progress.update(email_bar, advance=1)
        progress.update(email_bar, description=format_progress_update("All invoices sent ✓", "green"))

        # Generate and send tutor payroll summary
        payroll_bar = progress.add_task(format_progress_update("Generating and sending tutor payroll summary", "cyan"), total=3)
        generate_and_send_tutor_payroll(sessions_by_biller, biweek_start, biweek_end, progress, payroll_bar)
        progress.update(payroll_bar, description=format_progress_update("Tutor payroll summary sent ✓", "green"))

        
# ADD DATABASE INSERTIONS FOR INVOICES AND PAYROLLS