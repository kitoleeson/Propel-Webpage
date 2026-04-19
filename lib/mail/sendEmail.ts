/** @format */
import nodemailer from "nodemailer";
import { parseSubjects } from "@/lib/db/tutor";

export async function sendAdminApprovalPendingTutorEmail(pending_tutor_id: number, data: any) {
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

	const baseUrl = test ? "http://localhost:3000/api" : "https://api.propeltutoring.ca";
	const approveUrl = `${baseUrl}/approve?id=${pending_tutor_id}`;
	const insertion = data.tutor_id === -1;

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
			const value = data[key];
			const displayValue = value !== undefined && value !== null && value !== "" ? value : "—";
			tableContent += `
            <tr>
               <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; font-size: 13px;">${label}</td>
               <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 13px;">${displayValue}</td>
            </tr>
			`;
		});
	});
	const subjects = data.subjects_json || data.subjects;
	tableContent += `
      <tr>
         <td colspan="2" style="padding: 15px 8px 5px 8px; font-size: 14px; color: #1eb9c2; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #1eb9c2;">Teaching Subjects</td>
      </tr>
      <tr>
         <td colspan="2" style="padding: 12px 8px; background: #f0f7ff; font-size: 14px;">${parseSubjects(subjects)}</td>
      </tr>
	`;

	const mailOptions = {
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

	return transporter.sendMail(mailOptions);
}
