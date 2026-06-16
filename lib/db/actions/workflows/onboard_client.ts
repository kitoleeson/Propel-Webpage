/** @format */

import { ClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { db, sql } from "../..";
import { DBTypes } from "../../dbtypes";
import { sendAdminClientSignupReviewEmail, sendAdminTutorClientAcceptanceReviewEmail } from "@/lib/mail/sendAdmin";
import { sendClientSignupConfirmationEmail } from "@/lib/mail/sendClient";
import sendClientClientAgreementEmail, { ClientAgreementEmailData } from "@/lib/mail/sendClient/clientAgreement";

export async function onboardClientWithFormData(data: ClientFormValues) {
	// 1. Client fills out the form and submits it, including personal information, billing information, and tutor preferences (top 2 choices).
	// 2. The form data is sent to the server, where it is processed and stored in the database under the "students", "guardians", "student_guardian", "billing_accounts", "student_billing", and "pending_student_tutors" tables.
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
				: (await db.billing_account.insert({ display_name: guardian.pref_name ?? guardian.gov_first_name, email: guardian.email, first_invoice: true, guardian_id: guardian.guardian_id }, tx))[0];
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

	// 3. An email is sent to the admin with a summary of the client's information for review.
	try {
		await sendAdminClientSignupReviewEmail(data);
	} catch (e) {
		console.error("Failed to send client signup review email to admin", e);
		throw new Error("Failed to send client signup review email to admin");
	}

	// 3. An email is sent to the client with confirmation of signup and information about next steps
	try {
		await sendClientSignupConfirmationEmail(data);
	} catch (e) {
		console.error("Failed to send signup confirmation email to client", e);
		throw new Error("Failed to send signup confirmation email to client");
	}
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

	// email the student_tutor information to the admin
	try {
		// 7. An email review is sent to the admin with the tutor and student's names and student_tutor information
		await sendAdminTutorClientAcceptanceReviewEmail(data);
	} catch (e) {
		console.error("Failed to send tutor client acceptance review email to admin", e);
		throw new Error("Failed to send tutor client acceptance review email to admin");
	}
}
