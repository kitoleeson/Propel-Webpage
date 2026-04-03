/** @format */

import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type Props = {
	label: string;
	register: UseFormRegisterReturn;
	options: string[];
	error?: string;
	placeholder?: string;
};

const FormRadioInput = ({ label, register, options, error, placeholder }: Props) => {
	return (
		<div className="flex flex-col gap-1 flex-1">
			<label>{label}</label>
			<div className="flex flex-row gap-4">
				{options.map((option) => (
					<label key={option} className="flex flex-1 items-center gap-2 border border-gray-300 rounded-md px-2 py-1">
						<input type="radio" value={option} {...register} />
						{option}
					</label>
				))}
			</div>
			{error && <p className="text-red-500">{error}</p>}
		</div>
	);
};

export default FormRadioInput;
