/** @format */

import { FormCheckboxInputProps } from ".";

/** make it a grid, not a row, so that more options overflow to a new line, not scroll off the page */

const FormCheckboxInput = (props: FormCheckboxInputProps) => {
	return (
		<fieldset className={`flex flex-col gap-1 flex-1 portrait:mt-2 ${props.divFormat}`}>
			<legend>{props.label}</legend>
			<div className="flex landscape:flex-row portrait:flex-col landscape:gap-4 portrait:gap-3">
				{props.options.map((option) => (
					<div key={option} className={`flex flex-1 items-center gap-2 border border-gray-300 rounded-md px-1 py-1 ${props.format}`}>
						<input id={`${props.register?.name}_${option}`} type="checkbox" value={option} {...props.register} disabled={props.disabled} />
						<label htmlFor={`${props.register?.name}_${option}`}>{option}</label>
					</div>
				))}
			</div>
			{props.error && <p className="text-red-500">{props.error}</p>}
		</fieldset>
	);
};

export default FormCheckboxInput;
