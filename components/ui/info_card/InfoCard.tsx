/** @format */
import { useRef, useState } from "react";

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
		const touchEnd = e.clientY;
		if (Math.abs(touchEnd - touchStart.current) < 10) setIsFlipped(false);
	};

	return (
		<div className={`relative aspect-4/5 w-full max-w-120 perspective-[1000px] ${className}`} onMouseEnter={() => setIsFlipped(true)} onMouseLeave={() => setIsFlipped(false)} style={{ touchAction: "pan-y" }}>
			<div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest pointer-events-none">
				<span className="hidden [@media(hover:hover)]:inline">{isFlipped ? "← Back" : "Hover to Flip →"}</span>
				<span className="inline [@media(hover:hover)]:hidden">{isFlipped ? "← Back" : "Click to Flip →"}</span>
			</div>

			<div className={`relative w-full h-full duration-500 transform-3d will-change-transform ${isFlipped ? "rotate-y-180" : ""}`}>
				{/* FRONT */}
				<div className={`absolute inset-0 h-full w-full backface-hidden rounded-xl overflow-hidden border cursor-pointer ${isFlipped ? "z-0" : "z-20"}`} onClick={() => setIsFlipped(true)}>
					{front}
				</div>

				{/* BACK */}
				<div className={`absolute inset-0 h-full w-full backface-hidden rounded-xl overflow-y-auto border rotate-y-180 bg-white custom-scrollbar ${isFlipped ? "z-20" : "z-0"}`} onClick={(e) => e.stopPropagation()}>
					<div className="min-h-full p-4" onPointerDown={handleStart} onPointerUp={handleEnd}>
						{back}
					</div>
				</div>
			</div>
		</div>
	);
};

export default InfoCard;
