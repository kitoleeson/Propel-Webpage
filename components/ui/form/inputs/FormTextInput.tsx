/** @format */

import { FormTextInputProps } from ".";

const FormTextInput = (props: FormTextInputProps) => {
	return (
		<div className={`flex flex-col gap-1 flex-1 ${props.divFormat || ""}`}>
			<label>{props.label}</label>
			<input className={`border border-gray-300 rounded-md p-1 ${props.format}`} {...props.register} type={props.type} placeholder={props.placeholder} disabled={props.disabled} />
			{props.error && <p className="text-red-500">{props.error}</p>}
		</div>
	);
};

export default FormTextInput;
