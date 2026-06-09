/** @format */

import { DBTypes } from "@/lib/db/types";
import { tutorPlaceholder } from "@/lib/validation/tutorForm/tutorFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;

describe("Tutor Subjects Repository Integration Tests", () => {
	beforeAll(async () => {
		({ db } = await import("@/lib/db"));
	});

	beforeEach(async () => {
		await db.pool.query("TRUNCATE TABLE tutors, tutor_subjects RESTART IDENTITY CASCADE");
		await db.tutor.insert.insert(createMockTutor());
	});

	const createMockTutor = (overrides = {}): DBTypes.Tutors => ({
		...tutorPlaceholder,
		subjects: "Math, Science",
		in_person: "Hybrid",
		current_degree: "Bachelor's Degree",
		ap_ib_credentials: "AP Scholar with Distinction",

		prior_experience: 11,
		current_rate: 37.5,
		accepting_students: 2,
		year_of_study: 5,

		...overrides,
	});

	const createMockTutorSubject = (overrides = {}): DBTypes.TutorSubjects => ({
		tutor_id: 1,
		subject: "Math 10 (AP)",
		...overrides,
	});

	const allSubjects = [
		"Math 10 (AP)",
		"Math 20 (AP)",
		"Math 30 (AP)",
		"Math 31 (AP)",
		"Math 35 (AP)",
		"Stats 35 (AP)",
		"Science 10",
		"Science 20",
		"Science 30",
		"Physics 20 (AP)",
		"Physics 30 (AP)",
		"Physics C (AP)",
		"Chemistry 20 (AP)",
		"Chemistry 30 (AP)",
		"Biology 20 (AP)",
		"Biology 30 (AP)",
		"Comp Sci 10",
		"Comp Sci 20 (AP)",
		"Comp Sci 30 (AP)",
		"Social 10 (AP)",
		"Social 20 (AP)",
		"Social 30 (AP)",
		"English 10 (AP)",
		"English 20 (AP)",
		"English 30 (AP)",
		"French 10-30",
		"Spanish 10-30",
		"German 10-30",
	];

	describe("Insert & Find", () => {
		it("should insert a new tutor_subject pair", async () => {
			const ts = (await db.tutor_subjects.insert(createMockTutorSubject())).rows[0];
			expect(ts.tutor_id).toEqual(1);
			expect(ts.subject).toEqual("Math 10 (AP)");
		});

		it("should error insert on invalid tutor_id", async () => {
			await expect(db.tutor_subjects.insert({ tutor_id: 2, subject: "Math 10 (AP)" })).rejects.toThrow(/violates foreign key constraint.*tutor_id_fkey/);
		});

		it("should error insert on duplicate pair", async () => {
			await db.tutor_subjects.insert(createMockTutorSubject());
			const ts = await db.tutor_subjects.insert(createMockTutorSubject());
			expect(ts.rows.length).toEqual(0);
		});

		it("should insert and find a new tutor_subject pair", async () => {
			await db.tutor_subjects.insert(createMockTutorSubject());
			const ts = (await db.tutor_subjects.find(createMockTutorSubject())).rows[0];
			expect(ts.tutor_id).toEqual(1);
			expect(ts.subject).toEqual("Math 10 (AP)");
		});

		it("should error find on non-existent pair", async () => {
			const result = await db.tutor_subjects.find(createMockTutorSubject());
			expect(result.rows.length).toEqual(0);
		});
	});

	describe("Get Operations", () => {
		it("should get all tutor_subject pairs ordered by ascending tutor ID and subject", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.insert({ tutor_id: i + 1, subject: allSubjects[i] });

			const result = await db.tutor_subjects.get.getAll();
			expect(result.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) {
				expect(result.rows[i].tutor_id).toEqual(i + 1);
				expect(result.rows[i].subject).toEqual(allSubjects[i]);
			}
		});

		it("should get all unique subjects ordered by ascending subject name (3 subjects)", async () => {
			for (let i = 0; i < 3; i++) await db.tutor_subjects.insert({ tutor_id: 1, subject: allSubjects[i] });

			const result = await db.tutor_subjects.get.getAllSubjects();
			expect(result.rows.length).toEqual(3);
			const sorted = allSubjects.slice(0, 3).sort();
			for (let i = 0; i < 3; i++) expect(result.rows[i].subject).toEqual(sorted[i]);
		});

		it("should get all unique subjects ordered by ascending subject name (all subjects)", async () => {
			const n = allSubjects.length;
			for (let i = 0; i < n; i++) await db.tutor_subjects.insert({ tutor_id: 1, subject: allSubjects[i] });

			const result = await db.tutor_subjects.get.getAllSubjects();
			expect(result.rows.length).toEqual(n);
			const sorted = allSubjects.sort();
			for (let i = 0; i < n; i++) expect(result.rows[i].subject).toEqual(sorted[i]);
		});

		it("should get all unique subjects ordered by ascending subject name (no subjects)", async () => {
			const result = await db.tutor_subjects.get.getAllSubjects();
			expect(result.rows.length).toEqual(0);
		});

		it("should get all unique subjects ordered by ascending subject name (multiple tutors, 3 subjects each)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 1; i < 4; i++) for (let j = 0; j < 3; j++) await db.tutor_subjects.insert({ tutor_id: i, subject: allSubjects[j] });

			const result = await db.tutor_subjects.get.getAllSubjects();
			expect(result.rows.length).toEqual(3);
			const sorted = allSubjects.slice(0, 3).sort();
			for (let i = 0; i < 3; i++) expect(result.rows[i].subject).toEqual(sorted[i]);
		});

		it("should get all unique subjects ordered by ascending subject name (multiple tutors, all subjects each)", async () => {
			const n = allSubjects.length;
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 1; i < 4; i++) for (let j = 0; j < n; j++) await db.tutor_subjects.insert({ tutor_id: i, subject: allSubjects[j] });

			const result = await db.tutor_subjects.get.getAllSubjects();
			expect(result.rows.length).toEqual(n);
			const sorted = allSubjects.sort();
			for (let i = 0; i < n; i++) expect(result.rows[i].subject).toEqual(sorted[i]);
		});

		it("should get all tutor_subject pairs ordered by ascending tutor ID and subject (multiple subjects per tutor)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 1; i < 4; i++) for (let j = 0; j < 3; j++) await db.tutor_subjects.insert({ tutor_id: i, subject: allSubjects[j] });

			const result = await db.tutor_subjects.get.getAll();
			expect(result.rows.length).toEqual(9);
			for (let i = 0; i < 9; i++) {
				expect(result.rows[i].tutor_id).toEqual(Math.floor(i / 3 + 1));
				expect(result.rows[i].subject).toEqual(allSubjects[i % 3]);
			}
		});

		it("should get all subjects for a given tutor ID", async () => {
			for (let i = 0; i < 3; i++) await db.tutor_subjects.insert({ tutor_id: 1, subject: allSubjects[i] });
			const result = await db.tutor_subjects.get.getSubjectsByTutor(1);
			expect(result.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) expect(result.rows[i].subject).toEqual(allSubjects[i]);
		});

		it("should error while getting all subjects for a non-existent tutor ID", async () => {
			const result = await db.tutor_subjects.get.getSubjectsByTutor(2);
			expect(result.rows.length).toEqual(0);
		});

		it("should get all tutors for a given subject", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 1; i < 4; i++) await db.tutor_subjects.insert({ tutor_id: i, subject: allSubjects[0] });
			const result = await db.tutor_subjects.get.getTutorsBySubject(allSubjects[0]);
			expect(result.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) expect(result.rows[i].tutor_id).toEqual(i + 1);
		});

		it("should error while getting all tutors for a non-existent subject", async () => {
			const result = await db.tutor_subjects.get.getTutorsBySubject(allSubjects[0]);
			expect(result.rows.length).toEqual(0);
		});

		it("should get all accepting tutors for a given subject", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: i - 1 }));
			for (let i = 1; i < 4; i++) await db.tutor_subjects.insert({ tutor_id: i, subject: allSubjects[0] });
			const result = await db.tutor_subjects.get.getAcceptingTutorsBySubject(allSubjects[0]);
			expect(result.rows.length).toEqual(2);
			expect(result.rows[0].tutor_id).toEqual(1);
			expect(result.rows[1].tutor_id).toEqual(3);
			expect(result.rows[0].in_person).toEqual("Hybrid");
			expect(result.rows[1].in_person).toEqual("Hybrid");
		});

		it("should get the display name for all accepting tutors for a given subject", async () => {
			for (let i = 1; i < 4; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: (i + 1) % 3, pref_name: "J".repeat(i - 1) }));
			for (let i = 1; i < 5; i++) await db.tutor_subjects.insert({ tutor_id: i, subject: allSubjects[0] });
			const result = await db.tutor_subjects.get.getAcceptingTutorsBySubject(allSubjects[0]);
			expect(result.rows.length).toEqual(3);
			expect(result.rows[0].tutor_id).toEqual(1);
			expect(result.rows[1].tutor_id).toEqual(2);
			expect(result.rows[2].tutor_id).toEqual(4);
			expect(result.rows[0].display_name).toEqual("Janie");
			expect(result.rows[1].display_name).toEqual("Jane Catherine");
			expect(result.rows[2].display_name).toEqual("JJ");
		});

		it("should error while getting all accepting tutors for a non-existent subject", async () => {
			const result = await db.tutor_subjects.get.getAcceptingTutorsBySubject(allSubjects[0]);
			expect(result.rows.length).toEqual(0);
		});

		it("should get all tutors who teach at least one subject in a given set of subjects (all valid)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 1; i < 4; i++) await db.tutor_subjects.addSubjects(i, allSubjects.slice(0, 3));

			const result1 = await db.tutor_subjects.get.getTutorsByOneOfSubjects(allSubjects.slice(0, 3));
			expect(result1.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) expect(result1.rows[i].tutor_id).toEqual(i + 1);

			const result2 = await db.tutor_subjects.get.getTutorsByOneOfSubjects(allSubjects.slice(2, 5));
			expect(result2.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) expect(result2.rows[i].tutor_id).toEqual(i + 1);
		});

		it("should get all tutors who teach at least one subject in a given set of subjects (some valid)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result1 = await db.tutor_subjects.get.getTutorsByOneOfSubjects(allSubjects.slice(0, 3));
			expect(result1.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) expect(result1.rows[i].tutor_id).toEqual(i + 1);

			const result2 = await db.tutor_subjects.get.getTutorsByOneOfSubjects(allSubjects.slice(3, 6));
			expect(result2.rows.length).toEqual(2);
			for (let i = 0; i < 2; i++) expect(result2.rows[i].tutor_id).toEqual(i + 2);
		});

		it("should get all tutors who teach at least one subject in a given set of subjects (none valid)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result = await db.tutor_subjects.get.getTutorsByOneOfSubjects(allSubjects.slice(6, 9));
			expect(result.rows.length).toEqual(0);
		});

		it("should get error when getting all tutors who teach at least one subject in a null set of subjects", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result = await db.tutor_subjects.get.getTutorsByOneOfSubjects([]);
			expect(result.rows.length).toEqual(0);
		});

		it("should get all accepting tutors who teach at least one subject in a given set of subjects (all valid)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: i - 1 }));
			for (let i = 1; i < 4; i++) await db.tutor_subjects.addSubjects(i, allSubjects.slice(0, 3));

			const result1 = await db.tutor_subjects.get.getAcceptingTutorsByOneOfSubjects(allSubjects.slice(0, 3));
			expect(result1.rows.length).toEqual(2);
			expect(result1.rows[0].tutor_id).toEqual(1);
			expect(result1.rows[1].tutor_id).toEqual(3);

			const result2 = await db.tutor_subjects.get.getAcceptingTutorsByOneOfSubjects(allSubjects.slice(2, 5));
			expect(result2.rows.length).toEqual(2);
			expect(result2.rows[0].tutor_id).toEqual(1);
			expect(result2.rows[1].tutor_id).toEqual(3);
		});

		it("should get the display names of all accepting tutors who teach at least one subject in a given set of subjects (some valid)", async () => {
			for (let i = 1; i < 4; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: (i + 1) % 3, pref_name: "J".repeat(i - 1) }));
			for (let i = 0; i < 4; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result1 = await db.tutor_subjects.get.getAcceptingTutorsByOneOfSubjects(allSubjects.slice(0, 3));
			expect(result1.rows.length).toEqual(2);
			expect(result1.rows[0].tutor_id).toEqual(1);
			expect(result1.rows[1].tutor_id).toEqual(2);
			expect(result1.rows[0].display_name).toEqual("Janie");
			expect(result1.rows[1].display_name).toEqual("Jane Catherine");

			const result2 = await db.tutor_subjects.get.getAcceptingTutorsByOneOfSubjects(allSubjects.slice(3, 6));
			expect(result2.rows.length).toEqual(2);
			expect(result2.rows[0].tutor_id).toEqual(2);
			expect(result2.rows[1].tutor_id).toEqual(4);
			expect(result2.rows[0].display_name).toEqual("Jane Catherine");
			expect(result2.rows[1].display_name).toEqual("JJ");
		});

		it("should get all accepting tutors who teach at least one subject in a given set of subjects (some valid)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: i - 1 }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result1 = await db.tutor_subjects.get.getAcceptingTutorsByOneOfSubjects(allSubjects.slice(0, 3));
			expect(result1.rows.length).toEqual(2);
			expect(result1.rows[0].tutor_id).toEqual(1);
			expect(result1.rows[1].tutor_id).toEqual(3);

			const result2 = await db.tutor_subjects.get.getAcceptingTutorsByOneOfSubjects(allSubjects.slice(3, 6));
			expect(result2.rows.length).toEqual(1);
			expect(result2.rows[0].tutor_id).toEqual(3);
		});

		it("should get all accepting tutors who teach at least one subject in a given set of subjects (none valid)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: i - 1 }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result = await db.tutor_subjects.get.getAcceptingTutorsByOneOfSubjects(allSubjects.slice(6, 9));
			expect(result.rows.length).toEqual(0);
		});

		it("should get error when getting all accepting tutors who teach at least one subject in a null set of subjects", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: i - 1 }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result = await db.tutor_subjects.get.getAcceptingTutorsByOneOfSubjects([]);
			expect(result.rows.length).toEqual(0);
		});

		it("should get all tutors who teach all subjects in a given set of subjects (all valid)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 1; i < 4; i++) await db.tutor_subjects.addSubjects(i, allSubjects.slice(0, 3));

			const result1 = await db.tutor_subjects.get.getTutorsByAllOfSubjects(allSubjects.slice(0, 3));
			expect(result1.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) expect(result1.rows[i].tutor_id).toEqual(i + 1);

			const result2 = await db.tutor_subjects.get.getTutorsByAllOfSubjects(allSubjects.slice(2, 5));
			expect(result2.rows.length).toEqual(0);
		});

		it("should get all tutors who teach all subjects in a given set of subjects (some valid)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result1 = await db.tutor_subjects.get.getTutorsByAllOfSubjects(allSubjects.slice(0, 3));
			expect(result1.rows.length).toEqual(1);
			expect(result1.rows[0].tutor_id).toEqual(1);

			const result2 = await db.tutor_subjects.get.getTutorsByAllOfSubjects(allSubjects.slice(3, 6));
			expect(result2.rows.length).toEqual(0);
		});

		it("should get all tutors who teach all subjects in a given set of subjects (none valid)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result = await db.tutor_subjects.get.getTutorsByAllOfSubjects(allSubjects.slice(6, 9));
			expect(result.rows.length).toEqual(0);
		});

		it("should get error when getting all tutors who teach all subjects in a null set of subjects", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result = await db.tutor_subjects.get.getTutorsByAllOfSubjects([]);
			expect(result.rows.length).toEqual(0);
		});

		it("should get all accepting tutors who teach all subjects in a given set of subjects (all valid)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: i - 1 }));
			for (let i = 1; i < 4; i++) await db.tutor_subjects.addSubjects(i, allSubjects.slice(0, 3));

			const result1 = await db.tutor_subjects.get.getAcceptingTutorsByAllOfSubjects(allSubjects.slice(0, 3));
			expect(result1.rows.length).toEqual(2);
			expect(result1.rows[0].tutor_id).toEqual(1);
			expect(result1.rows[1].tutor_id).toEqual(3);

			const result2 = await db.tutor_subjects.get.getAcceptingTutorsByAllOfSubjects(allSubjects.slice(2, 5));
			expect(result2.rows.length).toEqual(0);
		});

		it("should get all accepting tutors who teach all subjects in a given set of subjects (some valid)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: i - 1 }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result1 = await db.tutor_subjects.get.getAcceptingTutorsByAllOfSubjects(allSubjects.slice(0, 3));
			expect(result1.rows.length).toEqual(1);
			expect(result1.rows[0].tutor_id).toEqual(1);

			const result2 = await db.tutor_subjects.get.getAcceptingTutorsByAllOfSubjects(allSubjects.slice(3, 6));
			expect(result2.rows.length).toEqual(0);
		});

		it("should get the display names of all accepting tutors who teach all subjects in a given set of subjects (some valid)", async () => {
			for (let i = 1; i < 4; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: (i + 1) % 3, pref_name: "J".repeat(i - 1) }));
			for (let i = 0; i < 4; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 4));

			const result1 = await db.tutor_subjects.get.getAcceptingTutorsByAllOfSubjects(allSubjects.slice(1, 4));
			expect(result1.rows.length).toEqual(2);
			expect(result1.rows[0].tutor_id).toEqual(1);
			expect(result1.rows[1].tutor_id).toEqual(2);
			expect(result1.rows[0].display_name).toEqual("Janie");
			expect(result1.rows[1].display_name).toEqual("Jane Catherine");

			const result2 = await db.tutor_subjects.get.getAcceptingTutorsByAllOfSubjects(allSubjects.slice(3, 6));
			expect(result2.rows.length).toEqual(1);
			expect(result2.rows[0].tutor_id).toEqual(4);
			expect(result2.rows[0].display_name).toEqual("JJ");
		});

		it("should get all accepting tutors who teach all subjects in a given set of subjects (none valid)", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: i - 1 }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result = await db.tutor_subjects.get.getAcceptingTutorsByAllOfSubjects(allSubjects.slice(6, 9));
			expect(result.rows.length).toEqual(0);
		});

		it("should get error when getting all accepting tutors who teach all subjects in a null set of subjects", async () => {
			for (let i = 1; i < 3; i++) await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: i - 1 }));
			for (let i = 0; i < 3; i++) await db.tutor_subjects.addSubjects(i + 1, allSubjects.slice(i, i + 3));

			const result = await db.tutor_subjects.get.getAcceptingTutorsByAllOfSubjects([]);
			expect(result.rows.length).toEqual(0);
		});
	});

	describe("Update Operations", () => {
		it("should add subjects to tutor", async () => {
			const ts1 = await db.tutor_subjects.addSubjects(1, allSubjects.slice(0, 3));
			expect(ts1.rows.length).toEqual(3);
			const subjects1 = ts1.rows.map((row: { subject: string }) => row.subject);
			expect(subjects1).toEqual(allSubjects.slice(0, 3));

			const ts2 = await db.tutor_subjects.addSubjects(1, allSubjects.slice(3, 6));
			expect(ts2.rows.length).toEqual(3);
			const subjects2 = ts2.rows.map((row: { subject: string }) => row.subject);
			expect(subjects2).toEqual(allSubjects.slice(3, 6));

			const ts3 = await db.tutor_subjects.get.getSubjectsByTutor(1);
			expect(ts3.rows.length).toEqual(6);
			const subjects3 = ts3.rows.map((row: { subject: string }) => row.subject);
			expect(subjects3).toEqual(allSubjects.slice(0, 6));
		});

		it("should update subjects", async () => {
			for (let i = 0; i < 3; i++) await db.tutor_subjects.insert({ tutor_id: 1, subject: allSubjects[i] });
			const ts1 = await db.tutor_subjects.get.getSubjectsByTutor(1);
			expect(ts1.rows.length).toEqual(3);
			const subjects1 = ts1.rows.map((row: { subject: string }) => row.subject);
			expect(subjects1).toEqual(allSubjects.slice(0, 3));
			await db.tutor_subjects.update(1, allSubjects.slice(3, 6));
			const ts2 = await db.tutor_subjects.get.getSubjectsByTutor(1);
			expect(ts2.rows.length).toEqual(3);
			const subjects2 = ts2.rows.map((row: { subject: string }) => row.subject);
			expect(subjects2).toEqual(allSubjects.slice(3, 6));
		});

		it("should not update if tutor ID does not exist", async () => {
			await expect(db.tutor_subjects.update(2, allSubjects.splice(0, 3))).rejects.toThrow(/violates foreign key constraint.*tutor_id_fkey/);
		});

		it("should not add if tutor ID does not exist", async () => {
			await expect(db.tutor_subjects.addSubjects(2, allSubjects.splice(0, 3))).rejects.toThrow(/violates foreign key constraint.*tutor_id_fkey/);
		});

		it("should not add on duplicate pair (3/3 duplicates)", async () => {
			await db.tutor_subjects.addSubjects(1, allSubjects.slice(0, 3));
			const result = await db.tutor_subjects.addSubjects(1, allSubjects.slice(0, 3));
			expect(result.rows.length).toEqual(0);
		});

		it("should not add on duplicate pair (2/3 duplicates)", async () => {
			await db.tutor_subjects.addSubjects(1, allSubjects.slice(0, 3));
			const result = await db.tutor_subjects.addSubjects(1, allSubjects.slice(1, 4));
			expect(result.rows.length).toEqual(1);
		});

		it("should not add on duplicate pair (1/3 duplicates)", async () => {
			await db.tutor_subjects.addSubjects(1, allSubjects.slice(0, 3));
			const result = await db.tutor_subjects.addSubjects(1, allSubjects.slice(2, 5));
			expect(result.rows.length).toEqual(2);
		});
	});

	describe("Delete Operations", () => {
		it("should remove all tutor_subject pairs by tutor ID", async () => {
			await db.tutor_subjects.addSubjects(1, allSubjects.slice(0, 3));
			const result1 = await db.tutor_subjects.get.getSubjectsByTutor(1);
			expect(result1.rows.length).toEqual(3);
			const removed = await db.tutor_subjects.removeByTutor(1);
			expect(removed.rows.length).toEqual(3);
			const result2 = await db.tutor_subjects.get.getSubjectsByTutor(1);
			expect(result2.rows.length).toEqual(0);
		});

		it("should error when trying to remove tutor_subject pairs from a non-existent tutor ID", async () => {
			const result = await db.tutor_subjects.removeByTutor(2);
			expect(result.rowCount).toEqual(0);
		});
	});
});
