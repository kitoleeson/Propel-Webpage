/** @format */

import fs from "fs";
import path from "path";
import { sendEmail } from "@/lib/mail";
import { ClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import Mail from "nodemailer/lib/mailer";

export default async function sendClientSignupConfirmationEmail(data: ClientFormValues) {
	try {
		const bodyPath = path.resolve(process.cwd(), "assets/email_bodies/signupConfirmation.txt");
		const body = fs.readFileSync(bodyPath, "utf8").replace("??StudentFirstName??", data.student.pref_name ?? data.student.gov_first_name);

		const options: Mail.Options = {
			to: data.student.email,
			cc: data.guardians.map((g) => g.email),
			subject: `Propel Tutoring Signup Confirmation - ${data.student.pref_name ?? data.student.gov_first_name} ${data.student.gov_last_name}`,
			text: body,
		};

		await sendEmail(options);

		return true;
	} catch (error) {
		console.error("Failed to send signup confirmation:", error);
		throw error;
	}
}
