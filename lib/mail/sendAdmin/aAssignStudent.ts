/** @format */

import { compileEmailTable, sendEmail, TableSection } from "..";
import Mail from "nodemailer/lib/mailer";
import { DBTypes } from "@/lib/db/dbtypes";

export type AdminAssignStudentEmailData = {
	student: DBTypes.StudentsRow;
	subjects: string;
	timeandlocation: string;
};

// needs pending_student_tutor information and student information (could be found by pending_student_tutor information)
export default async function sendAdminAssignStudentActionEmail(data: AdminAssignStudentEmailData) {
	const sections: TableSection[] = [
		{
			title: "Personal Information",
			rows: [
				{ label: "Name", value: data.student.gov_first_name + (data.student.pref_name ? ` (${data.student.pref_name}) ` : " ") + data.student.gov_last_name },
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
				{ label: "Subjects", value: data.subjects },
				{ label: "Ideal Time and Location", value: data.timeandlocation },
			],
		},
	];
	const tableContent = compileEmailTable(sections);

	const options: Mail.Options = {
		to: process.env.ADMIN_EMAIL,
		subject: `New Unpaired Student Request: ${data.student.gov_first_name} ${data.student.gov_last_name}`,
		html: `
         <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #1eb9c2; color: white; padding: 20px; text-align: center;">
               <h1 style="margin: 0; font-size: 20px;">Student Information</h1>
            </div>
            <div style="padding: 20px;">${tableContent}</div>
         </div>
      `,
	};

	return sendEmail(options);
}
