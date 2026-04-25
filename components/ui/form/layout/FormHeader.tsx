/** @format */

import React from "react";

const FormHeader = ({ text }: { text: string }) => {
	return <h1 className="landscape:mt-8 portrait:mt-14 mb-1 text-primary leading-11">{text}</h1>;
};

export default FormHeader;
