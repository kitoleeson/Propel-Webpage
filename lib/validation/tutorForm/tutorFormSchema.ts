/** @format */

import { z } from "zod";

const testing: boolean = false; // Set to true to enable default values for testing

// console.log(`[ENV CHECK] APP_ENV is: "${process.env.APP_ENV}"`);
// console.log(`[ENV CHECK] Testing mode is: ${process.env.APP_ENV != "prod"}`);

export const subjectSchema = z
	.object({
		math: z.array(z.string()),
		advanced_math: z.array(z.string()),
		science: z.array(z.string()),
		physics: z.array(z.string()),
		chemistry: z.array(z.string()),
		biology: z.array(z.string()),
		computer_science: z.array(z.string()),
		social_studies: z.array(z.string()),
		english: z.array(z.string()),
		languages: z.array(z.string()),
	})
	.refine((data) => Object.values(data).some((arr) => arr.length > 0), {
		message: "At least one subject must be selected",
	});

export const tutorSchema = z
	.object({
		gov_first_name: z.string().min(1, "First name is required"),
		gov_last_name: z.string().min(1, "Last name is required"),
		pref_name: z.string().optional(),
		email: z.string().email("Invalid email address"),
		phone: z.string().min(1, "Phone number is required"),

		date_hired: z.date(),
		prior_experience: z
			.number()
			.int()
			.min(0, "Prior experience must be a positive number")
			.optional()
			.refine((val) => val !== undefined, { message: "Prior experience is required" }),
		current_rate: z
			.number()
			.min(0, "Current rate must be a positive number")
			.optional()
			.refine((val) => val !== undefined, { message: "Current rate is required" })
			.refine((val) => (val * 10) % 25 === 0, { message: "Rate must be in increments of $2.5" }),
		accepting_students: z
			.number()
			.int()
			.min(0, "Number of desired additional students must be a non-negative number")
			.optional()
			.refine((val) => val !== undefined, { message: "Number of desired additional students is required" }),

		emerg_contact_name: z.string().min(1, "Emergency contact name is required"),
		emerg_contact_phone: z.string().min(1, "Emergency contact phone number is required"),
		emerg_contact_relationship: z.string().min(1, "Emergency contact relationship is required"),

		availability: z.string().min(1, "Availability is required"),
		in_person: z
			.enum(["In-Person Only", "Online Only", "Hybrid"])
			.optional()
			.refine((val) => val !== undefined, { message: "Required" }),
		city: z.string().min(1, { message: "City is required" }),
		location: z.string().optional(),

		subjects: subjectSchema,

		current_uni: z.string().min(1, "Current university is required"),
		current_degree: z
			.enum(["Bachelor's Degree", "Master's Degree", "Associate's Degree", "Doctorate", "Vocational Certificate", "Other"])
			.optional()
			.refine((val) => val !== undefined, { message: "Required" }),
		field_of_study: z.string().min(1, "Current field of study is required"),
		year_of_study: z
			.number()
			.int()
			.min(-1)
			.optional()
			.refine((val) => val !== undefined, { message: "Year of study is required" })
			.refine((val) => val != 0, { message: "Year of study cannot be zero" }),
		current_fav_class: z.string().min(1, "Current favorite class is required"),
		academic_interests: z.string().min(1, "Academic interests are required"),

		bio: z.string().min(1, "Bio is required"),
		hobbies: z.string().min(1, "Hobbies are required"),

		high_school: z.string().min(1, "High school is required"),
		high_school_city: z.string().min(1, "High school city is required"),
		fav_high_school_class: z.string().min(1, "Favorite high school class is required"),
		ap_ib_credentials: z
			.enum(["AP Scholar", "AP Scholar with Honours", "AP Scholar with Distinction", "IB Certificate", "IB Diploma", "N/A"])
			.optional()
			.refine((val) => val !== undefined, { message: "Required" }),
	})
	.superRefine((data, ctx) => {
		if (data.in_person != "Online Only" && (!data.location || data.location?.length < 1)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Location is required if in-person tutoring is offered",
				path: ["location"],
			});
		}
	});

