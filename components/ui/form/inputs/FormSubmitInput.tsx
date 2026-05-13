/** @format */
"use client";

import { FormSubmitInputProps } from ".";

export default function FormSubmitInput(props: FormSubmitInputProps) {
	const label = props.label ?? "Submit";
	const loadingLabel = props.loadingLabel ?? "Loading...";

	return (
		<div className={`mt-6 flex flex-col gap-1 flex-1 ${props.divFormat}`}>
			<button type="submit" disabled={props.pending || props.disabled} className={`self-start border border-gray-300 rounded-md py-1 px-2 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed ${props.format}`}>
				{props.pending ? loadingLabel : label}
			</button>
			{props.error && <p className="text-red-500 text-sm">{props.error}</p>}
		</div>
	);
}
