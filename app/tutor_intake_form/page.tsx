/** @format */

import NavBar from "@/components/ui/NavBar";
import Body from "@/components/ui/Body";
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
			<Body>
				<p>
					this page is where tutors will go to submit information about themselves. on submission, the form will send me an email confirm adding the information to the database. there will be no links to this page on the website
				</p>
				{open && <TutorIntakeForm />}
			</Body>
		</div>
	);
};

export default TutorFormPage;
