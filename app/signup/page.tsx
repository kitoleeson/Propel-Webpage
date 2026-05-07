/** @format */

import ClientSignUpForm from "./ClientSignUpForm";
import BasePage from "@/components/ui/BasePage";

const SignupPage = () => {
	return (
		<BasePage title={"Start Tutoring\nToday!"}>
			<p>
				this page will host the signup form for incoming clients to the company. it will take in all the information we need from them, add their profiles to the database, and allow them to choose a tutor. on submission, it will
				email me a summary of their answers so that i can ensure everything is correct and correctly assign them their tutor. it will also automatically send them an email at their provided email holding the client agreement
				contract.
			</p>
			<p>
				<i>NOTE: This form is not yet operational. To sign up, please email propeltutoringyeg@gmail.com.</i>
			</p>
			<ClientSignUpForm />
			{/* <p>
				Propel Tutoring places a strong emphasis on allowing students to choose their own tutor. We believe that learning is most effective when students feel comfortable, respected, and genuinely connected to the person
				supporting them. This model allows the student to find a tutor who will work best for themselves, empowering them to take an active role in their education and increasing engagement, motivation, and investment in their
				sessions.
			</p> */}
		</BasePage>
	);
};

export default SignupPage;
