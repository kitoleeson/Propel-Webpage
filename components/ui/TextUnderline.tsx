/** @format */

import React, { useState, useRef, useEffect } from "react";

const TextUnderline = ({ textColour, lineColour = "bg-black", children }: { textColour?: string; lineColour?: string; children: React.ReactNode }) => {
	const [hasIntersected, setHasIntersected] = useState(false);
	const elementRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const currentElement = elementRef.current;
		if (!currentElement) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setHasIntersected(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "0px 0px -20% 0px", threshold: 1 },
		);

		observer.observe(currentElement);
		return () => observer.disconnect();
	}, []);

	return (
		<span ref={elementRef} className={`relative inline-block text-nowrap ${textColour}`}>
			{children}
			<span
				className={`
               absolute left-0 bottom-0 h-0.75 rounded-full 
               ${lineColour}
               ${hasIntersected ? "w-full" : "w-0"}
               transition-[width] duration-500 ease-out
            `}
			/>
		</span>
	);
};

export default TextUnderline;
