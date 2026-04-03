/** @format */
"use client";

import { useFormStatus } from "react-dom";

type Props = {
	label?: string;
	loadingLabel?: string;
	format?: string;
	pending?: boolean;
	error?: string;
	divFormat?: string;
};

export default function FormSubmitInput({ label = "Submit", loadingLabel = "Loading...", pending, format, error, divFormat }: Props) {
	return (
		<div className={`mt-6 flex flex-col gap-1 flex-1 ${divFormat}`}>
			<button type="submit" disabled={pending} className={`self-start border border-gray-300 rounded-md py-1 px-2 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed ${format}`}>
				{pending ? loadingLabel : label}
			</button>
			{error && <p className="text-red-500 text-sm">{error}</p>}
		</div>
	);
}
