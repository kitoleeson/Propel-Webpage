/** @format */

import fs from "fs";
import path from "path";
import { sendEmail } from "@/lib/mail";
import { DBTypes } from "@/lib/db/types";

export type ClientEmailData = {
	student: DBTypes.Students;
	guardians: DBTypes.Guardians[];
	student_tutor: DBTypes.StudentTutor;
};

export async function sendAgreementEmail(data: ClientEmailData) {
	const studentName = `${data.student.gov_first_name} ${data.student.gov_last_name}`;

	const templatePath = path.join(process.cwd(), "assets/templates/clientAgreement.tex");
	let texString = fs.readFileSync(templatePath, "utf8");

	texString = texString.replace("??StudentName??", `${data.student.gov_first_name} ${data.student.gov_last_name}`);

	try {
		const url = "https://latexonline.cc/compile?text=" + encodeURIComponent(texString);
		const response = await fetch(url, { method: "GET" });

		if (!response.ok) throw new Error(`LaTeX API Compilation failed with status: ${response.status}`);

		const arrayBuffer = await response.arrayBuffer();
		const pdfBuffer = Buffer.from(arrayBuffer);

		const body = `Hello ${data.student.gov_first_name},|Welcome to Propel Tutoring! We are very excited to have you.|Please find our Client Agreement attached to this email. Please sign it, digitally or physically, and send a PDF version back to this email (propeltutoringyeg@gmail.com). We must receive your signed agreement prior to your first tutoring session, if we have not received it by that time, your first session will be rescheduled.|Please feel free to reach out if you have any questions or concerns. We are here to help!\nWe appreciate your trust and support, and are excited to see the progress this semester will bring!|Propel Tutoring`;

		await sendEmail({
			to: data.student.email,
			cc: data.guardians.map((g) => g.email),
			subject: `Propel Tutoring Agreement — ${studentName}`,
			text: body.replace("|", "\n\n"),
			attachments: [{ filename: `Propel_Agreement_${data.student.gov_last_name}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
		});

		return true;
	} catch (error) {
		console.error("Failed to compile or send contract:", error);
		throw error;
	}
}
