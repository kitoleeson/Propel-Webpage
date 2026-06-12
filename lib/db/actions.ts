/** @format */

"use server";

import { db, sql } from ".";
import { ClientFormValues } from "../validation/clientForm/clientFormSchema";
import { TutorFormValues } from "../validation/tutorForm/tutorFormSchema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DBTypes } from "./types";
import { sendAdminPendingTutorApprovalEmail, sendAdminClientSignupReviewEmail, sendAdminTutorClientAcceptanceReviewEmail } from "@/lib/mail/sendAdmin";
import { ClientAgreementEmailData } from "@/lib/mail/sendClient/clientAgreement";
import { sendClientClientAgreementEmail } from "@/lib/mail/sendClient";

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
	const existingId = await db.tutor.find(data.gov_first_name, data.gov_last_name);
	const pendingTutor = (
		await db.pending_tutor.insert({
			...data,
			tutor_id: existingId ?? -1,
			created_at: new Date(),
			subjects_json: data.subjects,
		})
	)[0];
	await sendAdminPendingTutorApprovalEmail(pendingTutor?.pending_tutor_id, { ...data, tutor_id: existingId ?? -1 });

	revalidatePath("/");
	redirect("/");
}

export async function approvePendingTutor(pending_tutor_id: number) {
	const client = await db.pool.connect();
	const tx = sql(client);
	try {
		await client.query("BEGIN");

		const pendingResults = await db.pending_tutor.get(pending_tutor_id, tx);
		if (!pendingResults.length) throw new Error("PENDING_NOT_FOUND");

		const pendingTutor = pendingResults[0];
		const formData = await mapDbToTutorFormValues(pendingTutor);

		if (pendingTutor.tutor_id === -1) await db.tutor.insert.insertWithSubjects(formData, tx);
		else await db.tutor.update.updateWithSubjects(formData, tx);

		await db.pending_tutor.remove(pending_tutor_id, tx);

		await client.query("COMMIT");
		return { gov_first: pendingTutor.gov_first_name, gov_last: pendingTutor.gov_last_name, insertion: pendingTutor.tutor_id === -1 };
	} catch (e) {
		await client.query("ROLLBACK");
		console.error("Failed tutor accept student database operation", e);
		throw new Error("Failed tutor accept student database operation");
	} finally {
		client.release();
	}
}

export const mapDbToTutorFormValues = async (data: DBTypes.PendingTutors): Promise<TutorFormValues> =>
	({
		...data,
		date_hired: new Date(data.date_hired),
		subjects: data.subjects_json as any,
	}) as any;

export async function checkGuardianStatus(email: string) {
	const response = (await db.guardian.get.getByEmail(email))[0];
	const sucess = response != null;
	return {
		success: sucess,
		data: response,
		error: sucess ? null : "Guardian not found with provided ID and email",
	};
}

export async function getTutorsBySubjects(subjects: string[]): Promise<DBTypes.TutorsRow[]> {
	const tutors = !subjects || subjects.length === 0 ? await db.tutor.get.getAll() : await db.tutor_subjects.get.getAcceptingTutorsByAllOfSubjects(subjects);
	return tutors;
}

