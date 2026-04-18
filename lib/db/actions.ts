/** @format */

"use server";

import { db } from ".";
import { sendAdminApprovalPendingTutorEmail } from "../mail/sendEmail";
import { FormValues } from "../validation/tutorForm/tutorFormSchema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateTutorWithSubjectsAndGoHome(data: FormValues) {
	try {
		await db.tutor.updateWithSubjects(data);
		revalidatePath("/");
	} catch (err: any) {
		if (err.message === "Tutor not found") throw new Error("TUTOR_NOT_FOUND");
		throw err;
	}
	redirect("/");
}

export async function submitTutorForApproval(data: FormValues) {
	const existing_id = await db.tutor.find(data.gov_first_name, data.gov_last_name);
	const result = await db.pending_tutor.insert(existing_id ?? -1, data);
	await sendAdminApprovalPendingTutorEmail(result[0].pending_tutor_id, { ...data, tutor_id: existing_id ?? -1 });

	revalidatePath("/");
	redirect("/");
}

export async function approvePendingTutor(pending_tutor_id: number) {
	const pendingResults = await db.pending_tutor.getById(pending_tutor_id);
	if (!pendingResults?.length) throw new Error("PENDING_NOT_FOUND");

	const pending_tutor = pendingResults[0];

	const formData = await mapDbToFormValues(pending_tutor);

	if (pending_tutor.tutor_id === -1) await db.tutor.insertWithSubjects(formData);
	else await db.tutor.updateWithSubjects(formData);

	await db.pending_tutor.removeById(pending_tutor_id);

	return { gov_first: pending_tutor.gov_first_name, gov_last: pending_tutor.gov_last_name, insertion: pending_tutor.tutor_id === -1 };
}

export const mapDbToFormValues = async (data: any): Promise<FormValues> => ({
	...data,
	date_hired: new Date(data.date_hired),
	subjects: data.subjects_json,
});
