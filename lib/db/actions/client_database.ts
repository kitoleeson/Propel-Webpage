/** @format */

"use server";

import { db } from "..";
import { TutorFormValues } from "../../validation/tutorForm/tutorFormSchema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DBTypes } from "../dbtypes";

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
