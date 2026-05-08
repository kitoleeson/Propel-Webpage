/** @format */

import { FormTextAreaInputProps } from ".";

const FormTextAreaInput = (props: FormTextAreaInputProps) => {
	return (
		<div className={`flex flex-col gap-1 flex-1 ${props.divFormat}`}>
			<label>{props.label}</label>
			<textarea className={`border border-gray-300 rounded-md p-1 resize-y min-h-12 ${props.format}`} {...props.register} placeholder={props.placeholder} rows={props.rows ?? 2} disabled={props.disabled} />
			{props.error && <p className="text-red-500 text-sm">{props.error}</p>}
		</div>
	);
};

export default FormTextAreaInput;
