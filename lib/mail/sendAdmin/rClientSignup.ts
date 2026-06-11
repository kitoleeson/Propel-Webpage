/** @format */

import { ClientFormValues, GuardianClientFormValues, StudentClientFormValues, TutorClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { sendEmail } from "..";
import Mail from "nodemailer/lib/mailer";

export default async function sendAdminClientSignupReviewEmail(data: ClientFormValues) {
	const student_section = {
		title: "Student",
		fields: {
			gov_first_name: "First Name",
			gov_last_name: "Last Name",
			pref_name: "Preferred Name",
			email: "Email",
			phone: "Phone",
			pref_communication: "Preferred Communication",
			city: "City",
			grade: "Grade",
			how_found_us: "How Found Us",
			biller: "Biller",
		},
	};

	const guardian_section = {
		title: "Guardian",
		fields: {
			gov_first_name: "First Name",
			gov_last_name: "Last Name",
			pref_name: "Preferred Name",
			email: "Email",
			phone: "Phone",
			pref_communication: "Preferred Communication",
			relationship: "Relationship to Student",
			is_primary_biller: "Primary Biller?",
			already_exists: "Already Exists?",
		},
	};

	const tutor_section = {
		title: "Tutors",
		fields: {
			first_choice: "First Choice",
			second_choice: "Second Choice",
			notes: "Notes",
		},
	};

	const other_section = {
		title: "Other",
		fields: {
			primary_biller_index: "Primary Biller Index",
			comments: "Additional Comments",
		},
	};

	let tableContent = "";
	tableContent += `
		<tr>
			<td colspan="2" style="padding: 15px 8px 5px 8px; font-size: 14px; color: #1eb9c2; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #1eb9c2;">
				${student_section.title}
			</td>
		</tr>
	`;

	Object.entries(student_section.fields).forEach(([key, label]) => {
		const value = data.student[key as keyof StudentClientFormValues];
		const displayValue = value !== undefined && value !== null && value !== "" ? value : "—";
		tableContent += `
			<tr>
				<td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; font-size: 13px;">${label}</td>
				<td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 13px;">${displayValue}</td>
			</tr>
		`;
	});

	data.guardians.forEach((guardian, i) => {
		tableContent += `
			<tr>
				<td colspan="2" style="padding: 15px 8px 5px 8px; font-size: 14px; color: #1eb9c2; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #1eb9c2;">
					${guardian_section.title} ${i + 1}
				</td>
			</tr>
		`;

		Object.entries(guardian_section.fields).forEach(([key, label]) => {
			const value = guardian[key as keyof GuardianClientFormValues];
			const displayValue = value !== undefined && value !== null && value !== "" ? value : "—";
			tableContent += `
				<tr>
					<td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; font-size: 13px;">${label}</td>
					<td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 13px;">${displayValue}</td>
				</tr>
			`;
		});
	});

	tableContent += `
		<tr>
			<td colspan="2" style="padding: 15px 8px 5px 8px; font-size: 14px; color: #1eb9c2; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #1eb9c2;">
				${tutor_section.title}
			</td>
		</tr>
	`;

	Object.entries(tutor_section.fields).forEach(([key, label]) => {
		const value = data.tutors[key as keyof TutorClientFormValues];
		const displayValue = value !== undefined && value !== null && value !== "" ? value : "—";
		tableContent += `
			<tr>
				<td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; font-size: 13px;">${label}</td>
				<td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 13px;">${displayValue}</td>
			</tr>
		`;
	});

	tableContent += `
		<tr>
			<td colspan="2" style="padding: 15px 8px 5px 8px; font-size: 14px; color: #1eb9c2; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #1eb9c2;">
				${other_section.title}
			</td>
		</tr>
	`;

	Object.entries(other_section.fields).forEach(([key, label]) => {
		const value = data[key as keyof ClientFormValues];
		const displayValue = value !== undefined && value !== null && value !== "" ? value : "—";
		tableContent += `
			<tr>
				<td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; font-size: 13px;">${label}</td>
				<td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 13px;">${displayValue}</td>
			</tr>
		`;
	});

	const test = process.env.APP_ENV != "prod";
	const options: Mail.Options = {
		from: `"Propel System" <${test ? process.env.TEST_SMTP_USER : process.env.SMTP_USER}>`,
		to: process.env.ADMIN_EMAIL,
		subject: `New Client Signup: ${data.student.gov_first_name} ${data.student.gov_last_name}`,
		html: `
         <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #1eb9c2; color: white; padding: 20px; text-align: center;">
               <h1 style="margin: 0; font-size: 20px;">Student Profile Review</h1>
            </div>
            <div style="padding: 20px;">
               <table style="width: 100%; border-collapse: collapse;">
                  ${tableContent}
               </table>
            </div>
         </div>
      `,
		attachments: [{ filename: `${data.student.gov_first_name}_${data.student.gov_last_name}-client_signup_form.json`, content: JSON.stringify(data, null, 2), contentType: "application/json" }],
	};

	return sendEmail(options);
}
