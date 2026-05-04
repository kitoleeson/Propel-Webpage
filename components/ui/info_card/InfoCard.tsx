/** @format */

import { useState, useRef } from "react";

type Props = {
	front: any;
	back: any;
	className?: string;
};

const InfoCard = ({ front, back, className }: Props) => {
	const [isFlipped, setIsFlipped] = useState(false);
	const touchStart = useRef(0);

	const handleStart = (e: React.PointerEvent) => {
		touchStart.current = e.clientY;
	};

	const handleEnd = (e: React.PointerEvent) => {
		if (Math.abs(e.clientY - touchStart.current) < 10) {
			setIsFlipped(false);
		}
	};

	return (
		<div
			className={`relative aspect-4/5 w-full max-w-120 perspective-[1000px] cursor-pointer ${className}`}
			onMouseEnter={() => setIsFlipped(true)}
			onMouseLeave={() => setIsFlipped(false)}
			onClick={() => setIsFlipped(!isFlipped)}
			style={{ touchAction: "pan-y" }}
		>
			<div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
				<span className="hidden [@media(hover:hover)]:inline">{isFlipped ? "← Back" : "Hover to Flip →"}</span>
				<span className="inline [@media(hover:hover)]:hidden">{isFlipped ? "← Back" : "Click to Flip →"}</span>
			</div>
			<div className={`relative w-full h-full duration-500 transition-transform will-change-transform ${isFlipped ? "rotate-y-180" : ""}`} style={{ transformStyle: "preserve-3d" }}>
				<div className={`absolute inset-0 h-full w-full backface-hidden rounded-xl overflow-hidden border z-10 ${isFlipped ? "pointer-events-none" : "cursor-pointer"}`} onClick={() => setIsFlipped(true)}>
					{front}
				</div>
				<div
					className={`absolute inset-0 h-full w-full rounded-xl overflow-y-auto border bg-white custom-scrollbar ${isFlipped ? "rotate-y-180 z-20 opacity-100" : "rotate-y-0 z-0 opacity-0 pointer-events-none"}`}
					style={{ WebkitOverflowScrolling: "touch", backfaceVisibility: "hidden" }}
				>
					<div className="min-h-full p-4" onPointerDown={handleStart} onPointerUp={handleEnd}>
						{back}
					</div>
				</div>
			</div>
		</div>
	);
};

export default InfoCard;
