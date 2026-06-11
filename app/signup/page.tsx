/** @format */

import { db } from "@/lib/db";
import ClientSignUpForm from "./ClientSignUpForm";
import BasePage from "@/components/ui/base_page/BasePage";

const SignupPage = async () => {
	const tutors = await db.tutor.get.getAll();
	const subjects = (await db.tutor_subjects.get.getAllSubjects()).map((row: { subject: string }) => row.subject);

	return (
		<BasePage title={"Start Tutoring\nToday!"}>
			<p>
				<i>NOTE: This form is not yet operational. To sign up, please email propeltutoringyeg@gmail.com.</i>
			</p>
			<ClientSignUpForm tutors={tutors} subjects={subjects} />
		</BasePage>
	);
};

export default SignupPage;
