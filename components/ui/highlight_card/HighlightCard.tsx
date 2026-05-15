/** @format */

import React from "react";
import Icon, { IconName } from "../Icon";

type Props = {
	title?: string;
	iconName?: IconName;
	className?: string;
	iconClass?: string;
	titleClass?: string;
	textClass?: string;
	children: React.ReactNode;
};

const HighlightCard = ({ title, iconName, className, iconClass, titleClass, textClass, children }: Props) => {
	const twoRows = title || iconName;
	return (
		<div className={`w-full h-78 p-5 ${twoRows && "pt-10"} border-3 rounded-md border-primary-hover font-semibold grid grid-rows-${twoRows ? 2 : 1} items-stretch justify-center text-center shadow-md ${className}`}>
			{twoRows && (
				<div className="flex flex-col justify-center items-center">
					{iconName && <Icon name={iconName} className={`text-primary-hover mb-3 ${iconClass}`} />}
					{title && <h2 className={`text-primary flex items-center justify-center ${titleClass}`}>{title}</h2>}
				</div>
			)}
			<p className={`text-primary-hover flex items-center justify-center ${textClass}`}>{children}</p>
		</div>
	);
};

export default HighlightCard;
