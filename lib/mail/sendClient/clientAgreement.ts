/** @format */

import fs from "fs";
import path from "path";
import { sendEmail } from "@/lib/mail";
import { DBTypes } from "@/lib/db/types";

export type ClientAgreementEmailData = {
	student: DBTypes.StudentsRow;
	guardians: DBTypes.GuardiansRow[];
	student_tutor: Omit<DBTypes.StudentTutorRow, "assignment_id">;
	tutor: DBTypes.TutorsRow;
};

export default async function sendClientClientAgreementEmail(data: ClientAgreementEmailData) {
	const studentName = `${data.student.gov_first_name} ${data.student.gov_last_name}`;

	const tutorFieldOfStudy = data.tutor.field_of_study ? ("AEIOU".includes(data.tutor.field_of_study[1]) ? `an ${data.tutor.field_of_study}` : `a ${data.tutor.field_of_study}`) : "a";

	const templatePath = path.resolve(process.cwd(), "assets/templates/clientAgreement.tex");
	const template = fs
		.readFileSync(templatePath, "utf8")
		.replace("??StudentName??", studentName)
		.replace("??TutorFirstName??", data.tutor.gov_first_name)
		.replace("??TutorFieldOfStudy??", tutorFieldOfStudy)
		.replace("??TutorUni??", data.tutor.current_uni ?? "University of Alberta")
		.replace("??TutorRate??", data.tutor.current_rate.toString());

	try {
		const formData = new FormData();
		const texBlob = new Blob([template], { type: "text/x-tex" });
		formData.append("file", texBlob, "agreement.txt");
		const url = "https://latexonline.cc/compile";
		const response = await fetch(url, { method: "POST", body: formData });

		if (!response.ok) throw new Error(`LaTeX API Compilation failed with status: ${response.status}`);

		const arrayBuffer = await response.arrayBuffer();
		const pdfBuffer = Buffer.from(arrayBuffer);
		const bodyPath = path.resolve(process.cwd(), "assets/email_bodies/tutorAcceptanceAndClientAgreement.txt");
		const body = fs.readFileSync(bodyPath, "utf8").replace("??StudentFirstName??", data.student.gov_first_name);

		await sendEmail({
			to: data.student.email,
			cc: data.guardians.map((g) => g.email),
			subject: `Propel Tutoring Agreement - ${studentName}`,
			text: body,
			attachments: [{ filename: `Propel-Agreement_${data.student.gov_first_name.replace(" ", "-")}_${data.student.gov_last_name.replace(" ", "-")}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
		});

		return true;
	} catch (error) {
		console.error("Failed to compile or send contract:", error);
		throw error;
	}
}