export const defaultTutor: FormValues = testing
	? {
			gov_first_name: "Test",
			gov_last_name: "Tutor",
			pref_name: "Tess",
			email: "test@example.ca",
			phone: "(123) 456-7890",

			date_hired: new Date(),
			prior_experience: 0,
			current_rate: 25,
			accepting_students: 1,

			emerg_contact_name: "Emerg Contact",
			emerg_contact_phone: "(098) 765-4321",
			emerg_contact_relationship: "Mother",

			availability: "Thursdays maybe?",
			in_person: undefined,
			city: "",
			location: "UAlberta Campus",

			subjects: {
				math: [],
				advanced_math: [],
				science: [],
				physics: [],
				chemistry: [],
				biology: [],
				computer_science: [],
				social_studies: [],
				english: [],
				languages: [],
			},

			current_uni: "University of Alberta",
			current_degree: undefined,
			field_of_study: "CS",
			year_of_study: 1,
			current_fav_class: "229",
			academic_interests: "CS probably",

			bio: "asdlfjasldkfjasdf",
			hobbies: "ethernetting :)",

			high_school: "Scona",
			high_school_city: "Edmonton",
			fav_high_school_class: "Physics",
			ap_ib_credentials: undefined,
		}
	: {
			gov_first_name: "",
			gov_last_name: "",
			pref_name: "",
			email: "",
			phone: "",

			date_hired: new Date(),
			prior_experience: undefined,
			current_rate: undefined,
			accepting_students: undefined,

			emerg_contact_name: "",
			emerg_contact_phone: "",
			emerg_contact_relationship: "",

			availability: "",
			in_person: undefined,
			city: "",
			location: "",

			subjects: {
				math: [],
				advanced_math: [],
				science: [],
				physics: [],
				chemistry: [],
				biology: [],
				computer_science: [],
				social_studies: [],
				english: [],
				languages: [],
			},

			current_uni: "",
			current_degree: undefined,
			field_of_study: "",
			year_of_study: undefined,
			current_fav_class: "",
			academic_interests: "",

			bio: "",
			hobbies: "",

			high_school: "",
			high_school_city: "",
			fav_high_school_class: "",
			ap_ib_credentials: undefined,
		};

export const tutorPlaceholder: FormValues = {
	gov_first_name: "Jane Catherine",
	gov_last_name: "Ngila",
	pref_name: "Janie",
	email: "jane@example.ca",
	phone: "(123) 456-7890",

	date_hired: new Date(),
	prior_experience: 11,
	current_rate: 37.5,
	accepting_students: 2,

	emerg_contact_name: "Lise Korsten",
	emerg_contact_phone: "(123) 456-7890",
	emerg_contact_relationship: "Cousin",

	availability: "Tuesdays and Thursdays after 11am, Saturdays after 2pm",
	in_person: undefined,
	city: "Ithiani",
	location: "Kenyatta University Campus, Kensington, or Kitui County",

	subjects: {
		math: [],
		advanced_math: [],
		science: [],
		physics: [],
		chemistry: [],
		biology: [],
		computer_science: [],
		social_studies: [],
		english: [],
		languages: [],
	},

	current_uni: "University of Johannesburg",
	current_degree: undefined,
	field_of_study: "Chemical Sciences",
	year_of_study: 5,
	current_fav_class: "Nanotechnology in Water Purification",
	academic_interests: "Analytical-environmental chemistry, nanotechnology, chemical resins and filters, and water resource management",

	bio: "As a young girl in rural Kenya, I knew I wanted to solve problems to make a difference in my community. I love chemistry because it is precise, yet it can be incredibly creative - it's a creative tool to take something messy and make it pure. My greatest joy comes from knowing that a student I mentored is now leading their own lab, or that a community has a slightly safer glass of water because of a filter I helped design. I'm a scientist, but more than that, I am a woman who believes we have the power to heal our environment, one molecule at a time.",
	hobbies: "Mentorship, community advocacy, academic management, and maxing out my h-index",

	high_school: "Lugulu Girls School",
	high_school_city: "Bungoma County",
	fav_high_school_class: "Applied Chemistry 20",
	ap_ib_credentials: undefined,
};

export type FormValues = z.infer<typeof tutorSchema>;
