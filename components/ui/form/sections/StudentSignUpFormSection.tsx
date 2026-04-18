/** @format */

"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormTextInput, FormPhoneInput, FormDropdownInput, FormRadioInput, FormNumberInput } from "@/components/ui/form/inputs";
import type { ClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import type { PersonPlaceholder } from "@/lib/validation/clientForm/clientFormPersonPlaceholders";
import { FormInputCluster } from "../layout";

type Props = {
	placeholder: PersonPlaceholder;
};

const StudentSection = ({ placeholder }: Props) => {
	const {
		register,
		formState: { errors },
	} = useFormContext<ClientFormValues>();

	return (
		<>
			<h1>Student Information</h1>

			<FormInputCluster>
				<FormTextInput label="First Name" register={register("student.gov_first_name")} placeholder={placeholder.gov_first_name} error={errors.student?.gov_first_name?.message} />
				<FormTextInput label="Last Name" register={register("student.gov_last_name")} placeholder={placeholder.gov_last_name} error={errors.student?.gov_last_name?.message} />
				<FormTextInput label="Preferred Name (if applicable)" register={register("student.pref_name")} placeholder={placeholder.pref_name} error={errors.student?.pref_name?.message} />
			</FormInputCluster>

			<FormInputCluster>
				<FormNumberInput label="Grade" register={register("student.grade", { valueAsNumber: true })} min={1} max={12} step={1} placeholder={placeholder.grade.toString()} error={errors.student?.grade?.message} />
				<FormTextInput label="City" register={register("student.city")} placeholder={placeholder.city} error={errors.student?.city?.message} />
			</FormInputCluster>

			<FormInputCluster>
				<FormTextInput label="Email" type="email" register={register("student.email")} placeholder={placeholder.email} error={errors.student?.email?.message} />
				<FormPhoneInput label="Phone" register={register("student.phone")} placeholder={placeholder.phone} error={errors.student?.phone?.message} />
				<FormRadioInput label="Preferred Communication" register={register("student.pref_communication")} options={["Email", "Text Message"]} error={errors.student?.pref_communication?.message} />
			</FormInputCluster>

			<FormInputCluster>
				<FormDropdownInput
					label="How Did You Find Us?"
					register={register("student.how_found_us")}
					options={["Teacher", "Family Member", "Word of Mouth", "Advertisement", "Web Search", "Other"]}
					error={errors.student?.how_found_us?.message}
				/>
				<FormRadioInput label="Who Will Be Paying For Tutoring Sessions?" register={register("student.biller")} options={["Student", "Guardian"]} error={errors.student?.biller?.message} />
			</FormInputCluster>
		</>
	);
};

export default StudentSection;
