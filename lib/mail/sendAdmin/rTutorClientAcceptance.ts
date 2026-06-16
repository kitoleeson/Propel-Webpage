/** @format */

import { sendEmail } from "..";
import Mail from "nodemailer/lib/mailer";
import { ClientAgreementEmailData } from "../sendClient/clientAgreement";
import { DBTypes } from "@/lib/db/dbtypes";

export default async function sendAdminTutorClientAcceptanceReviewEmail(data: ClientAgreementEmailData & { tutor: DBTypes.Tutors }) {
	const formatValue = (value?: string) => (value == undefined || value == null || value == "" ? "-" : value);

	type TableRow = { label: string; value?: string };
	type TableSection = { title: string; rows: TableRow[] };

	const sections: TableSection[] = [
		{
			title: "Student",
			rows: [
				{ label: "Name", value: data.student.gov_first_name + (data.student.pref_name ? `(${data.student.pref_name})` : "") + data.student.gov_last_name },
				{ label: "City", value: data.student.city },
				{ label: "Grade", value: data.student.grade?.toString() },
			],
		},
		{
			title: "Tutor",
			rows: [
				{ label: "Name", value: data.tutor.pref_name + data.tutor.gov_last_name },
				{ label: "New Accepting Students", value: data.tutor.accepting_students.toString() },
			],
		},
		{
			title: "Details",
			rows: [
				{ label: "Hourly Rate", value: data.student_tutor.hourly_rate.toString() },
				{ label: "Subjects", value: data.student_tutor.subjects },
				{ label: "Markup", value: data.student_tutor.markup.toString() },
			],
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

		section.rows.forEach((row) => {
			tableContent += `
            <tr>
               <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; font-size: 13px;">${row.label}</td>
               <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 13px;">${formatValue(row.value)}</td>
            </tr>
         `;
		});
	});

	const test = process.env.APP_ENV != "prod";
	const options: Mail.Options = {
		from: `"Propel System" <${test ? process.env.TEST_SMTP_USER : process.env.SMTP_USER}>`,
		to: process.env.ADMIN_EMAIL,
		subject: `New Student-Tutor Pairing: ${data.student.gov_first_name} ${data.student.gov_last_name}`,
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
