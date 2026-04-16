/** @format */

import React from "react";
import Image from "next/image";

const PageHeader = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="@container-[size] h-120 flex flex-col justify-center bg-primary overflow-hidden relative">
			<div className="absolute -translate-x-1/2 -translate-y-1/2 top-5/6 @landscape:left-auto @landscape:right-[-120cqh] @portrait:left-1/2 w-[175cqh] h-[175cqh] opacity-15 pointer-events-none z-0">
				<Image src="/images/logos/full-white.png" alt="Propel Tutoring Logo Background" fill className="object-contain" />
			</div>
			<h1 className="text-white whitespace-pre-line text-[min(25cqw,25cqh)] z-10 @landscape:ml-20 @portrait:mx-2 font-bold leading-[1.2] @landscape:text-left @portrait:text-center">{children}</h1>
		</div>
	);
};

export default PageHeader;
