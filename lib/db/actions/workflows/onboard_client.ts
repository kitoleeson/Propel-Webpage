/** @format */

"use server";

import { ClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { db, sql } from "../..";
import { DBTypes } from "../../dbtypes";
import { sendAdminAssignStudentActionEmail, sendAdminClientSignupReviewEmail, sendAdminTutorClientAcceptanceReviewEmail } from "@/lib/mail/sendAdmin";
import { sendClientSignupConfirmationEmail } from "@/lib/mail/sendClient";
import sendClientClientAgreementEmail, { ClientAgreementEmailData } from "@/lib/mail/sendClient/clientAgreement";
import { sendTutorNewStudentRequestEmail } from "@/lib/mail/sendTutor";
import { NewStudentRequestEmailData } from "@/lib/mail/sendTutor/newStudentRequest";
import { AdminAssignStudentEmailData } from "@/lib/mail/sendAdmin/aAssignStudent";

export async function onboardClientWithFormData(data: ClientFormValues) {
	let first_choice_pending_student_tutor_id;

	const client = await db.pool.connect();
	const tx = sql(client);
	try {
		await client.query("BEGIN");

		// insert into student
		const student = (await db.student.insert(data.student as DBTypes.Students, tx))[0];

		// insert into guardians and student_guardian
		for (let g of data.guardians) {
			const guardianByEmail = g.already_exists && g.email_password ? (await db.guardian.get.getByEmail(g.email_password, tx))[0] : null;
			const guardian = guardianByEmail ?? (await db.guardian.insert(g as DBTypes.Guardians, tx))[0];
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
								display_name: student.pref_name ?? student.gov_first_name,
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
				timeandlocation: data.tutors.timeandlocation,
			};
			const pending_tutor = (await db.pending_student_tutor.insert(student_tutor_data, tx))[0];
			first_choice_pending_student_tutor_id = first_choice_pending_student_tutor_id ?? pending_tutor.pending_student_tutor_id;
		}

		await client.query("COMMIT");
	} catch (e: any) {
		await client.query("ROLLBACK");

		// handle unique key violation
		if (e.code === "23505") {
			const detail = e.detail || "";
			if (e.table === "students") {
				if (detail.includes("email")) return { success: false, errors: [{ field: "student.email", message: "This email is already linked to a registered student." }] };
				if (detail.includes("phone")) return { success: false, errors: [{ field: "student.phone", message: "This phone number is already linked to a registered student." }] };
			}

			if (e.table === "guardians") {
				if (detail.includes("email")) {
					const match = detail.match(/\((.*?)\)=\((.*?)\)/);
					const failedEmail = match ? match[2] : "";
					const idx = data.guardians.findIndex((g) => g.email === failedEmail);
					return { success: false, errors: [{ field: `guardians.${idx !== -1 ? idx : 0}.email`, message: "This email is already linked to a registered guardian." }] };
				}
				if (detail.includes("phone")) {
					const match = detail.match(/\((.*?)\)=\((.*?)\)/);
					const failedPhone = match ? match[2] : "";
					const idx = data.guardians.findIndex((g) => g.phone === failedPhone);
					return { success: false, errors: [{ field: `guardians.${idx !== -1 ? idx : 0}.phone`, message: "This phone number is already linked to a registered guardian." }] };
				}
			}
		}

		return { success: false, globalError: e };
	} finally {
		client.release();
	}

	try {
		await sendAdminClientSignupReviewEmail(data);
	} catch (e) {
		throw e;
	}

	try {
		await sendClientSignupConfirmationEmail(data);
	} catch (e) {
		throw e;
	}

	try {
		const tutorData = await getNewStudentRequestEmailData(first_choice_pending_student_tutor_id ?? -1);
		await sendTutorNewStudentRequestEmail(tutorData);
	} catch (e) {
		throw e;
	}

	return { success: true };
}

export async function getNewStudentRequestEmailData(pending_student_tutor_id: number): Promise<NewStudentRequestEmailData> {
	const pending_student_tutor = (await db.pending_student_tutor.get.get(pending_student_tutor_id))[0];
	const student = (await db.student.get.get(pending_student_tutor.student_id))[0];
	const tutor = (await db.tutor.get.get(pending_student_tutor.tutor_id))[0];
	return { pending_student_tutor, student, tutor };
}

export async function tutorAcceptStudent(pending_student_tutor_id: number) {
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
		await client.query("BEGIN");

		data.student_tutor = (await db.pending_student_tutor.get.get(pending_student_tutor_id, tx))[0];
		await db.student_tutor.insert(data.student_tutor, tx);
		await db.pending_student_tutor.remove.byStudentId(data.student_tutor.student_id, tx);
		await db.tutor.update.decrementAcceptingStudents(data.student_tutor.tutor_id, tx);

		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}

	// get data for emails
	try {
		data.student = (await db.student.get.get(data.student_tutor.student_id))[0];
		data.tutor = (await db.tutor.get.get(data.student_tutor.tutor_id))[0];
		data.guardians = await db.student_guardian.get.getGuardians(data.student_tutor.student_id);
	} catch (e) {
		throw e;
	}

	// email the client contract to the student and guardians
	try {
		await sendClientClientAgreementEmail(data);
	} catch (e) {
		throw e;
	}

	// email the student_tutor information to the admin
	try {
		await sendAdminTutorClientAcceptanceReviewEmail(data);
	} catch (e) {
		throw e;
	}

	return { student_first: data.student.gov_first_name, student_last: data.student.gov_last_name };
}

export async function tutorDeclineStudent(pending_student_tutor_id: number) {
	const pending_student_tutor = (await db.pending_student_tutor.get.get(pending_student_tutor_id))[0];

	// remove from pending_student_tutor
	await db.pending_student_tutor.remove.remove(pending_student_tutor.pending_student_tutor_id);

	const pending_pairs = await db.pending_student_tutor.get.getByStudentId(pending_student_tutor.student_id);

	try {
		if (pending_pairs.length) {
			const data = await getNewStudentRequestEmailData(pending_pairs[0].pending_student_tutor_id);
			await sendTutorNewStudentRequestEmail(data);
		} else {
			const data: AdminAssignStudentEmailData = { student: (await db.student.get.get(pending_student_tutor.student_id))[0], subjects: pending_student_tutor.subjects, timeandlocation: pending_student_tutor.timeandlocation };
			await sendAdminAssignStudentActionEmail(data);
		}
	} catch (e) {
		throw e;
	}

	const student = (await db.student.get.get(pending_student_tutor.student_id))[0];

	return { student_first: student.gov_first_name, student_last: student.gov_last_name };
}
