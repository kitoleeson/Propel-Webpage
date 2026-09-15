/** @format */

import { FormRadioInputProps } from ".";

const FormRadioInput = (props: FormRadioInputProps) => {
	return (
		<fieldset className={`flex flex-col gap-1 flex-1 ${props.divFormat}`}>
			<legend>{props.label}</legend>
			<div className="flex flex-row gap-4">
				{props.options.map((option) => (
					<div key={option} className={`flex flex-1 items-center gap-2 border border-gray-300 rounded-md px-2 py-1 ${props.format}`}>
						<input id={`${props.register?.name}_${option.toLowerCase().replaceAll(" ", "-")}`} type="radio" value={option} {...props.register} disabled={props.disabled} />
						<label htmlFor={`${props.register?.name}_${option.toLowerCase().replaceAll(" ", "-")}`}>{option}</label>
					</div>
				))}
			</div>
			{props.error && <p className="text-red-500">{props.error}</p>}
		</fieldset>
	);
};

export default FormRadioInput;
