/** @format */

type Props = {
	title: string;
	field: string;
	className?: string;
	titleClass?: string;
	fieldClass?: string;
};

const InfoCardTitleField = ({ title, field, className, titleClass, fieldClass }: Props) => {
	return (
		<div className={className}>
			<p className={`text-slate-500 uppercase font-bold text-[10px] ${titleClass}`}>{title}</p>
			<p className={fieldClass}>{field}</p>
		</div>
	);
};

export default InfoCardTitleField;
