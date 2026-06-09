/** @format */
import nodemailer from "nodemailer";
import parseSubjects from "../db/subjects";
import { ClientFormValues, GuardianClientFormValues, StudentClientFormValues, TutorClientFormValues } from "../validation/clientForm/clientFormSchema";
import { TutorFormValues } from "../validation/tutorForm/tutorFormSchema";

export type emailOptions = {
	from?: string;
	to?: string;
	subject: string;
	html?: string;
};

export async function sendEmail(data: emailOptions) {
	const test = process.env.APP_ENV != "prod";
	const transporter = nodemailer.createTransport({
		host: test ? process.env.TEST_SMTP_HOST : process.env.SMTP_HOST,
		port: Number(test ? process.env.TEST_SMTP_PORT : process.env.SMTP_PORT),
		secure: false,
		auth: {
			user: test ? process.env.TEST_SMTP_USER : process.env.SMTP_USER,
			pass: test ? process.env.TEST_SMTP_PASSWORD : process.env.SMTP_PASSWORD,
		},
	});

	const options = {
		from: data.from || `"Propel System" <${test ? process.env.TEST_SMTP_USER : process.env.SMTP_USER}>`,
		to: data.to || process.env.ADMIN_EMAIL,
		subject: data.subject,
		html: data.html,
	};

	return transporter.sendMail(options);
}

export async function sendAdminApprovalPendingTutorEmail(pending_tutor_id: number, data: TutorFormValues & { tutor_id: number }) {
	const sections = [
		{
			title: "Personal Information",
			fields: {
				gov_first_name: "First Name",
				gov_last_name: "Last Name",
				pref_name: "Preferred Name",
				email: "Email",
				phone: "Phone",
				bio: "Bio",
				hobbies: "Hobbies",
			},
		},
		{
			title: "Tutoring Details",
			fields: {
				date_hired: "Date Hired",
				prior_experience: "Prior Experience",
				current_rate: "Rate ($)",
				accepting_students: "Capacity",
				availability: "Availability",
				in_person: "Tutoring Mode",
				city: "City",
				location: "Location",
			},
		},
		{
			title: "Emergency Contact",
			fields: {
				emerg_contact_name: "Name",
				emerg_contact_phone: "Phone",
				emerg_contact_relationship: "Relationship",
			},
		},
		{
			title: "Post-Secondary History",
			fields: {
				current_uni: "University",
				current_degree: "Degree",
				field_of_study: "Field",
				year_of_study: "Year",
				current_fav_class: "Favourite Class",
				academic_interests: "Interests",
			},
		},
		{
			title: "High School History",
			fields: {
				high_school: "High School",
				high_school_city: "City",
				fav_high_school_class: "Favourite Class",
				ap_ib_credentials: "AP/IB Status",
			},
		},
	];

	let tableContent = "";
	sections.forEach((section) => {
		tableContent += `
         <tr>
            <td colspan="2" style="padding: 15px 8px 5px 8px; font-size: 14px; color: #1eb9c2; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #1eb9c2;">
               ${section.title}
            </td>
         </tr>
		`;

		Object.entries(section.fields).forEach(([key, label]) => {
			const value = data[key as keyof TutorFormValues];
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
         <td colspan="2" style="padding: 15px 8px 5px 8px; font-size: 14px; color: #1eb9c2; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #1eb9c2;">Teaching Subjects</td>
      </tr>
      <tr>
         <td colspan="2" style="padding: 12px 8px; background: #f0f7ff; font-size: 14px;">${parseSubjects(data.subjects)}</td>
      </tr>
	`;

	const test = process.env.APP_ENV != "prod";
	const baseUrl = test ? "http://localhost:3000/api" : process.env.NEXT_PUBLIC_BASE_URL;
	const approveUrl = `${baseUrl}/approve?id=${pending_tutor_id}`;
	const insertion = data.tutor_id === -1;

	const options: emailOptions = {
		from: `"Propel System" <${test ? process.env.TEST_SMTP_USER : process.env.SMTP_USER}>`,
		to: process.env.ADMIN_EMAIL,
		subject: `Pending Tutor Request: [${insertion ? "NEW" : "UPDATE"}] ${data.gov_first_name} ${data.gov_last_name}`,
		html: `
         <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #1eb9c2; color: white; padding: 20px; text-align: center;">
               <h1 style="margin: 0; font-size: 20px;">Tutor Profile Review</h1>
            </div>
            <div style="padding: 20px;">
               <table style="width: 100%; border-collapse: collapse;">
                  ${tableContent}
               </table>
               <div style="margin-top: 30px; text-align: center; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                  <p style="margin-bottom: 20px; font-weight: bold;">Review complete? Push to production:</p>
                  <a href="${approveUrl}" style="display: inline-block; padding: 16px 32px; color: white; background-color: #28a745; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
                     Approve & Finalize Tutor
                  </a>
               </div>
            </div>
         </div>
      `,
	};

	return sendEmail(options);
}

export async function sendAdminClientSignupReviewEmail(data: ClientFormValues) {
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
	const options: emailOptions = {
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
	};

	return sendEmail(options);
}
