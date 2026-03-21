/** @format */

import NavBar from "@/components/ui/NavBar";
import React from "react";
import ClientSignUpForm from "./ClientSignUpForm";

const SignupPage = () => {
	return (
		<div>
			<NavBar />
			{/* <div style={{ padding: '213px', background: '#1eb9c2' }}></div> */}
			<div className="h-120 px-20 flex flex-col justify-center bg-primary">
				<h1 className="text-white text-8xl">Start Tutoring Today!</h1>
			</div>
			<div className="mx-10 my-10">
				<p>
					this page will host the signup form for incoming clients to the company. it will take in all the information we need from them, add their profiles to the database, and allow them to choose a tutor. on submission, it will
					email me a summary of their answers so that i can ensure everything is correct and correctly assign them their tutor. it will also automatically send them an email at their provided email holding the client agreement
					contract.
				</p>
				<ClientSignUpForm />
			</div>
		</div>
	);
};

export default SignupPage;
