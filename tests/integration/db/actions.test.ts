/** @format */

import { ClientFormValues, GuardianClientFormValues, StudentClientFormValues, TutorClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { subjectPlaceholder, TutorFormValues, tutorPlaceholder } from "@/lib/validation/tutorForm/tutorFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";
import * as mail from "@/lib/mail";
import Mail from "nodemailer/lib/mailer";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;
let onboardClientWithFormData: typeof import("@/lib/db/actions").onboardClientWithFormData;
let emailSpy: import("vitest").MockInstance;

describe("Action Repository Integration Tests", () => {
	beforeAll(async () => {
		({ db } = await import("@/lib/db"));
		({ onboardClientWithFormData } = await import("@/lib/db/actions"));
		await db.pool.query("TRUNCATE TABLE tutors RESTART IDENTITY CASCADE");
		await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects(1, { current_rate: 35 }));
		await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects(2, { current_rate: 40 }));
		emailSpy = vi.spyOn(mail, "sendEmail").mockImplementation(async (data: Mail.Options) => ({
			accepted: [data.to?.toString() || "test@example.com"],
			rejected: [],
			envelopeTime: 0,
			messageTime: 0,
			messageSize: 0,
			response: "250 OK: Message accepted",
			envelope: { from: "test@example.com", to: ["test@example.com"] },
			messageId: "mock-message-id",
			pending: [],
		}));
	});

	beforeEach(async () => {
		await db.pool.query(`
         TRUNCATE TABLE
         students,
         guardians,
         student_guardian,
         student_tutor,
         billing_accounts,
         student_billing,
         pending_student_tutor
         RESTART IDENTITY CASCADE
      `);
	});

	afterAll(() => {
		emailSpy.mockRestore();
	});

	const createMockStudent = (index = 1, overrides = {}): StudentClientFormValues => ({
		gov_first_name: "Rocket",
		gov_last_name: "Man",
		pref_name: "RM",
		email: `rocket${index}.man@mars.ca`,
		phone: `(${index}${index}${index}) 456-7890`,
		pref_communication: "Text Message",
		grade: 12,
		city: "Edmonton",
		how_found_us: "Word of Mouth",
		biller: "Guardian",
		...overrides,
	});

	const createMockGuardian = (index = 1, overrides = {}): GuardianClientFormValues => ({
		gov_first_name: "Rosanna",
		gov_last_name: "Toto",
		pref_name: "Rose",
		email: `rosanna${index}@africa.ca`,
		phone: `(${index}${index}${index}) 456-7890`,
		pref_communication: "Email",
		relationship: "Parent",
		is_primary_biller: true,
		already_exists: false,
		...overrides,
	});

	const createMockTutorWithSubjects = (index = 1, overrides = {}): TutorFormValues => ({
		...tutorPlaceholder,

		email: `jane${index}@example.ca`,
		phone: `(${index}${index}${index}) 456-7890`,

		subjects: subjectPlaceholder,
		in_person: "Hybrid",
		current_degree: "Bachelor's Degree",
		ap_ib_credentials: "AP Scholar with Distinction",
		...overrides,
	});

	const createMockClientFormValues = async (studentOverrides = {}, guardianOverrides = {}): Promise<ClientFormValues> => {
		const student: StudentClientFormValues = createMockStudent(1, studentOverrides);
		const guardian: GuardianClientFormValues = createMockGuardian(1, guardianOverrides);
		const tutors: TutorClientFormValues = { choices: [1, 2], subjects: "Math, Science", notes: "Test notes" };
		return {
			student: student,
			guardians: [guardian],
			tutors: tutors,
			primary_biller_index: 0,
			comments: "Test comments",
		};
	};

	describe("Insert & Find Operations", () => {
		it("should onboard a new student", async () => {
			const data = await createMockClientFormValues();
			await onboardClientWithFormData(data);

			// CHECK DATABASE INPUTS
			// check student
			const students = await db.student.get.getAll();
			expect(students.length).toEqual(1);
			expect(students[0].student_id).toEqual(1);
			expect(students[0].gov_first_name).toEqual("Rocket");
			expect(students[0].email).toEqual("rocket1.man@mars.ca");

			// check guardian
			const guardians = await db.guardian.get.getAll();
			expect(guardians.length).toEqual(1);
			expect(guardians[0].guardian_id).toEqual(1);
			expect(guardians[0].gov_first_name).toEqual("Rosanna");
			expect(guardians[0].email).toEqual("rosanna1@africa.ca");

			// check student_guardian
			const student_guardians = await db.student_guardian.get.getAll();
			expect(student_guardians.length).toEqual(1);
			expect(student_guardians[0].student_id).toEqual(1);
			expect(student_guardians[0].guardian_id).toEqual(1);
			expect(student_guardians[0].is_primary_biller).toEqual(true);

			// check billing_accounts
			const billing_accounts = await db.billing_account.get.getAll();
			expect(billing_accounts.length).toEqual(1);
			expect(billing_accounts[0].billing_id).toEqual(1);
			expect(billing_accounts[0].display_name).toEqual(guardians[0].pref_name);
			expect(billing_accounts[0].first_invoice).toEqual(true);

			// check student_billing
			const student_billings = await db.student_billing.get.getAll();
			expect(student_billings.length).toEqual(1);
			expect(student_billings[0].student_id).toEqual(1);
			expect(student_billings[0].billing_id).toEqual(1);

			// check pending_student_tutor
			const pending_student_tutors = await db.pending_student_tutor.get.getAll();
			expect(pending_student_tutors.length).toEqual(2);
			expect(pending_student_tutors[0].student_id).toEqual(1);
			expect(pending_student_tutors[0].tutor_id).toEqual(1);
			expect(pending_student_tutors[0].hourly_rate).toEqual(35);
			expect(pending_student_tutors[0].had_session).toEqual(false);
			expect(pending_student_tutors[1].student_id).toEqual(1);
			expect(pending_student_tutors[1].tutor_id).toEqual(2);
			expect(pending_student_tutors[1].hourly_rate).toEqual(40);
			expect(pending_student_tutors[1].had_session).toEqual(false);

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(2);
			const adminArguments = emailSpy.mock.calls[0][0];
			expect(adminArguments).toEqual({
				to: "propeltutoringyeg@gmail.com",
				html: expect.any(String),
				subject: `New Client Signup: Rocket Man`,
				attachments: [{ filename: `Rocket_Man-Client_Signup_Form.json`, content: JSON.stringify(data, null, 2), contentType: "application/json" }],
			});
			expect(adminArguments.html).toContain(">Rocket<");
			expect(adminArguments.html).toContain(">Man<");
			expect(adminArguments.html).toContain(">rosanna1@africa.ca<");
			expect(adminArguments.html).not.toContain("??");

			// check client email send
			const clientArguments = emailSpy.mock.calls[1][0];
			expect(clientArguments).toEqual({
				to: "rocket1.man@mars.ca",
				cc: ["rosanna1@africa.ca"],
				text: expect.any(String),
				subject: `Propel Tutoring Signup Confirmation - Rocket Man`,
			});
			expect(clientArguments.text).toContain("Hi Rocket,");
			expect(clientArguments.text).toContain("here is what comes next:");
			expect(clientArguments.text).toContain("3.");
			expect(clientArguments.text).not.toContain("??");
		});

		/**
		 * ADD BEFORE TESTS
		 * at least 2 tutors (BEFORE ALL, DONT TRUNCATE)
		 * a few guardians to use as existing and for unique keys
		 * a few students to check against unique keys
		 */

		/**
		 * THINGS TO TEST
		 * all new information
		 * existing guardians (if inputted as new)
		 * existing guardians (if inputted as existing)
		 * students and guardians with non-unique emails and phone numbers -- send an error back to form to say "already have an account?"
		 * student biller and guardian biller
		 */
	});
});
