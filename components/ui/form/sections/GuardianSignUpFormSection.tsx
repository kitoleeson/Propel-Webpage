/** @format */

"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormTextInput, FormPhoneInput, FormSelectInput, FormRadioInput } from "@/components/ui/form/inputs";
import type { ClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import type { PersonPlaceholder } from "@/lib/validation/clientForm/clientFormPersonPlaceholders";

type Props = {
	index: number;
	placeholder: PersonPlaceholder;
	optional?: boolean;
};

// make it so that if student is billed by guardian, at least one guardian section is shown and cannot be removed, but if student is not billed by guardian, guardian sections can be added or removed at will (including having zero guardians)
// also needs radio buttons per guardian for primary biller (probably do in ClientSignUpForm)

const GuardianSection = ({ index, placeholder, optional }: Props) => {
	const {
		register,
		formState: { errors },
	} = useFormContext<ClientFormValues>();

	return (
		<>
			<h1>
				Guardian Information{index > 0 && ` ${index + 1}`}
				{optional && " (Optional)"}
			</h1>
			<div className="landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6">
				<FormTextInput label="First Name" register={register(`guardians.${index}.gov_first`)} placeholder={placeholder.gov_first} error={errors.guardians?.[index]?.gov_first?.message} />
				<FormTextInput label="Last Name" register={register(`guardians.${index}.gov_last`)} placeholder={placeholder.gov_last} error={errors.guardians?.[index]?.gov_last?.message} />
				<FormTextInput label="Preferred Name (if applicable)" register={register(`guardians.${index}.pref_name`)} placeholder={placeholder.pref_name} error={errors.guardians?.[index]?.pref_name?.message} />
			</div>

			<div className="landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6">
				<FormSelectInput
					label="Relationship to Student"
					register={register(`guardians.${index}.relationship`)}
					options={["Mother", "Father", "Parent", "Legal Guardian", "Other"]}
					error={errors.guardians?.[index]?.relationship?.message}
				/>
			</div>

			<div className="landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6">
				<FormTextInput label="Email" type="email" register={register(`guardians.${index}.email`)} placeholder={placeholder.email} error={errors.guardians?.[index]?.email?.message} />
				<FormPhoneInput label="Phone" register={register(`guardians.${index}.phone`)} placeholder={placeholder.phone} error={errors.guardians?.[index]?.phone?.message} />
				<FormRadioInput label="Preferred Communication" register={register(`guardians.${index}.pref_comm`)} options={["Email", "Text Message"]} error={errors.guardians?.[index]?.pref_comm?.message} />
			</div>
		</>
	);
};

export default GuardianSection;

// TO DO:
// - add check for if guardian already exists in system (by email or phone number, if either matches an existing guardian, show the guardian's name and ask if they want to use that profile or create a new one)
// - if they want to use the existing profile, prefill the guardian section with that guardian's information and disable editing
