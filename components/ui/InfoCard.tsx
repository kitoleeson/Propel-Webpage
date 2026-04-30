/** @format */

import { truncate } from "node:fs";
import { useState } from "react";

type Props = {
	front: any;
	back: any;
	className?: string;
};

const InfoCard = ({ front, back, className }: Props) => {
	const [isFlipped, setIsFlipped] = useState(false);

	return (
		<div className={`relative aspect-4/5 perspective-[1000px] cursor-pointer ${className}`} onMouseEnter={() => setIsFlipped(true)} onMouseLeave={() => setIsFlipped(false)}>
			<div className={`relative w-80 md:w-90 lg:w-100 h-full duration-500 transform-3d will-change-transform ${isFlipped ? "rotate-y-180" : ""}`}>
				<div className="absolute inset-0 h-full w-full backface-hidden rounded-xl overflow-hidden border z-10">{front}</div>
				<div className="absolute inset-0 h-full w-full backface-hidden rounded-xl overflow-y-auto border rotate-y-180 p-4 bg-white">{back}</div>
			</div>
		</div>
	);
};

export default InfoCard;
