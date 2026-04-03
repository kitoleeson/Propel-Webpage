/** @format */

import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
	label: string;
	register: UseFormRegisterReturn;
	min?: number;
	max?: number;
	step?: number;
	error?: string;
	placeholder?: string;
};

const FormNumberInput = ({ label, register, min, max, step, error, placeholder }: Props) => {
	return (
		<div className="flex flex-col gap-1 flex-1">
			<label>{label}</label>
			<input className="border border-gray-300 rounded-md p-1" {...register} inputMode="decimal" type="number" min={min} max={max} step={step} placeholder={placeholder} />
			{error && <p className="text-red-500">{error}</p>}
		</div>
	);
};

export default FormNumberInput;
