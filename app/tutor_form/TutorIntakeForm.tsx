/** @format */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { defaultTutor, FormValues, tutorSchema } from "@/lib/validation/tutorForm/tutorFormSchema";
import { FormButtonInput, FormInputCluster, FormPhoneInput, FormRadioInput, FormDropdownInput, FormTextInput, FormNumberInput, FormDateInput } from "@/components/ui/form";
import FormCheckboxInput from "@/components/ui/form/inputs/FormCheckboxInput";

const TutorIntakeForm = () => {
	const methods = useForm<FormValues>({
		resolver: zodResolver(tutorSchema),
		defaultValues: defaultTutor,
	});

	const {
		register,
		formState: { errors },
		handleSubmit,
	} = methods;

	const onSubmit: SubmitHandler<z.infer<typeof tutorSchema>> = (data) => {
		console.log("Form submitted with data:");
		console.log(data);
	};

	return (
		<div className="mt-10 mb-100">
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<h1 className="landscape:mt-8 portrait:mt-14">Personal Information</h1>

					<FormInputCluster className="mt-3!">
						<FormTextInput label="First Name" register={register("gov_first")} error={errors.gov_first?.message} />
						<FormTextInput label="Last Name" register={register("gov_last")} error={errors.gov_last?.message} />
						<FormTextInput label="Preferred Name (if applicable)" register={register("pref_name")} error={errors.pref_name?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormTextInput label="Email" type="email" register={register("email")} error={errors.email?.message} />
						<FormPhoneInput label="Phone" register={register("phone")} error={errors.phone?.message} />
					</FormInputCluster>

					<h1 className="landscape:mt-8 portrait:mt-14">Tutoring Information</h1>

					<FormInputCluster className="mt-3!">
						<FormDateInput label="Date Hired" register={register("date_hired")} error={errors.date_hired?.message} />
						<FormNumberInput label="Full years of tutoring experience before Propel?" register={register("prior_experience")} error={errors.prior_experience?.message} step={1} />
						<FormNumberInput label="What is your current agreed-upon rate?" register={register("current_rate")} min={25} step={2.5} error={errors.current_rate?.message} />
					</FormInputCluster>

					<h1 className="landscape:mt-8 portrait:mt-14">Emergency Contact Information</h1>

					<FormInputCluster className="mt-3!">
						<FormTextInput label="Emergency Contact Full Name" register={register("emerg_contact_name")} error={errors.emerg_contact_name?.message} />
						<FormPhoneInput label="Emergency Contact Phone Number" register={register("emerg_contact_phone")} error={errors.emerg_contact_phone?.message} />
						<FormTextInput label="Emergency Contact Relationship to Tutor" register={register("emerg_contact_relationship")} error={errors.emerg_contact_relationship?.message} />
					</FormInputCluster>

					<h1 className="landscape:mt-8 portrait:mt-14">Availability Information</h1>

					<FormInputCluster className="mt-3!">
						<FormTextInput label="Availability" register={register("availability")} error={errors.availability?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormDropdownInput label="In Person" register={register("in_person")} options={["In Person Only", "Online Only", "Both"]} error={errors.in_person?.message} />
						<FormTextInput label="City" register={register("city")} error={errors.city?.message} />
						<FormTextInput label="Location" register={register("location")} error={errors.location?.message} />
					</FormInputCluster>

					<h1 className="landscape:mt-8 portrait:mt-14">Teaching Information</h1>

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
							options={["Computer Science 10", "Computer Science 20 (AP)", "Computer Science 30 (AP)"]}
							error={errors.subjects?.computer_science?.message}
						/>
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput
							label="What social studies do you teach?"
							register={register("subjects.social_studies")}
							options={["Social Studies 10 (AP)", "Social Studies 20 (AP)", "Social Studies 30 (AP)"]}
							error={errors.subjects?.social_studies?.message}
						/>
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput label="What english do you teach?" register={register("subjects.english")} options={["English 10 (AP)", "English 20 (AP)", "English 30 (AP)"]} error={errors.subjects?.english?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormCheckboxInput label="What languages do you teach?" register={register("subjects.languages")} options={["French 10-30", "Spanish 10-30", "German 10-30"]} error={errors.subjects?.english?.message} />
					</FormInputCluster>

					<h1 className="landscape:mt-8 portrait:mt-14">Post-Secondary Information</h1>

					<FormInputCluster className="mt-3!">
						<FormNumberInput label="Year of Study in Current Degree (enter '-1' if currently in high school)" register={register("current_study_year")} min={-1} error={errors.current_study_year?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormTextInput label="Current University" register={register("current_uni")} error={errors.current_uni?.message} />
						<FormDropdownInput label="Current Degree" register={register("current_degree")} options={["Bachelor's Degree", "Master's Degree", "PhD"]} error={errors.current_degree?.message} />
						<FormTextInput label="Current Field of Study" register={register("current_study_field")} error={errors.current_study_field?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormTextInput label="Current Favourite Class" register={register("current_fav_class")} error={errors.current_fav_class?.message} />
						<FormTextInput label="Academic Interests" register={register("academic_interests")} error={errors.academic_interests?.message} />
					</FormInputCluster>

					<h1 className="landscape:mt-8 portrait:mt-14">Personal Information</h1>

					<FormInputCluster className="mt-3!">
						<FormTextInput label="Bio" register={register("bio")} error={errors.bio?.message} />
						<FormTextInput label="Hobbies" register={register("hobbies")} error={errors.hobbies?.message} />
					</FormInputCluster>

					<h1 className="landscape:mt-8 portrait:mt-14">High School Information</h1>

					<FormInputCluster className="mt-3!">
						<FormTextInput label="High School Attended" register={register("high_school")} error={errors.high_school?.message} />
						<FormTextInput label="High School City" register={register("high_school_city")} error={errors.high_school_city?.message} />
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormTextInput label="Favourite High School Class" register={register("fav_high_school_class")} error={errors.fav_high_school_class?.message} />
						<FormTextInput label="AP/IB Credentials" register={register("ap_ib_credentials")} error={errors.ap_ib_credentials?.message} />
					</FormInputCluster>

					<FormButtonInput label="Submit" onClick={handleSubmit(onSubmit)} format="self-stretch text-primary font-bold text-primary mt-10 text-xl" />
				</form>
			</FormProvider>
		</div>
	);
};

export default TutorIntakeForm;
