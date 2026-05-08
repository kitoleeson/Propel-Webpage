/** @format */

"use client";

import { FormButtonInputProps } from ".";

export default function FormButtonInput(props: FormButtonInputProps) {
	return (
		<div className={`mt-6 flex flex-col gap-1 flex-1 ${props.divFormat}`}>
			<button type="button" onClick={props.onClick} className={`self-start border border-gray-300 rounded-md py-1 px-2 hover:bg-stone-100 ${props.format}`} disabled={props.disabled}>
				{props.label}
			</button>
			{props.error && <p className="text-red-500">{props.error}</p>}
		</div>
	);
}
