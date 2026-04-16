/** @format */

import React from "react";
import NavBar from "./NavBar";
import PageHeader from "./PageHeader";
import Body from "./Body";

type BasePageProps = {
	title: string;
	children: React.ReactNode;
};

const BasePage = ({ title, children }: BasePageProps) => {
	return (
		<>
			<NavBar />
			<main>
				<PageHeader>{title}</PageHeader>
				<Body>{children}</Body>
			</main>
		</>
	);
};

export default BasePage;
