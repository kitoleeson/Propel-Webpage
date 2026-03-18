/** @format */

"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormTextInput, FormPhoneInput, FormSelectInput, FormRadioInput } from "@/components/ui/form/inputs";
import type { FormValues } from "@/lib/validation/clientForm/clientFormSchema";
import type { PersonPlaceholder } from "@/lib/validation/clientForm/clientFormPersonPlaceholders";

type Props = {
	index: number;
	placeholder: PersonPlaceholder;
};

const GuardianSection = ({ index, placeholder }: Props) => {
	const {
		register,
		formState: { errors },
	} = useFormContext<FormValues>();

	return (
		<>
			<h1>Guardian Information</h1>
			<div className="landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6">
				<FormTextInput
					label="First Name"
					register={register(`guardians.${index}.gov_first`)}
					placeholder={placeholder.gov_first}
					error={errors.guardians?.[index]?.gov_first?.message}
				/>
				<FormTextInput
					label="Last Name"
					register={register(`guardians.${index}.gov_last`)}
					placeholder={placeholder.gov_last}
					error={errors.guardians?.[index]?.gov_last?.message}
				/>
				<FormTextInput
					label="Preferred Name (if applicable)"
					register={register(`guardians.${index}.pref_name`)}
					placeholder={placeholder.pref_name}
					error={errors.guardians?.[index]?.pref_name?.message}
				/>
			</div>

			<div className="landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6">
				<FormTextInput
					label="Email"
					type="email"
					register={register(`guardians.${index}.email`)}
					placeholder={placeholder.email}
					error={errors.guardians?.[index]?.email?.message}
				/>
				<FormPhoneInput
					label="Phone"
					register={register(`guardians.${index}.phone`)}
					placeholder={placeholder.phone}
					error={errors.guardians?.[index]?.phone?.message}
				/>
				<FormRadioInput
					label="Preferred Communication"
					register={register(`guardians.${index}.pref_comm`)}
					options={["Email", "Text Message"]}
					error={errors.guardians?.[index]?.pref_comm?.message}
				/>
			</div>

			<div className="landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6"></div>
		</>
	);
};

export default GuardianSection;
