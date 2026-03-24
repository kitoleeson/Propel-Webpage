/** @format */

import { z } from "zod";

export const tutorSchema = z.object({
	gov_first: z.string().min(1, "First name is required"),
	gov_last: z.string().min(1, "Last name is required"),
	pref_name: z.string().optional(),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(1, "Phone number is required"),
	date_hired: z.date(),
	prior_experience: z.number().int().min(0, "Prior experience must be a positive number"),
	current_rate: z.number().min(0, "Current rate must be a positive number"),
	emerg_contact_name: z.string().min(1, "Emergency contact name is required"),
	emerg_contact_phone: z.string().min(1, "Emergency contact phone number is required"),
	emerg_contact_relationship: z.string().min(1, "Emergency contact relationship is required"),
	availability: z.string().min(1, "Availability is required"),
	in_person: z
		.boolean()
		.optional()
		.refine((val) => val !== undefined, { message: "Required" }),
	city: z.string().min(1),
	location: z.string().min(1, "Location is required if in-person tutoring is offered").optional(),
	subjects: z.array(z.string()).min(1, "At least one subject must be selected"),
	current_uni: z.string().min(1, "Current university is required"),
	current_degree: z.string().min(1, "Current degree program is required"),
	current_study_field: z.string().min(1, "Current field of study is required"),
	current_study_year: z.number().int().min(1, "Current year of study must be a positive integer"),
	current_fav_class: z.string().min(1, "Current favorite class is required"),
	academic_interests: z.string().min(1, "Academic interests are required"),
	bio: z.string().min(1, "Bio is required"),
	hobbies: z.string().min(1, "Hobbies are required"),
	high_school: z.string().min(1, "High school is required"),
	high_school_city: z.string().min(1, "High school city is required"),
	fav_high_school_class: z.string().min(1, "Favorite high school class is required"),
	ap_ib_credentials: z.string().min(1, "AP/IB credentials are required"),
	/** ^^^^^ added to sheet ^^^^^^ */
});

export const defaultTutor: FormValues = {
	gov_first: "",
	gov_last: "",
	pref_name: "",
	email: "",
	phone: "",
	date_hired: new Date(),
	prior_experience: 0,
	current_rate: 0,
	emerg_contact_name: "",
	emerg_contact_phone: "",
	emerg_contact_relationship: "",
	availability: "",
	in_person: undefined,
	city: "",
	location: "",
	subjects: [],
	current_uni: "",
	current_degree: "",
	current_study_field: "",
	current_study_year: 0,
	current_fav_class: "",
	bio: "",
	hobbies: "",
	academic_interests: "",
	ap_ib_credentials: "",
	high_school: "",
	high_school_city: "",
	fav_high_school_class: "",
};

export type FormValues = z.infer<typeof tutorSchema>;
