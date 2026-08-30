/** @format */

import { allSubjectPlaceholder, subjectPlaceholder, TutorFormValues, tutorPlaceholder, TutorSemesterUpdateFormValues, tutorUpdatePlaceholder } from "@/lib/validation/tutorForm/tutorFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";
import Mail from "nodemailer/lib/mailer";
import { redirect } from "next/navigation";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;
let submitNewTutorForApproval: typeof import("@/lib/db/actions/workflows/tutor_forms").submitNewTutorForApproval;
let approvePendingNewTutor: typeof import("@/lib/db/actions/workflows/tutor_forms").approvePendingNewTutor;
let submitTutorSemesterUpdateForApproval: typeof import("@/lib/db/actions/workflows/tutor_forms").submitTutorSemesterUpdateForApproval;
let approvePendingTutorSemesterUpdate: typeof import("@/lib/db/actions/workflows/tutor_forms").approvePendingTutorSemesterUpdate;
let emailSpy: import("vitest").MockInstance;

describe("Tutor Input Forms Integration Tests", () => {
	beforeAll(async () => {
		vi.resetModules();
		({ db } = await import("@/lib/db"));
		({ submitNewTutorForApproval, approvePendingNewTutor, submitTutorSemesterUpdateForApproval, approvePendingTutorSemesterUpdate } = await import("@/lib/db/actions/workflows/tutor_forms"));

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
                tutors,
				pending_tutors
            RESTART IDENTITY CASCADE
        `);
		emailSpy.mockClear();
		vi.clearAllMocks();
	});

	afterAll(() => {
		emailSpy.mockRestore();
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

	const createMockTutorSemesterUpdate = (overrides = {}): TutorSemesterUpdateFormValues => ({
		...tutorUpdatePlaceholder,

		in_person: "In-Person Only",
		current_degree: "Bachelor's Degree",
		ap_ib_credentials: "AP Scholar with Distinction",

		...overrides,
	});

	describe("New Tutor Operations", () => {
		it("should submit a new tutor for admin approval", async () => {
			const data = createMockTutorWithSubjects();
			await submitNewTutorForApproval(data);

			// check tutors
			const tutors = await db.tutor.get.getAll();
			expect(tutors.length).toEqual(0);

			// check pending_tutors
			const pending_tutors = await db.pending_tutor.getAll();
			expect(pending_tutors.length).toEqual(1);
			expect(pending_tutors[0].tutor_id).toEqual(-1);
			expect(pending_tutors[0].pending_tutor_id).toEqual(1);
			expect(pending_tutors[0].gov_first_name).toEqual("Jane Catherine");

			// check tutor_subjects
			const tutor_subjects = await db.tutor_subjects.get.getAll();
			expect(tutor_subjects.length).toEqual(0);

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(1);
			const adminArguments = emailSpy.mock.calls[0][0];
			expect(adminArguments).toEqual({
				to: "propeltutoringyeg@gmail.com",
				html: expect.any(String),
				subject: "Pending Tutor Request: [NEW] Jane Catherine Ngila",
				attachments: [{ filename: "Jane_Catherine_Ngila-pending_tutor_entry-1.json", content: JSON.stringify({ ...data, tutor_id: -1 }, null, 2), contentType: "application/json" }],
			});
			expect(adminArguments.html).toContain(">Jane Catherine<");
			expect(adminArguments.html).toContain(">Ngila<");
			expect(adminArguments.html).toContain(">jane1@example.ca<");
			expect(adminArguments.html).not.toContain("??");

			// check redirect
			expect(redirect).toHaveBeenCalledOnce();
			expect(redirect).toHaveBeenCalledWith("/");
		});

		it("should submit an existing tutor for admin approval", async () => {
			await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects(1, { subjects: allSubjectPlaceholder }));
			const data = createMockTutorWithSubjects(1, { pref_name: "Jane" });
			await submitNewTutorForApproval(data);

			// check tutors
			const tutors = await db.tutor.get.getAll();
			expect(tutors.length).toEqual(1);
			expect(tutors[0].tutor_id).toEqual(1);
			expect(tutors[0].gov_first_name).toEqual("Jane Catherine");
			expect(tutors[0].pref_name).toEqual("Janie");

			// check pending_tutors
			const pending_tutors = await db.pending_tutor.getAll();
			expect(pending_tutors.length).toEqual(1);
			expect(pending_tutors[0].tutor_id).toEqual(1);
			expect(pending_tutors[0].pending_tutor_id).toEqual(1);
			expect(pending_tutors[0].gov_first_name).toEqual("Jane Catherine");
			expect(pending_tutors[0].pref_name).toEqual("Jane");

			// check tutor_subjects
			const tutor_subjects = await db.tutor_subjects.get.getAll();
			expect(tutor_subjects.length).toEqual(27);

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(1);
			const adminArguments = emailSpy.mock.calls[0][0];
			expect(adminArguments).toEqual({
				to: "propeltutoringyeg@gmail.com",
				html: expect.any(String),
				subject: "Pending Tutor Request: [UPDATE] Jane Catherine Ngila",
				attachments: [{ filename: "Jane_Catherine_Ngila-pending_tutor_entry-1.json", content: JSON.stringify({ ...data, tutor_id: 1 }, null, 2), contentType: "application/json" }],
			});
			expect(adminArguments.html).toContain(">Jane Catherine<");
			expect(adminArguments.html).toContain(">Ngila<");
			expect(adminArguments.html).toContain(">jane1@example.ca<");
			expect(adminArguments.html).not.toContain("??");

			// check redirect
			expect(redirect).toHaveBeenCalledOnce();
			expect(redirect).toHaveBeenCalledWith("/");
		});

		it("should submit a new tutor for admin approval and be accepted by admin", async () => {
			// --------------- SUBMIT FOR ADMIN APPROVAL ---------------
			const data = createMockTutorWithSubjects();
			await submitNewTutorForApproval(data);

			// check tutors
			const pre_tutors = await db.tutor.get.getAll();
			expect(pre_tutors.length).toEqual(0);

			// check pending_tutors
			const pre_pending_tutors = await db.pending_tutor.getAll();
			expect(pre_pending_tutors.length).toEqual(1);
			expect(pre_pending_tutors[0].tutor_id).toEqual(-1);
			expect(pre_pending_tutors[0].pending_tutor_id).toEqual(1);
			expect(pre_pending_tutors[0].gov_first_name).toEqual("Jane Catherine");

			// check tutor_subjects
			const pre_tutor_subjects = await db.tutor_subjects.get.getAll();
			expect(pre_tutor_subjects.length).toEqual(0);

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(1);
			const adminArguments = emailSpy.mock.calls[0][0];
			expect(adminArguments).toEqual({
				to: "propeltutoringyeg@gmail.com",
				html: expect.any(String),
				subject: "Pending Tutor Request: [NEW] Jane Catherine Ngila",
				attachments: [{ filename: "Jane_Catherine_Ngila-pending_tutor_entry-1.json", content: JSON.stringify({ ...data, tutor_id: -1 }, null, 2), contentType: "application/json" }],
			});
			expect(adminArguments.html).toContain(">Jane Catherine<");
			expect(adminArguments.html).toContain(">Ngila<");
			expect(adminArguments.html).toContain(">jane1@example.ca<");
			expect(adminArguments.html).not.toContain("??");

			// check redirect
			expect(redirect).toHaveBeenCalledOnce();
			expect(redirect).toHaveBeenCalledWith("/");

			// --------------- ADMIN APPROVAL ---------------
			await approvePendingNewTutor(1);

			// check tutors
			const post_tutors = await db.tutor.get.getAll();
			expect(post_tutors.length).toEqual(1);
			expect(post_tutors[0].tutor_id).toEqual(1);
			expect(post_tutors[0].gov_first_name).toEqual("Jane Catherine");

			// check pending_tutors
			const post_pending_tutors = await db.pending_tutor.getAll();
			expect(post_pending_tutors.length).toEqual(0);

			// check tutor_subjects
			const post_tutor_subjects = await db.tutor_subjects.get.getAll();
			expect(post_tutor_subjects.length).toEqual(14);
		});

		it("should submit an existing tutor for admin approval and be accepted by admin", async () => {
			// --------------- SUBMIT FOR ADMIN APPROVAL ---------------
			await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects(1, { subjects: allSubjectPlaceholder }));
			const data = createMockTutorWithSubjects(1, { pref_name: "Jane" });
			await submitNewTutorForApproval(data);

			// check tutors
			const pre_tutors = await db.tutor.get.getAll();
			expect(pre_tutors.length).toEqual(1);
			expect(pre_tutors[0].tutor_id).toEqual(1);
			expect(pre_tutors[0].gov_first_name).toEqual("Jane Catherine");
			expect(pre_tutors[0].pref_name).toEqual("Janie");

			// check pending_tutors
			const pre_pending_tutors = await db.pending_tutor.getAll();
			expect(pre_pending_tutors.length).toEqual(1);
			expect(pre_pending_tutors[0].tutor_id).toEqual(1);
			expect(pre_pending_tutors[0].pending_tutor_id).toEqual(1);
			expect(pre_pending_tutors[0].gov_first_name).toEqual("Jane Catherine");
			expect(pre_pending_tutors[0].pref_name).toEqual("Jane");

			// check tutor_subjects
			const pre_tutor_subjects = await db.tutor_subjects.get.getAll();
			expect(pre_tutor_subjects.length).toEqual(27);

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(1);
			const adminArguments = emailSpy.mock.calls[0][0];
			expect(adminArguments).toEqual({
				to: "propeltutoringyeg@gmail.com",
				html: expect.any(String),
				subject: "Pending Tutor Request: [UPDATE] Jane Catherine Ngila",
				attachments: [{ filename: "Jane_Catherine_Ngila-pending_tutor_entry-1.json", content: JSON.stringify({ ...data, tutor_id: 1 }, null, 2), contentType: "application/json" }],
			});
			expect(adminArguments.html).toContain(">Jane Catherine<");
			expect(adminArguments.html).toContain(">Ngila<");
			expect(adminArguments.html).toContain(">jane1@example.ca<");
			expect(adminArguments.html).not.toContain("??");

			// check redirect
			expect(redirect).toHaveBeenCalledOnce();
			expect(redirect).toHaveBeenCalledWith("/");

			// --------------- ADMIN APPROVAL ---------------
			await approvePendingNewTutor(1);

			// check tutors
			const post_tutors = await db.tutor.get.getAll();
			expect(post_tutors.length).toEqual(1);
			expect(post_tutors[0].tutor_id).toEqual(1);
			expect(post_tutors[0].gov_first_name).toEqual("Jane Catherine");
			expect(post_tutors[0].pref_name).toEqual("Jane");

			// check pending_tutors
			const post_pending_tutors = await db.pending_tutor.getAll();
			expect(post_pending_tutors.length).toEqual(0);

			// check tutor_subjects
			const post_tutor_subjects = await db.tutor_subjects.get.getAll();
			expect(post_tutor_subjects.length).toEqual(14);
		});

		it("should error admin approval on duplicate email", async () => {
			// --------------- SUBMIT FOR ADMIN APPROVAL ---------------
			await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects(1, { subjects: allSubjectPlaceholder }));
			const data = createMockTutorWithSubjects(1, { gov_first_name: "JC", phone: "(000) 456-7890" });
			await submitNewTutorForApproval(data);

			// check tutors
			const pre_tutors = await db.tutor.get.getAll();
			expect(pre_tutors.length).toEqual(1);
			expect(pre_tutors[0].tutor_id).toEqual(1);
			expect(pre_tutors[0].gov_first_name).toEqual("Jane Catherine");

			// check pending_tutors
			const pre_pending_tutors = await db.pending_tutor.getAll();
			expect(pre_pending_tutors.length).toEqual(1);
			expect(pre_pending_tutors[0].tutor_id).toEqual(-1);
			expect(pre_pending_tutors[0].pending_tutor_id).toEqual(1);
			expect(pre_pending_tutors[0].gov_first_name).toEqual("JC");

			// check tutor_subjects
			const pre_tutor_subjects = await db.tutor_subjects.get.getAll();
			expect(pre_tutor_subjects.length).toEqual(27);

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(1);
			const adminArguments = emailSpy.mock.calls[0][0];
			expect(adminArguments).toEqual({
				to: "propeltutoringyeg@gmail.com",
				html: expect.any(String),
				subject: "Pending Tutor Request: [NEW] JC Ngila",
				attachments: [{ filename: "JC_Ngila-pending_tutor_entry-1.json", content: JSON.stringify({ ...data, tutor_id: -1 }, null, 2), contentType: "application/json" }],
			});
			expect(adminArguments.html).toContain(">JC<");
			expect(adminArguments.html).toContain(">Ngila<");
			expect(adminArguments.html).toContain(">jane1@example.ca<");
			expect(adminArguments.html).not.toContain("??");

			// check redirect
			expect(redirect).toHaveBeenCalledOnce();
			expect(redirect).toHaveBeenCalledWith("/");

			// --------------- ADMIN APPROVAL ---------------
			await expect(approvePendingNewTutor(1)).rejects.toThrow(/duplicate key value violates unique constraint "tutors_email_key/);

			// check tutors
			const post_tutors = await db.tutor.get.getAll();
			expect(post_tutors.length).toEqual(1);
			expect(post_tutors[0].tutor_id).toEqual(1);
			expect(post_tutors[0].gov_first_name).toEqual("Jane Catherine");

			// check pending_tutors
			const post_pending_tutors = await db.pending_tutor.getAll();
			expect(post_pending_tutors.length).toEqual(1);

			// check tutor_subjects
			const post_tutor_subjects = await db.tutor_subjects.get.getAll();
			expect(post_tutor_subjects.length).toEqual(27);
		});

		it("should error admin approval on duplicate phone number", async () => {
			// --------------- SUBMIT FOR ADMIN APPROVAL ---------------
			await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects(1, { subjects: allSubjectPlaceholder }));
			const data = createMockTutorWithSubjects(1, { gov_first_name: "JC", email: "jane0@example.ca" });
			await submitNewTutorForApproval(data);

			// check tutors
			const pre_tutors = await db.tutor.get.getAll();
			expect(pre_tutors.length).toEqual(1);
			expect(pre_tutors[0].tutor_id).toEqual(1);
			expect(pre_tutors[0].gov_first_name).toEqual("Jane Catherine");

			// check pending_tutors
			const pre_pending_tutors = await db.pending_tutor.getAll();
			expect(pre_pending_tutors.length).toEqual(1);
			expect(pre_pending_tutors[0].tutor_id).toEqual(-1);
			expect(pre_pending_tutors[0].pending_tutor_id).toEqual(1);
			expect(pre_pending_tutors[0].gov_first_name).toEqual("JC");

			// check tutor_subjects
			const pre_tutor_subjects = await db.tutor_subjects.get.getAll();
			expect(pre_tutor_subjects.length).toEqual(27);

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(1);
			const adminArguments = emailSpy.mock.calls[0][0];
			expect(adminArguments).toEqual({
				to: "propeltutoringyeg@gmail.com",
				html: expect.any(String),
				subject: "Pending Tutor Request: [NEW] JC Ngila",
				attachments: [{ filename: "JC_Ngila-pending_tutor_entry-1.json", content: JSON.stringify({ ...data, tutor_id: -1 }, null, 2), contentType: "application/json" }],
			});
			expect(adminArguments.html).toContain(">JC<");
			expect(adminArguments.html).toContain(">Ngila<");
			expect(adminArguments.html).toContain(">jane0@example.ca<");
			expect(adminArguments.html).not.toContain("??");

			// check redirect
			expect(redirect).toHaveBeenCalledOnce();
			expect(redirect).toHaveBeenCalledWith("/");

			// --------------- ADMIN APPROVAL ---------------
			await expect(approvePendingNewTutor(1)).rejects.toThrow(/duplicate key value violates unique constraint "tutors_phone_key/);

			// check tutors
			const post_tutors = await db.tutor.get.getAll();
			expect(post_tutors.length).toEqual(1);
			expect(post_tutors[0].tutor_id).toEqual(1);
			expect(post_tutors[0].gov_first_name).toEqual("Jane Catherine");

			// check pending_tutors
			const post_pending_tutors = await db.pending_tutor.getAll();
			expect(post_pending_tutors.length).toEqual(1);

			// check tutor_subjects
			const post_tutor_subjects = await db.tutor_subjects.get.getAll();
			expect(post_tutor_subjects.length).toEqual(27);
		});
	});

	describe("Semester Update Operations", () => {
		beforeEach(async () => {
			await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects(1));
		});

		it("should submit a tutor semester update for admin approval", async () => {
			const data = createMockTutorSemesterUpdate();
			await submitTutorSemesterUpdateForApproval(data);

			// check tutors
			const tutors = await db.tutor.get.getAll();
			expect(tutors.length).toEqual(1);
			expect(tutors[0].tutor_id).toEqual(1);
			expect(tutors[0].gov_first_name).toEqual("Jane Catherine");
			expect(tutors[0].in_person).toEqual("Hybrid");

			// check pending_tutors
			const pending_tutors = await db.pending_tutor.getAll();
			expect(pending_tutors.length).toEqual(1);
			expect(pending_tutors[0].tutor_id).toEqual(1);
			expect(pending_tutors[0].pending_tutor_id).toEqual(1);
			expect(pending_tutors[0].gov_first_name).toEqual("Jane Catherine");
			expect(pending_tutors[0].in_person).toEqual("In-Person Only");

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(1);
			const adminArguments = emailSpy.mock.calls[0][0];
			expect(adminArguments).toEqual({
				to: "propeltutoringyeg@gmail.com",
				html: expect.any(String),
				subject: "Pending Tutor Semester Update Request: Jane Catherine Ngila",
				attachments: [{ filename: "Jane_Catherine_Ngila-pending_tutor_entry-1.json", content: JSON.stringify({ ...data, tutor_id: 1 }, null, 2), contentType: "application/json" }],
			});
			expect(adminArguments.html).toContain(">Jane Catherine<");
			expect(adminArguments.html).toContain(">Ngila<");
			expect(adminArguments.html).toContain(">In-Person Only<");
			expect(adminArguments.html).not.toContain("??");

			// check redirect
			expect(redirect).toHaveBeenCalledOnce();
			expect(redirect).toHaveBeenCalledWith("/");
		});

		it("should submit a new tutor for admin approval and be accepted by admin, updating in_person field", async () => {
			// --------------- SUBMIT FOR ADMIN APPROVAL ---------------
			const data = createMockTutorSemesterUpdate();
			await submitTutorSemesterUpdateForApproval(data);

			// check tutors
			const tutors = await db.tutor.get.getAll();
			expect(tutors.length).toEqual(1);
			expect(tutors[0].tutor_id).toEqual(1);
			expect(tutors[0].gov_first_name).toEqual("Jane Catherine");
			expect(tutors[0].in_person).toEqual("Hybrid");

			// check pending_tutors
			const pending_tutors = await db.pending_tutor.getAll();
			expect(pending_tutors.length).toEqual(1);
			expect(pending_tutors[0].tutor_id).toEqual(1);
			expect(pending_tutors[0].pending_tutor_id).toEqual(1);
			expect(pending_tutors[0].gov_first_name).toEqual("Jane Catherine");
			expect(pending_tutors[0].in_person).toEqual("In-Person Only");

			// check admin email send
			expect(emailSpy).toHaveBeenCalledTimes(1);
			const adminArguments = emailSpy.mock.calls[0][0];
			expect(adminArguments).toEqual({
				to: "propeltutoringyeg@gmail.com",
				html: expect.any(String),
				subject: "Pending Tutor Semester Update Request: Jane Catherine Ngila",
				attachments: [{ filename: "Jane_Catherine_Ngila-pending_tutor_entry-1.json", content: JSON.stringify({ ...data, tutor_id: 1 }, null, 2), contentType: "application/json" }],
			});
			expect(adminArguments.html).toContain(">Jane Catherine<");
			expect(adminArguments.html).toContain(">Ngila<");
			expect(adminArguments.html).toContain(">In-Person Only<");
			expect(adminArguments.html).not.toContain("??");

			// check redirect
			expect(redirect).toHaveBeenCalledOnce();
			expect(redirect).toHaveBeenCalledWith("/");

			// --------------- ADMIN APPROVAL ---------------
			await approvePendingTutorSemesterUpdate(1);

			// check tutors
			const post_tutors = await db.tutor.get.getAll();
			expect(post_tutors.length).toEqual(1);
			expect(post_tutors[0].tutor_id).toEqual(1);
			expect(post_tutors[0].gov_first_name).toEqual("Jane Catherine");
			expect(post_tutors[0].in_person).toEqual("In-Person Only");

			// check pending_tutors
			const post_pending_tutors = await db.pending_tutor.getAll();
			expect(post_pending_tutors.length).toEqual(0);
		});
	});
});
