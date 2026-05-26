/** @format */

import ClientSignUpForm from "./ClientSignUpForm";
import BasePage from "@/components/ui/base_page/BasePage";

const SignupPage = () => {
	return (
		<BasePage title={"Start Tutoring\nToday!"}>
			<p>
				<i>NOTE: This form is not yet operational. To sign up, please email propeltutoringyeg@gmail.com.</i>
			</p>
			<ClientSignUpForm />
			{/* <p>
				Propel Tutoring places a strong emphasis on allowing students to choose their own tutor. We believe that learning is most effective when students feel comfortable, respected, and genuinely connected to the person
				supporting them. This model allows the student to find a tutor who will work best for themselves, empowering them to take an active role in their education and increasing engagement, motivation, and investment in their
				sessions. ALSO ADD FIELD FOR ANY OTHER COMMENTS/STUFF YOU WANT US TO KNOW
			</p> */}
			{/* <p>
				We would love to help you find your perfect tutor match, email us for any questions.
			</p> */}
		</BasePage>
	);
};

export default SignupPage;

// DATA FLOW:
// 1. Client fills out the form and submits it, including personal information, billing information, and tutor preferences (top 2 choices).
// 2. The form data is sent to the server, where it is processed and stored in the database under the "students", "guardians", "student_guardian", "billing_accounts", and "student_billing" tables.
// 3. An email is sent to the admin with a summary of the client's information for review.
// 4. An email is sent to the client with the client agreement contract attached.
// 5. An email is sent to the tutor who the client chooses, notifying them of the new student, providing the student's information for review, and providing a link to the API where they can accept or reject the tutoring request.
// 	The tutor will reach out the student to decide whether the relationship will work, then either accept or reject the request.
// 	If they accept, the "student_tutor" table is updated to reflect the match.
// 	If they reject, the student's second choice tutor is notified. If they also reject, the admin is notified to manually assign a tutor.
// 6. Once a tutor accepts the student, an email confirmation is sent to the client with the tutor's rate and client contract?
