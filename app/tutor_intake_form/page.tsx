/** @format */

import NavBar from "@/components/ui/NavBar";
import React from "react";
import TutorIntakeForm from "./TutorIntakeForm";
import PageHeader from "@/components/ui/PageHeader";

const open: boolean = true;

const TutorFormPage = () => {
	return (
		<div>
			<NavBar />
			<PageHeader>
				Welcome to
				<br />
				Propel!
			</PageHeader>
			<div className="mx-10 my-10">
				<p>
					this page is where tutors will go to submit information about themselves. on submission, the form will send me an email confirm adding the information to the database. there will be no links to this page on the website
				</p>
				{open && <TutorIntakeForm />}
			</div>
		</div>
	);
};

export default TutorFormPage;
