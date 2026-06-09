/** @format */

"use server";

import { db } from ".";
import { sendAdminApprovalPendingTutorEmail } from "../mail/sendEmail";
import { ClientFormValues } from "../validation/clientForm/clientFormSchema";
import { TutorFormValues } from "../validation/tutorForm/tutorFormSchema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DBTypes } from "./types";

export async function updateTutorWithSubjectsAndGoHome(data: TutorFormValues) {
	try {
		await db.tutor.update.updateWithSubjects(data);
		revalidatePath("/");
	} catch (err: any) {
		if (err.message === "Tutor not found") throw new Error("TUTOR_NOT_FOUND");
		throw err;
	}
	redirect("/");
}

export async function submitTutorForApproval(data: TutorFormValues) {
	const existing_id = await db.tutor.find(data.gov_first_name, data.gov_last_name);
	const result = await db.pending_tutor.insert(existing_id ?? -1, data);
	await sendAdminApprovalPendingTutorEmail(result.rows[0].pending_tutor_id, { ...data, tutor_id: existing_id ?? -1 });

	revalidatePath("/");
	redirect("/");
}

export async function submitStudentForAcceptance(data: ClientFormValues) {
	const student_result = await db.student.insert(data.student as DBTypes.Students);
	const db_student = student_result.rows[0];
	for (let guardian of data.guardians) {
		let guardian_id;
		if (!guardian.already_exists) {
			const guardian_result = await db.guardian.insert(guardian as DBTypes.Guardians);
			guardian_id = guardian_result.rows[0].guardian_id;
		} else {
			const guardian_result = await db.guardian.find(guardian.gov_first_name, guardian.gov_last_name);
			guardian_id = guardian_result.rows[0].guardian_id;
		}
		db.student_guardian.insert({ student_id: db_student.id, guardian_id: guardian_id, relationship_type: guardian.relationship ?? "Legal Guardian", is_primary_biller: guardian.is_primary_biller });
	}
}

export async function approvePendingTutor(pending_tutor_id: number) {
	const pendingResults = await db.pending_tutor.get(pending_tutor_id);
	if (!pendingResults.rows?.length) throw new Error("PENDING_NOT_FOUND");

	const pending_tutor = pendingResults.rows[0];

	const formData = await mapDbToFormValues(pending_tutor);

	if (pending_tutor.tutor_id === -1) await db.tutor.insert.insertWithSubjects(formData);
	else await db.tutor.update.updateWithSubjects(formData);

	await db.pending_tutor.remove(pending_tutor_id);

	return { gov_first: pending_tutor.gov_first_name, gov_last: pending_tutor.gov_last_name, insertion: pending_tutor.tutor_id === -1 };
}

export const mapDbToFormValues = async (data: any): Promise<TutorFormValues> => ({
	...data,
	date_hired: new Date(data.date_hired),
	subjects: data.subjects_json,
});

export async function checkGuardianStatus(email: string) {
	const response = await db.guardian.get.getByEmail(email);
	const success = response.rows?.length === 1;
	return {
		success: success,
		data: success ? response.rows[0] : null,
		error: success ? null : "Guardian not found with provided ID and email",
	};
}

export async function getTutorsBySubjects(subjects: string[]): Promise<DBTypes.Tutors[]> {
	const tutors = !subjects || subjects.length === 0 ? await db.tutor.get.getAll() : await db.tutor_subjects.get.getAcceptingTutorsByAllOfSubjects(subjects);
	return tutors.rows;
}

export async function onboardClientWithFormData(data: ClientFormValues) {
	// DATA FLOW:
	// 1. Client fills out the form and submits it, including personal information, billing information, and tutor preferences (top 2 choices).
	// 2. The form data is sent to the server, where it is processed and stored in the database under the "students", "guardians", "student_guardian", "billing_accounts", and "student_billing" tables.
	// 3. An email is sent to the admin with a summary of the client's information for review.
	// 4. An email is sent to the client with the client agreement contract attached.
	// 5. An email is sent to the tutor who the client chooses, notifying them of the new student, providing the student's information for review, and providing a link to the API where they can accept or reject the tutoring request.
	// 	The tutor will reach out the student to decide whether the relationship will work, then either accept or reject the request.
	// 	If they accept, the "student_tutor" table is updated to reflect the match.
	// 	If they reject, the student's second choice tutor is notified. If they also reject, the admin is notified to manually assign a tutor.
	// 6. Once a tutor accepts the student, an email confirmation is sent to the client with the tutor's rate and client contract?
}
