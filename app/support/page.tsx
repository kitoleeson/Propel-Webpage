/** @format */

import PageHeader from "@/components/ui/PageHeader";
import NavBar from "@/components/ui/NavBar";
import React from "react";
import Body from "@/components/ui/Body";

const SupportPage = () => {
	return (
		<div>
			<NavBar />
			<PageHeader>Support</PageHeader>
			<Body>
				<p>this page is for clients to come to for support. it will hold contact information as well as frequently asked questions.</p>
			</Body>
		</div>
	);
};

export default SupportPage;
