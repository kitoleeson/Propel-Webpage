/** @format */

export type PersonPlaceholder = {
	gov_first: string;
	gov_last: string;
	pref_name: string;
	city: string;
	grade: number;
	email: string;
	phone: string;
	relationship: string;
};

const joyce: PersonPlaceholder = {
	gov_first: "Joyce",
	gov_last: "Nakatumba-Nabende",
	pref_name: "Joy",
	city: "Kampala",
	grade: 12,
	email: "joyce@example.ca",
	phone: "(123) 456-7890",
	relationship: "Mother",
};

const verdiana: PersonPlaceholder = {
	gov_first: "Verdiana",
	gov_last: "Masanja",
	pref_name: "Diana",
	city: "Arusha",
	grade: 12,
	email: "verdiana@example.ca",
	phone: "(123) 456-7890",
	relationship: "Mother",
};

const maryam: PersonPlaceholder = {
	gov_first: "Maryam",
	gov_last: "Mirzakhani",
	pref_name: "",
	city: "Tehran",
	grade: 12,
	email: "maryam@example.ca",
	phone: "(123) 456-7890",
	relationship: "Mother",
};

const sameera: PersonPlaceholder = {
	gov_first: "Sameera",
	gov_last: "Moussa",
	pref_name: "Sammy",
	city: "Cairo",
	grade: 12,
	email: "sameera@example.ca",
	phone: "(123) 456-7890",
	relationship: "Aunt",
};

const francisca: PersonPlaceholder = {
	gov_first: "Francisca",
	gov_last: "Nneka Okeke",
	pref_name: "Keke",
	city: "Onitsha",
	grade: 12,
	email: "francisca@example.ca",
	phone: "(123) 456-7890",
	relationship: "Mother",
};

const janaki: PersonPlaceholder = {
	gov_first: "Janaki",
	gov_last: "Ammal",
	pref_name: "Naki",
	city: "Thalassery",
	grade: 12,
	email: "janaki@example.ca",
	phone: "(123) 456-7890",
	relationship: "Aunt",
};

const hayat: PersonPlaceholder = {
	gov_first: "Hayat",
	gov_last: "Sindi",
	pref_name: "",
	city: "Mecca",
	grade: 12,
	email: "hayat@example.ca",
	phone: "(123) 456-7890",
	relationship: "Aunt",
};

export const placeholders: PersonPlaceholder[] = [joyce, verdiana, maryam, sameera, francisca, janaki, hayat];
