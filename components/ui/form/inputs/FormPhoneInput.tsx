/** @format */

"use client";
import { FormPhoneInputProps } from ".";

function formatPhone(value: string) {
	const digits = value.replace(/\D/g, "").slice(0, 10);

	const area = digits.slice(0, 3);
	const middle = digits.slice(3, 6);
	const last = digits.slice(6, 10);

	if (digits.length <= 3) return digits;
	if (digits.length <= 6) return `(${area}) ${middle}`;
	return `(${area}) ${middle}-${last}`;
}

export default function FormPhoneInput(props: FormPhoneInputProps) {
	return (
		<div className={`flex flex-col gap-1 flex-1 ${props.divFormat}`}>
			<label>{props.label}</label>

			<input
				type="tel"
				inputMode="numeric"
				{...props.register}
				onChange={(e) => {
					const formatted = formatPhone(e.target.value);
					e.target.value = formatted;
					props.register.onChange(e);
				}}
				className={`border border-gray-300 rounded-md p-1 ${props.format}`}
				placeholder={props.placeholder}
				disabled={props.disabled}
			/>

			{props.error && <p className="text-red-500">{props.error}</p>}
		</div>
	);
}
