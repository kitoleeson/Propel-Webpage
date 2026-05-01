/** @format */

import React from "react";

const InfoCardCluster = ({ children, className }: { children: React.ReactNode; className?: string }) => {
	return <div className={`py-4 space-y-2 ${className}`}>{children}</div>;
};

export default InfoCardCluster;
