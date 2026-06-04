/** @format */
"use client";

import { TutorType } from "@/lib/db/tutor";
import FormDataListInput from "../inputs/FormDataListInput";
import { useState } from "react";
import { getTutorsBySubjects } from "@/lib/db/actions";
import { useFormContext } from "react-hook-form";
import { ClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { FormInputCluster } from "../layout";
import { FormDropdownInput, FormTextAreaInput } from "../inputs";

const PickTutorSignUpForm = ({ tutors, subjects }: { tutors: TutorType[]; subjects: string[] }) => {
	const [filteredTutors, setFilteredTutors] = useState<TutorType[]>(tutors);
	const [loading, setLoading] = useState(false);

	const {
		register,
		formState: { errors },
	} = useFormContext<ClientFormValues>();

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

	const getYearString = (year: number) => {
		if (year == -1) return "Incoming";
		if (year % 10 == 1 && year % 100 != 11) return "1st year";
		if (year % 10 == 2 && year % 100 != 12) return "2nd year";
		if (year % 10 == 3 && year % 100 != 13) return "3rd year";
		return year + "th year";
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
				<div className="w-full grow landscape:basis-2/3 relative">
					{loading && (
						<div className="absolute top-0 left-0 right-0 text-center bg-white/90 py-3 rounded-md z-5 shadow-sm border border-slate-100 opacity-100">
							<p className="text-sm font-bold text-primary animate-dots">Updating tutor list</p>
						</div>
					)}
					<div className={`flex flex-col space-y-6 divide-y divide-slate-400 transition-opacity duration-200 ${loading ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
						{!loading && filteredTutors.length === 0 && <p className="text-sm text-gray-500">No tutors match all selected subjects.</p>}
						{filteredTutors.map((tutor) => (
							<div key={tutor.tutor_id} className="pb-4 flex flex-col sm:flex-row items-center justify-between w-full">
								<div className="space-y-2 w-full">
									<h3 className="text-2xl font-bold">{tutor.display_name}</h3>
									<p className="font-bold text-primary leading-tight">{tutor.subjects}</p>
									<p className="">{`${getYearString(tutor.year_of_study)} ${tutor.field_of_study.split(",")[0]} student @ ${tutor.current_uni}`}</p>
									<div className="bg-primary-faded rounded-md p-3 w-full space-y-3">
										<p className="">{`Tutors ${tutor.in_person === "Online Only" ? "online only" : "at " + tutor.location + (tutor.in_person === "Hybrid" ? " or online" : "")}`}</p>
										<p className="">{`Available ${tutor.availability}`}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="border-t-2 border-primary-hover mx-6 mt-6 py-3">
				<FormInputCluster>
					<FormDropdownInput
						label="First Option"
						register={register("tutors.first_choice", { valueAsNumber: true })}
						options={tutors.map((tutor) => ({ label: tutor.display_name ?? "Unknown Tutor", value: tutor.tutor_id ?? -1 }))}
						error={errors.tutors?.first_choice?.message}
					/>
					<FormDropdownInput
						label="Second Option"
						register={register("tutors.second_choice", { valueAsNumber: true })}
						options={tutors.map((tutor) => ({ label: tutor.display_name ?? "Unknown Tutor", value: tutor.tutor_id ?? -1 }))}
						error={errors.tutors?.second_choice?.message}
					/>
				</FormInputCluster>
				{/* INCLUDE A TEXT BOX where they can indicate whether they would like tutoring from more than one tutor if no single tutor can tutor all subjects. preferably, one tutor for all subjects, but if they would like another then that is okay too */}
				<FormInputCluster>
					<FormTextAreaInput
						label="We generally recommend working with a single tutor for all subjects. This allows for a more personalized and consistent learning experience. However, we can also accomodate different tutors for different subjects, if
					preferred for any reason. Please indicate whether you would like tutoring from more than one tutor, and the details regarding your preferences:"
						register={register("tutors.notes")}
						error={errors.tutors?.notes?.message}
					/>
				</FormInputCluster>
				{/* ALSO ADD FIELD FOR ANY OTHER COMMENTS/STUFF YOU WANT US TO KNOW */}
				<FormInputCluster>
					<FormTextAreaInput label="Any other comments or information you would like us to know:" register={register("comments")} error={errors.comments?.message} />
				</FormInputCluster>
			</div>
		</div>
	);
};

export default PickTutorSignUpForm;
