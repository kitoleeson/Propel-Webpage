/** @format */

import fs from "fs";
import path from "path";
import { sendEmail } from "@/lib/mail";
import { ClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";

export default async function sendClientSignupConfirmationEmail(data: ClientFormValues) {
	try {
		const bodyPath = path.resolve(process.cwd(), "assets/email_bodies/signupConfirmation.txt");
		const body = fs.readFileSync(bodyPath, "utf8").replace("??StudentFirstName??", data.student.gov_first_name);

		await sendEmail({
			to: data.student.email,
			cc: data.guardians.map((g) => g.email),
			subject: `Propel Tutoring Signup Confirmation - ${data.student.gov_first_name} ${data.student.gov_last_name}`,
			text: body,
		});

		return true;
	} catch (error) {
		console.error("Failed to send signup confirmation:", error);
		throw error;
	}
}
