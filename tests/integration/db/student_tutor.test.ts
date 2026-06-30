/** @format */

import { DBTypes } from "@/lib/db/dbtypes";
import { tutorPlaceholder } from "@/lib/validation/tutorForm/tutorFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;

describe("Student Tutor Repository Integration Tests", () => {
	beforeAll(async () => {
		({ db } = await import("@/lib/db"));
	});

	beforeEach(async () => {
		await db.pool.query("TRUNCATE TABLE student_tutor, tutors, students RESTART IDENTITY CASCADE");
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
		const student_tutor = (
			await db.student_tutor.insert({
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
		return { student: student, tutor: tutor, student_tutor: student_tutor };
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

		it("should insert a new student_tutor pair", async () => {
			const { student, tutor, student_tutor } = await createMockPair();
			expect(student_tutor).toBeDefined();
			expect(student_tutor.student_id).toEqual(student.student_id);
			expect(student_tutor.tutor_id).toEqual(tutor.tutor_id);
		});

		it("should error insert on invalid student_id", async () => {
			const tutor = await db.tutor.insert.insert(createMockTutor());
			await expect(db.student_tutor.insert({ student_id: 1, tutor_id: tutor[0].tutor_id, ...mockPairAttributes })).rejects.toThrow(/violates foreign key constraint.*student_id_fkey/);
		});

		it("should error insert on invalid tutor_id", async () => {
			const student = await db.student.insert(createMockStudent());
			await expect(db.student_tutor.insert({ student_id: student[0].student_id, tutor_id: 1, ...mockPairAttributes })).rejects.toThrow(/violates foreign key constraint.*tutor_id_fkey/);
		});

		it("should error insert on duplicate pair", async () => {
			const { student, tutor } = await createMockPair();
			await expect(db.student_tutor.insert({ student_id: student.student_id, tutor_id: tutor.tutor_id, ...mockPairAttributes })).rejects.toThrow(/duplicate key value violates unique constraint.*student_id_tutor_id_key/);
		});
	});

	describe("Get Operations", () => {
		it("should get a student_tutor pair by student and tutor IDs", async () => {
			const { student, tutor, student_tutor } = await createMockPair();
			const result = await db.student_tutor.get.get(student.student_id, tutor.tutor_id);
			expect(result.length).toEqual(1);
			expect(result[0]).toEqual(student_tutor);
		});

		it("should error when getting a student_tutor pair with non-existant student ID", async () => {
			const { tutor } = await createMockPair();
			const result = await db.student_tutor.get.get(2, tutor.tutor_id);
			expect(result.length).toEqual(0);
		});

		it("should error when getting a student_tutor pair with non-existant tutor ID", async () => {
			const { student } = await createMockPair();
			const result = await db.student_tutor.get.get(student.student_id, 2);
			expect(result.length).toEqual(0);
		});

		it("should get all student_tutor pairs ordered by ascending student and tutor ID", async () => {
			const pairs = [];
			for (let i = 0; i < 3; i++)
				pairs.push(
					await createMockPair(
						{ gov_first_name: `Student${i + 1}`, email: `student${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` },
						{ gov_first_name: `Tutor${i + 1}`, email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` },
					),
				);

			const result = await db.student_tutor.get.getAll();
			expect(result.length).toEqual(3);
			for (let i = 0; i < 3; i++) {
				expect(result[i].student_id).toEqual(pairs[i].student.student_id);
				expect(result[i].tutor_id).toEqual(pairs[i].tutor.tutor_id);
			}
		});

		it("should get all student_tutor pairs ordered by ascending student and tutor ID (multiple tutors per student)", async () => {
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
				const result = await db.student_tutor.insert({ student_id: pairs[i].student.student_id, tutor_id: tutor[0].tutor_id, ...mockPairAttributes });
				pairs.push({
					student: pairs[i].student,
					tutor: tutor[0],
					student_tutor: result[0],
				});
			}

			const result = await db.student_tutor.get.getAll();
			expect(result.length).toEqual(6);
			for (let i = 0; i < 3; i++) {
				expect(result[i * 2].student_id).toEqual(pairs[i].student.student_id);
				expect(result[i * 2].tutor_id).toEqual(pairs[i].tutor.tutor_id);
				expect(result[i * 2 + 1].student_id).toEqual(pairs[i].student.student_id);
				expect(result[i * 2 + 1].tutor_id).toEqual(tutor[0].tutor_id);
			}
		});

		it("should get all students for a given tutor ID", async () => {
			const students = [];
			for (let i = 0; i < 3; i++) students.push(await db.student.insert(createMockStudent({ email: `student${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` })));
			const tutor = await db.tutor.insert.insert(createMockTutor());
			for (let i = 0; i < 3; i++) await db.student_tutor.insert({ student_id: students[i][0].student_id, tutor_id: tutor[0].tutor_id, ...mockPairAttributes });
			const result = await db.student_tutor.get.getStudents(tutor[0].tutor_id);
			expect(result.length).toEqual(3);
			for (let i = 0; i < 3; i++) expect(result[i].student_id).toEqual(students[i][0].student_id);
		});

		it("should get all tutors for a given student ID", async () => {
			const tutors = [];
			for (let i = 0; i < 3; i++) tutors.push(await db.tutor.insert.insert(createMockTutor({ email: `tutor${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` })));
			const student = await db.student.insert(createMockStudent({ email: "student1@example.ca", phone: "(111) 456-7890" }));
			for (let i = 0; i < 3; i++) await db.student_tutor.insert({ student_id: student[0].student_id, tutor_id: tutors[i][0].tutor_id, ...mockPairAttributes });
			const result = await db.student_tutor.get.getTutors(student[0].student_id);
			expect(result.length).toEqual(3);
			for (let i = 0; i < 3; i++) expect(result[i].tutor_id).toEqual(tutors[i][0].tutor_id);
		});
	});

	describe("Update Operations", () => {
		it("should update subjects", async () => {
			const { student, tutor } = await createMockPair();
			const result = await db.student_tutor.update({ student_id: student.student_id, tutor_id: tutor.tutor_id, ...mockPairAttributes, subjects: "Math" });
			expect(result.length).toEqual(1);
			expect(result[0].subjects).toEqual("Math");
		});

		it("should update markup", async () => {
			const { student, tutor } = await createMockPair();
			const result = await db.student_tutor.update({ student_id: student.student_id, tutor_id: tutor.tutor_id, ...mockPairAttributes, markup: 10 });
			expect(result.length).toEqual(1);
			expect(result[0].markup).toEqual(10);
		});

		it("should not update if student_tutor pair does not exist", async () => {
			const result = await db.student_tutor.update({ student_id: 1, tutor_id: 1, ...mockPairAttributes });
			expect(result.length).toEqual(0);
		});

		it("should not update if student ID does not exist", async () => {
			const { tutor } = await createMockPair();
			const result = await db.student_tutor.update({ student_id: 2, tutor_id: tutor.tutor_id, ...mockPairAttributes });
			expect(result.length).toEqual(0);
		});

		it("should not update if tutor ID does not exist", async () => {
			const { student } = await createMockPair();
			const result = await db.student_tutor.update({ student_id: student.student_id, tutor_id: 2, ...mockPairAttributes });
			expect(result.length).toEqual(0);
		});

		it("should set had_session to true", async () => {
			const { student, tutor } = await createMockPair();
			let result = await db.student_tutor.get.get(student.student_id, tutor.tutor_id);
			expect(result[0].had_session).toEqual(false);
			await db.student_tutor.setHadSession(student.student_id, tutor.tutor_id);
			result = await db.student_tutor.get.get(student.student_id, tutor.tutor_id);
			expect(result[0].had_session).toEqual(true);
		});

		it("should set had_session to true", async () => {
			const { student, tutor } = await createMockPair();
			let result = await db.student_tutor.get.get(student.student_id, tutor.tutor_id);
			expect(result[0].had_session).toEqual(false);
			await db.student_tutor.setHadSession(student.student_id, tutor.tutor_id);
			result = await db.student_tutor.get.get(student.student_id, tutor.tutor_id);
			expect(result[0].had_session).toEqual(true);
			await db.student_tutor.setHadSession(student.student_id, tutor.tutor_id, false);
			result = await db.student_tutor.get.get(student.student_id, tutor.tutor_id);
			expect(result[0].had_session).toEqual(false);
		});
	});

	describe("Delete Operations", () => {
		it("should remove a student_tutor pair by student and tutor IDs", async () => {
			const { student, tutor } = await createMockPair();
			const result = await db.student_tutor.remove.remove(student.student_id, tutor.tutor_id);
			expect((result as any).meta.rowCount).toEqual(1);

			const getResult = await db.student_tutor.get.get(student.student_id, tutor.tutor_id);
			expect(getResult.length).toEqual(0);
		});

		it("should error when trying to remove a non-existent student_tutor pair", async () => {
			const result = await db.student_tutor.remove.remove(1, 1);
			expect((result as any).meta.rowCount).toEqual(0);
		});

		it("should remove all student_tutor pairs for a given student ID", async () => {
			const { student, tutor } = await createMockPair();
			const tutor2 = await db.tutor.insert.insert(createMockTutor({ email: "tutor2@example.ca", phone: "(222) 456-7890" }));
			await db.student_tutor.insert({ student_id: student.student_id, tutor_id: tutor2[0].tutor_id, ...mockPairAttributes });

			const result = await db.student_tutor.remove.byStudentId(student.student_id);
			expect((result as any).meta.rowCount).toEqual(2);
			expect((await db.student_tutor.get.get(student.student_id, tutor.tutor_id)).length).toEqual(0);
			expect((await db.student_tutor.get.get(student.student_id, tutor2[0].tutor_id)).length).toEqual(0);
		});

		it("should error when trying to remove all student_tutor pairs for a non-existent student ID", async () => {
			const result = await db.student_tutor.remove.byStudentId(1);
			expect((result as any).meta.rowCount).toEqual(0);
		});

		it("should remove all student_tutor pairs for a given tutor ID", async () => {
			const { student, tutor } = await createMockPair();
			const student2 = await db.student.insert(createMockStudent({ email: "student2@example.ca", phone: "(222) 456-7890" }));
			await db.student_tutor.insert({ student_id: student2[0].student_id, tutor_id: tutor.tutor_id, ...mockPairAttributes });

			const result = await db.student_tutor.remove.byTutorId(tutor.tutor_id);
			expect((result as any).meta.rowCount).toEqual(2);
			expect((await db.student_tutor.get.get(student.student_id, tutor.tutor_id)).length).toEqual(0);
			expect((await db.student_tutor.get.get(student2[0].student_id, tutor.tutor_id)).length).toEqual(0);
		});

		it("should error when trying to remove all student_tutor pairs for a non-existent tutor ID", async () => {
			const result = await db.student_tutor.remove.byTutorId(1);
			expect((result as any).meta.rowCount).toEqual(0);
		});

		it("should remove all student_tutor pairs for a given student name", async () => {
			const { student, tutor } = await createMockPair();
			const tutor2 = await db.tutor.insert.insert(createMockTutor({ email: "tutor2@example.ca", phone: "(222) 456-7890" }));
			await db.student_tutor.insert({ student_id: student.student_id, tutor_id: tutor2[0].tutor_id, ...mockPairAttributes });

			const result = await db.student_tutor.remove.byStudentName(student.gov_first_name, student.gov_last_name);
			expect((result as any).meta.rowCount).toEqual(2);
			expect((await db.student_tutor.get.get(student.student_id, tutor.tutor_id)).length).toEqual(0);
			expect((await db.student_tutor.get.get(student.student_id, tutor2[0].tutor_id)).length).toEqual(0);
		});

		it("should error when trying to remove all student_tutor pairs for a non-existent student name", async () => {
			const result = await db.student_tutor.remove.byStudentName("Non", "Existent");
			expect((result as any).meta.rowCount).toEqual(0);
		});

		it("should remove all student_tutor pairs for a given tutor name", async () => {
			const { student, tutor } = await createMockPair();
			const student2 = await db.student.insert(createMockStudent({ email: "student2@example.ca", phone: "(222) 456-7890" }));
			await db.student_tutor.insert({ student_id: student2[0].student_id, tutor_id: tutor.tutor_id, ...mockPairAttributes });

			const result = await db.student_tutor.remove.byTutorName(tutor.gov_first_name, tutor.gov_last_name);
			expect((result as any).meta.rowCount).toEqual(2);
			expect((await db.student_tutor.get.get(student.student_id, tutor.tutor_id)).length).toEqual(0);
			expect((await db.student_tutor.get.get(student2[0].student_id, tutor.tutor_id)).length).toEqual(0);
		});

		it("should error when trying to remove all student_tutor pairs for a non-existent tutor name", async () => {
			const result = await db.student_tutor.remove.byTutorName("Non", "Existent");
			expect((result as any).meta.rowCount).toEqual(0);
		});
	});
});
