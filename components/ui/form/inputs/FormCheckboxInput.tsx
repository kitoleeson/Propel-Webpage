/** @format */

import { FormCheckboxInputProps } from ".";

/** make it a grid, not a row, so that more options overflow to a new line, not scroll off the page */

const FormCheckboxInput = (props: FormCheckboxInputProps) => {
	return (
		<div className={`flex flex-col gap-1 flex-1 portrait:mt-2 ${props.divFormat}`}>
			<label>{props.label}</label>
			<div className="flex landscape:flex-row portrait:flex-col landscape:gap-4 portrait:gap-3">
				{props.options.map((option) => (
					<label key={option} className={`flex flex-1 items-center gap-2 border border-gray-300 rounded-md px-1 py-1 ${props.format}`}>
						<input type="checkbox" value={option} {...props.register} disabled={props.disabled} />
						{option}
					</label>
				))}
			</div>
			{props.error && <p className="text-red-500">{props.error}</p>}
		</div>
	);
};

export default FormCheckboxInput;
