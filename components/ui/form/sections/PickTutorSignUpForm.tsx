/** @format */
"use client";

import { TutorType } from "@/lib/db/tutor";
import FormDataListInput from "../inputs/FormDataListInput";
import { useState } from "react";
import { getTutorsBySubjects } from "@/lib/db/actions";

const PickTutorSignUpForm = ({ tutors, subjects }: { tutors: TutorType[]; subjects: string[] }) => {
	const [filteredTutors, setFilteredTutors] = useState<TutorType[]>(tutors);
	const [loading, setLoading] = useState(false);

	const updateAvailableTutors = async (selectedSubjects: string[]) => {
		setLoading(true);
		try {
			const availableTutors = await getTutorsBySubjects(selectedSubjects);
			setFilteredTutors(availableTutors);
		} catch (error) {
			console.error("Failed to filter tutors from database:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="border-2 border-primary-hover rounded-md p-6 space-y-5">
			<h1>Choose Your Tutor</h1>

			<p>
				Propel Tutoring places a strong emphasis on allowing students to choose their own tutor. We believe that learning is most effective when students feel comfortable, respected, and genuinely connected to the person
				supporting them. This model allows the student to find a tutor who will work best for themselves, empowering them to take an active role in their education and increasing engagement, motivation, and investment in their
				sessions.
			</p>
			<p>
				We would love to help you find the perfect tutor for you. Please email us at{" "}
				<a href="mailto:propeltutoringyeg@gmail.com" className="font-semibold text-primary hover:text-primary-hover">
					propeltutoringyeg@gmail.com
				</a>{" "}
				for any questions.
			</p>

			<div className="w-full max-w-[97%] m-auto flex flex-col landscape:items-start portrait:items-center gap-12">
				<FormDataListInput label="Filter by Subject" options={subjects} placeholder="Choose your subjects" onChange={updateAvailableTutors} />
				{/* INCLUDE A TEXT BOX where they can indicate whether they would like tutoring from more than one tutor if no single tutor can tutor all subjects. preferably, one tutor for all subjects, but if they would like another then that is okay too */}
				{/* ALSO ADD FIELD FOR ANY OTHER COMMENTS/STUFF YOU WANT US TO KNOW */}

				<div className="w-full grow landscape:basis-2/3 relative">
					{loading && (
						<div className="absolute top-0 left-0 right-0 text-center bg-white/90 py-3 rounded-md z-5 shadow-sm border border-slate-100 opacity-100">
							<p className="text-sm font-bold text-primary animate-dots">Updating tutor list</p>
						</div>
					)}

					<div className={`flex flex-col gap-4 transition-opacity duration-200 ${loading ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
						{!loading && filteredTutors.length === 0 && <p className="text-sm text-gray-500">No tutors match all selected subjects.</p>}

						{filteredTutors.map((tutor) => (
							<div key={tutor.tutor_id} className="border-b pb-4 flex flex-col sm:flex-row items-center justify-between">
								<div>
									<h3 className="text-2xl font-bold text-slate-800">{tutor.gov_first_name}</h3>
									<p className="font-bold text-primary mt-1 leading-tight">{tutor.subjects}</p>
									<p className="mt-2 text-sm text-slate-600">{tutor.bio}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PickTutorSignUpForm;
