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
		const delta = Math.abs(e.clientY - touchStart.current);
		if (delta < 10) {
			setIsFlipped(false);
		}
	};

	return (
		<div className={`relative aspect-4/5 w-full max-w-120 perspective-[1000px] ${className}`} style={{ touchAction: "pan-y" }}>
			<div className={`relative w-full h-full duration-500 transition-transform ${isFlipped ? "rotate-y-180" : ""}`} style={{ transformStyle: "preserve-3d" }}>
				{/* FRONT */}
				<div className={`absolute inset-0 h-full w-full backface-hidden rounded-xl overflow-hidden border z-10 ${isFlipped ? "pointer-events-none" : "cursor-pointer"}`} onClick={() => setIsFlipped(true)}>
					{front}
				</div>

				{/* BACK */}
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
