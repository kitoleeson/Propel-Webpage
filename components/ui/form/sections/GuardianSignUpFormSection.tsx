/** @format */

"use client";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormTextInput, FormPhoneInput, FormDropdownInput, FormRadioInput, FormCheckboxInput, FormNumberInput } from "@/components/ui/form/inputs";
import type { ClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import type { PersonPlaceholder } from "@/lib/validation/clientForm/clientFormPersonPlaceholders";
import { FormInputCluster } from "../layout";
import { email } from "zod";

type Props = {
	index: number;
	placeholder: PersonPlaceholder;
	optional?: boolean;
};

const GuardianSection = ({ index, placeholder, optional }: Props) => {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = useFormContext<ClientFormValues>();

	const existingGuardian = watch(`guardians.${index}.already_exists`);
	const guardianId = watch(`guardians.${index}.id`);
	const emailPassword = watch(`guardians.${index}.email_password`);

	useEffect(() => {
		if (existingGuardian && guardianId && emailPassword) {
			const verifyGuardian = async () => {
				const response = await checkGuardianStatus(guardianId, emailPassword);
				if (response.success) {
					const data = response.data;
					setValue(`guardians.${index}.gov_first_name`, data.gov_first_name);
					setValue(`guardians.${index}.gov_last_name`, data.gov_last_name);
					setValue(`guardians.${index}.pref_name`, data.pref_name);
					setValue(`guardians.${index}.email`, data.email);
					setValue(`guardians.${index}.phone`, data.phone);
					setValue(`guardians.${index}.pref_communication`, data.pref_communication);
					setValue(`guardians.${index}.relationship`, data.relationship);
				}
			};
			verifyGuardian();
		}
	}, [existingGuardian, guardianId, emailPassword, index, setValue]);

	return (
		<>
			<h1>
				Guardian Information{index > 0 && ` ${index + 1}`}
				{optional && " (Optional)"}
			</h1>

			{index == 0 && (
				<p>
					At least one guardian is required if the student is billed by a guardian. If the student is billing for themselves, guardians are optional. The primary biller is the guardian who we will send our invoices to and
					primarily be in contact with for any reason other than billing.
				</p>
			)}

			<FormInputCluster>
				<FormCheckboxInput label="Is this guardian already linked to a registered student?" register={register(`guardians.${index}.already_exists`)} options={["Yes"]} />
				{existingGuardian && (
					<>
						<FormNumberInput label="Guardian ID (found in registration confirmation email)" disabled={!existingGuardian} register={register(`guardians.${index}.id`)} />
						<FormTextInput
							label="Email (same one used for previous registration)"
							type="email"
							disabled={!existingGuardian}
							register={register(`guardians.${index}.email_password`)}
							error={errors.guardians?.[index]?.email?.message}
						/>
					</>
				)}
			</FormInputCluster>

			<FormInputCluster>
				<FormTextInput label="Government First Name" register={register(`guardians.${index}.gov_first_name`)} placeholder={placeholder.gov_first_name} error={errors.guardians?.[index]?.gov_first_name?.message} />
				<FormTextInput label="Government Last Name" register={register(`guardians.${index}.gov_last_name`)} placeholder={placeholder.gov_last_name} error={errors.guardians?.[index]?.gov_last_name?.message} />
				<FormTextInput label="Preferred Name (if applicable)" register={register(`guardians.${index}.pref_name`)} placeholder={placeholder.pref_name} error={errors.guardians?.[index]?.pref_name?.message} />
			</FormInputCluster>
			<FormInputCluster>
				<FormDropdownInput
					label="Relationship to Student"
					register={register(`guardians.${index}.relationship`)}
					options={["Mother", "Father", "Parent", "Legal Guardian", "Other"]}
					error={errors.guardians?.[index]?.relationship?.message}
				/>
			</FormInputCluster>
			<FormInputCluster>
				<FormTextInput label="Email" type="email" register={register(`guardians.${index}.email`)} placeholder={placeholder.email} error={errors.guardians?.[index]?.email?.message} />
				<FormPhoneInput label="Phone" register={register(`guardians.${index}.phone`)} placeholder={placeholder.phone} error={errors.guardians?.[index]?.phone?.message} />
				<FormRadioInput label="Preferred Communication" register={register(`guardians.${index}.pref_communication`)} options={["Email", "Text Message"]} error={errors.guardians?.[index]?.pref_communication?.message} />
			</FormInputCluster>
		</>
	);
};

export default GuardianSection;

// TO DO:
// - add check for if guardian already exists in system (by email or phone number, if either matches an existing guardian, show the guardian's name and ask if they want to use that profile or create a new one)
// - if they want to use the existing profile, prefill the guardian section with that guardian's information and disable editing
