/** @format */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { defaultTutor, TutorFormValues, tutorSchema, tutorPlaceholder } from "@/lib/validation/tutorForm/tutorFormSchema";
import { FormInputCluster, FormDropdownInput, FormTextInput, FormNumberInput } from "@/components/ui/form";
import { getTutorInfoFromName, submitTutorSemesterUpdateForApproval } from "@/lib/db/actions/client_database";
import { useEffect } from "react";
import FormSubmitInput from "@/components/ui/form/inputs/FormSubmitInput";
import FormTextAreaInput from "@/components/ui/form/inputs/FormTextAreaInput";
import FormHeader from "@/components/ui/form/layout/FormHeader";

const TutorSemesterUpdateForm = () => {
	const methods = useForm<TutorFormValues>({
		resolver: zodResolver(tutorSchema),
		defaultValues: defaultTutor,
	});

	const {
		register,
		formState: { errors, isDirty, isSubmitting },
		handleSubmit,
		watch,
		setError,
		clearErrors,
		setValue,
		getValues,
	} = methods;

	useEffect(() => {
		if (isDirty) clearErrors("root");
	}, [watch("gov_first_name"), watch("gov_last_name"), isDirty, clearErrors]);

	const autofillTutor = async () => {
		const firstname = getValues("gov_first_name");
		const lastname = getValues("gov_last_name");
		if (!firstname || !lastname) return clearFields();

		const response = await getTutorInfoFromName(firstname, lastname);
		if (response.success && response.data) {
			const data = response.data;
			setValue("in_person", data.in_person);
			setValue("city", data.city || "");
			setValue("location", data.location);
			setValue("current_uni", data.current_uni || "");
			setValue("current_degree", data.current_degree || "Bachelor's Degree");
			setValue("field_of_study", data.field_of_study || "");
			setValue("high_school", data.high_school || "");
			setValue("high_school_city", data.high_school_city || "");
			setValue("fav_high_school_class", data.fav_high_school_class || "");
			setValue("ap_ib_credentials", data.ap_ib_credentials || "N/A");
			setValue("academic_interests", data.academic_interests || "");
			setValue("bio", data.bio || "");
			setValue("hobbies", data.hobbies || "");
		}
	};

	const clearFields = () => {
		setValue("in_person", undefined as any);
		setValue("city", "");
		setValue("location", "");
		setValue("year_of_study", undefined as any);
		setValue("current_uni", "");
		setValue("current_degree", undefined as any);
		setValue("field_of_study", "");
		setValue("high_school", "");
		setValue("high_school_city", "");
		setValue("fav_high_school_class", "");
		setValue("ap_ib_credentials", undefined as any);
		setValue("academic_interests", "");
		setValue("bio", "");
		setValue("hobbies", "");
	};

	const onSubmit: SubmitHandler<z.infer<typeof tutorSchema>> = async (data) => {
		try {
			clearErrors("root");
			await submitTutorSemesterUpdateForApproval(data);
		} catch (err: any) {
			if (err.message == "NEXT_REDIRECT") throw err;

			console.error("Form Submission Error:", err);
			setError("root", {
				type: "manual",
				message: "Something went wrong while submitting for approval. Please try again.",
			});
		}

		console.log("Form submitted with data:");
		console.log(data);
	};

	const isHighSchool = watch("year_of_study") === -1;
	const uniIdentifier = isHighSchool ? "Prospective" : "Current";

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormHeader text="Personal Information" />
				<p>This is how clients and other tutors will call and contact you. Please enter your government first and last name, and the email and phone number that you wish to be contacted on.</p>

				<FormInputCluster className="mt-3!">
					<FormTextInput label="Government First Name" register={register("gov_first_name", { onBlur: autofillTutor })} placeholder={tutorPlaceholder.gov_first_name} error={errors.gov_first_name?.message} />
					<FormTextInput label="Government Last Name" register={register("gov_last_name", { onBlur: autofillTutor })} placeholder={tutorPlaceholder.gov_last_name} error={errors.gov_last_name?.message} />
				</FormInputCluster>

				<FormHeader text="Tutoring Information" />
				<p>
					This question assumes that you have already reached out to all non-graduated students you were tutoring last semester, and have a sense of if they would like to continue with their tutoring this semester. All students
					who wish to continue with your tutoring services should not be included in this count.
				</p>
				<FormInputCluster className="mt-3!">
					<FormNumberInput
						label="How many (more) students do you want to take on this semester?"
						register={register("accepting_students", { valueAsNumber: true })}
						placeholder={tutorPlaceholder.accepting_students?.toString()}
						error={errors.accepting_students?.message}
						step={1}
						min={0}
					/>
				</FormInputCluster>

				<FormHeader text="Availability Information" />
				<p>
					Please enter your general availability & location for this current semester (until June 2026). These values can always be changed via a form which I will soon build or by texting me. Please input a city and primary
					location (neighborhood, library, campus, et cetera) which new clients can use to inform their choice of tutor. If you choose online only, please input a location anyways (where you would tutor if you did in-person
					lessons) and it will not be shown to the public.
				</p>

				<FormInputCluster className="mt-3!">
					<FormTextInput label="Availability" register={register("availability")} placeholder={tutorPlaceholder.availability} error={errors.availability?.message} />
				</FormInputCluster>

				<FormInputCluster className="mt-3!">
					<FormDropdownInput label="In Person" register={register("in_person")} options={["In-Person Only", "Online Only", "Hybrid"]} error={errors.in_person?.message} />
					<FormDropdownInput label="City" register={register("city")} options={["Edmonton", "Greater Edmonton", "Vancouver"]} error={errors.city?.message} />
				</FormInputCluster>

				<FormInputCluster className="mt-3!">
					<FormTextInput label="Location" register={register("location")} placeholder={tutorPlaceholder.location} error={errors.location?.message} />
				</FormInputCluster>

				<FormHeader text="Academic Information" />
				<h2>Post-Secondary</h2>

				<FormInputCluster className="mt-3!">
					<FormNumberInput
						label="Year of Study in Current Degree (enter '-1' if currently in high school)"
						register={register("year_of_study", { valueAsNumber: true })}
						placeholder={tutorPlaceholder.year_of_study?.toString()}
						step={1}
						min={-1}
						error={errors.year_of_study?.message}
					/>
					<FormTextInput label={`${uniIdentifier} University`} placeholder={tutorPlaceholder.current_uni} register={register("current_uni")} error={errors.current_uni?.message} />
				</FormInputCluster>

				<FormInputCluster className="mt-3!">
					<FormDropdownInput
						label={`${uniIdentifier} Degree`}
						register={register("current_degree")}
						options={["Bachelor's Degree", "Master's Degree", "Associate's Degree", "Doctorate", "Vocational Certificate", "Other"]}
						error={errors.current_degree?.message}
					/>
					<FormTextInput label={`${uniIdentifier} Field of Study`} register={register("field_of_study")} placeholder={tutorPlaceholder.field_of_study} error={errors.field_of_study?.message} />
				</FormInputCluster>

				<h2 className="landscape:mt-4 portrait:mt-7">High School</h2>
				<FormInputCluster className="mt-3!">
					<FormTextInput label={`High School Attend${isHighSchool ? "ing" : "ed"}`} register={register("high_school")} placeholder={tutorPlaceholder.high_school} error={errors.high_school?.message} />
					<FormTextInput label="High School City" register={register("high_school_city")} placeholder={tutorPlaceholder.high_school_city} error={errors.high_school_city?.message} />
				</FormInputCluster>

				<FormInputCluster className="mt-3!">
					<FormTextInput label="Favourite High School Class" register={register("fav_high_school_class")} placeholder={tutorPlaceholder.fav_high_school_class} error={errors.fav_high_school_class?.message} />
					<FormDropdownInput
						label="AP/IB Credentials"
						register={register("ap_ib_credentials")}
						options={["AP Scholar", "AP Scholar with Honours", "AP Scholar with Distinction", "IB Certificate", "IB Diploma", "N/A"]}
						error={errors.ap_ib_credentials?.message}
					/>
				</FormInputCluster>

				<h2 className="landscape:mt-4 portrait:mt-7">General</h2>
				<FormInputCluster className="mt-3!">
					<FormTextInput label="Favourite Class This Semester" register={register("current_fav_class")} placeholder={tutorPlaceholder.current_fav_class} error={errors.current_fav_class?.message} />
					<FormTextInput label="Academic Interests" register={register("academic_interests")} placeholder={tutorPlaceholder.academic_interests} error={errors.academic_interests?.message} />
				</FormInputCluster>

				<FormHeader text="Personal Information" />
				<p>Show off your personality!</p>

				<FormInputCluster className="mt-3!">
					<FormTextAreaInput label="Bio" register={register("bio")} placeholder={tutorPlaceholder.bio} error={errors.bio?.message} rows={4} />
				</FormInputCluster>

				<FormInputCluster className="mt-3!">
					<FormTextInput label="Hobbies" register={register("hobbies")} placeholder={tutorPlaceholder.hobbies} error={errors.hobbies?.message} />
				</FormInputCluster>

				<FormSubmitInput pending={isSubmitting} format="self-stretch text-primary font-bold text-primary mt-10 text-xl" />
				{errors.root && <p className="text-red-500">{errors.root?.message}</p>}
			</form>
		</FormProvider>
	);
};

export default TutorSemesterUpdateForm;
