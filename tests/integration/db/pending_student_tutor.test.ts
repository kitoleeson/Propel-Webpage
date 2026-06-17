/** @format */

import { DBTypes } from "@/lib/db/dbtypes";
import { tutorPlaceholder } from "@/lib/validation/tutorForm/tutorFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;

describe("Pending Student Tutor Repository Integration Tests", () => {
	beforeAll(async () => {
		({ db } = await import("@/lib/db"));
	});

	beforeEach(async () => {
		await db.pool.query("TRUNCATE TABLE pending_student_tutor, tutors, students RESTART IDENTITY CASCADE");
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

	const createMockStudent = (overrides = {}): DBTypes.Students => ({
		gov_first_name: "Rocket",
		gov_last_name: "Man",
		pref_name: "RM",
		email: "rocket.man@mars.ca",
		phone: "(123) 456-7890",
		pref_communication: "Text Message",
		grade: 12,
		city: "Edmonton",
		how_found_us: "Word of Mouth",
		...overrides,
	});

	const createMockPair = async (studentOverrides = {}, tutorOverrides = {}) => {
		const student = (await db.student.insert(createMockStudent(studentOverrides)))[0];
		const tutor = (await db.tutor.insert.insert(createMockTutor(tutorOverrides)))[0];
		const pending_student_tutor = (
			await db.pending_student_tutor.insert({
				student_id: student.student_id,
				tutor_id: tutor.tutor_id,
				usual_duration: 1,
				hourly_rate: tutor.current_rate,
				subjects: tutor.subjects,
				markup: 0,
				travel_fee: 0,
				had_session: false,
			})
		)[0];
		return { student: student, tutor: tutor, pending_student_tutor: pending_student_tutor };
	};

	const mockPairAttributes = {
		usual_duration: 1,
		hourly_rate: 25,
		subjects: "Math, Science",
		markup: 0,
		travel_fee: 0,
		had_session: false,
	};

	describe("Insert & Find", () => {
		it("should insert a new tutor", async () => {
			const mockData = createMockTutor();
			const result = await db.tutor.insert.insert(mockData);
			expect(result[0]).toBeDefined();
			expect(result[0].gov_first_name).toBe("Jane Catherine");
		});

		it("should insert a new pending_student_tutor pair", async () => {
			const { student, tutor, pending_student_tutor } = await createMockPair();
			expect(pending_student_tutor).toBeDefined();
			expect(pending_student_tutor.student_id).toEqual(student.student_id);
			expect(pending_student_tutor.tutor_id).toEqual(tutor.tutor_id);
		});

		it("should error insert on invalid student_id", async () => {
			const tutor = await db.tutor.insert.insert(createMockTutor());
			await expect(db.pending_student_tutor.insert({ student_id: 1, tutor_id: tutor[0].tutor_id, ...mockPairAttributes })).rejects.toThrow(/violates foreign key constraint.*student_id_fkey/);
		});

		it("should error insert on invalid tutor_id", async () => {
			const student = await db.student.insert(createMockStudent());
			await expect(db.pending_student_tutor.insert({ student_id: student[0].student_id, tutor_id: 1, ...mockPairAttributes })).rejects.toThrow(/violates foreign key constraint.*tutor_id_fkey/);
		});

		it("should error insert on duplicate pair", async () => {
			const { student, tutor } = await createMockPair();
			await expect(db.pending_student_tutor.insert({ student_id: student.student_id, tutor_id: tutor.tutor_id, ...mockPairAttributes })).rejects.toThrow(/duplicate key value violates unique constraint.*student_id_tutor_id_key/);
		});
	});

	describe("Get Operations", () => {
		it("should get a pending_student_tutor pair by student and tutor IDs", async () => {
			const { student, tutor, pending_student_tutor } = await createMockPair();
			const result = await db.pending_student_tutor.get.getByStudentAndTutorIds(student.student_id, tutor.tutor_id);
			expect(result.length).toEqual(1);
			expect(result[0]).toEqual(pending_student_tutor);
		});

		it("should error when getting a pending_student_tutor pair by student and tutor IDs with non-existant student ID", async () => {
			const { tutor } = await createMockPair();
			const result = await db.pending_student_tutor.get.getByStudentAndTutorIds(2, tutor.tutor_id);
			expect(result.length).toEqual(0);
		});

		it("should error when getting a pending_student_tutor pair by student and tutor IDs with non-existant tutor ID", async () => {
			const { student } = await createMockPair();
			const result = await db.pending_student_tutor.get.getByStudentAndTutorIds(student.student_id, 2);
			expect(result.length).toEqual(0);
		});

		it("should get a pending_student_tutor pair by pending_student_tutor ID", async () => {
			const { pending_student_tutor } = await createMockPair();
			const result = await db.pending_student_tutor.get.get(pending_student_tutor.pending_student_tutor_id);
			expect(result.length).toEqual(1);
			expect(result[0]).toEqual(pending_student_tutor);
		});

		it("should error when getting a pending_student_tutor pair by pending_student_tutor ID with non-existant pending_student_tutor ID", async () => {
			const result = await db.pending_student_tutor.get.get(1);
			expect(result.length).toEqual(0);
		});

		it("should get a pending_student_tutor pair by student ID", async () => {
			const { student, pending_student_tutor } = await createMockPair();
			const result = await db.pending_student_tutor.get.getByStudentId(student.student_id);
			expect(result.length).toEqual(1);
			expect(result[0]).toEqual(pending_student_tutor);
		});

		it("should error when getting a pending_student_tutor pair by student ID with non-existant student ID", async () => {
			const result = await db.pending_student_tutor.get.getByStudentId(1);
			expect(result.length).toEqual(0);
		});

		it("should get all pending_student_tutor pairs ordered by ascending student and tutor ID", async () => {
			const pairs = [];
			for (let i = 0; i < 3; i++)
				pairs.push(
					await createMockPair(
						{ gov_first_name: `Student${i + 1}`, email: `student${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` },
						{ gov_first_name: `Tutor${i + 1}`, email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` },
					),
				);

			const result = await db.pending_student_tutor.get.getAll();
			expect(result.length).toEqual(3);
			for (let i = 0; i < 3; i++) {
				expect(result[i].student_id).toEqual(pairs[i].student.student_id);
				expect(result[i].tutor_id).toEqual(pairs[i].tutor.tutor_id);
			}
		});

		it("should get all pending_student_tutor pairs ordered by ascending student and tutor ID (multiple tutors per student)", async () => {
			const pairs = [];
			for (let i = 0; i < 3; i++) {
				pairs.push(
					await createMockPair(
						{ gov_first_name: `Student${i + 1}`, email: `student${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` },
						{ gov_first_name: `Tutor${i + 1}`, email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` },
					),
				);
			}
			const tutor = await db.tutor.insert.insert(createMockTutor({ gov_first_name: `Tutor4`, email: "tutor4@example.ca", phone: "(444) 456-7890" }));
			for (let i = 0; i < 3; i++) {
				const result = await db.pending_student_tutor.insert({ student_id: pairs[i].student.student_id, tutor_id: tutor[0].tutor_id, ...mockPairAttributes });
				pairs.push({
					student: pairs[i].student,
					tutor: tutor[0],
					pending_student_tutor: result[0],
				});
			}

			const result = await db.pending_student_tutor.get.getAll();
			expect(result.length).toEqual(6);
			for (let i = 0; i < 3; i++) {
				expect(result[i * 2].student_id).toEqual(pairs[i].student.student_id);
				expect(result[i * 2].tutor_id).toEqual(pairs[i].tutor.tutor_id);
				expect(result[i * 2 + 1].student_id).toEqual(pairs[i].student.student_id);
				expect(result[i * 2 + 1].tutor_id).toEqual(tutor[0].tutor_id);
			}
		});
	});

	describe("Delete Operations", () => {
		it("should remove a pending_student_tutor pair by student and tutor IDs", async () => {
			const { student, tutor } = await createMockPair();
			const result = await db.pending_student_tutor.remove.byStudentAndTutorIds(student.student_id, tutor.tutor_id);
			expect((result as any).meta.rowCount).toEqual(1);

			const getResult = await db.pending_student_tutor.get.getByStudentAndTutorIds(student.student_id, tutor.tutor_id);
			expect(getResult.length).toEqual(0);
		});

		it("should error when trying to remove a non-existent pending_student_tutor pair", async () => {
			const result = await db.pending_student_tutor.remove.byStudentAndTutorIds(1, 1);
			expect((result as any).meta.rowCount).toEqual(0);
		});

		it("should remove a pending_student_tutor pair by pending_student_tutor ID", async () => {
			const { pending_student_tutor } = await createMockPair();
			const result = await db.pending_student_tutor.remove.remove(pending_student_tutor.pending_student_tutor_id);
			expect((result as any).meta.rowCount).toEqual(1);

			const getResult = await db.pending_student_tutor.get.get(pending_student_tutor.pending_student_tutor_id);
			expect(getResult.length).toEqual(0);
		});

		it("should error when trying to remove a non-existent pending_student_tutor pair", async () => {
			const result = await db.pending_student_tutor.remove.remove(1);
			expect((result as any).meta.rowCount).toEqual(0);
		});

		it("should remove all pending_student_tutor pairs for a given student ID", async () => {
			const { student, tutor } = await createMockPair();
			const tutor2 = await db.tutor.insert.insert(createMockTutor({ email: "tutor2@example.ca", phone: "(222) 456-7890" }));
			await db.pending_student_tutor.insert({ student_id: student.student_id, tutor_id: tutor2[0].tutor_id, ...mockPairAttributes });

			const result = await db.pending_student_tutor.remove.byStudentId(student.student_id);
			expect((result as any).meta.rowCount).toEqual(2);
			expect((await db.pending_student_tutor.get.getByStudentAndTutorIds(student.student_id, tutor.tutor_id)).length).toEqual(0);
			expect((await db.pending_student_tutor.get.getByStudentAndTutorIds(student.student_id, tutor2[0].tutor_id)).length).toEqual(0);
		});

		it("should error when trying to remove all pending_student_tutor pairs for a non-existent student ID", async () => {
			const result = await db.pending_student_tutor.remove.byStudentId(1);
			expect((result as any).meta.rowCount).toEqual(0);
		});

		it("should remove all pending_student_tutor pairs for a given tutor ID", async () => {
			const { student, tutor } = await createMockPair();
			const student2 = await db.student.insert(createMockStudent({ email: "student2@example.ca", phone: "(222) 456-7890" }));
			await db.pending_student_tutor.insert({ student_id: student2[0].student_id, tutor_id: tutor.tutor_id, ...mockPairAttributes });

			const result = await db.pending_student_tutor.remove.byTutorId(tutor.tutor_id);
			expect((result as any).meta.rowCount).toEqual(2);
			expect((await db.pending_student_tutor.get.getByStudentAndTutorIds(student.student_id, tutor.tutor_id)).length).toEqual(0);
			expect((await db.pending_student_tutor.get.getByStudentAndTutorIds(student2[0].student_id, tutor.tutor_id)).length).toEqual(0);
		});

		it("should error when trying to remove all pending_student_tutor pairs for a non-existent tutor ID", async () => {
			const result = await db.pending_student_tutor.remove.byTutorId(1);
			expect((result as any).meta.rowCount).toEqual(0);
		});
	});
});
