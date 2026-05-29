/** @format */

import { TutorType } from "@/lib/db/tutor";
import { SubjectFormValues, subjectPlaceholder, TutorFormValues, tutorPlaceholder } from "@/lib/validation/tutorForm/tutorFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;

describe("Tutor Repository Integration Tests", () => {
	beforeAll(async () => {
		({ db } = await import("@/lib/db"));
	});

	beforeEach(async () => {
		await db.pool.query("TRUNCATE TABLE tutors, tutor_subjects RESTART IDENTITY CASCADE");
	});

	const createMockTutor = (overrides = {}): TutorType => ({
		...tutorPlaceholder,
		subjects: "Math, Science",
		in_person: "Hybrid",
		current_degree: "Bachelor's Degree",
		ap_ib_credentials: "AP Scholar with Distinction",
		...overrides,
	});

	const createMockTutorWithSubjects = (overrides = {}): TutorFormValues => ({
		...tutorPlaceholder,
		subjects: subjectPlaceholder,
		in_person: "Hybrid",
		current_degree: "Bachelor's Degree",
		ap_ib_credentials: "AP Scholar with Distinction",
		...overrides,
	});

	const emptySubjects: SubjectFormValues = {
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
	};

	const newSubjects: SubjectFormValues = {
		math: ["Math 10 (AP)", "Math 20 (AP)", "Math 30 (AP)"],
		advanced_math: ["Math 31 (AP)"],
		science: [],
		physics: ["Physics 20 (AP)", "Physics 30 (AP)"],
		chemistry: [],
		biology: [],
		computer_science: ["Comp Sci 20 (AP)", "Comp Sci 30 (AP)"],
		social_studies: [],
		english: [],
		languages: [],
	};

	describe("Insert & Find Operations", () => {
		it("should insert a new tutor", async () => {
			const mockData = createMockTutor();
			const result = await db.tutor.insert.insert(mockData);
			expect(result.rows[0]).toBeDefined();
			expect(result.rows[0].gov_first_name).toBe("Jane Catherine");
		});

		it("should insert a new tutor and retrieve their ID by name", async () => {
			const mockData = createMockTutor();
			const result = await db.tutor.insert.insert(mockData);
			expect(result.rows[0]).toBeDefined();

			const tutorId = await db.tutor.find("Jane Catherine", "Ngila");
			expect(tutorId).toEqual(1);
		});

		it("should insert a new tutor and retrieve their ID by case-insensitive name", async () => {
			const mockData = createMockTutor();
			const result = await db.tutor.insert.insert(mockData);
			expect(result.rows[0]).toBeDefined();

			let tutorId;
			tutorId = await db.tutor.find("JANE CATHERINE", "NGILA");
			expect(tutorId).toEqual(1);

			tutorId = await db.tutor.find("jane catherine", "ngila");
			expect(tutorId).toEqual(1);

			tutorId = await db.tutor.find("jANe cAThERinE", "nGiLA");
			expect(tutorId).toEqual(1);
		});

		it("should error insert on duplicate email", async () => {
			await db.tutor.insert.insert(createMockTutor({ email: "jane@example.ca", phone: "(123) 456-7890" }));
			await expect(db.tutor.insert.insert(createMockTutor({ email: "jane@example.ca", phone: "(098) 765-4321" }))).rejects.toThrow(/duplicate key value violates unique constraint.*email/);
		});

		it("should error insert on duplicate phone", async () => {
			await db.tutor.insert.insert(createMockTutor({ email: "jane1@example.ca", phone: "(123) 456-7890" }));
			await expect(db.tutor.insert.insert(createMockTutor({ email: "jane2@example.ca", phone: "(123) 456-7890" }))).rejects.toThrow(/duplicate key value violates unique constraint.*phone/);
		});

		it("should insert tutor with subjects into tutors and tutor_subjects", async () => {
			const inserted = (await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects())).rows[0];
			expect(inserted.gov_first_name).toEqual("Jane Catherine");
			const tutor = (await db.tutor.get.get(inserted.tutor_id)).rows[0];
			expect(tutor.gov_first_name).toEqual("Jane Catherine");
			expect(parseFloat(tutor.current_rate)).toEqual(37.5);
			const subjects = await db.tutor_subjects.get.getSubjectsByTutor(inserted.tutor_id);
			expect(subjects.rows.map((row: { subject: string }) => row.subject).sort()).toEqual(Object.values(subjectPlaceholder).flat().sort());
		});

		it("should insert tutor with no subjects", async () => {
			const inserted = (await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects({ subjects: emptySubjects }))).rows[0];
			expect(inserted.gov_first_name).toEqual("Jane Catherine");
			const tutor = (await db.tutor.get.get(inserted.tutor_id)).rows[0];
			expect(tutor.gov_first_name).toEqual("Jane Catherine");
			expect(parseFloat(tutor.current_rate)).toEqual(37.5);
			const subjects = await db.tutor_subjects.get.getSubjectsByTutor(inserted.tutor_id);
			expect(subjects.rows.map((row: { subject: string }) => row.subject).sort()).toEqual([]);
		});
	});

	describe("Get Operations", () => {
		it("should fetch a specific tutor by ID", async () => {
			const mockData = createMockTutor();
			const inserted = await db.tutor.insert.insert(mockData);
			const id = inserted.rows[0].tutor_id;

			const result = await db.tutor.get.get(id);
			expect(result.rows[0].gov_first_name).toBe("Jane Catherine");
			expect(result.rows[0].email).toBe("jane@example.ca");
		});

		it("should error when getting non-existent tutor ID", async () => {
			const result = await db.tutor.get.get(1);
			expect(result.rows.length).toEqual(0);
		});

		it("should error when getting all non-existent tutor IDs", async () => {
			const result = await db.tutor.get.getAll();
			expect(result.rows.length).toEqual(0);
		});

		it("should return all tutors ordered by number of accepting students", async () => {
			const names = ["A-B-C", "1-2-3", "Do-Re-Mi"];
			for (let i = 1; i <= 3; i++) await db.tutor.insert.insert(createMockTutor({ gov_first_name: names[i - 1], email: `tutor${i}@test.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: i }));
			const result = await db.tutor.get.getAll();
			expect(Array.isArray(result.rows)).toBe(true);
			expect(result.rows.length).toEqual(3);
			expect(result.rows[0].gov_first_name).toBe("Do-Re-Mi");
			expect(result.rows[1].gov_first_name).toBe("1-2-3");
			expect(result.rows[2].gov_first_name).toBe("A-B-C");
		});

		it("should return all tutors ordered by government first name", async () => {
			const names = ["A-B-C", "1-2-3", "Do-Re-Mi"];
			for (let i = 1; i <= 3; i++) await db.tutor.insert.insert(createMockTutor({ gov_first_name: names[i - 1], email: `tutor${i}@test.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			const result = await db.tutor.get.getAll();
			expect(Array.isArray(result.rows)).toBe(true);
			expect(result.rows.length).toEqual(3);
			expect(result.rows[0].gov_first_name).toBe("1-2-3");
			expect(result.rows[1].gov_first_name).toBe("A-B-C");
			expect(result.rows[2].gov_first_name).toBe("Do-Re-Mi");
		});

		it("should return all tutors ordered by number of accepting students and government first name", async () => {
			const names = ["A-B-C", "1-2-3", "Do-Re-Mi"];
			for (let i = 1; i <= 3; i++) await db.tutor.insert.insert(createMockTutor({ gov_first_name: names[i - 1], email: `tutor${i}@test.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: i % 2 }));
			const result = await db.tutor.get.getAll();
			expect(Array.isArray(result.rows)).toBe(true);
			expect(result.rows.length).toEqual(3);
			expect(result.rows[0].gov_first_name).toBe("A-B-C");
			expect(result.rows[1].gov_first_name).toBe("Do-Re-Mi");
			expect(result.rows[2].gov_first_name).toBe("1-2-3");
		});
	});

	describe("Update Operations", () => {
		it("should update tutor preferred name successfully", async () => {
			const mockData = createMockTutor();
			const inserted = await db.tutor.insert.insert(mockData);
			const id = inserted.rows[0].tutor_id;
			expect(inserted.rows[0].pref_name).toBe("Janie");

			const updatedData = { ...mockData, pref_name: "Jane" };
			const updated = await db.tutor.update.update(id, updatedData);

			expect(updated.rows[0].pref_name).toBe("Jane");
			expect(updated.rows[0].gov_first_name).toBe("Jane Catherine");
			expect(updated.rows[0].gov_last_name).toBe("Ngila");
		});

		it("should error update on duplicate email", async () => {
			for (let i = 1; i <= 2; i++) await db.tutor.insert.insert(createMockTutor({ email: `jane${i}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			await expect(db.tutor.update.update(1, createMockTutor({ email: `jane2@example.ca`, phone: `(111) 456-7890` }))).rejects.toThrow(/duplicate key value violates unique constraint.*email/);
		});

		it("should error update on duplicate phone", async () => {
			for (let i = 1; i <= 2; i++) await db.tutor.insert.insert(createMockTutor({ email: `jane${i}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			await expect(db.tutor.update.update(1, createMockTutor({ email: `jane1@example.ca`, phone: `(222) 456-7890` }))).rejects.toThrow(/duplicate key value violates unique constraint.*phone/);
		});

		it("should update tutor and their subjects", async () => {
			const inserted = (await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects())).rows[0];
			expect(inserted.gov_first_name).toEqual("Jane Catherine");
			const tutor1 = (await db.tutor.get.get(inserted.tutor_id)).rows[0];
			expect(tutor1.gov_first_name).toEqual("Jane Catherine");
			expect(parseFloat(tutor1.current_rate)).toEqual(37.5);
			const subjects1 = await db.tutor_subjects.get.getSubjectsByTutor(inserted.tutor_id);
			expect(subjects1.rows.map((row: { subject: string }) => row.subject).sort()).toEqual(Object.values(subjectPlaceholder).flat().sort());

			const updated = (await db.tutor.update.updateWithSubjects(createMockTutorWithSubjects({ pref_name: "Jane", subjects: newSubjects }))).rows[0];
			expect(updated.gov_first_name).toEqual("Jane Catherine");
			expect(updated.pref_name).toEqual("Jane");
			const tutor2 = (await db.tutor.get.get(inserted.tutor_id)).rows[0];
			expect(tutor2.gov_first_name).toEqual("Jane Catherine");
			expect(tutor2.pref_name).toEqual("Jane");
			const subjects2 = await db.tutor_subjects.get.getSubjectsByTutor(inserted.tutor_id);
			expect(subjects2.rows.map((row: { subject: string }) => row.subject).sort()).toEqual(Object.values(newSubjects).flat().sort());
		});

		it("should error update tutor with subject on non-existent tutor name", async () => {
			const inserted = (await db.tutor.insert.insertWithSubjects(createMockTutorWithSubjects())).rows[0];
			expect(inserted.gov_first_name).toEqual("Jane Catherine");
			await expect(db.tutor.update.updateWithSubjects(createMockTutorWithSubjects({ gov_first_name: "Jane", subjects: newSubjects }))).rejects.toThrow("Tutor not found");
		});
	});

	describe("Delete Operations", () => {
		it("should remove a tutor by ID", async () => {
			const inserted = await db.tutor.insert.insert(createMockTutor());
			const id = inserted.rows[0].tutor_id;

			await db.tutor.remove.byId(id);
			const result = await db.tutor.get.get(id);
			expect(result.rows.length).toEqual(0);
		});

		it("should remove a tutor by name", async () => {
			const inserted = await db.tutor.insert.insert(createMockTutor());
			const id = inserted.rows[0].tutor_id;

			await db.tutor.remove.byName("Jane Catherine", "Ngila");
			const result = await db.tutor.get.get(id);
			expect(result.rows.length).toEqual(0);
		});

		it("should throw an error when trying to remove a non-existent tutor by ID", async () => {
			const result = await db.tutor.remove.byId(1);
			expect(result.rowCount).toEqual(0);
		});
	});
});
