/** @format */
// with help from Google Gemini
"use client";

import Image from "next/image";
import { useState } from "react";
import InfoCard from "./InfoCard";

const getImageName = (first: string, last: string) => {
	return first.replace(" ", "-") + "_" + last.replace(" ", "-");
};

const getYearString = (year: number) => {
	if (year == -1) return "Going into";
	if (year == 1) return "1st year";
	if (year == 2) return "2nd year";
	if (year == 3) return "3rd year";
	return year + "th year";
};

const buildFront = (imgSrc: string, setImgSrc: any, displayName: string) => {
	return <Image src={imgSrc} onError={() => setImgSrc("/images/logos/teal.png")} alt={displayName} fill className="object-cover" />;
};

const buildBack = (tutor: any) => {
	const locationDisplay = tutor.in_person === "Online Only" ? "Online Only" : tutor.location;
	return (
		<>
			<h4 className="font-bold text-primary border-b pb-1 mb-3">Tutor Profile</h4>
			<div className="grid grid-cols-2 gap-3 text-xs mb-4">
				<div>
					<p className="text-slate-500 uppercase font-bold text-[10px]">Education</p>
					<p>
						{getYearString(tutor.year_of_study)} {tutor.field_of_study} student
					</p>
					<p className="text-primary font-medium">{tutor.current_uni}</p>
				</div>
				<div>
					<p className="text-slate-500 uppercase font-bold text-[10px]">Rate & Exp</p>
					<p>${tutor.current_rate}/hr</p>
					<p>{tutor.prior_experience + 1} Years Exp.</p>
				</div>
			</div>
			<div className="space-y-2 text-xs border-t pt-3">
				<p>
					<strong>Fav Class:</strong> {tutor.current_fav_class}
				</p>
				<p>
					<strong>Availability:</strong> {tutor.availability}
				</p>
				<p>
					<strong>Location:</strong> {locationDisplay}
				</p>
				{tutor.ap_ib_credentials && (
					<p>
						<strong>Credentials:</strong> {tutor.ap_ib_credentials}
					</p>
				)}
			</div>
			<div className="mt-4 bg-slate-50 p-2 rounded text-[11px]">
				<p className="text-slate-500 uppercase font-bold mb-1">Interests & Hobbies</p>
				<p className="leading-tight">{tutor.hobbies}</p>
			</div>
		</>
	);
};

const TutorCard = ({ tutor, switchLayout }: { tutor: any; switchLayout: boolean }) => {
	const [imgSrc, setImgSrc] = useState(`/images/tutors/${getImageName(tutor.gov_first_name, tutor.gov_last_name)}.png`);
	const displayName = (tutor.pref_name || tutor.gov_first_name) + " " + tutor.gov_last_name;

	return (
		<div className="w-full flex portrait:flex-col landscape:flex-row landscape:items-start portrait:items-center gap-4">
			{switchLayout && <InfoCard front={buildFront(imgSrc, setImgSrc, displayName)} back={buildBack(tutor)} />}
			<div className="w-full flex flex-col grow justify-between">
				<div className="flex items-center justify-between">
					<h3 className="text-2xl font-bold text-slate-800">{displayName}</h3>
					<div className={`font-bold ${tutor.accepting_students > 0 ? "text-green-600" : "text-red-600"}`}>{tutor.accepting_students > 0 ? "Accepting Students" : "Full Capacity"}</div>
					{/* <div className={`h-2.5 w-2.5 rounded-full ${tutor.accepting_students > 0 ? "bg-green-500" : "bg-red-500"}`} title={tutor.accepting_students > 0 ? "Accepting Students" : "Full Capacity"} /> */}
				</div>
				<p className="font-bold text-primary mt-1 leading-tight">{tutor.subjects}</p>
				<p className="mt-3">{tutor.bio}</p>
			</div>
			{!switchLayout && <InfoCard front={buildFront(imgSrc, setImgSrc, displayName)} back={buildBack(tutor)} />}
		</div>
	);
};

export default TutorCard;
