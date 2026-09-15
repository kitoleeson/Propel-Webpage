/** @format */

import { cleanup, render, RenderResult } from "vitest-browser-react";
import type { DBTypes } from "@/lib/db/dbtypes";
import ClientSignUpForm from "@/app/signup/ClientSignUpForm";
import { userEvent } from "vitest/browser";

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

const fillOutStudentSection = async (page: RenderResult, overrides: any = {}) => {
	const studentSection = page.getByRole("group", { name: "Student Information" });

	await studentSection.getByLabelText("Government First Name").fill(overrides.gov_first_name ?? "Test");
	await studentSection.getByLabelText("Government Last Name").fill(overrides.gov_last_name ?? "Student");
	await studentSection.getByLabelText("Preferred Name (if applicable)").fill(overrides.pref_name ?? "Tess");

	await studentSection.getByLabelText("Grade").fill(overrides.grade ?? "12");
	await studentSection.getByLabelText("City").fill(overrides.city ?? "Edmonton");

	await studentSection.getByRole("textbox", { name: "Email" }).fill(overrides.email ?? "student@example.ca");
	await studentSection.getByLabelText("Phone").fill(overrides.phone ?? "(123) 456-7890");
	if (overrides.pref_communication === "Text Message") await studentSection.getByRole("radio", { name: "Text Message" }).click();
	else await studentSection.getByRole("radio", { name: "Email" }).click();

	await userEvent.selectOptions(studentSection.getByLabelText("How Did You Find Us?"), overrides.how_found_us ?? "Word of Mouth");
	if (overrides.biller === "Student") await studentSection.getByRole("radio", { name: "Student" }).click();
	else await studentSection.getByRole("radio", { name: "Guardian" }).click();
};

const fillOutGuardianSection = async (page: RenderResult, overrides: any = {}) => {
	const guardianSection = page.getByRole("group", { name: overrides.section_name ?? "Guardian Information" });

	await guardianSection.getByLabelText("Government First Name").fill(overrides.gov_first_name ?? "Test");
	await guardianSection.getByLabelText("Government Last Name").fill(overrides.gov_last_name ?? "Guardian");
	await guardianSection.getByLabelText("Preferred Name (if applicable)").fill(overrides.pref_name ?? "Tessa");

	await userEvent.selectOptions(guardianSection.getByLabelText("Relationship to Student"), overrides.relationship ?? "Legal Guardian");

	await guardianSection.getByRole("textbox", { name: "Email" }).fill(overrides.email ?? "guardian@example.ca");
	await guardianSection.getByLabelText("Phone").fill(overrides.phone ?? "(987) 654-3210");
	if (overrides.pref_communication === "Text Message") await guardianSection.getByRole("radio", { name: "Text Message" }).click();
	else await guardianSection.getByRole("radio", { name: "Email" }).click();
};

const fillOutPickTutorSection = async (page: RenderResult, overrides: any = {}) => {
	const pickTutorSection = page.getByRole("group", { name: overrides.section_name ?? "Choose Your Tutor" });

	await userEvent.selectOptions(pickTutorSection.getByLabelText("First Option"), overrides.first_option ?? "McJesus");
	await userEvent.selectOptions(pickTutorSection.getByLabelText("Second Option"), overrides.first_option ?? "Leo");

	await pickTutorSection.getByLabelText("What subjects are you looking for tutoring in?").fill(overrides.subjects ?? "Math 10 AP, Chemistry 20 AP");
	await pickTutorSection.getByLabelText("What days, times, and locations work best for you?").fill(overrides.times_and_locations ?? "Weekdays after 5pm, weekends all day");
};

describe("Client Sign Up Form", () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});

	afterEach(() => cleanup());

	it("should load the form", async () => {
		const form = await render(<ClientSignUpForm tutors={mockTutors} subjects={mockSubjects} />);
		await expect.element(form.getByText("Sign Up")).toBeInTheDocument();
		await expect.element(form.getByText("Student Information")).toBeInTheDocument();
		await expect.element(form.getByText("Guardian Information")).toBeInTheDocument();
		await expect.element(form.getByText("Choose Your Tutor")).toBeInTheDocument();
	});

	it("should load, fill out, and submit the form", async () => {
		const form = await render(<ClientSignUpForm tutors={mockTutors} subjects={mockSubjects} />);
		await fillOutStudentSection(form);
		await fillOutGuardianSection(form);
		await fillOutPickTutorSection(form);
		await form.getByRole("button", { name: "Sign Up" }).click();
		expect(mockOnboardClientWithFormData).toHaveBeenCalledOnce();
	});

	/**
	it("should display field errors returned by server", async () => {
		// mockOnboardClientWithFormData.mockResolvedValueOnce({
		// 	success: false,
		// 	errors: [{ field: "comments", message: "Comment contains invalid characters" }],
		// });
		// const form = await render(<ClientSignUpForm tutors={mockTutors} subjects={mockSubjects} />);
		// await fillOutStudentSection(form);
		// const submitBtn = form.getByRole("button", { name: "Sign Up" });
		// await submitBtn.click();
		// // await expect.element(form.getByText("Comment contains invalid characters")).toBeInTheDocument();
		// expect(mockRouterPush).not.toHaveBeenCalled();
	});

	it("should display global errors returned by server", async () => {});
	it("should display error input on incorrect zod types", async () => {});
	it("should add and remove a new guardian", async () => {});
	it("should add a second guardian as the primary biller", async () => {});
	it("should submit with a student biller", async () => {});
	it("should remember form state after refresh", async () => {});
	it("should autofill an existing guardian", async () => {});
	*/
});

/**
 * THINGS TO UI TEST:
 * - add and remove guardians
 * - persistent form values
 * - submission calls correct functions
 * - primary biller accuracy
 * - autofill existing guardian
 */
