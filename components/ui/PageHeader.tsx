/** @format */

import React from "react";

const PageHeader = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="@container-[size] h-120 flex flex-col justify-center bg-primary">
			<h1 className="text-white text-[min(18cqw,25cqh)] @landscape:ml-20 @portrait:mx-2 font-bold leading-[1.2] @landscape:text-left @portrait:text-center">{children}</h1>
		</div>
	);
};

export default PageHeader;
