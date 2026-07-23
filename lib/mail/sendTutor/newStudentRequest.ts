/** @format */

import { sendEmail } from "..";
import Mail from "nodemailer/lib/mailer";
import { DBTypes } from "@/lib/db/dbtypes";

export type NewStudentRequestEmailData = {
	pending_student_tutor: DBTypes.PendingStudentTutorRow;
	student: DBTypes.StudentsRow;
	tutor: DBTypes.TutorsRow;
};

// needs pending_student_tutor information and student information (could be found by pending_student_tutor information)
export default async function sendTutorNewStudentRequestEmail(data: NewStudentRequestEmailData) {
	const formatValue = (value?: string) => (value == undefined || value == null || value == "" ? "-" : value);

	type TableRow = { label: string; value?: string };
	type TableSection = { title: string; rows: TableRow[] };

	const sections: TableSection[] = [
		{
			title: "Personal Information",
			rows: [
				{ label: "Name", value: `${data.student.gov_first_name} ${data.student.pref_name ? `(${data.student.pref_name})` : ""} ${data.student.gov_last_name}` },
				{ label: "Email", value: data.student.email },
				{ label: "Phone", value: data.student.phone },
				{ label: "Preferred Communication", value: data.student.pref_communication },
			],
		},
		{
			title: "Student Information",
			rows: [
				{ label: "City", value: data.student.city },
				{ label: "Grade", value: data.student.grade?.toString() },
				{ label: "Subjects", value: data.pending_student_tutor.subjects },
				{ label: "Ideal Time and Location", value: data.pending_student_tutor.timeandlocation },
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
	const baseUrl = test ? "http://localhost:3000/api" : process.env.NEXT_PUBLIC_BASE_URL;
	const acceptUrl = `${baseUrl}/acceptNewStudent?id=${data.pending_student_tutor.pending_student_tutor_id}`;
	const declineUrl = `${baseUrl}/declineNewStudent?id=${data.pending_student_tutor.pending_student_tutor_id}`;
	const options: Mail.Options = {
		to: data.tutor.email,
		subject: `New Student Request: ${data.student.pref_name ?? data.student.gov_first_name} ${data.student.gov_last_name}`,
		html: `
         <p>Hi ${data.tutor.gov_first_name},</p>
         <br/>
         <p>You have a new student request, please see their information below.</p>
         <p>Feel free to reach out to them personally by their preferred method of communication to get a better sense of availability or fit.</p>
         <br/>
         <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #1eb9c2; color: white; padding: 20px; text-align: center;">
               <h1 style="margin: 0; font-size: 20px;">Student Information</h1>
            </div>
            <div style="padding: 20px;">
               <table style="width: 100%; border-collapse: collapse;">
                  ${tableContent}
               </table>
               <div style="margin-top: 30px; text-align: center; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                  <p style="margin-bottom: 20px; font-weight: bold;">Seems like a fit?</p>
                  <div style="display: flex; flex-direction: row; justify-content: space-evenly;">
                     <a href="${acceptUrl}" style="display: inline-block; padding: 16px 32px; color: white; background-color: #28a745; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        Accept Student
                     </a>
                     <a href="${declineUrl}" style="display: inline-block; padding: 16px 32px; color: white; background-color: #a72828; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        Decline Student
                     </a>
                  </div>
               </div>
            </div>
         </div>
      `,
	};

	return sendEmail(options);
}
