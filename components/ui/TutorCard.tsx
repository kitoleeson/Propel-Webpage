/** @format */
// With help from Google Gemini
"use client";

import Image from "next/image";
import { useState } from "react";
import InfoCard from "./info_card/InfoCard";
import InfoCardTitleField from "./info_card/InfoCardTitleField";
import InfoCardCluster from "./info_card/InfoCardCluster";

const getImageName = (first: string, last: string) => {
	return first.replace(" ", "-") + "_" + last.replace(" ", "-");
};

const getYearString = (year: number) => {
	if (year == -1) return "Incoming";
	if (year % 10 == 1 && year % 100 != 11) return "1st year";
	if (year % 10 == 2 && year % 100 != 12) return "2nd year";
	if (year % 10 == 3 && year % 100 != 13) return "3rd year";
	return year + "th year";
};

const buildFront = (imgSrc: string, setImgSrc: any, displayName: string, loading: "lazy" | "eager" = "lazy") => (
	<Image src={imgSrc} onError={() => setImgSrc("/images/logos/teal.png")} alt={displayName} fill className="object-cover" sizes="(max-width: 768px) 80vw, 480px" loading={loading} />
);

const buildBack = (tutor: any) => {
	const locationDisplay = tutor.in_person === "Online Only" ? "Online Only" : tutor.location;
	return (
		<>
			{/* HEADER */}
			<h3 className="font-bold text-primary border-b pb-2">Academic Profile</h3>

			{/* UNIVERSITY INFORMATION */}
			<InfoCardCluster>
				<div>
					<p className="text-primary font-semibold">{tutor.current_uni}</p>
					<p className="text-[12px]">{tutor.current_degree}</p>
				</div>

				<div className="grid grid-cols-2 gap-3 text-xs">
					<InfoCardTitleField title="Field" field={tutor.field_of_study} />
					<div className="flex flex-col justify-between space-y-2">
						<InfoCardTitleField title="Year" field={getYearString(tutor.year_of_study)} />
						<InfoCardTitleField title="Favourite Class" field={tutor.current_fav_class} />
					</div>
				</div>

				<InfoCardTitleField title="Interests" field={tutor.academic_interests} fieldClass="text-sm" />
			</InfoCardCluster>

			{/* TUTOR INFORMATION */}
			<InfoCardCluster className="flex flex-col border-y">
				<div className="grid grid-cols-2 gap-3 text-xs">
					<InfoCardTitleField title="Current Rate" field={`$${tutor.current_rate}/hr`} />
					<InfoCardTitleField title="Experience" field={tutor.prior_experience + 1 + (tutor.prior_experience > 0 ? " Years" : " Year")} />
				</div>
				<InfoCardTitleField title="Availablity" field={tutor.availability} fieldClass="text-sm" />
				<InfoCardTitleField title="Location" field={tutor.in_person === "Online Only" ? "Online only" : tutor.location + (tutor.in_person === "Hybrid" ? " or online" : "")} fieldClass="text-sm" />
			</InfoCardCluster>

			{/* HIGH SCHOOL INFORMATION */}
			<InfoCardCluster>
				<p className="text-primary font-semibold">{tutor.high_school}</p>

				<div className="grid grid-cols-2 gap-3 text-xs">
					<InfoCardTitleField title="Favourite Class" field={tutor.fav_high_school_class} />
					<InfoCardTitleField title="AP/IB Credentials" field={tutor.ap_ib_credentials} />
				</div>
			</InfoCardCluster>

			{/* HOBBIES */}
			<div className="mt-4 bg-slate-100 p-2 rounded text-[11px]">
				<p className="text-slate-500 uppercase font-bold mb-1">Hobbies</p>
				<p className="leading-tight text-sm">{tutor.hobbies}</p>
			</div>
		</>
	);
};

const TutorCard = ({ tutor, index }: { tutor: any; index: number }) => {
	const [imgSrc, setImgSrc] = useState(`/images/tutors/${getImageName(tutor.gov_first_name, tutor.gov_last_name)}.png`);
	const displayName = (tutor.pref_name || tutor.gov_first_name) + " " + tutor.gov_last_name;

	return (
		<div className="w-full min-w-70 flex portrait:flex-col landscape:flex-row landscape:items-start portrait:items-center gap-12">
			<div className={`w-full landscape:basis-1/3 flex justify-center shrink-0 ${index % 2 == 0 ? "landscape:order-1" : ""}`}>
				<InfoCard front={buildFront(imgSrc, setImgSrc, displayName, index == 0 ? "eager" : "lazy")} back={buildBack(tutor)} />
			</div>
			<div className="w-full flex flex-col grow justify-between landscape:basis-2/3">
				<div className="flex items-center justify-between">
					<h3 className="text-2xl font-bold text-slate-800">{displayName}</h3>
					<div className={`font-bold text-right ${tutor.accepting_students > 0 ? "text-green-600" : "text-red-600"}`}>{tutor.accepting_students > 0 ? "Accepting Students" : "Full Capacity"}</div>
				</div>
				<p className="font-bold text-primary mt-1 leading-tight">{tutor.subjects}</p>
				<p className="mt-4">{tutor.bio}</p>
			</div>
		</div>
	);
};

export default TutorCard;
