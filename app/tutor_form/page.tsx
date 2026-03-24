/** @format */

import NavBar from "@/components/ui/NavBar";
import React from "react";
import TutorIntakeForm from "./TutorIntakeForm";

const open: boolean = true;

const TutorFormPage = () => {
	return (
		<div>
			<NavBar />
			<div className="h-120 px-20 flex flex-col justify-center bg-primary">
				<h1 className="text-white text-8xl">Welcome to Propel Tutoring!</h1>
			</div>
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
