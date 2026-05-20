/** @format */

import React from "react";

const HighlightCardGrid = ({ children }: { children: React.ReactNode }) => {
	return <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">{children}</div>;
};

export default HighlightCardGrid;
