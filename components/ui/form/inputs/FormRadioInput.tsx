/** @format */

import { FormRadioInputProps } from ".";

const FormRadioInput = (props: FormRadioInputProps) => {
	return (
		<div className={`flex flex-col gap-1 flex-1 ${props.divFormat}`}>
			<label>{props.label}</label>
			<div className="flex flex-row gap-4">
				{props.options.map((option) => (
					<label key={option} className={`flex flex-1 items-center gap-2 border border-gray-300 rounded-md px-2 py-1 ${props.format}`}>
						<input type="radio" value={option} {...props.register} disabled={props.disabled} />
						{option}
					</label>
				))}
			</div>
			{props.error && <p className="text-red-500">{props.error}</p>}
		</div>
	);
};

export default FormRadioInput;
