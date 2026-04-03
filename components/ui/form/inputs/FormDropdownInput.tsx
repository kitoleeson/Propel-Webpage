/** @format */

import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
	label: string;
	register: UseFormRegisterReturn;
	options: string[];
	error?: string;
	placeholder?: string;
};

const FormDropdownInput = ({ label, register, options, error, placeholder }: Props) => {
	return (
		<div className="flex flex-col gap-1 flex-1">
			<label>{label}</label>
			<select className="border border-gray-300 rounded-md p-1" {...register} defaultValue="">
				<option value="" disabled>
					{placeholder || "Select an option"}
				</option>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
			{error && <p className="text-red-500">{error}</p>}
		</div>
	);
};

export default FormDropdownInput;
