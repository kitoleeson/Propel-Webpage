/** @format */

import BasePage from "@/components/ui/base_page/BasePage";
import TutorSemesterUpdateForm from "./TutorSemesterUpdateForm";

const open: boolean = true;

const TutorSemesterUpdateFormPage = () => {
	return (
		<BasePage title={"Excited for a\nNew Semester!"}>
			<p>Hi tutors! Welcome to another semester at Propel, I am excited to have you here.</p>
			<p>
				Please fill out this form with your most recent information. All fields which I do not expect to change will autofill, but please double check them to ensure they continue to be accurate and if not, please update them. If
				you would like to change any values not on this form, please reach out to me directly. This may include: preferred name, email, phone number, emergency contact information, or subjects you would like to tutor.
			</p>
			<p>If you would also like to update your profile photo on the website, you can also send me a new one via text. Preferably a 4:5 portrait photo with clear vision of your face, doing something you love.</p>
			{open && <TutorSemesterUpdateForm />}
			{!open && <p>Form is currently closed.</p>}
		</BasePage>
	);
};

export default TutorSemesterUpdateFormPage;
