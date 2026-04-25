/** @format */

import TutorIntakeForm from "./TutorIntakeForm";
import BasePage from "@/components/ui/BasePage";

const open: boolean = true;

const TutorFormPage = () => {
	return (
		<BasePage title={"Welcome to\nPropel!"}>
			<p>
				Hi tutors! Welcome to Propel, I am excited to have you here. Please fill out this form with your information. Your information will be put up on our website, so that incoming clients can make an informed decision about who
				they would like to be their tutor.
			</p>
			{open && <TutorIntakeForm />}
		</BasePage>
	);
};

export default TutorFormPage;
