/** @format */

"use server";

import { db } from ".";
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
