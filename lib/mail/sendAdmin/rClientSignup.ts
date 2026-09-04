/** @format */

import { ClientFormValues, GuardianClientFormValues, StudentClientFormValues, TutorClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { compileEmailTable, sendEmail, TableSection } from "..";
import Mail from "nodemailer/lib/mailer";

export default async function sendAdminClientSignupReviewEmail(data: ClientFormValues) {
	const sections: TableSection[] = [
		{
			title: "Student",
			rows: [
				{ label: "First Name", value: data.student.gov_first_name },
				{ label: "Last Name", value: data.student.gov_last_name },
				{ label: "Preferred Name", value: data.student.pref_name },
				{ label: "Email", value: data.student.email },
				{ label: "Phone", value: data.student.phone },
				{ label: "Preferred Communication", value: data.student.pref_communication },
				{ label: "City", value: data.student.city },
				{ label: "Grade", value: data.student.grade.toString() },
				{ label: "How Found Us", value: data.student.how_found_us },
				{ label: "Biller", value: data.student.biller },
			],
		},
		{
			title: "Tutors",
			rows: [
				{ label: "First Choice", value: data.tutors.choices[0].toString() },
				{ label: "Second Choice", value: data.tutors.choices[1].toString() },
				{ label: "Ideal Time and Location", value: data.tutors.timeandlocation },
				{ label: "Notes", value: data.tutors.notes },
			],
		},
		{
			title: "Other",
			rows: [
				{ label: "Primary Biller Index", value: data.primary_biller_index.toString() },
				{ label: "Additional Comments", value: data.comments },
			],
		},
	];

	data.guardians.forEach((guardian, i) => {
		const guardianData = {
			title: `Guardian ${i + 1}`,
			rows: [
				{ label: "First Name", value: guardian.gov_first_name },
				{ label: "Last Name", value: guardian.gov_last_name },
				{ label: "Preferred Name", value: guardian.pref_name },
				{ label: "Email", value: guardian.email },
				{ label: "Phone", value: guardian.phone },
				{ label: "Preferred Communication", value: guardian.pref_communication },
				{ label: "Relationship to Student", value: guardian.relationship },
				{ label: "Primary Biller?", value: guardian.is_primary_biller.toString() },
				{ label: "Already Exists?", value: guardian.already_exists.toString() },
			],
		};
		sections.splice(1 + i, 0, guardianData);
	});

	let tableContent = compileEmailTable(sections);

	const options: Mail.Options = {
		to: process.env.ADMIN_EMAIL,
		subject: `New Client Signup: ${data.student.gov_first_name} ${data.student.gov_last_name}`,
		html: `
         <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #333; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #1eb9c2; color: white; padding: 20px; text-align: center;">
               <h1 style="margin: 0; font-size: 20px;">Student Profile Review</h1>
            </div>
            <div style="padding: 20px;">
				${tableContent}
			</div>
         </div>
      `,
		attachments: [{ filename: `${data.student.gov_first_name}_${data.student.gov_last_name}-Client_Signup_Form.json`, content: JSON.stringify(data, null, 2), contentType: "application/json" }],
	};

	return sendEmail(options);
}
