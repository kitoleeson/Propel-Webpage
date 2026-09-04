/** @format */

import { TutorFormValues } from "@/lib/validation/tutorForm/tutorFormSchema";
import parseSubjects from "@/lib/db/integration/subjects";
import { compileEmailTable, sendEmail, TableSection } from "..";
import Mail from "nodemailer/lib/mailer";

export default async function sendAdminPendingNewTutorApprovalEmail(pending_tutor_id: number, data: TutorFormValues & { tutor_id: number }) {
	const sections: TableSection[] = [
		{
			title: "Personal Information",
			rows: [
				{ label: "First Name", value: data.gov_first_name },
				{ label: "Last Name", value: data.gov_last_name },
				{ label: "Preferred Name", value: data.pref_name },
				{ label: "Email", value: data.email },
				{ label: "Phone", value: data.phone },
				{ label: "Bio", value: data.bio },
				{ label: "Hobbies", value: data.hobbies },
			],
		},
		{
			title: "Tutoring Details",
			rows: [
				{ label: "Date Hired", value: data.date_hired.toString() },
				{ label: "Prior Experience", value: data.prior_experience.toString() },
				{ label: "Rate ($)", value: data.current_rate.toString() },
				{ label: "Capacity", value: data.accepting_students.toString() },
				{ label: "Availability", value: data.availability },
				{ label: "Tutoring Mode", value: data.in_person },
				{ label: "City", value: data.city },
				{ label: "Location", value: data.location },
			],
		},
		{
			title: "Emergency Contact",
			rows: [
				{ label: "Name", value: data.emerg_contact_name },
				{ label: "Phone", value: data.emerg_contact_phone },
				{ label: "Relationship", value: data.emerg_contact_relationship },
			],
		},
		{
			title: "Post-Secondary History",
			rows: [
				{ label: "University", value: data.current_uni },
				{ label: "Degree", value: data.current_degree },
				{ label: "Field", value: data.field_of_study },
				{ label: "Year", value: data.year_of_study.toString() },
				{ label: "Favourite Class", value: data.current_fav_class },
				{ label: "Interests", value: data.academic_interests },
			],
		},
		{
			title: "High School History",
			rows: [
				{ label: "High School", value: data.high_school },
				{ label: "City", value: data.high_school_city },
				{ label: "Favourite Class", value: data.fav_high_school_class },
				{ label: "AP/IB Status", value: data.ap_ib_credentials },
			],
		},
	];

	let tableContent = compileEmailTable(sections, true);
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
	const approveUrl = `${baseUrl}/approvePendingNewTutor?id=${pending_tutor_id}`;
	const insertion = data.tutor_id === -1;

	const options: Mail.Options = {
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
		attachments: [
			{ filename: `${data.gov_first_name.replaceAll(" ", "_")}_${data.gov_last_name.replaceAll(" ", "_")}-pending_tutor_entry-${pending_tutor_id}.json`, content: JSON.stringify(data, null, 2), contentType: "application/json" },
		],
	};

	return sendEmail(options);
}
