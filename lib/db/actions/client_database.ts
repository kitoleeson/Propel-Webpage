/** @format */

"use server";

import { db, sql } from "..";
import { TutorFormValues, TutorSemesterUpdateFormValues } from "../../validation/tutorForm/tutorFormSchema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DBTypes } from "../dbtypes";
import { sendAdminPendingNewTutorApprovalEmail, sendAdminPendingTutorSemesterUpdateApprovalEmail } from "@/lib/mail/sendAdmin";

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

export async function submitNewTutorForApproval(data: TutorFormValues) {
	const existingId = await db.tutor.find(data.gov_first_name, data.gov_last_name);
	const pendingTutor = (
		await db.pending_tutor.insert({
			...data,
			tutor_id: existingId ?? -1,
			created_at: new Date(),
			subjects_json: data.subjects,
		})
	)[0];
	await sendAdminPendingNewTutorApprovalEmail(pendingTutor?.pending_tutor_id, { ...data, tutor_id: existingId ?? -1 });

	revalidatePath("/");
	redirect("/");
}

export async function approvePendingNewTutor(pending_tutor_id: number) {
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
		console.error("Failed approve new tutor database operation", e);
		throw new Error("Failed approve new tutor database operation");
	} finally {
		client.release();
	}
}

export async function submitTutorSemesterUpdateForApproval(data: TutorSemesterUpdateFormValues) {
	const existingId = await db.tutor.find(data.gov_first_name, data.gov_last_name);

	const pendingTutor = (
		await db.pending_tutor.insert({
			...data,
			tutor_id: existingId ?? -1,
			created_at: new Date(),
		})
	)[0];
	await sendAdminPendingTutorSemesterUpdateApprovalEmail(pendingTutor?.pending_tutor_id, { ...data, tutor_id: existingId ?? -1 });

	revalidatePath("/");
	redirect("/");
}

export async function approvePendingTutorSemesterUpdate(pending_tutor_id: number) {
	const client = await db.pool.connect();
	const tx = sql(client);
	try {
		await client.query("BEGIN");

		const pendingResults = await db.pending_tutor.get(pending_tutor_id, tx);
		if (!pendingResults.length) throw new Error("PENDING_NOT_FOUND");

		const pendingTutor = pendingResults[0];
		if (pendingTutor.tutor_id === -1) throw new Error("PENDING_IS_NOT_SEMESTER_UPDATE");

		await db.tutor.update.updatePartial(pendingTutor.tutor_id, pendingTutor);
		await db.pending_tutor.remove(pending_tutor_id, tx);

		await client.query("COMMIT");
		return { gov_first: pendingTutor.gov_first_name, gov_last: pendingTutor.gov_last_name };
	} catch (e) {
		await client.query("ROLLBACK");
		console.error("Failed approve tutor semester update database operation", e);
		throw new Error("Failed approve tutor semester update database operation");
	} finally {
		client.release();
	}
}

export const mapDbToTutorFormValues = async (data: DBTypes.PendingTutors): Promise<TutorFormValues> =>
	({
		...data,
		date_hired: data.date_hired ? new Date(data.date_hired) : new Date(),
		subjects: data.subjects_json as any,
	}) as any;

export async function getTutorsBySubjects(subjects: string[]): Promise<DBTypes.TutorsRow[]> {
	const tutors = !subjects || subjects.length === 0 ? await db.tutor.get.getAll() : await db.tutor_subjects.get.getAcceptingTutorsByAllOfSubjects(subjects);
	return tutors;
}

export async function checkGuardianStatus(email: string) {
	const response = (await db.guardian.get.getByEmail(email))[0];
	const success = response != null;
	return {
		success: success,
		data: response,
		error: success ? null : "Guardian not found with provided ID and email",
	};
}

export async function getTutorInfoFromName(firstname: string, lastname: string) {
	const tutor_id = await db.tutor.find(firstname, lastname);
	const response = tutor_id ? (await db.tutor.get.get(tutor_id))[0] : null;
	const success = response != null;
	return {
		success: success,
		data: response,
		error: success ? null : "Tutor not found with provided name",
	};
}
