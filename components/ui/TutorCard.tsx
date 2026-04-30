/** @format */
// with help from Google Gemini
"use client";

import Image from "next/image";
import { useState } from "react";

const getImageName = (first: string, last: string) => {
	return first.replace(" ", "-") + "_" + last.replace(" ", "-");
};

const TutorCard = ({ tutor }: { tutor: any }) => {
	const [isFlipped, setIsFlipped] = useState(false);
	const [imgSrc, setImgSrc] = useState(`/images/tutors/${getImageName(tutor.gov_first_name, tutor.gov_last_name)}.png`);
	const displayName = (tutor.pref_name || tutor.gov_first_name) + " " + tutor.gov_last_name;
	const locationDisplay = tutor.in_person === "Online Only" ? "Online Only" : tutor.location;

	return (
		<div className="w-80 md:w-90 lg:w-100 flex flex-col gap-4">
			<div className="relative aspect-4/5 perspective-[1000px] cursor-pointer" onMouseEnter={() => setIsFlipped(true)} onMouseLeave={() => setIsFlipped(false)}>
				<div className={`relative w-80 md:w-90 lg:w-100 h-full duration-500 transform-3d ${isFlipped ? "rotate-y-180" : ""}`}>
					{/* --- FRONT OF CARD --- */}
					<div className="absolute inset-0 h-full w-full backface-hidden rounded-xl z-10 overflow-hidden border shadow-sm">
						<Image src={imgSrc} onError={() => setImgSrc("/images/logos/teal.png")} alt={displayName} fill className="object-cover" />
					</div>

					{/* --- BACK OF CARD --- */}
					<div className="absolute inset-0 h-full w-full rotate-y-180 backface-hidden bg-white border rounded-xl p-4 overflow-y-auto">
						<h4 className="font-bold text-primary border-b pb-1 mb-3">Academic Profile</h4>
						<div className="grid grid-cols-2 gap-3 text-xs mb-4">
							<div>
								<p className="text-slate-500 uppercase font-bold text-[10px]">Education</p>
								<p>
									{tutor.year_of_study} Year {tutor.field_of_study}
								</p>
								<p className="text-primary font-medium">{tutor.current_uni}</p>
							</div>
							<div>
								<p className="text-slate-500 uppercase font-bold text-[10px]">Rate & Exp</p>
								<p>${tutor.current_rate}/hr</p>
								<p>{tutor.prior_experience} Years Exp.</p>
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
					</div>
				</div>
			</div>
			{/* <div className="p-4 bg-white border-x border-b rounded-b-xl shadow-sm h-[calc(100%-250px)]">
				<h3 className="text-xl font-bold">
					{displayName} {tutor.gov_last_name}
				</h3>
				<div className="flex items-center gap-2 my-1 text-sm font-medium">
					<span className={tutor.accepting_students > 0 ? "text-green-500" : "text-red-500"}>●</span>
					{tutor.accepting_students > 0 ? "Accepting Students" : "Full Capacity"}
				</div>
				<p className="text-sm text-slate-600 line-clamp-1 italic mb-2">{tutor.subjects}</p>
				<p className="text-sm text-slate-700 line-clamp-5">{tutor.bio}</p>
			</div> */}
			<div className="flex flex-col grow">
				<div className="flex items-center justify-between">
					<h3 className="text-xl font-bold text-slate-800">{displayName}</h3>
					<div className={`h-2.5 w-2.5 rounded-full ${tutor.accepting_students > 0 ? "bg-green-500" : "bg-red-500"}`} title={tutor.accepting_students > 0 ? "Accepting Students" : "Full Capacity"} />
				</div>

				<p className="text-sm font-bold text-primary mt-1 leading-tight">{tutor.subjects}</p>

				<p className="text-sm text-slate-600 mt-3 line-clamp-4 leading-relaxed">{tutor.bio}</p>
			</div>
		</div>
	);
};

export default TutorCard;
