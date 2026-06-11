/** @format */

"use client";
import { useFormContext } from "react-hook-form";
import { FormTextInput, FormPhoneInput, FormDropdownInput, FormRadioInput, FormCheckboxInput } from "@/components/ui/form/inputs";
import type { ClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import type { PersonPlaceholder } from "@/lib/validation/clientForm/clientFormPersonPlaceholders";
import { FormInputCluster } from "../layout";
import { checkGuardianStatus } from "@/lib/db/actions";

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
		getValues,
		clearErrors,
		setError,
		formState: { errors },
	} = useFormContext<ClientFormValues>();

	const existingGuardian = watch(`guardians.${index}.already_exists`);

	const verifyGuardian = async () => {
		const alreadyExists = getValues(`guardians.${index}.already_exists`);
		const emailPassword = getValues(`guardians.${index}.email_password`);
		if (!alreadyExists || !emailPassword) return;

		const response = await checkGuardianStatus(emailPassword);
		if (response.success && response.data) {
			const data = response.data;
			setValue(`guardians.${index}.gov_first_name`, data.gov_first_name);
			setValue(`guardians.${index}.gov_last_name`, data.gov_last_name);
			setValue(`guardians.${index}.pref_name`, data.pref_name);
			setValue(`guardians.${index}.email`, data.email);
			setValue(`guardians.${index}.phone`, data.phone ?? "");
			setValue(`guardians.${index}.pref_communication`, data.pref_communication);
			setValue(`guardians.${index}.relationship`, data.relationship_type);
			clearErrors(`guardians.${index}.already_exists`);
		} else setError(`guardians.${index}.already_exists`, { type: "manual", message: response.error || "Guardian not found" });
	};

	const clearFields = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) return;
		setValue(`guardians.${index}.email_password`, "");
		setValue(`guardians.${index}.gov_first_name`, "");
		setValue(`guardians.${index}.gov_last_name`, "");
		setValue(`guardians.${index}.pref_name`, "");
		setValue(`guardians.${index}.email`, "");
		setValue(`guardians.${index}.phone`, "");
	};

	return (
		<div>
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
				<FormCheckboxInput
					label="Is this guardian already linked to a registered student?"
					register={register(`guardians.${index}.already_exists`, { onChange: clearFields })}
					options={["Yes"]}
					error={errors.guardians?.[index]?.already_exists?.message}
				/>
				{existingGuardian && (
					<FormTextInput
						label="Email (same one used for previous registration)"
						type="email"
						disabled={!existingGuardian}
						placeholder={placeholder.email}
						register={register(`guardians.${index}.email_password`, { onBlur: verifyGuardian })}
						error={errors.guardians?.[index]?.email_password?.message}
					/>
				)}
			</FormInputCluster>

			<FormInputCluster>
				<FormTextInput
					label="Government First Name"
					register={register(`guardians.${index}.gov_first_name`)}
					placeholder={existingGuardian ? undefined : placeholder.gov_first_name}
					error={errors.guardians?.[index]?.gov_first_name?.message}
					disabled={existingGuardian}
				/>
				<FormTextInput
					label="Government Last Name"
					register={register(`guardians.${index}.gov_last_name`)}
					placeholder={existingGuardian ? undefined : placeholder.gov_last_name}
					error={errors.guardians?.[index]?.gov_last_name?.message}
					disabled={existingGuardian}
				/>
				<FormTextInput
					label="Preferred Name (if applicable)"
					register={register(`guardians.${index}.pref_name`)}
					placeholder={existingGuardian ? undefined : placeholder.pref_name}
					error={errors.guardians?.[index]?.pref_name?.message}
					disabled={existingGuardian}
				/>
			</FormInputCluster>

			<FormInputCluster>
				<FormDropdownInput
					label="Relationship to Student"
					register={register(`guardians.${index}.relationship`)}
					options={["Mother", "Father", "Parent", "Legal Guardian", "Other"]}
					error={errors.guardians?.[index]?.relationship?.message}
					disabled={existingGuardian}
				/>
			</FormInputCluster>

			<FormInputCluster>
				<FormTextInput
					label="Email"
					type="email"
					register={register(`guardians.${index}.email`)}
					placeholder={existingGuardian ? undefined : placeholder.email}
					error={errors.guardians?.[index]?.email?.message}
					disabled={existingGuardian}
				/>
				<FormPhoneInput label="Phone" register={register(`guardians.${index}.phone`)} placeholder={existingGuardian ? undefined : placeholder.phone} error={errors.guardians?.[index]?.phone?.message} disabled={existingGuardian} />
				<FormRadioInput
					label="Preferred Communication"
					register={register(`guardians.${index}.pref_communication`)}
					options={["Email", "Text Message"]}
					error={errors.guardians?.[index]?.pref_communication?.message}
					disabled={existingGuardian}
				/>
			</FormInputCluster>
		</div>
	);
};

export default GuardianSection;
