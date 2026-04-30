/** @format */

import BasePage from "@/components/ui/BasePage";
import TutorCard from "@/components/ui/TutorCard";
import { db } from "@/lib/db";

const AboutPage = async () => {
	const result = await db.tutor.getAll();
	const tutors = result.rows;

	return (
		<BasePage title="About Propel">
			<p>
				this page will hold a little information about who we are as collective tutors, as well as more personalized information for each tutor so that students may choose a tutor who they feel will help them the best. each tutor
				will have their own card with a picture and information about them, as well as whether or not they are currently taking clients. all information will be pulled from the database, and the page will be built dynamically
				based off its entries.
			</p>
			<p>
				<span className={"text-green-500"}>●</span> = Accepting Students &emsp; <span className={"text-red-500"}>●</span> = Full Capacity
			</p>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-18 justify-items-center mt-10">
				{tutors.map((tutor: any) => (
					<TutorCard key={tutor.tutor_id} tutor={tutor} />
				))}
			</div>
		</BasePage>
	);
};

export default AboutPage;
