/** @format */

import React from "react";

type Props = {
	children: React.ReactNode;
	className?: string;
};

const FormInputCluster = ({ children, className }: Props) => {
	return <div className={`landscape:mt-6 portrait:mt-14 flex landscape:flex-row portrait:flex-col gap-6 ${className ?? ""}`}>{children}</div>;
};

export default FormInputCluster;
