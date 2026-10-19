/** @format */

import fs from "fs";
import path from "path";
import { sendEmail } from "@/lib/mail";
import Mail from "nodemailer/lib/mailer";
import { ClientAgreementEmailData } from "../sendClient/clientAgreement";

export default async function sendTutorStudentAcceptanceConfirmationEmail(data: ClientAgreementEmailData) {
	try {
		const bodyPath = path.resolve(process.cwd(), "assets/email_bodies/studentAcceptanceConfirmation.txt");
		const body = fs
			.readFileSync(bodyPath, "utf8")
			.replaceAll("??TutorFirstName??", data.tutor.pref_name ?? data.tutor.gov_first_name)
			.replaceAll("??StudentFirstName??", data.student.pref_name ?? data.student.gov_first_name)
			.replaceAll("??StudentLastName??", data.student.gov_last_name);

		const options: Mail.Options = {
			to: data.tutor.email,
			subject: `Student Acceptance Confirmation: ${data.student.pref_name ?? data.student.gov_first_name} ${data.student.gov_last_name}`,
			text: body,
		};

		await sendEmail(options);

		return true;
	} catch (error) {
		console.error("Failed to send student acceptance confirmation:", error);
		throw error;
	}
}
