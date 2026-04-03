/** @format */

import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
	label: string;
	register: UseFormRegisterReturn;
	error?: string;
	placeholder?: string;
	rows?: number;
};

const FormTextAreaInput = ({ label, register, error, placeholder, rows = 2 }: Props) => {
	return (
		<div className="flex flex-col gap-1 flex-1">
			<label>{label}</label>
			<textarea className="border border-gray-300 rounded-md p-1 resize-y min-h-12" {...register} placeholder={placeholder} rows={rows} />
			{error && <p className="text-red-500 text-sm">{error}</p>}
		</div>
	);
};

export default FormTextAreaInput;
