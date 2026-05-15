/** @format */

import React from "react";

const Body = ({ space_y = 5, children }: { space_y?: number; children: React.ReactNode }) => {
	return <div className={`m-10 space-y-${space_y}`}>{children}</div>;
};

export default Body;
