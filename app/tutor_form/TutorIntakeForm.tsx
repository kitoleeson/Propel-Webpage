/** @format */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { defaultTutor, FormValues, tutorSchema } from "@/lib/validation/tutorForm/tutorFormSchema";
import { FormInputCluster, FormPhoneInput, FormRadioInput, FormSelectInput, FormTextInput } from "@/components/ui/form";

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
						<FormTextInput label="<DATE HIRED, PRIOR EXPERIENCE, CURRENT RATE>" type="email" register={register("email")} error={errors.email?.message} />
						{/* INSERT DATE HIRED (DATE) */}
						{/* INSERT PRIOR EXPERIENCE (NUMERIC) */}
						{/* INSERT CURRENT RATE (NUMERIC) */}
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
						{/* INSERT SUBJECTS (CHECKBOXES) */}
					</FormInputCluster>

					<FormInputCluster className="mt-3!">
						<FormSelectInput label="In Person" register={register("in_person")} options={["In Person Only", "Online Only", "Both"]} error={errors.in_person?.message} />
						<FormTextInput label="City" register={register("city")} error={errors.city?.message} />
						<FormTextInput label="Location" register={register("location")} error={errors.location?.message} />
					</FormInputCluster>

					<h1 className="landscape:mt-8 portrait:mt-14">Post-Secondary Information</h1>

					<FormInputCluster className="mt-3!">
						{/* add for currently in high school tutors */}
						<FormTextInput label="Current University" register={register("current_uni")} error={errors.current_uni?.message} />
						<FormSelectInput label="Current Degree" register={register("current_degree")} options={["Bachelor's Degree", "Master's Degree", "PhD"]} error={errors.current_degree?.message} />
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
				</form>
			</FormProvider>
		</div>
	);
};

export default TutorIntakeForm;
