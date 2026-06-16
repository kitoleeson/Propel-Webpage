/** @format */

"use client";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { FormButtonInput, StudentSection, GuardianSection, FormInputCluster, FormTextAreaInput } from "@/components/ui/form";
import { defaultStudent, defaultGuardian, formSchema, ClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { placeholders } from "@/lib/validation/clientForm/clientFormPersonPlaceholders";
import PickTutorSignUpForm from "@/components/ui/form/sections/PickTutorSignUpForm";
import { DBTypes } from "@/lib/db/dbtypes";
import { onboardClientWithFormData } from "@/lib/db/actions/workflows/onboard_client";

function shuffle(array: any[]) {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
}

const SESSION_STORAGE_KEY = "propel_signup_form_data";

const ClientSignUpForm = ({ tutors, subjects }: { tutors: DBTypes.Tutors[]; subjects: string[] }) => {
	const [shuffledPlaceholders, setShuffledPlaceholders] = useState(placeholders);
	useEffect(() => setShuffledPlaceholders(shuffle(placeholders)), []);

	const getPreviousValues = (): Partial<ClientFormValues> | null => {
		if (typeof window !== "undefined") {
			const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
			if (saved) {
				try {
					return JSON.parse(saved);
				} catch (e) {
					console.error("Error parsing saved signup form data", e);
				}
			}
		}
		return null;
	};

	const methods = useForm<ClientFormValues>({ resolver: zodResolver(formSchema), defaultValues: getPreviousValues() || { student: defaultStudent, guardians: [defaultGuardian], primary_biller_index: 0 } });
	const {
		formState: { errors },
		handleSubmit,
		watch,
		register,
		control,
		setValue,
	} = methods;

	const { fields, append, remove } = useFieldArray({ control, name: "guardians" });

	const studentBilling = watch("student.biller") === "Student";
	if (!studentBilling && fields.length === 0) append(defaultGuardian);

	const allFormValues = watch();
	useEffect(() => {
		if (typeof window !== "undefined") sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(allFormValues));
	}, [allFormValues]);

	const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
		try {
			if (data.student.biller === "Student") data.primary_biller_index = -1;
			else data.guardians[data.primary_biller_index].is_primary_biller = true;
			console.log("Form submitted with data:");
			console.log(data);
			sessionStorage.removeItem(SESSION_STORAGE_KEY);
			await onboardClientWithFormData(data);
		} catch (e) {
			console.error("Submission failed", e);
		}
	};

	const addGuardian = () => {
		const scrollY = window.scrollY;
		const current = methods.getValues("primary_biller_index");

		append(defaultGuardian, { shouldFocus: false });
		setValue("primary_biller_index", current, { shouldDirty: true, shouldTouch: true, shouldValidate: true });

		requestAnimationFrame(() => window.scrollTo(0, scrollY));
	};

	const removeGuardian = (index: number) => {
		const scrollY = window.scrollY;

		const current = methods.getValues("primary_biller_index");
		if (current == index) setValue("primary_biller_index", 0, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
		else if (current > index) setValue("primary_biller_index", current - 1, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
		else setValue("primary_biller_index", current, { shouldDirty: true, shouldTouch: true, shouldValidate: true });

		remove(index);
		requestAnimationFrame(() => window.scrollTo(0, scrollY));
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)} className="landscape:space-y-10 portrait:space-y-14">
				<StudentSection placeholder={shuffledPlaceholders[0]} />
				<div className="landscape:space-y-10 portrait:space-y-14">
					{fields.map((field, index) => (
						<div key={field.id}>
							<GuardianSection index={index} placeholder={shuffledPlaceholders[(index + 1) % shuffledPlaceholders.length]} optional={studentBilling || index > 0} />
							{(fields.length > 1 || studentBilling) && (
								<FormInputCluster className="portrait:gap-0! portrait:mt-8! landscape:mt-3!">
									{!studentBilling && (
										<div className="mt-6 flex flex-col gap-1 flex-1">
											<label key={index} className="flex flex-1 items-center gap-2 border border-gray-300 rounded-md px-3 py-1 text-center">
												<input type="radio" value={index} checked={watch("primary_biller_index") === index} onChange={() => setValue("primary_biller_index", index)} />
												{"Is Primary Biller"}
											</label>
											{errors.primary_biller_index?.message && <p className="text-red-500">{errors.primary_biller_index?.message}</p>}
										</div>
									)}
									<FormButtonInput label="Remove Guardian" onClick={() => removeGuardian(index)} format="self-stretch text-red-500 flex-1" />
								</FormInputCluster>
							)}
						</div>
					))}
					<FormButtonInput label="Add New Guardian" onClick={addGuardian} divFormat="mt-14" format="w-full" />
				</div>
				<PickTutorSignUpForm tutors={tutors} subjects={subjects} />
				<FormInputCluster>
					<FormTextAreaInput label="Any other specific requests, concerns, or extra comments/information you would like us to know (optional):" rows={3} register={register("comments")} error={errors.comments?.message} />
				</FormInputCluster>
				<FormButtonInput label="Sign Up" onClick={handleSubmit(onSubmit)} format="self-stretch text-primary font-bold text-primary" />
			</form>
		</FormProvider>
	);
};

export default ClientSignUpForm;

/**
 * TO DO:
 * - check if guardian exists during sign up
 * - add choose tutor step as next page of form, or as part of this form if it doesn't make it too long
 * - connect to database:
 * 	- add student
 * 	- add guardians
 * 	- link guardians to student
 * - send email to admin with form responses
 * - send email to client with agreement contract
 */

/**
 * THINGS TO UI TEST:
 * - add and remove guardians
 * - persistent form values
 * - submission and database inputting
 * - primary biller accuracy
 * - autofill existing guardian
 *
 */
