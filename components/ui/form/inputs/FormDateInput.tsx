/** @format */

import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
	label: string;
	register: UseFormRegisterReturn;
	min?: string;
	max?: string;
	error?: string;
	placeholder?: string;
};

const FormDateInput = ({ label, register, min, max, error, placeholder }: Props) => {
	return (
		<div className="flex flex-col gap-1 flex-1">
			<label>{label}</label>
			<input className="border border-gray-300 rounded-md p-1" {...register} type="date" min={min} max={max} placeholder={placeholder} />
			{error && <p className="text-red-500">{error}</p>}
		</div>
	);
};

export default FormDateInput;
