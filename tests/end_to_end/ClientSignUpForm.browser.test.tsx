/** @format */

/**
 * THINGS TO UI TEST:
 * - add and remove guardians
 * - persistent form values
 * - submission calls correct functions
 * - primary biller accuracy
 * - autofill existing guardian
 */

import { render } from "vitest-browser-react";
import type { DBTypes } from "@/lib/db/dbtypes";
import ClientSignUpForm from "@/app/signup/ClientSignUpForm";

const { mockTutors, mockSubjects, mockGuardian, mockRouterPush, mockOnboardClientWithFormData, mockCheckGuardianStatus, mockGetTutorsBySubjects } = vi.hoisted(() => {
	const mockTutors: DBTypes.TutorsRow[] = [
		{
			tutor_id: 1,
			gov_first_name: "Connor",
			gov_last_name: "McDavid",
			pref_name: "McJesus",
			display_name: "McJesus",
			email: "connormcdavid@oilnation.ca",
			phone: "(780) 111-1111",
			date_hired: new Date(),
			prior_experience: 11,
			current_rate: 12.5,
			accepting_students: 97,
			emerg_contact_name: "Lauren McDavid",
			emerg_contact_phone: "(587) 111-1111",
			emerg_contact_relationship: "Wife",
			availability: "Saturday nights",
			in_person: "In-Person Only",
			city: "Edmonton",
			location: "Rogers Place",
			subjects: "Hockey Techniques, Hockey Strategy, Hockey Fitness",
			current_uni: "University of Alberta",
			current_degree: "Master's Degree",
			field_of_study: "Hockey Science",
			year_of_study: 12,
			current_fav_class: "Advanced Stick Handling",
			academic_interests: "Hockey Analytics, Sports Psychology",
			bio: "I just want to be in Edmonton, playing hockey.",
			hobbies: "Hockey",
			high_school: "McDowell High School",
			high_school_city: "Erie",
			fav_high_school_class: "Physical Education",
			ap_ib_credentials: "AP Scholar",
		},
		{
			tutor_id: 2,
			gov_first_name: "Leon",
			gov_last_name: "Draisaitl",
			pref_name: "Drai",
			display_name: "Leo",
			email: "leondraisaitl@oilnation.ca",
			phone: "(780) 222-2222",
			date_hired: new Date(),
			prior_experience: 12,
			current_rate: 14,
			accepting_students: 29,
			emerg_contact_name: "Celeste Draisaitl",
			emerg_contact_phone: "(587) 222-2222",
			emerg_contact_relationship: "Wife",
			availability: "Saturday nights",
			in_person: "In-Person Only",
			city: "Edmonton",
			location: "Rogers Place",
			subjects: "Bullying Bullies, Finishing from the Office, Hockey Fitness",
			current_uni: "University of Alberta",
			current_degree: "Master's Degree",
			field_of_study: "Hockey Science",
			year_of_study: 13,
			current_fav_class: "Advanced Stick Handling",
			academic_interests: "Hockey Analytics, Sports Psychology",
			bio: "Let's do this, Edmonton.",
			hobbies: "Hockey",
			high_school: "Jungadler Mannheim Academy",
			high_school_city: "Mannheim",
			fav_high_school_class: "Physical Education",
			ap_ib_credentials: "AP Scholar",
		},
	];
	const mockSubjects: string[] = mockTutors.map((tutor) => tutor.subjects).flatMap((subjects) => subjects.split(", "));
	const mockGuardian: DBTypes.GuardiansRow = {
		guardian_id: 1,
		gov_first_name: "Kris",
		gov_last_name: "Knoblauch",
		pref_name: "Knobster",
		email: "krisknoblauch@oilnation.ca",
		phone: "(123) 456-7890",
		pref_communication: "Text Message",
	};
	return {
		mockTutors,
		mockSubjects,
		mockGuardian,
		mockRouterPush: vi.fn(),
		mockOnboardClientWithFormData: vi.fn().mockResolvedValue({ success: true }),
		mockCheckGuardianStatus: vi.fn().mockResolvedValue({ success: true, data: mockGuardian, error: null }),
		mockGetTutorsBySubjects: vi.fn().mockResolvedValue((subjects: string[]) => Promise.resolve(mockTutors.filter((tutor) => subjects.every((subject) => tutor.subjects.split(", ").includes(subject))))),
	};
});

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockRouterPush }) }));
vi.mock("@/lib/db/actions/onboard_client", () => ({ onboardClientWithFormData: mockOnboardClientWithFormData }));
vi.mock("@/lib/db/actions/client_form", () => ({ checkGuardianStatus: mockCheckGuardianStatus, getTutorsBySubjects: mockGetTutorsBySubjects }));

describe("Client Sign Up Form", () => {
	it("should load the form", async () => {
		const form = await render(<ClientSignUpForm tutors={mockTutors} subjects={mockSubjects} />);
	});
});
