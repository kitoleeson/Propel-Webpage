/** @format */

import { PendingTutorType } from "@/lib/db/pending_student_tutor";
import { TutorType } from "@/lib/db/tutor";
import { subjectPlaceholder, tutorPlaceholder } from "@/lib/validation/tutorForm/tutorFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;

describe("Pending Tutor Repository Integration Tests", () => {
	beforeAll(async () => {
		({ db } = await import("@/lib/db"));
	});

	beforeEach(async () => {
		await db.pool.query("TRUNCATE TABLE pending_tutors, tutors RESTART IDENTITY CASCADE");
	});

	const createMockTutor = (overrides = {}): TutorType => ({
		...tutorPlaceholder,
		subjects: "Math, Science",
		in_person: "Hybrid",
		current_degree: "Bachelor's Degree",
		ap_ib_credentials: "AP Scholar with Distinction",
		...overrides,
	});

	const insertMockTutor = async (overrides = {}): Promise<PendingTutorType> => {
		const mockData = createMockTutor(overrides);
		const result = await db.tutor.insert.insert(mockData);
		return { ...result.rows[0] };
	};

	describe("Insert & Find Operations", () => {
		it("should insert a tutor update", async () => {
			const tutor = await insertMockTutor();
			const result = await db.pending_tutor.insert(tutor.tutor_id, tutor);
			expect(result.rows[0]).toBeDefined();
			expect(result.rows[0].gov_first_name).toBe("Jane Catherine");
		});

		it("should insert a tutor update and retrieve their tutor ID by pending tutor ID", async () => {
			const tutor = await insertMockTutor();
			const pending_tutor_id = (await db.pending_tutor.insert(tutor.tutor_id, tutor)).rows[0].pending_tutor_id;
			const result = await db.pending_tutor.get(pending_tutor_id);
			expect(result.rows[0]).toBeDefined();
			expect(result.rows[0].tutor_id).toEqual(1);
		});

		it("should insert a new tutor and retrieve their tutor ID by pending tutor ID", async () => {
			const tutor = await insertMockTutor();
			const pending_tutor_id = (await db.pending_tutor.insert(-1, tutor)).rows[0].pending_tutor_id;
			const result = await db.pending_tutor.get(pending_tutor_id);
			expect(result.rows[0]).toBeDefined();
			expect(result.rows[0].tutor_id).toEqual(-1);
		});

		it("should insert duplicate pending tutor entries for consecutive updates", async () => {
			const tutor = await insertMockTutor();
			const pending_tutor1 = await db.pending_tutor.insert(tutor.tutor_id, tutor);
			const pending_tutor2 = await db.pending_tutor.insert(tutor.tutor_id, { ...tutor, pref_name: "Jane" });
			expect(pending_tutor1.rows[0]).toBeDefined();
			expect(pending_tutor1.rows[0].tutor_id).toEqual(1);
			expect(pending_tutor1.rows[0].pref_name).toEqual("Janie");
			expect(pending_tutor2.rows[0]).toBeDefined();
			expect(pending_tutor2.rows[0].tutor_id).toEqual(1);
			expect(pending_tutor2.rows[0].pref_name).toEqual("Jane");
		});

		it("should insert duplicate pending tutor entries for consecutive new tutors", async () => {
			const tutor = createMockTutor();
			const pending_tutor1 = await db.pending_tutor.insert(-1, { ...tutor, subjects: subjectPlaceholder });
			const pending_tutor2 = await db.pending_tutor.insert(-1, { ...tutor, subjects: subjectPlaceholder });
			expect(pending_tutor1.rows[0]).toBeDefined();
			expect(pending_tutor1.rows[0].tutor_id).toEqual(-1);
			expect(pending_tutor2.rows[0]).toBeDefined();
			expect(pending_tutor2.rows[0].tutor_id).toEqual(-1);
		});
	});

	describe("Get Operations", () => {
		it("should fetch a specific tutor by ID", async () => {
			const tutor = await insertMockTutor();
			const inserted = await db.pending_tutor.insert(tutor.tutor_id, tutor);
			const result = await db.pending_tutor.get(inserted.rows[0].tutor_id);
			expect(result.rows[0].gov_first_name).toBe("Jane Catherine");
			expect(result.rows[0].email).toBe("jane@example.ca");
		});

		it("should error when getting non-existent pending tutor ID", async () => {
			const result = await db.pending_tutor.get(1);
			expect(result.rows.length).toEqual(0);
		});

		it("should error when getting all non-existent tutor IDs", async () => {
			const result = await db.pending_tutor.getAll();
			expect(result.rows.length).toEqual(0);
		});

		it("should return all pending tutors ordered by pending tutor IDs", async () => {
			const names = ["A-B-C", "1-2-3", "Do-Re-Mi"];
			for (let i = 1; i <= 3; i++) {
				const tutor = await insertMockTutor({ gov_first_name: names[i - 1], email: `tutor${i}@test.ca`, phone: `(${i}${i}${i}) 456-7890`, accepting_students: i });
				await db.pending_tutor.insert(tutor.tutor_id, tutor);
			}
			const result = await db.pending_tutor.getAll();
			expect(Array.isArray(result.rows)).toBe(true);
			expect(result.rows.length).toEqual(3);
			expect(result.rows[0].gov_first_name).toBe("A-B-C");
			expect(result.rows[1].gov_first_name).toBe("1-2-3");
			expect(result.rows[2].gov_first_name).toBe("Do-Re-Mi");
		});
	});

	describe("Delete Operations", () => {
		it("should remove a tutor by ID", async () => {
			const tutor = await insertMockTutor();
			const inserted = await db.pending_tutor.insert(tutor.tutor_id, tutor);

			await db.pending_tutor.remove(inserted.rows[0].pending_tutor_id);
			const result = await db.pending_tutor.get(inserted.rows[0].pending_tutor_id);
			expect(result.rows.length).toEqual(0);
		});

		it("should throw an error when trying to remove a non-existent tutor by ID", async () => {
			const result = await db.pending_tutor.remove(1);
			expect(result.rowCount).toEqual(0);
		});
	});
});
