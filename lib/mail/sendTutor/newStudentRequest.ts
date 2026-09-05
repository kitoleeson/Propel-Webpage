/** @format */

import { sendEmail, compileEmailTable, TableSection } from "..";
import Mail from "nodemailer/lib/mailer";
import { DBTypes } from "@/lib/db/dbtypes";

export type NewStudentRequestEmailData = {
	// add tutor choices to pending_student_tutor data to find here
	pending_student_tutor: DBTypes.PendingStudentTutorRow;
	student: DBTypes.StudentsRow;
	tutor: DBTypes.TutorsRow;
	guardians: DBTypes.GuardiansRow[];
};

export default async function sendTutorNewStudentRequestEmail(data: NewStudentRequestEmailData) {
	const sections: TableSection[] = [
		{
			title: "Personal Information",
			rows: [
				{ label: "Name", value: `${data.student.gov_first_name} ${data.student.pref_name ? `(${data.student.pref_name})` : ""} ${data.student.gov_last_name}` },
				{ label: "Student Email", value: data.student.email },
				{ label: "Student Phone", value: data.student.phone },
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
		// {
		// 	title: "Tutor Choices Information",
		// 	rows: [
		// 		{ label: "First Choice", value: data.tutor_choices_names.first },
		// 		{ label: "Second Choice", value: data.tutor_choices_names.second },
		// 	],
		// },
	];
	data.guardians.forEach((guardian, i) => {
		sections[0].rows.push({ label: `Guardian ${i + 1} Name`, value: `${guardian.pref_name ?? guardian.gov_first_name} ${guardian.gov_last_name}` });
		sections[0].rows.push({ label: `Guardian ${i + 1} Contact`, value: `${guardian.email}, ${guardian.phone}, prefers ${guardian.pref_communication}` });
	});
	const tableContent = compileEmailTable(sections);

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
				${tableContent}
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
