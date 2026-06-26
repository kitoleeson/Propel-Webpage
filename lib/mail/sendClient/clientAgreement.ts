/** @format */

import fs from "fs";
import path from "path";
import { sendEmail } from "@/lib/mail";
import { DBTypes } from "@/lib/db/dbtypes";
import Mail from "nodemailer/lib/mailer";

export type ClientAgreementEmailData = {
	student: DBTypes.StudentsRow;
	guardians: DBTypes.GuardiansRow[];
	student_tutor: Omit<DBTypes.StudentTutorRow, "assignment_id">;
	tutor: DBTypes.TutorsRow;
};

export default async function sendClientClientAgreementEmail(data: ClientAgreementEmailData) {
	const studentName = `${data.student.gov_first_name} ${data.student.gov_last_name}`;

	const anIfy = (s: string) => ("aeiou".includes(s[0].toLowerCase()) ? "an " + s : "a " + s);

	// const templatePath = path.resolve(process.cwd(), "assets/templates/clientAgreement.tex");
	// const template = fs.readFileSync(templatePath, "utf8").replaceAll("??StudentName??", studentName).replaceAll("??LogoBase64??", "https://propeltutoring.ca/images/logos/teal.png");

	try {
		// const formData = new FormData();
		// const texBlob = new Blob([template], { type: "text/x-tex" });
		// formData.append("file", texBlob, "agreement.tex");
		// const url = "https://latexonline.cc/data";
		// const response = await fetch(url, { method: "POST", body: formData });

		// if (!response.ok) {
		// 	const log = await response.text();
		// 	console.error("--- LaTeX Engine Compilation Error Log ---");
		// 	console.error(log);
		// 	console.error("------------------------------------------");
		// 	throw new Error(`LaTeX API Compilation failed with status: ${response.status}`);
		// }

		// const arrayBuffer = await response.arrayBuffer();
		// const pdfBuffer = Buffer.from(arrayBuffer);

		const pdfPath = path.resolve(process.cwd(), "assets/templates/clientAgreement.pdf");
		const pdfBuffer = fs.readFileSync(pdfPath);

		const bodyPath = path.resolve(process.cwd(), "assets/email_bodies/tutorAcceptanceAndClientAgreement.txt");
		const body = fs
			.readFileSync(bodyPath, "utf8")
			.replaceAll("??StudentFirstName??", data.student.pref_name ?? data.student.gov_first_name)
			.replaceAll("??TutorFirstName??", data.tutor.gov_first_name)
			.replaceAll("??TutorFieldOfStudy??", data.tutor.field_of_study ? anIfy(data.tutor.field_of_study) : "a")
			.replaceAll("??TutorUni??", data.tutor.current_uni ?? "University of Alberta")
			.replaceAll("??TutorRate??", data.tutor.current_rate.toString());

		const options: Mail.Options = {
			to: data.student.email,
			cc: data.guardians.map((g) => g.email),
			subject: `Propel Tutoring Tutor Pair and Agreement - ${studentName}`,
			text: body,
			attachments: [{ filename: `Propel-Agreement_${data.student.gov_first_name.replace(/\s+/g, "-")}-${data.student.gov_last_name.replace(/\s+/g, "-")}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
		};

		await sendEmail(options);

		return true;
	} catch (e) {
		console.error("Failed to compile or send contract:", e);
		throw e;
	}
}
