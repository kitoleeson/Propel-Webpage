/** @format */

import React from "react";
import Icon, { IconName } from "../Icon";

const HighlightCard = ({ title, iconName, children }: { title?: string; iconName?: IconName; children: React.ReactNode }) => {
	return (
		<div className="w-full h-78 p-5 pt-10 border-3 rounded-md border-primary-hover font-semibold grid grid-rows-2 items-stretch justify-center text-center gap-3">
			<div className="flex flex-col justify-center items-center">
				{iconName && <Icon name={iconName} className="text-primary-hover mb-3" />}
				<h2 className="text-primary flex items-center justify-center">{title}</h2>
			</div>
			<p className="text-primary-hover flex items-center justify-center">{children}</p>
		</div>
	);
};

export default HighlightCard;
