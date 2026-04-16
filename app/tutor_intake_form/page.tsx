/** @format */

import TutorIntakeForm from "./TutorIntakeForm";
import BasePage from "@/components/ui/BasePage";

const open: boolean = true;

const TutorFormPage = () => {
	return (
		<BasePage title={"Welcome to\nPropel!"}>
			<p>
				this page is where tutors will go to submit information about themselves. on submission, the form will send me an email confirm adding the information to the database. there will be no links to this page on the website
			</p>
			{open && <TutorIntakeForm />}
		</BasePage>
	);
};

export default TutorFormPage;
