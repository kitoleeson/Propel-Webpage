/** @format */

"use server";

import { db, sql } from "..";
import { TutorFormValues } from "../../validation/tutorForm/tutorFormSchema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DBTypes } from "../dbtypes";
import { sendAdminPendingTutorApprovalEmail } from "@/lib/mail/sendAdmin";

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
