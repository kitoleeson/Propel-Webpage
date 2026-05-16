/** @format */

import React from "react";

const HighlightCardFluidGrid = ({ className, cardClass, children }: { className?: string; cardClass?: string; children: React.ReactNode }) => {
	return (
		<div className={`flex flex-wrap gap-6 w-full max-w-[calc(100vw-80px)] mx-auto ${className}`}>
			{React.Children.map(children, (child) => (
				<div className={`grow basis-full sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)] rounded-md ${cardClass}`}>{child}</div>
			))}
		</div>
	);
};

export default HighlightCardFluidGrid;
