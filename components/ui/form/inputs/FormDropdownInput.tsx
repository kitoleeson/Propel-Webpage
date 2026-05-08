/** @format */

import { FormDropdownInputProps } from ".";

const FormDropdownInput = (props: FormDropdownInputProps) => {
	return (
		<div className={`flex flex-col gap-1 flex-1 ${props.divFormat}`}>
			<label>{props.label}</label>
			<select className={`border border-gray-300 rounded-md p-1 ${props.format}`} {...props.register} defaultValue="" disabled={props.disabled}>
				<option value="" disabled>
					{props.placeholder || "Select an option"}
				</option>
				{props.options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
			{props.error && <p className="text-red-500">{props.error}</p>}
		</div>
	);
};

export default FormDropdownInput;
