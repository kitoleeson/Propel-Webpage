/** @format */

import { useEffect, useRef, useState } from "react";

type Props = {
	front: any;
	back: any;
	className?: string;
};

const DRAG_THRESHOLD = 8;

const InfoCard = ({ front, back, className }: Props) => {
	const [isFlipped, setIsFlipped] = useState(false);
	const [supportsHover, setSupportsHover] = useState(false);
	const pointerStart = useRef<{ x: number; y: number } | null>(null);
	const isTouchDrag = useRef(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		setSupportsHover(window.matchMedia("(hover: hover)").matches);
	}, []);

	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		if (event.pointerType === "touch" || event.pointerType === "pen") {
			pointerStart.current = { x: event.clientX, y: event.clientY };
			isTouchDrag.current = false;
		}
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!pointerStart.current) return;
		const dx = Math.abs(event.clientX - pointerStart.current.x);
		const dy = Math.abs(event.clientY - pointerStart.current.y);
		if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
			isTouchDrag.current = true;
		}
	};

	const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
		if ((event.pointerType === "touch" || event.pointerType === "pen") && !isTouchDrag.current) {
			setIsFlipped((prev) => !prev);
		}
		pointerStart.current = null;
		isTouchDrag.current = false;
	};

	return (
		<div
			className={`relative aspect-4/5 w-full max-w-120 perspective-[1000px] cursor-pointer ${className}`}
			onMouseEnter={supportsHover ? () => setIsFlipped(true) : undefined}
			onMouseLeave={supportsHover ? () => setIsFlipped(false) : undefined}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			style={{ touchAction: "pan-y" }}
		>
			<div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
				<span className="hidden [@media(hover:hover)]:inline">{isFlipped ? "← Back" : "Hover to Flip →"}</span>
				<span className="inline [@media(hover:hover)]:hidden">{isFlipped ? "← Back" : "Tap to Flip →"}</span>
			</div>
			<div className={`relative w-full h-full duration-500 transform-3d will-change-transform ${isFlipped ? "rotate-y-180" : ""}`}>
				<div className="absolute inset-0 h-full w-full backface-hidden rounded-xl overflow-hidden border z-10">{front}</div>
				<div className="absolute inset-0 h-full w-full backface-hidden rounded-xl overflow-y-auto border rotate-y-180 p-4 bg-white custom-scrollbar" style={{ touchAction: "pan-y" }}>
					{back}
				</div>
			</div>
		</div>
	);
};

export default InfoCard;
