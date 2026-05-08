/** @format */

import { UseFormRegisterReturn } from "react-hook-form";

export { default as FormTextInput } from "./FormTextInput";
export { default as FormPhoneInput } from "./FormPhoneInput";
export { default as FormDropdownInput } from "./FormDropdownInput";
export { default as FormRadioInput } from "./FormRadioInput";
export { default as FormButtonInput } from "./FormButtonInput";
export { default as FormNumberInput } from "./FormNumberInput";
export { default as FormDateInput } from "./FormDateInput";
export { default as FormCheckboxInput } from "./FormCheckboxInput";
export { default as FormSubmitInput } from "./FormSubmitInput";
export { default as FormTextAreaInput } from "./FormTextAreaInput";

type FormBaseInputProps = {
	label: string;

	error?: string;
	placeholder?: string;
	disabled?: boolean;

	divFormat?: string;
	format?: string;
	type?: string;
};

type FormRegisterableProps = FormBaseInputProps & {
	register: UseFormRegisterReturn;
};

type FormOptionProps = FormRegisterableProps & {
	options: string[];
};

type FormButtonInputProps = FormBaseInputProps & {
	register?: never;
	onClick: () => void;
	type?: never;
};

type FormTextInputProps = FormRegisterableProps;

type FormPhoneInputProps = FormRegisterableProps;

type FormDropdownInputProps = FormOptionProps;

type FormRadioInputProps = FormOptionProps;

type FormNumberInputProps = FormRegisterableProps & {
	min?: number;
	max?: number;
	step?: number;
};

type FormDateInputProps = FormRegisterableProps & {
	min?: string;
	max?: string;
};

type FormCheckboxInputProps = FormOptionProps;

type FormSubmitInputProps = FormBaseInputProps & {
	label?: string;
	register?: never;
	loadingLabel?: string;
	pending?: boolean;
};

type FormTextAreaInputProps = FormRegisterableProps & {
	rows?: number;
};

export type {
	FormButtonInputProps,
	FormTextInputProps,
	FormPhoneInputProps,
	FormDropdownInputProps,
	FormRadioInputProps,
	FormNumberInputProps,
	FormDateInputProps,
	FormCheckboxInputProps,
	FormSubmitInputProps,
	FormTextAreaInputProps,
};
