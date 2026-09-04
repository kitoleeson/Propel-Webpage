/** @format */

import { compileEmailTable, sendEmail, TableSection } from "..";
import Mail from "nodemailer/lib/mailer";
import { ClientAgreementEmailData } from "../sendClient/clientAgreement";
import { DBTypes } from "@/lib/db/dbtypes";

export default async function sendAdminTutorClientAcceptanceReviewEmail(data: ClientAgreementEmailData & { tutor: DBTypes.Tutors }) {
	const sections: TableSection[] = [
		{
			title: "Student",
			rows: [
				{ label: "Name", value: data.student.gov_first_name + (data.student.pref_name ? ` (${data.student.pref_name}) ` : " ") + data.student.gov_last_name },
				{ label: "City", value: data.student.city },
				{ label: "Grade", value: data.student.grade?.toString() },
			],
		},
		{
			title: "Tutor",
			rows: [
				{ label: "Name", value: (data.tutor.pref_name ?? data.tutor.gov_first_name) + " " + data.tutor.gov_last_name },
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
	const tableContent = compileEmailTable(sections);

	const options: Mail.Options = {
		to: process.env.ADMIN_EMAIL,
		subject: `New Student-Tutor Pairing: ${data.student.gov_first_name} ${data.student.gov_last_name}`,
		html: `
         <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #1eb9c2; color: white; padding: 20px; text-align: center;">
               <h1 style="margin: 0; font-size: 20px;">Student Profile Review</h1>
            </div>
            <div style="padding: 20px;">${tableContent}</div>
         </div>
      `,
	};

	return sendEmail(options);
}
