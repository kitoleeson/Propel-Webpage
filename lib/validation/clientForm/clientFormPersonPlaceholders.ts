/** @format */

export type PersonPlaceholder = {
	gov_first_name: string;
	gov_last_name: string;
	pref_name: string;
	city: string;
	grade: number;
	email: string;
	phone: string;
	relationship: string;
};

const joyce: PersonPlaceholder = {
	gov_first_name: "Joyce",
	gov_last_name: "Nakatumba-Nabende",
	pref_name: "Joy",
	city: "Kampala",
	grade: 12,
	email: "joyce@example.ca",
	phone: "(123) 456-7890",
	relationship: "Mother",
};

const verdiana: PersonPlaceholder = {
	gov_first_name: "Verdiana",
	gov_last_name: "Masanja",
	pref_name: "Diana",
	city: "Arusha",
	grade: 12,
	email: "verdiana@example.ca",
	phone: "(123) 456-7890",
	relationship: "Mother",
};

const maryam: PersonPlaceholder = {
	gov_first_name: "Maryam",
	gov_last_name: "Mirzakhani",
	pref_name: "",
	city: "Tehran",
	grade: 12,
	email: "maryam@example.ca",
	phone: "(123) 456-7890",
	relationship: "Mother",
};

const sameera: PersonPlaceholder = {
	gov_first_name: "Sameera",
	gov_last_name: "Moussa",
	pref_name: "Sammy",
	city: "Cairo",
	grade: 12,
	email: "sameera@example.ca",
	phone: "(123) 456-7890",
	relationship: "Aunt",
};

const francisca: PersonPlaceholder = {
	gov_first_name: "Francisca",
	gov_last_name: "Nneka Okeke",
	pref_name: "Keke",
	city: "Onitsha",
	grade: 12,
	email: "francisca@example.ca",
	phone: "(123) 456-7890",
	relationship: "Mother",
};

const janaki: PersonPlaceholder = {
	gov_first_name: "Janaki",
	gov_last_name: "Ammal",
	pref_name: "Naki",
	city: "Thalassery",
	grade: 12,
	email: "janaki@example.ca",
	phone: "(123) 456-7890",
	relationship: "Aunt",
};

const hayat: PersonPlaceholder = {
	gov_first_name: "Hayat",
	gov_last_name: "Sindi",
	pref_name: "",
	city: "Mecca",
	grade: 12,
	email: "hayat@example.ca",
	phone: "(123) 456-7890",
	relationship: "Aunt",
};

export const placeholders: PersonPlaceholder[] = [joyce, verdiana, maryam, sameera, francisca, janaki, hayat];