export async function onboardClientWithFormData(data: ClientFormValues) {
	// 1. Client fills out the form and submits it, including personal information, billing information, and tutor preferences (top 2 choices).
	// 2. The form data is sent to the server, where it is processed and stored in the database under the "students", "guardians", "student_guardian", "billing_accounts", "student_billing", and "pending_student_tutors" tables.
	async function saveClientDataToDatabase() {
		const client = await db.pool.connect();
		const tx = sql(client);
		try {
			await client.query("BEGIN");

			// insert into student
			const student = (await db.student.insert(data.student as DBTypes.Students, tx))[0];

			// insert into guardians and student_guardian
			for (let g of data.guardians) {
				const guardianByEmail = (await db.guardian.get.getByEmail(g.email, tx))[0];
				const exists = g.already_exists || guardianByEmail != null;
				const guardian = exists ? guardianByEmail : (await db.guardian.insert(g as DBTypes.Guardians, tx))[0];
				await db.student_guardian.insert({ student_id: student.student_id, guardian_id: guardian.guardian_id, relationship_type: g.relationship, is_primary_biller: g.is_primary_biller }, tx);
			}

			// insert into billing_accounts and student_billing
			if (data.student.biller === "Guardian") {
				const primaryBiller = data.guardians[data.primary_biller_index];
				const guardian = (await db.guardian.get.getByEmail(primaryBiller.email, tx))[0];
				const result = await db.billing_account.get.getByGuardianOwner(guardian.guardian_id, tx);
				const billingAccount = result.length
					? result[0]
					: (await db.billing_account.insert({ display_name: `${guardian.pref_name ?? guardian.gov_first_name} ${guardian.gov_last_name}`, email: guardian.email, first_invoice: true, guardian_id: guardian.guardian_id }, tx))[0];
				const billingId = billingAccount.billing_id;
				await db.student_billing.insert({ student_id: student.student_id, billing_id: billingId }, tx);
			} else {
				const result = await db.billing_account.get.getByStudentOwner(student.student_id, tx);
				const billingAccount = result.length
					? result[0]
					: (
							await db.billing_account.insert(
								{
									display_name: `${student.pref_name ?? student.gov_first_name} ${student.gov_last_name}`,
									email: student.email ?? "",
									first_invoice: true,
									student_id: student.student_id,
								},
								tx,
							)
						)[0];
				const billingId = billingAccount.billing_id;
				await db.student_billing.insert({ student_id: student.student_id, billing_id: billingId }, tx);
			}

			// insert into pending_student_tutor
			for (let tutor_id of data.tutors.choices) {
				const tutor = (await db.tutor.get.get(tutor_id, tx))[0];
				const student_tutor_data: DBTypes.PendingStudentTutor = {
					student_id: student.student_id,
					tutor_id: tutor.tutor_id,
					usual_duration: 1,
					hourly_rate: tutor.current_rate,
					subjects: data.tutors.subjects,
					markup: 5,
					travel_fee: 0,
					had_session: false,
				};
				await db.pending_student_tutor.insert(student_tutor_data, tx);
			}

			await client.query("COMMIT");
		} catch (e) {
			await client.query("ROLLBACK");
			console.error("Failed client intake database operation", e);
			throw new Error("Failed client intake database operation");
		} finally {
			client.release();
		}
	}

	async function sendClientDataToAdminForReview() {
		// 3. An email is sent to the admin with a summary of the client's information for review.
		try {
			await sendAdminClientSignupReviewEmail(data);
		} catch (e) {
			console.error("Failed to send client signup review email to admin", e);
			throw new Error("Failed to send client signup review email to admin");
		}
	}

	saveClientDataToDatabase();
	sendClientDataToAdminForReview();
}

// 4. An email is sent to the tutor who the client chooses, notifying them of the new student, providing the student's information for review, and providing a link to the API where they can accept or reject the tutoring request.
// 	The tutor will reach out the student to decide whether the relationship will work, then either accept or reject the request.
// 	If they accept, the "student_tutor" table is updated to reflect the match.
// 	If they reject, the student's second choice tutor is notified. If they also reject, the admin is notified to manually assign a tutor.
export async function sendClientToFirstTutorChoice(data: ClientFormValues) {}

export async function sendClientToSecondTutorChoice(data: ClientFormValues) {}

export async function sendClientToAdminForManualMatching(data: ClientFormValues) {}

export async function tutorAcceptStudent(tutor_id: number, student_id: number) {
	const data: ClientAgreementEmailData & { tutor: DBTypes.Tutors } = {
		student: undefined as any,
		tutor: undefined as any,
		guardians: undefined as any,
		student_tutor: undefined as any,
	};

	// insert data from pending_student_tutor into student_tutor
	const client = await db.pool.connect();
	const tx = sql(client);
	try {
		// 5. Once a tutor accepts the student, the pending_student_tutor row is inserted into the student_tutor database
		await client.query("BEGIN");

		data.student_tutor = (await db.pending_student_tutor.get.get(student_id, tutor_id, tx))[0];
		await db.student_tutor.insert(data.student_tutor, tx);
		await db.pending_student_tutor.remove.byStudentId(student_id, tx);
		await db.tutor.update.decrementAcceptingStudents(tutor_id);

		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		console.error("Failed tutor accept student database operation", e);
		throw new Error("Failed tutor accept student database operation");
	} finally {
		client.release();
	}

	// get data for emails
	try {
		data.student = (await db.student.get.get(student_id))[0];
		data.tutor = (await db.tutor.get.get(tutor_id))[0];
		data.guardians = await db.student_guardian.get.getGuardians(student_id);
	} catch (e) {
		console.error("Failed to get student, guardians, and tutor data", e);
		throw new Error("Failed to get student, guardians, and tutor data");
	}

	// email the client contract to the student and guardians
	try {
		// 6. An email confirmation is sent to the client with the tutor's rate and client agreement
		await sendClientClientAgreementEmail(data);
	} catch (e) {
		console.error("Failed client agreement email", e);
		throw new Error("Failed client agreement email");
	}

	// email the student_tutor informatino to the admin
	try {
		// 7. An email review is sent to the admin with the tutor and student's names and student_tutor information
		await sendAdminTutorClientAcceptanceReviewEmail(data);
	} catch (e) {
		console.error("Failed to send tutor client acceptance review email to admin", e);
		throw new Error("Failed to send tutor client acceptance review email to admin");
	}
}
