/** @format */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { defaultTutor, FormValues, tutorSchema, tutorPlaceholder } from "@/lib/validation/tutorForm/tutorFormSchema";
import { FormInputCluster, FormPhoneInput, FormDropdownInput, FormTextInput, FormNumberInput, FormDateInput } from "@/components/ui/form";
import FormCheckboxInput from "@/components/ui/form/inputs/FormCheckboxInput";
import { submitTutorForApproval } from "@/lib/db/actions";
import { useEffect } from "react";
import FormSubmitInput from "@/components/ui/form/inputs/FormSubmitInput";
import FormTextAreaInput from "@/components/ui/form/inputs/FormTextAreaInput";
import FormHeader from "@/components/ui/form/layout/FormHeader";

const TutorIntakeForm = () => {
	const methods = useForm<FormValues>({
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
	} = methods;

	useEffect(() => {
		if (isDirty) clearErrors("root");
	}, [watch("gov_first_name"), watch("gov_last_name"), isDirty, clearErrors]);

	const onSubmit: SubmitHandler<z.infer<typeof tutorSchema>> = async (data) => {
		try {
			clearErrors("root");
			await submitTutorForApproval(data);
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
		<div className="my-10">
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FormHeader text="Personal Information" />
					<p>This is how clients and other tutors will call and contact you. Please enter your government first and last name, and the email and phone number that you wish to be contacted on.</p>

					{/* <FormInputCluster className="mt-3!">
						<FormDropdownInput
							label="Choose Your Profile"
							options={process.env.TUTORS?.split(", ").map((tutor) => tutor.trim())}
							placeholder="Select a profile"
						/>
					</FormInputCluster> */}

					<FormInputCluster className="mt-3!">
						<FormTextInput label="Government First Name" register={register("gov_first_name")} placeholder={tutorPlaceholder.gov_first_name} error={errors.gov_first_name?.message} />
						<FormTextInput label="Government Last Name" register={register("gov_last_name")} placeholder={tutorPlaceholder.gov_last_name} error={errors.gov_last_name?.message} />
						<FormTextInput label="Preferred Name (if applicable)" register={register("pref_name")} placeholder={tutorPlaceholder.pref_name} error={errors.pref_name?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormTextInput label="Email" type="email" register={register("email")} placeholder={tutorPlaceholder.email} error={errors.email?.message} />
						<FormPhoneInput label="Phone" register={register("phone")} placeholder={tutorPlaceholder.phone} error={errors.phone?.message} />
					</FormInputCluster>

					<FormHeader text="Emergency Contact Information" />
					<p>Your emergency contact information will not be shared with the public.</p>

					<FormInputCluster className="mt-3!">
						<FormTextInput label="Emergency Contact Full Name" register={register("emerg_contact_name")} placeholder={tutorPlaceholder.emerg_contact_name} error={errors.emerg_contact_name?.message} />
						<FormPhoneInput label="Emergency Contact Phone Number" register={register("emerg_contact_phone")} placeholder={tutorPlaceholder.emerg_contact_phone} error={errors.emerg_contact_phone?.message} />
						<FormTextInput
							label="Emergency Contact Relationship to Tutor"
							register={register("emerg_contact_relationship")}
							placeholder={tutorPlaceholder.emerg_contact_relationship}
							error={errors.emerg_contact_relationship?.message}
						/>
					</FormInputCluster>

					<FormHeader text="Tutoring Information" />

					<FormInputCluster className="mt-3!">
						<FormDateInput label="Date Hired" register={register("date_hired", { valueAsDate: true })} error={errors.date_hired?.message} />
						<FormNumberInput
							label="What is your current agreed-upon rate?"
							register={register("current_rate", { valueAsNumber: true })}
							placeholder={tutorPlaceholder.current_rate?.toString()}
							min={25}
							step={2.5}
							error={errors.current_rate?.message}
						/>
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormNumberInput
							label="Full years of tutoring experience before Propel?"
							register={register("prior_experience", { valueAsNumber: true })}
							placeholder={tutorPlaceholder.prior_experience?.toString()}
							error={errors.prior_experience?.message}
							step={1}
							min={0}
						/>
						<FormNumberInput
							label="How many (more) students do you want to tutor right now?"
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

					<FormHeader text="Teaching Information" />
					<p>Please check all subjects which you feel comfortable tutoring and want to tutor. This can also always be changed.</p>
					{errors.subjects?.message && <p className="text-red-500">{errors.subjects?.message}</p>}

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput label="What mathematics do you teach?" register={register("subjects.math")} options={["Math 10", "Math 20 (AP)", "Math 30 (AP)"]} error={errors.subjects?.math?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput
							label="What calculus and statistics do you teach?"
							register={register("subjects.advanced_math")}
							options={["Math 31 (AP)", "Math 35 (AP)", "Stats 35 (AP)"]}
							error={errors.subjects?.advanced_math?.message}
						/>
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput label="What science do you teach?" register={register("subjects.science")} options={["Science 10", "Science 20", "Science 30"]} error={errors.subjects?.science?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput label="What physics do you teach?" register={register("subjects.physics")} options={["Physics 20 (AP)", "Physics 30 (AP)", "Physics C (AP)"]} error={errors.subjects?.physics?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput label="What chemistry do you teach?" register={register("subjects.chemistry")} options={["Chemistry 20 (AP)", "Chemistry 30 (AP)"]} error={errors.subjects?.chemistry?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput label="What biology do you teach?" register={register("subjects.biology")} options={["Biology 20 (AP)", "Biology 30 (AP)"]} error={errors.subjects?.biology?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput
							label="What computer science do you teach?"
							register={register("subjects.computer_science")}
							options={["Comp Sci 10", "Comp Sci 20 (AP)", "Comp Sci 30 (AP)"]}
							error={errors.subjects?.computer_science?.message}
						/>
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput
							label="What social studies do you teach?"
							register={register("subjects.social_studies")}
							options={["Social 10 (AP)", "Social 20 (AP)", "Social 30 (AP)"]}
							error={errors.subjects?.social_studies?.message}
						/>
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput label="What english do you teach?" register={register("subjects.english")} options={["English 10 (AP)", "English 20 (AP)", "English 30 (AP)"]} error={errors.subjects?.english?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput label="What languages do you teach?" register={register("subjects.languages")} options={["French 10-30", "Spanish 10-30", "German 10-30"]} error={errors.subjects?.english?.message} />
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
		</div>
	);
};

export default TutorIntakeForm;
