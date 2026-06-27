/** @format */

import { ClientFormValues, GuardianClientFormValues, StudentClientFormValues, TutorClientFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { subjectPlaceholder, TutorFormValues, tutorPlaceholder } from "@/lib/validation/tutorForm/tutorFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";
import Mail from "nodemailer/lib/mailer";
import fs from "fs";
import path from "path";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;
let onboardClientWithFormData: typeof import("@/lib/db/actions/workflows/onboard_client").onboardClientWithFormData;
let tutorAcceptStudent: typeof import("@/lib/db/actions/workflows/onboard_client").tutorAcceptStudent;
let tutorDeclineStudent: typeof import("@/lib/db/actions/workflows/onboard_client").tutorDeclineStudent;
let emailSpy: import("vitest").MockInstance;

describe("Action Repository Integration Tests", () => {
	beforeAll(async () => {
		vi.resetModules();
		({ db } = await import("@/lib/db"));
		({ onboardClientWithFormData, tutorAcceptStudent, tutorDeclineStudent } = await import("@/lib/db/actions/workflows/onboard_client"));
		await db.pool.query("TRUNCATE TABLE tutors RESTART IDENTITY CASCADE");
		await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects(1));
		await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects(2, { current_rate: 40, accepting_students: 4 }));

		const mail = await import("@/lib/mail");
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
		emailSpy.mockClear();
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
		is_primary_biller: index === 1,
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

	const createMockClientFormValues = (studentOverrides = {}, guardianOverrides = [{}]): ClientFormValues => {
		const student: StudentClientFormValues = createMockStudent(1, studentOverrides);
		const guardians: GuardianClientFormValues[] = guardianOverrides.map((overrides, i) => createMockGuardian(i + 1, overrides));
		const tutors: TutorClientFormValues = { choices: [1, 2], subjects: "Math, Science", notes: "Test notes", timeandlocation: "Weekdays after 5pm" };
		return {
			student: student,
			guardians: guardians,
			tutors: tutors,
			primary_biller_index: 0,
			comments: "Test comments",
		};
	};

	describe("Onboarding Operations", () => {
		it("should onboard a new student with a new guardian", async () => {
			const data = createMockClientFormValues();
			await onboardClientWithFormData(data);

			// --------------- CHECK DATABASE INPUTS ---------------
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
			expect(billing_accounts[0].guardian_id).toEqual(1);
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
			expect(pending_student_tutors[0].hourly_rate).toEqual(37.5);
			expect(pending_student_tutors[0].had_session).toEqual(false);
			expect(pending_student_tutors[1].student_id).toEqual(1);
			expect(pending_student_tutors[1].tutor_id).toEqual(2);
			expect(pending_student_tutors[1].hourly_rate).toEqual(40);
			expect(pending_student_tutors[1].had_session).toEqual(false);

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(3);
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
				subject: `Propel Tutoring Signup Confirmation - RM Man`,
			});
			expect(clientArguments.text).toContain("Hi RM,");
			expect(clientArguments.text).toContain("here is what comes next:");
			expect(clientArguments.text).toContain("3.");
			expect(clientArguments.text).not.toContain("??");

			// check tutor email send
			const tutorArguments = emailSpy.mock.calls[2][0];
			expect(tutorArguments).toEqual({
				to: "jane1@example.ca",
				html: expect.any(String),
				subject: `New Student Request: RM Man`,
			});
			expect(tutorArguments.html).toContain("http://localhost:3000/api/acceptNewStudent?id=1");
			expect(tutorArguments.html).toContain("http://localhost:3000/api/declineNewStudent?id=1");
			expect(tutorArguments.html).toContain(">Rocket (RM) Man<");
			expect(tutorArguments.html).toContain(">Math, Science<");
			expect(tutorArguments.html).toContain(">Weekdays after 5pm<");
			expect(tutorArguments.html).not.toContain("??");
		});

		it("should onboard a new student with an existing guardian", async () => {
			const guardian = (await db.guardian.insert(createMockGuardian()))[0];
			const data = createMockClientFormValues({}, [{ already_exists: true, email_password: guardian.email }]);
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
			expect(billing_accounts[0].guardian_id).toEqual(1);
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
			expect(pending_student_tutors[0].hourly_rate).toEqual(37.5);
			expect(pending_student_tutors[0].had_session).toEqual(false);
			expect(pending_student_tutors[1].student_id).toEqual(1);
			expect(pending_student_tutors[1].tutor_id).toEqual(2);
			expect(pending_student_tutors[1].hourly_rate).toEqual(40);
			expect(pending_student_tutors[1].had_session).toEqual(false);

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(3);
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
				subject: `Propel Tutoring Signup Confirmation - RM Man`,
			});
			expect(clientArguments.text).toContain("Hi RM,");
			expect(clientArguments.text).toContain("here is what comes next:");
			expect(clientArguments.text).toContain("3.");
			expect(clientArguments.text).not.toContain("??");

			// check tutor email send
			const tutorArguments = emailSpy.mock.calls[2][0];
			expect(tutorArguments).toEqual({
				to: "jane1@example.ca",
				html: expect.any(String),
				subject: `New Student Request: RM Man`,
			});
			expect(tutorArguments.html).toContain("http://localhost:3000/api/acceptNewStudent?id=1");
			expect(tutorArguments.html).toContain("http://localhost:3000/api/declineNewStudent?id=1");
			expect(tutorArguments.html).toContain(">Rocket (RM) Man<");
			expect(tutorArguments.html).toContain(">Math, Science<");
			expect(tutorArguments.html).toContain(">Weekdays after 5pm<");
			expect(tutorArguments.html).not.toContain("??");
		});

		it("should onboard a new student with two new guardians", async () => {
			const data = createMockClientFormValues({}, [{}, {}]);
			await onboardClientWithFormData(data);

			// --------------- CHECK DATABASE INPUTS ---------------
			// check student
			const students = await db.student.get.getAll();
			expect(students.length).toEqual(1);
			expect(students[0].student_id).toEqual(1);
			expect(students[0].gov_first_name).toEqual("Rocket");
			expect(students[0].email).toEqual("rocket1.man@mars.ca");

			// check guardians
			const guardians = await db.guardian.get.getAll();
			expect(guardians.length).toEqual(2);
			expect(guardians[0].guardian_id).toEqual(1);
			expect(guardians[0].gov_first_name).toEqual("Rosanna");
			expect(guardians[0].email).toEqual("rosanna1@africa.ca");
			expect(guardians[1].guardian_id).toEqual(2);
			expect(guardians[1].gov_first_name).toEqual("Rosanna");
			expect(guardians[1].email).toEqual("rosanna2@africa.ca");

			// check student_guardians
			const student_guardians = await db.student_guardian.get.getAll();
			expect(student_guardians.length).toEqual(2);
			expect(student_guardians[0].student_id).toEqual(1);
			expect(student_guardians[0].guardian_id).toEqual(1);
			expect(student_guardians[0].is_primary_biller).toEqual(true);
			expect(student_guardians[1].student_id).toEqual(1);
			expect(student_guardians[1].guardian_id).toEqual(2);
			expect(student_guardians[1].is_primary_biller).toEqual(false);

			// check billing_accounts
			const billing_accounts = await db.billing_account.get.getAll();
			expect(billing_accounts.length).toEqual(1);
			expect(billing_accounts[0].billing_id).toEqual(1);
			expect(billing_accounts[0].guardian_id).toEqual(1);
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
			expect(pending_student_tutors[0].hourly_rate).toEqual(37.5);
			expect(pending_student_tutors[0].had_session).toEqual(false);
			expect(pending_student_tutors[1].student_id).toEqual(1);
			expect(pending_student_tutors[1].tutor_id).toEqual(2);
			expect(pending_student_tutors[1].hourly_rate).toEqual(40);
			expect(pending_student_tutors[1].had_session).toEqual(false);

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(3);
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
				cc: ["rosanna1@africa.ca", "rosanna2@africa.ca"],
				text: expect.any(String),
				subject: `Propel Tutoring Signup Confirmation - RM Man`,
			});
			expect(clientArguments.text).toContain("Hi RM,");
			expect(clientArguments.text).toContain("here is what comes next:");
			expect(clientArguments.text).toContain("3.");
			expect(clientArguments.text).not.toContain("??");

			// check tutor email send
			const tutorArguments = emailSpy.mock.calls[2][0];
			expect(tutorArguments).toEqual({
				to: "jane1@example.ca",
				html: expect.any(String),
				subject: `New Student Request: RM Man`,
			});
			expect(tutorArguments.html).toContain("http://localhost:3000/api/acceptNewStudent?id=1");
			expect(tutorArguments.html).toContain("http://localhost:3000/api/declineNewStudent?id=1");
			expect(tutorArguments.html).toContain(">Rocket (RM) Man<");
			expect(tutorArguments.html).toContain(">Math, Science<");
			expect(tutorArguments.html).toContain(">Weekdays after 5pm<");
			expect(tutorArguments.html).not.toContain("??");
		});

		it("should onboard a new student with an existing guardian and a new guardian", async () => {
			const guardian = (await db.guardian.insert(createMockGuardian()))[0];
			const data = createMockClientFormValues({}, [{ already_exists: true, email_password: guardian.email }, {}]);
			await onboardClientWithFormData(data);

			// CHECK DATABASE INPUTS
			// check student
			const students = await db.student.get.getAll();
			expect(students.length).toEqual(1);
			expect(students[0].student_id).toEqual(1);
			expect(students[0].gov_first_name).toEqual("Rocket");
			expect(students[0].email).toEqual("rocket1.man@mars.ca");

			// check guardians
			const guardians = await db.guardian.get.getAll();
			expect(guardians.length).toEqual(2);
			expect(guardians[0].guardian_id).toEqual(1);
			expect(guardians[0].gov_first_name).toEqual("Rosanna");
			expect(guardians[0].email).toEqual("rosanna1@africa.ca");
			expect(guardians[1].guardian_id).toEqual(2);
			expect(guardians[1].gov_first_name).toEqual("Rosanna");
			expect(guardians[1].email).toEqual("rosanna2@africa.ca");

			// check student_guardians
			const student_guardians = await db.student_guardian.get.getAll();
			expect(student_guardians.length).toEqual(2);
			expect(student_guardians[0].student_id).toEqual(1);
			expect(student_guardians[0].guardian_id).toEqual(1);
			expect(student_guardians[0].is_primary_biller).toEqual(true);
			expect(student_guardians[1].student_id).toEqual(1);
			expect(student_guardians[1].guardian_id).toEqual(2);
			expect(student_guardians[1].is_primary_biller).toEqual(false);

			// check billing_accounts
			const billing_accounts = await db.billing_account.get.getAll();
			expect(billing_accounts.length).toEqual(1);
			expect(billing_accounts[0].billing_id).toEqual(1);
			expect(billing_accounts[0].guardian_id).toEqual(1);
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
			expect(pending_student_tutors[0].hourly_rate).toEqual(37.5);
			expect(pending_student_tutors[0].had_session).toEqual(false);
			expect(pending_student_tutors[1].student_id).toEqual(1);
			expect(pending_student_tutors[1].tutor_id).toEqual(2);
			expect(pending_student_tutors[1].hourly_rate).toEqual(40);
			expect(pending_student_tutors[1].had_session).toEqual(false);

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(3);
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
				cc: ["rosanna1@africa.ca", "rosanna2@africa.ca"],
				text: expect.any(String),
				subject: `Propel Tutoring Signup Confirmation - RM Man`,
			});
			expect(clientArguments.text).toContain("Hi RM,");
			expect(clientArguments.text).toContain("here is what comes next:");
			expect(clientArguments.text).toContain("3.");
			expect(clientArguments.text).not.toContain("??");

			// check tutor email send
			const tutorArguments = emailSpy.mock.calls[2][0];
			expect(tutorArguments).toEqual({
				to: "jane1@example.ca",
				html: expect.any(String),
				subject: `New Student Request: RM Man`,
			});
			expect(tutorArguments.html).toContain("http://localhost:3000/api/acceptNewStudent?id=1");
			expect(tutorArguments.html).toContain("http://localhost:3000/api/declineNewStudent?id=1");
			expect(tutorArguments.html).toContain(">Rocket (RM) Man<");
			expect(tutorArguments.html).toContain(">Math, Science<");
			expect(tutorArguments.html).toContain(">Weekdays after 5pm<");
			expect(tutorArguments.html).not.toContain("??");
		});

		it("should onboard a new student with two existing guardians", async () => {
			const guardian1 = (await db.guardian.insert(createMockGuardian(1)))[0];
			const guardian2 = (await db.guardian.insert(createMockGuardian(2)))[0];
			const data = createMockClientFormValues({}, [
				{ already_exists: true, email_password: guardian1.email },
				{ already_exists: true, email_password: guardian2.email },
			]);
			await onboardClientWithFormData(data);

			// CHECK DATABASE INPUTS
			// check student
			const students = await db.student.get.getAll();
			expect(students.length).toEqual(1);
			expect(students[0].student_id).toEqual(1);
			expect(students[0].gov_first_name).toEqual("Rocket");
			expect(students[0].email).toEqual("rocket1.man@mars.ca");

			// check guardians
			const guardians = await db.guardian.get.getAll();
			expect(guardians.length).toEqual(2);
			expect(guardians[0].guardian_id).toEqual(1);
			expect(guardians[0].gov_first_name).toEqual("Rosanna");
			expect(guardians[0].email).toEqual("rosanna1@africa.ca");
			expect(guardians[1].guardian_id).toEqual(2);
			expect(guardians[1].gov_first_name).toEqual("Rosanna");
			expect(guardians[1].email).toEqual("rosanna2@africa.ca");

			// check student_guardians
			const student_guardians = await db.student_guardian.get.getAll();
			expect(student_guardians.length).toEqual(2);
			expect(student_guardians[0].student_id).toEqual(1);
			expect(student_guardians[0].guardian_id).toEqual(1);
			expect(student_guardians[0].is_primary_biller).toEqual(true);
			expect(student_guardians[1].student_id).toEqual(1);
			expect(student_guardians[1].guardian_id).toEqual(2);
			expect(student_guardians[1].is_primary_biller).toEqual(false);

			// check billing_accounts
			const billing_accounts = await db.billing_account.get.getAll();
			expect(billing_accounts.length).toEqual(1);
			expect(billing_accounts[0].billing_id).toEqual(1);
			expect(billing_accounts[0].guardian_id).toEqual(1);
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
			expect(pending_student_tutors[0].hourly_rate).toEqual(37.5);
			expect(pending_student_tutors[0].had_session).toEqual(false);
			expect(pending_student_tutors[1].student_id).toEqual(1);
			expect(pending_student_tutors[1].tutor_id).toEqual(2);
			expect(pending_student_tutors[1].hourly_rate).toEqual(40);
			expect(pending_student_tutors[1].had_session).toEqual(false);

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(3);
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
				cc: ["rosanna1@africa.ca", "rosanna2@africa.ca"],
				text: expect.any(String),
				subject: `Propel Tutoring Signup Confirmation - RM Man`,
			});
			expect(clientArguments.text).toContain("Hi RM,");
			expect(clientArguments.text).toContain("here is what comes next:");
			expect(clientArguments.text).toContain("3.");
			expect(clientArguments.text).not.toContain("??");

			// check tutor email send
			const tutorArguments = emailSpy.mock.calls[2][0];
			expect(tutorArguments).toEqual({
				to: "jane1@example.ca",
				html: expect.any(String),
				subject: `New Student Request: RM Man`,
			});
			expect(tutorArguments.html).toContain("http://localhost:3000/api/acceptNewStudent?id=1");
			expect(tutorArguments.html).toContain("http://localhost:3000/api/declineNewStudent?id=1");
			expect(tutorArguments.html).toContain(">Rocket (RM) Man<");
			expect(tutorArguments.html).toContain(">Math, Science<");
			expect(tutorArguments.html).toContain(">Weekdays after 5pm<");
			expect(tutorArguments.html).not.toContain("??");
		});

		it("should error if existing guardian is inputted as new", async () => {
			await db.guardian.insert(createMockGuardian());

			const data = createMockClientFormValues();
			await expect(onboardClientWithFormData(data)).rejects.toThrow(/duplicate key value violates unique constraint.*guardians_email_key/);
		});

		it("should error if existing student is inputted as new", async () => {
			await db.student.insert(createMockStudent());

			const data = createMockClientFormValues();
			await expect(onboardClientWithFormData(data)).rejects.toThrow(/duplicate key value violates unique constraint.*students_email_key/);
		});

		it("should onboard a new student with a new guardian and be accepted by the first tutor", async () => {
			const data = createMockClientFormValues();
			await onboardClientWithFormData(data);
			await tutorAcceptStudent(1);

			// --------------- CHECK DATABASE INPUTS ---------------
			// check student
			const students = await db.student.get.getAll();
			expect(students.length).toEqual(1);

			// check guardian
			const guardians = await db.guardian.get.getAll();
			expect(guardians.length).toEqual(1);

			// check student_guardian
			const student_guardians = await db.student_guardian.get.getAll();
			expect(student_guardians.length).toEqual(1);

			// check billing_accounts
			const billing_accounts = await db.billing_account.get.getAll();
			expect(billing_accounts.length).toEqual(1);

			// check student_billing
			const student_billings = await db.student_billing.get.getAll();
			expect(student_billings.length).toEqual(1);

			// check pending_student_tutor
			const pending_student_tutors = await db.pending_student_tutor.get.getAll();
			expect(pending_student_tutors.length).toEqual(0);

			// check student_tutor
			const student_tutors = await db.student_tutor.get.getAll();
			expect(student_tutors.length).toEqual(1);
			expect(student_tutors[0].student_id).toEqual(1);
			expect(student_tutors[0].tutor_id).toEqual(1);
			expect(student_tutors[0].hourly_rate).toEqual(37.5);
			expect(student_tutors[0].had_session).toEqual(false);

			expect(emailSpy).toHaveBeenCalledTimes(5);

			// check client agreement email send
			const clientArguments = emailSpy.mock.calls[3][0];
			const pdfPath = path.resolve(process.cwd(), "assets/templates/clientAgreement.pdf");
			const clientAgreement = fs.readFileSync(pdfPath);
			expect(clientArguments).toEqual({
				to: "rocket1.man@mars.ca",
				cc: ["rosanna1@africa.ca"],
				text: expect.any(String),
				subject: `Propel Tutoring Tutor Pair and Agreement - RM Man`,
				attachments: [{ filename: "Propel-Agreement_Rocket-Man.pdf", content: clientAgreement, contentType: "application/pdf" }],
			});
			expect(clientArguments.text).toContain("Hi RM,");
			expect(clientArguments.text).toContain("excited to begin");
			expect(clientArguments.text).toContain(
				"You will be working with Janie, a Chemical Sciences student at the University of Johannesburg. Their current hourly rate is $37.5 per hour, which will not change for as long as you work together. You will be hearing from Janie shortly to set up a first session.",
			);
			expect(clientArguments.text).not.toContain("??");

			// check admin review email send
			const adminArguments = emailSpy.mock.calls[4][0];
			expect(adminArguments).toEqual({
				to: "propeltutoringyeg@gmail.com",
				html: expect.any(String),
				subject: "New Student-Tutor Pairing: Rocket Man",
			});
			expect(adminArguments.html).toContain(">Rocket (RM) Man<");
			expect(adminArguments.html).toContain(">Edmonton<");
			expect(adminArguments.html).toContain(">12<");
			expect(adminArguments.html).toContain(">Janie Ngila<");
			expect(adminArguments.html).toContain(">1<");
			expect(adminArguments.html).toContain(">37.5<");
			expect(adminArguments.html).toContain(">5<");
			expect(adminArguments.html).not.toContain("??");
		});

		it("should onboard a new student with a new guardian and be declined by the first tutor", async () => {
			const data = createMockClientFormValues();
			await onboardClientWithFormData(data);
			await tutorDeclineStudent(1);

			// --------------- CHECK DATABASE INPUTS ---------------
			// check student
			const students = await db.student.get.getAll();
			expect(students.length).toEqual(1);

			// check guardian
			const guardians = await db.guardian.get.getAll();
			expect(guardians.length).toEqual(1);

			// check student_guardian
			const student_guardians = await db.student_guardian.get.getAll();
			expect(student_guardians.length).toEqual(1);

			// check billing_accounts
			const billing_accounts = await db.billing_account.get.getAll();
			expect(billing_accounts.length).toEqual(1);

			// check student_billing
			const student_billings = await db.student_billing.get.getAll();
			expect(student_billings.length).toEqual(1);

			// check pending_student_tutor
			const pending_student_tutors = await db.pending_student_tutor.get.getAll();
			expect(pending_student_tutors.length).toEqual(1);
			expect(pending_student_tutors[0].student_id).toEqual(1);
			expect(pending_student_tutors[0].tutor_id).toEqual(2);

			// check student_tutor
			const student_tutors = await db.student_tutor.get.getAll();
			expect(student_tutors.length).toEqual(0);

			expect(emailSpy).toHaveBeenCalledTimes(4);

			// check second choice tutor email send
			const tutorArguments = emailSpy.mock.calls[3][0];
			expect(tutorArguments).toEqual({
				to: "jane2@example.ca",
				html: expect.any(String),
				subject: `New Student Request: RM Man`,
			});
			expect(tutorArguments.html).toContain("http://localhost:3000/api/acceptNewStudent?id=2");
			expect(tutorArguments.html).toContain("http://localhost:3000/api/declineNewStudent?id=2");
			expect(tutorArguments.html).toContain(">Rocket (RM) Man<");
			expect(tutorArguments.html).toContain(">Math, Science<");
			expect(tutorArguments.html).toContain(">Weekdays after 5pm<");
			expect(tutorArguments.html).not.toContain("??");
		});

		it("should onboard a new student with a new guardian and be declined by the first tutor then accepted by the second tutor", async () => {
			const data = createMockClientFormValues();
			await onboardClientWithFormData(data);
			await tutorDeclineStudent(1);
			await tutorAcceptStudent(2);

			// --------------- CHECK DATABASE INPUTS ---------------
			// check student
			const students = await db.student.get.getAll();
			expect(students.length).toEqual(1);

			// check guardian
			const guardians = await db.guardian.get.getAll();
			expect(guardians.length).toEqual(1);

			// check student_guardian
			const student_guardians = await db.student_guardian.get.getAll();
			expect(student_guardians.length).toEqual(1);

			// check billing_accounts
			const billing_accounts = await db.billing_account.get.getAll();
			expect(billing_accounts.length).toEqual(1);

			// check student_billing
			const student_billings = await db.student_billing.get.getAll();
			expect(student_billings.length).toEqual(1);

			// check pending_student_tutor
			const pending_student_tutors = await db.pending_student_tutor.get.getAll();
			expect(pending_student_tutors.length).toEqual(0);

			// check student_tutor
			const student_tutors = await db.student_tutor.get.getAll();
			expect(student_tutors.length).toEqual(1);
			expect(student_tutors[0].student_id).toEqual(1);
			expect(student_tutors[0].tutor_id).toEqual(2);

			expect(emailSpy).toHaveBeenCalledTimes(6);

			// check second choice tutor email send
			const tutorArguments = emailSpy.mock.calls[3][0];
			expect(tutorArguments).toEqual({
				to: "jane2@example.ca",
				html: expect.any(String),
				subject: `New Student Request: RM Man`,
			});
			expect(tutorArguments.html).toContain("http://localhost:3000/api/acceptNewStudent?id=2");
			expect(tutorArguments.html).toContain("http://localhost:3000/api/declineNewStudent?id=2");
			expect(tutorArguments.html).toContain(">Rocket (RM) Man<");
			expect(tutorArguments.html).toContain(">Math, Science<");
			expect(tutorArguments.html).toContain(">Weekdays after 5pm<");
			expect(tutorArguments.html).not.toContain("??");

			// check client agreement email send
			const clientArguments = emailSpy.mock.calls[4][0];
			const pdfPath = path.resolve(process.cwd(), "assets/templates/clientAgreement.pdf");
			const clientAgreement = fs.readFileSync(pdfPath);
			expect(clientArguments).toEqual({
				to: "rocket1.man@mars.ca",
				cc: ["rosanna1@africa.ca"],
				text: expect.any(String),
				subject: `Propel Tutoring Tutor Pair and Agreement - RM Man`,
				attachments: [{ filename: "Propel-Agreement_Rocket-Man.pdf", content: clientAgreement, contentType: "application/pdf" }],
			});
			expect(clientArguments.text).toContain("Hi RM,");
			expect(clientArguments.text).toContain("excited to begin");
			expect(clientArguments.text).toContain(
				"You will be working with Janie, a Chemical Sciences student at the University of Johannesburg. Their current hourly rate is $40 per hour, which will not change for as long as you work together. You will be hearing from Janie shortly to set up a first session.",
			);
			expect(clientArguments.text).not.toContain("??");

			// check admin review email send
			const adminArguments = emailSpy.mock.calls[5][0];
			expect(adminArguments).toEqual({
				to: "propeltutoringyeg@gmail.com",
				html: expect.any(String),
				subject: "New Student-Tutor Pairing: Rocket Man",
			});
			expect(adminArguments.html).toContain(">Rocket (RM) Man<");
			expect(adminArguments.html).toContain(">Edmonton<");
			expect(adminArguments.html).toContain(">12<");
			expect(adminArguments.html).toContain(">Janie Ngila<");
			expect(adminArguments.html).toContain(">3<");
			expect(adminArguments.html).toContain(">40<");
			expect(adminArguments.html).toContain(">5<");
			expect(adminArguments.html).not.toContain("??");
		});

		it("should onboard a new student with a new guardian and be declined by the first tutor then declined by the second tutor", async () => {
			const data = createMockClientFormValues();
			await onboardClientWithFormData(data);
			await tutorDeclineStudent(1);
			await tutorDeclineStudent(2);

			// --------------- CHECK DATABASE INPUTS ---------------
			// check student
			const students = await db.student.get.getAll();
			expect(students.length).toEqual(1);

			// check guardian
			const guardians = await db.guardian.get.getAll();
			expect(guardians.length).toEqual(1);

			// check student_guardian
			const student_guardians = await db.student_guardian.get.getAll();
			expect(student_guardians.length).toEqual(1);

			// check billing_accounts
			const billing_accounts = await db.billing_account.get.getAll();
			expect(billing_accounts.length).toEqual(1);

			// check student_billing
			const student_billings = await db.student_billing.get.getAll();
			expect(student_billings.length).toEqual(1);

			// check pending_student_tutor
			const pending_student_tutors = await db.pending_student_tutor.get.getAll();
			expect(pending_student_tutors.length).toEqual(0);

			// check student_tutor
			const student_tutors = await db.student_tutor.get.getAll();
			expect(student_tutors.length).toEqual(0);

			expect(emailSpy).toHaveBeenCalledTimes(5);

			// check second choice tutor email send
			const tutorArguments = emailSpy.mock.calls[3][0];
			expect(tutorArguments).toEqual({
				to: "jane2@example.ca",
				html: expect.any(String),
				subject: `New Student Request: RM Man`,
			});
			expect(tutorArguments.html).toContain("http://localhost:3000/api/acceptNewStudent?id=2");
			expect(tutorArguments.html).toContain("http://localhost:3000/api/declineNewStudent?id=2");
			expect(tutorArguments.html).toContain(">Rocket (RM) Man<");
			expect(tutorArguments.html).toContain(">Math, Science<");
			expect(tutorArguments.html).toContain(">Weekdays after 5pm<");
			expect(tutorArguments.html).not.toContain("??");

			// check admin assignment email send
			const adminArguments = emailSpy.mock.calls[4][0];
			expect(adminArguments).toEqual({
				to: "propeltutoringyeg@gmail.com",
				html: expect.any(String),
				subject: "New Unpaired Student Request: Rocket Man",
			});
			expect(adminArguments.html).toContain(">Rocket (RM) Man<");
			expect(adminArguments.html).toContain(">Edmonton<");
			expect(adminArguments.html).toContain(">12<");
			expect(adminArguments.html).not.toContain("??");
		});

		/**
		 * THINGS TO TEST
		 * students and guardians with non-unique emails and phone numbers -- send an error back to form to say "already have an account?"
		 * student biller and guardian biller
		 */
	});
});
