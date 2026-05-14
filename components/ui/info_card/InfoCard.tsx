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
		<div className={`relative aspect-4/5 w-full max-w-120 perspective-[1000px] cursor-pointer ${className}`} onMouseEnter={() => setIsFlipped(true)} onMouseLeave={() => setIsFlipped(false)} style={{ touchAction: "pan-y" }}>
			<div className="absolute -top-8 left-0 w-full flex justify-center pointer-events-none">
				<div className="relative h-6 w-full overflow-hidden">
					<div className="relative w-full h-full flex justify-center items-center text-primary font-bold text-xs uppercase tracking-widest">
						<span className={`absolute transition-all duration-500 ease-in-out whitespace-nowrap ${isFlipped ? "translate-x-120" : "translate-x-0"}`}>
							<span className="hidden [@media(hover:hover)]:inline">Hover to Flip &rarr;</span>
							<span className="inline [@media(hover:hover)]:hidden">Click to Flip &rarr;</span>
						</span>
						<span className={`absolute transition-all duration-500 ease-in-out whitespace-nowrap ${isFlipped ? "translate-x-0" : "-translate-x-120"}`}>&larr; Back</span>
					</div>
				</div>
			</div>

			<div className={`relative w-full h-full duration-500 transform-3d transition-transform will-change-transform`} style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)" }}>
				<div
					className={`absolute inset-0 h-full w-full backface-hidden rounded-xl overflow-hidden border bg-white ${!isFlipped ? "z-20 cursor-pointer" : "z-0 pointer-events-none"}`}
					style={{ transform: "rotateY(180deg)" }}
					onClick={() => setIsFlipped(true)}
				>
					{front}
				</div>
				<div className={`absolute inset-0 h-full w-full backface-hidden rounded-xl overflow-y-auto border bg-white custom-scrollbar ${isFlipped ? "z-20" : "z-0 pointer-events-none"}`} style={{ WebkitOverflowScrolling: "touch" }}>
					<div className="min-h-full p-4" onPointerDown={handleStart} onPointerUp={handleEnd}>
						{back}
					</div>
				</div>
			</div>
		</div>
	);
};

export default InfoCard;
