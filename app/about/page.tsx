/** @format */

import BasePage from "@/components/ui/BasePage";
import TutorCard from "@/components/ui/TutorCard";
import { db } from "@/lib/db";

const AboutPage = async () => {
	const result = await db.tutor.getAll();
	const tutors = result.rows;

	return (
		<BasePage title="About Propel">
			<h2>Propel tutors are not just students. We are active members of the academic and scientific communities who put the fundamentals that we teach into use on a daily basis.</h2>
			<p>
				Each tutor at Propel has their own hourly rate, determined by experience, education, and tutoring background. Rates may vary between tutors. All tutor rates are presented when a student is choosing their tutor, and will be
				confirmed with you by email once chosen. Once a student begins working with a tutor, that particular tutor's hourly rate for that specific student will never increase, even if it increases for new clients in the future.
			</p>
			<div className="w-5/6 min-w-80 m-auto grid grid-cols-1 gap-18 justify-items-center mt-10">
				{tutors.map((tutor: any, index: number) => (
					<TutorCard key={tutor.tutor_id} tutor={tutor} switchLayout={index % 2 == 0} />
				))}
			</div>
		</BasePage>
	);
};

export default AboutPage;
