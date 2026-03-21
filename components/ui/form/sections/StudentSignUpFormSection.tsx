/** @format */

"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormTextInput, FormPhoneInput, FormSelectInput, FormRadioInput } from "@/components/ui/form/inputs";
import type { FormValues } from "@/lib/validation/clientForm/clientFormSchema";
import type { PersonPlaceholder } from "@/lib/validation/clientForm/clientFormPersonPlaceholders";

type Props = {
	placeholder: PersonPlaceholder;
};

const StudentSection = ({ placeholder }: Props) => {
	const {
		register,
		formState: { errors },
	} = useFormContext<FormValues>();

	return (
		<>
			<h1>Student Information</h1>
			<div className="landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6">
				<FormTextInput label="First Name" register={register("student.gov_first")} placeholder={placeholder.gov_first} error={errors.student?.gov_first?.message} />
				<FormTextInput label="Last Name" register={register("student.gov_last")} placeholder={placeholder.gov_last} error={errors.student?.gov_last?.message} />
				<FormTextInput label="Preferred Name (if applicable)" register={register("student.pref_name")} placeholder={placeholder.pref_name} error={errors.student?.pref_name?.message} />
			</div>

			<div className="landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6">
				<FormTextInput label="Grade" register={register("student.grade", { valueAsNumber: true })} placeholder={placeholder.grade.toString()} error={errors.student?.grade?.message} />
				<FormTextInput label="City" register={register("student.city")} placeholder={placeholder.city} error={errors.student?.city?.message} />
			</div>

			<div className="landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6">
				<FormTextInput label="Email" type="email" register={register("student.email")} placeholder={placeholder.email} error={errors.student?.email?.message} />
				<FormPhoneInput label="Phone" register={register("student.phone")} placeholder={placeholder.phone} error={errors.student?.phone?.message} />
				<FormRadioInput label="Preferred Communication" register={register("student.pref_comm")} options={["Email", "Text Message"]} error={errors.student?.pref_comm?.message} />
			</div>

			<div className="landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6">
				<FormSelectInput label="How Did You Find Us?" register={register("student.how_found")} options={["Teacher", "Word of Mouth", "Advertisement", "Web Search", "Other"]} error={errors.student?.how_found?.message} />
				<FormRadioInput label="Who Will Be Paying For Tutoring Sessions?" register={register("student.biller")} options={["Student", "Guardian"]} error={errors.student?.biller?.message} />
			</div>
		</>
	);
};

export default StudentSection;
