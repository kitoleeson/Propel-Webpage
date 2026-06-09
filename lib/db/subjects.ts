/** @format */

import { SubjectFormValues } from "../validation/tutorForm/tutorFormSchema";

const parse1030 = (subject: string, courses: string[]) => {
	switch (courses.length) {
		case 1:
			return courses[0].replace(" (AP)", "");
		case 2:
			if (courses.some((c) => c.includes("10"))) return courses.some((c) => c.includes("20")) ? `${subject} 10-20` : `${subject} 10 & 30`;
			else return `${subject} 20-30`;
		case 3:
			return `${subject} 10-30`;
		default:
			return "";
	}
};

const parse2030 = (subject: string, courses: string[]) => {
	switch (courses.length) {
		case 1:
			return courses[0].replace(" (AP)", "");
		case 2:
			return `${subject} 20-30`;
		default:
			return "";
	}
};

const parsePhysics = (courses: string[]) => {
	switch (courses.length) {
		case 1:
			return courses[0].replace(" (AP)", "");
		case 2:
			if (courses.some((c) => c.includes("20"))) return courses.some((c) => c.includes("30")) ? `Physics 20-30` : `Physics 20 & C`;
			else return `Physics 30 & C`;
		case 3:
			return `Physics 20-30 & C`;
		default:
			return "";
	}
};

const parseAdvancedMath = (courses: string[]) => {
	switch (courses.length) {
		case 1:
			return courses[0].replace(" (AP)", "");
		case 2:
			if (courses.some((c) => c.includes("31"))) return courses.some((c) => c.includes("Math 35")) ? `Math 31 & 35` : `Math 31 & Stats 35`;
			else return `Math 35 & Stats 35`;
		case 3:
			return "Math 31-35 & Stats 35";
		default:
			return "";
	}
};

export default function parseSubjects(subjects: SubjectFormValues) {
	const subjectArray: string[] = [];

	subjectArray.push(parse1030("Math", subjects.math));
	subjectArray.push(parseAdvancedMath(subjects.advanced_math));
	subjectArray.push(parse1030("Science", subjects.science));
	subjectArray.push(parsePhysics(subjects.physics));
	subjectArray.push(parse2030("Chemistry", subjects.chemistry));
	subjectArray.push(parse2030("Biology", subjects.biology));
	subjectArray.push(parse1030("Computer Science", subjects.computer_science));
	subjectArray.push(parse1030("Social Studies", subjects.social_studies));
	subjectArray.push(parse1030("English", subjects.english));
	subjects.languages.forEach((l) => subjectArray.push(l));

	return subjectArray.filter(Boolean).join(", ");
}
