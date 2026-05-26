/** @format */

import { GuardianFormValues, StudentFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;

describe("Student Guardian Repository Integration Tests", () => {
	beforeAll(async () => {
		({ db } = await import("@/lib/db"));
	});

	beforeEach(async () => {
		await db.pool.query("TRUNCATE TABLE student_guardian, guardians, students RESTART IDENTITY CASCADE");
	});

	const createMockGuardian = (overrides = {}): GuardianFormValues => ({
		gov_first_name: "Rosanna",
		gov_last_name: "Toto",
		pref_name: "Rose",
		email: "rosanna@africa.ca",
		phone: "(123) 456-7890",
		pref_communication: "Email",
		relationship: "Mother",
		is_primary_biller: true,
		...overrides,
	});

	const createMockStudent = (overrides = {}): StudentFormValues => ({
		gov_first_name: "Rocket",
		gov_last_name: "Man",
		pref_name: "RM",
		email: "rocket.man@mars.ca",
		phone: "(123) 456-7890",
		pref_communication: "Text Message",
		grade: 12,
		city: "Edmonton",
		how_found_us: "Word of Mouth",
		biller: "Guardian",
		...overrides,
	});

	const createMockPair = async (studentOverrides = {}, guardianOverrides = {}) => {
		const student = await db.student.insert(createMockStudent(studentOverrides));
		const guardian = await db.guardian.insert(createMockGuardian(guardianOverrides));
		const student_guardian = await db.student_guardian.insert({
			student_id: student.rows[0].student_id,
			guardian_id: guardian.rows[0].guardian_id,
			relationship_type: "Parent",
			is_primary_biller: true,
		});
		return { student: student.rows[0], guardian: guardian.rows[0], student_guardian: student_guardian.rows[0] };
	};

	const mockPairAttributes = {
		relationship_type: "Parent",
		is_primary_biller: true,
	};

	describe("Insert & Find", () => {
		it("should insert a new student_guardian pair", async () => {
			const { student, guardian, student_guardian } = await createMockPair();
			expect(student_guardian).toBeDefined();
			expect(student_guardian.student_id).toEqual(student.student_id);
			expect(student_guardian.guardian_id).toEqual(guardian.guardian_id);
		});

		it("should error insert on invalid student_id", async () => {
			const guardian = await db.guardian.insert(createMockGuardian());
			await expect(db.student_guardian.insert({ student_id: 999, guardian_id: guardian.rows[0].guardian_id, ...mockPairAttributes })).rejects.toThrow(/violates foreign key constraint.*student_guardian_student_id_fkey/);
		});

		it("should error insert on invalid guardian_id", async () => {
			const student = await db.student.insert(createMockStudent());
			await expect(db.student_guardian.insert({ student_id: student.rows[0].student_id, guardian_id: 999, ...mockPairAttributes })).rejects.toThrow(/violates foreign key constraint.*student_guardian_guardian_id_fkey/);
		});

		it("should error insert on invalid relationship type", async () => {
			const student = await db.student.insert(createMockStudent());
			const guardian = await db.guardian.insert(createMockGuardian());
			await expect(db.student_guardian.insert({ student_id: student.rows[0].student_id, guardian_id: guardian.rows[0].guardian_id, relationship_type: "little sister", is_primary_biller: true })).rejects.toThrow(
				/violates check constraint.*student_guardian_relationship_type_check/,
			);
		});

		it("should error insert on duplicate pair", async () => {
			const { student, guardian } = await createMockPair();
			await expect(db.student_guardian.insert({ student_id: student.student_id, guardian_id: guardian.guardian_id, ...mockPairAttributes })).rejects.toThrow(/duplicate key value violates unique constraint.*student_guardian_pkey/);
		});

		it("should error insert on multiple primary billers", async () => {
			const { student } = await createMockPair();
			const guardian2 = await db.guardian.insert(createMockGuardian({ email: "new@example.ca", phone: "(222) 456-7890" }));
			await expect(db.student_guardian.insert({ student_id: student.student_id, guardian_id: guardian2.rows[0].guardian_id, ...mockPairAttributes })).rejects.toThrow(
				/duplicate key value violates unique constraint.*primary_biller/,
			);
		});
	});

	describe("Get Operations", () => {
		it("should get a student_guardian pair by student and guardian IDs", async () => {
			const { student, guardian } = await createMockPair();
			const result = await db.student_guardian.get.get(student.student_id, guardian.guardian_id);
			expect(result.rows.length).toEqual(1);
			expect(result.rows[0].student_id).toEqual(student.student_id);
			expect(result.rows[0].guardian_id).toEqual(guardian.guardian_id);
			expect(result.rows[0].relationship_type).toEqual("Parent");
			expect(result.rows[0].is_primary_biller).toEqual(true);
		});

		it("should get all student_guardian pairs ordered by ascending student and guardian ID", async () => {
			const pairs = [];
			for (let i = 0; i < 3; i++)
				pairs.push(
					await createMockPair(
						{ gov_first_name: `Student${i + 1}`, email: `student${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` },
						{ gov_first_name: `Guardian${i + 1}`, email: `guardian${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` },
					),
				);

			const result = await db.student_guardian.get.getAll();
			expect(result.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) {
				expect(result.rows[i].student_id).toEqual(pairs[i].student.student_id);
				expect(result.rows[i].guardian_id).toEqual(pairs[i].guardian.guardian_id);
			}
		});

		it("should get all student_guardian pairs ordered by ascending student and guardian ID (multiple guardians per student)", async () => {
			const pairs = [];
			for (let i = 0; i < 3; i++) {
				pairs.push(
					await createMockPair(
						{ gov_first_name: `Student${i + 1}`, email: `student${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` },
						{ gov_first_name: `Guardian${i + 1}`, email: `guardian${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` },
					),
				);
			}
			const guardian = await db.guardian.insert(createMockGuardian({ gov_first_name: `Guardian4`, email: "guardian4@example.ca", phone: "(444) 456-7890" }));
			for (let i = 0; i < 3; i++) {
				const result = await db.student_guardian.insert({ student_id: pairs[i].student.student_id, guardian_id: guardian.rows[0].guardian_id, relationship_type: "Parent", is_primary_biller: false });
				pairs.push({
					student: pairs[i].student,
					guardian: guardian.rows[0],
					student_guardian: result.rows[0],
				});
			}

			const result = await db.student_guardian.get.getAll();
			expect(result.rows.length).toEqual(6);
			for (let i = 0; i < 3; i++) {
				expect(result.rows[i * 2].student_id).toEqual(pairs[i].student.student_id);
				expect(result.rows[i * 2].guardian_id).toEqual(pairs[i].guardian.guardian_id);
				expect(result.rows[i * 2 + 1].student_id).toEqual(pairs[i].student.student_id);
				expect(result.rows[i * 2 + 1].guardian_id).toEqual(guardian.rows[0].guardian_id);
			}
		});

		it("should get all students for a given guardian ID", async () => {
			const students = [];
			for (let i = 0; i < 3; i++) students.push(await db.student.insert(createMockStudent({ email: `student${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` })));
			const guardian = await db.guardian.insert(createMockGuardian());
			for (let i = 0; i < 3; i++) await db.student_guardian.insert({ student_id: students[i].rows[0].student_id, guardian_id: guardian.rows[0].guardian_id, ...mockPairAttributes });
			const result = await db.student_guardian.get.getStudents(guardian.rows[0].guardian_id);
			expect(result.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) expect(result.rows[i].student_id).toEqual(students[i].rows[0].student_id);
		});

		it("should get all guardians for a given student ID", async () => {
			const guardians = [];
			for (let i = 0; i < 3; i++) guardians.push(await db.guardian.insert(createMockGuardian({ email: `guardian${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` })));
			const student = await db.student.insert(createMockStudent({ email: "student1@example.ca", phone: "(111) 456-7890" }));
			for (let i = 0; i < 3; i++) await db.student_guardian.insert({ student_id: student.rows[0].student_id, guardian_id: guardians[i].rows[0].guardian_id, relationship_type: "Parent", is_primary_biller: false });
			const result = await db.student_guardian.get.getGuardians(student.rows[0].student_id);
			expect(result.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) expect(result.rows[i].guardian_id).toEqual(guardians[i].rows[0].guardian_id);
		});
	});

	describe("Update Operations", () => {
		it("should update relationship type", async () => {
			const { student, guardian } = await createMockPair();
			const result = await db.student_guardian.update({ student_id: student.student_id, guardian_id: guardian.guardian_id, relationship_type: "Mother", is_primary_biller: true });
			expect(result.rows.length).toEqual(1);
			expect(result.rows[0].relationship_type).toEqual("Mother");
		});

		it("should update primary biller status", async () => {
			const { student, guardian } = await createMockPair();
			const result = await db.student_guardian.update({ student_id: student.student_id, guardian_id: guardian.guardian_id, relationship_type: "Parent", is_primary_biller: false });
			expect(result.rows.length).toEqual(1);
			expect(result.rows[0].is_primary_biller).toEqual(false);
		});

		it("should error update on multiple primary billers", async () => {
			const { student, student_guardian } = await createMockPair();
			const guardian2 = await db.guardian.insert(createMockGuardian({ email: "guardian2@example.ca", phone: "(222) 456-7890" }));
			expect(student_guardian.is_primary_biller).toEqual(true);
			await db.student_guardian.insert({ student_id: student.student_id, guardian_id: guardian2.rows[0].guardian_id, relationship_type: "Parent", is_primary_biller: false });
			await expect(db.student_guardian.update({ student_id: student.student_id, guardian_id: guardian2.rows[0].guardian_id, ...mockPairAttributes })).rejects.toThrow();
		});

		it("should not update if student_guardian pair does not exist", async () => {
			const result = await db.student_guardian.update({ student_id: 1, guardian_id: 1, relationship_type: "Mother", is_primary_biller: true });
			expect(result.rows.length).toEqual(0);
		});

		it("should set new primary biller while unsetting all other guardians (2 guardians)", async () => {
			const { student, guardian } = await createMockPair();
			const guardian2 = await db.guardian.insert(createMockGuardian({ email: "guardian2@example.ca", phone: "(222) 456-7890" }));

			await db.student_guardian.insert({ student_id: student.student_id, guardian_id: guardian2.rows[0].guardian_id, relationship_type: "Parent", is_primary_biller: false });
			let result1 = await db.student_guardian.get.get(student.student_id, guardian.guardian_id);
			let result2 = await db.student_guardian.get.get(student.student_id, guardian2.rows[0].guardian_id);
			expect(result1.rows[0].is_primary_biller).toEqual(true);
			expect(result2.rows[0].is_primary_biller).toEqual(false);

			await db.student_guardian.setPrimaryBiller.guardian(student.student_id, guardian2.rows[0].guardian_id);
			result1 = await db.student_guardian.get.get(student.student_id, guardian.guardian_id);
			result2 = await db.student_guardian.get.get(student.student_id, guardian2.rows[0].guardian_id);
			expect(result1.rows[0].is_primary_biller).toEqual(false);
			expect(result2.rows[0].is_primary_biller).toEqual(true);
		});

		it("should set new primary biller while unsetting all other guardians (3 guardians)", async () => {
			const { student, guardian } = await createMockPair();
			const guardian2 = await db.guardian.insert(createMockGuardian({ email: "guardian2@example.ca", phone: "(222) 456-7890" }));
			const guardian3 = await db.guardian.insert(createMockGuardian({ email: "guardian3@example.ca", phone: "(333) 456-7890" }));

			await db.student_guardian.insert({ student_id: student.student_id, guardian_id: guardian2.rows[0].guardian_id, relationship_type: "Parent", is_primary_biller: false });
			await db.student_guardian.insert({ student_id: student.student_id, guardian_id: guardian3.rows[0].guardian_id, relationship_type: "Parent", is_primary_biller: false });

			let result1 = await db.student_guardian.get.get(student.student_id, guardian.guardian_id);
			let result2 = await db.student_guardian.get.get(student.student_id, guardian2.rows[0].guardian_id);
			let result3 = await db.student_guardian.get.get(student.student_id, guardian3.rows[0].guardian_id);
			expect(result1.rows[0].is_primary_biller).toEqual(true);
			expect(result2.rows[0].is_primary_biller).toEqual(false);
			expect(result3.rows[0].is_primary_biller).toEqual(false);

			await db.student_guardian.setPrimaryBiller.guardian(student.student_id, guardian2.rows[0].guardian_id);
			result1 = await db.student_guardian.get.get(student.student_id, guardian.guardian_id);
			result2 = await db.student_guardian.get.get(student.student_id, guardian2.rows[0].guardian_id);
			result3 = await db.student_guardian.get.get(student.student_id, guardian3.rows[0].guardian_id);
			expect(result1.rows[0].is_primary_biller).toEqual(false);
			expect(result2.rows[0].is_primary_biller).toEqual(true);
			expect(result3.rows[0].is_primary_biller).toEqual(false);

			await db.student_guardian.setPrimaryBiller.guardian(student.student_id, guardian3.rows[0].guardian_id);
			result1 = await db.student_guardian.get.get(student.student_id, guardian.guardian_id);
			result2 = await db.student_guardian.get.get(student.student_id, guardian2.rows[0].guardian_id);
			result3 = await db.student_guardian.get.get(student.student_id, guardian3.rows[0].guardian_id);
			expect(result1.rows[0].is_primary_biller).toEqual(false);
			expect(result2.rows[0].is_primary_biller).toEqual(false);
			expect(result3.rows[0].is_primary_biller).toEqual(true);

			await db.student_guardian.setPrimaryBiller.guardian(student.student_id, guardian2.rows[0].guardian_id);
			result1 = await db.student_guardian.get.get(student.student_id, guardian.guardian_id);
			result2 = await db.student_guardian.get.get(student.student_id, guardian2.rows[0].guardian_id);
			result3 = await db.student_guardian.get.get(student.student_id, guardian3.rows[0].guardian_id);
			expect(result1.rows[0].is_primary_biller).toEqual(false);
			expect(result2.rows[0].is_primary_biller).toEqual(true);
			expect(result3.rows[0].is_primary_biller).toEqual(false);
		});
	});

	describe("Delete Operations", () => {
		it("should remove a student_guardian pair by student and guardian IDs", async () => {
			const { student, guardian } = await createMockPair();
			const result = await db.student_guardian.remove.remove(student.student_id, guardian.guardian_id);
			expect(result.rowCount).toEqual(1);

			const getResult = await db.student_guardian.get.get(student.student_id, guardian.guardian_id);
			expect(getResult.rows.length).toEqual(0);
		});

		it("should error when trying to remove a non-existent student_guardian pair", async () => {
			const result = await db.student_guardian.remove.remove(1, 1);
			expect(result.rowCount).toEqual(0);
		});

		it("should remove all student_guardian pairs for a given student ID", async () => {
			const { student, guardian } = await createMockPair();
			const guardian2 = await db.guardian.insert(createMockGuardian({ email: "guardian2@example.ca", phone: "(222) 456-7890" }));
			await db.student_guardian.insert({ student_id: student.student_id, guardian_id: guardian2.rows[0].guardian_id, relationship_type: "Parent", is_primary_biller: false });

			const result = await db.student_guardian.remove.byStudentId(student.student_id);
			expect(result.rowCount).toEqual(2);
			expect((await db.student_guardian.get.get(student.student_id, guardian.guardian_id)).rows.length).toEqual(0);
			expect((await db.student_guardian.get.get(student.student_id, guardian2.rows[0].guardian_id)).rows.length).toEqual(0);
		});

		it("should error when trying to remove all student_guardian pairs for a non-existent student ID", async () => {
			const result = await db.student_guardian.remove.byStudentId(1);
			expect(result.rowCount).toEqual(0);
		});

		it("should remove all student_guardian pairs for a given guardian ID", async () => {
			const { student, guardian } = await createMockPair();
			const student2 = await db.student.insert(createMockStudent({ email: "student2@example.ca", phone: "(222) 456-7890" }));
			await db.student_guardian.insert({ student_id: student2.rows[0].student_id, guardian_id: guardian.guardian_id, ...mockPairAttributes });

			const result = await db.student_guardian.remove.byGuardianId(guardian.guardian_id);
			expect(result.rowCount).toEqual(2);
			expect((await db.student_guardian.get.get(student.student_id, guardian.guardian_id)).rows.length).toEqual(0);
			expect((await db.student_guardian.get.get(student2.rows[0].student_id, guardian.guardian_id)).rows.length).toEqual(0);
		});

		it("should error when trying to remove all student_guardian pairs for a non-existent guardian ID", async () => {
			const result = await db.student_guardian.remove.byGuardianId(1);
			expect(result.rowCount).toEqual(0);
		});

		it("should remove all student_guardian pairs for a given student name", async () => {
			const { student, guardian } = await createMockPair();
			const guardian2 = await db.guardian.insert(createMockGuardian({ email: "guardian2@example.ca", phone: "(222) 456-7890" }));
			await db.student_guardian.insert({ student_id: student.student_id, guardian_id: guardian2.rows[0].guardian_id, relationship_type: "Parent", is_primary_biller: false });

			const result = await db.student_guardian.remove.byStudentName(student.gov_first_name, student.gov_last_name);
			expect(result.rowCount).toEqual(2);
			expect((await db.student_guardian.get.get(student.student_id, guardian.guardian_id)).rows.length).toEqual(0);
			expect((await db.student_guardian.get.get(student.student_id, guardian2.rows[0].guardian_id)).rows.length).toEqual(0);
		});

		it("should error when trying to remove all student_guardian pairs for a non-existent student name", async () => {
			const result = await db.student_guardian.remove.byStudentName("Non", "Existent");
			expect(result.rowCount).toEqual(0);
		});

		it("should remove all student_guardian pairs for a given guardian name", async () => {
			const { student, guardian } = await createMockPair();
			const student2 = await db.student.insert(createMockStudent({ email: "student2@example.ca", phone: "(222) 456-7890" }));
			await db.student_guardian.insert({ student_id: student2.rows[0].student_id, guardian_id: guardian.guardian_id, ...mockPairAttributes });

			const result = await db.student_guardian.remove.byGuardianName(guardian.gov_first_name, guardian.gov_last_name);
			expect(result.rowCount).toEqual(2);
			expect((await db.student_guardian.get.get(student.student_id, guardian.guardian_id)).rows.length).toEqual(0);
			expect((await db.student_guardian.get.get(student2.rows[0].student_id, guardian.guardian_id)).rows.length).toEqual(0);
		});

		it("should error when trying to remove all student_guardian pairs for a non-existent guardian name", async () => {
			const result = await db.student_guardian.remove.byGuardianName("Non", "Existent");
			expect(result.rowCount).toEqual(0);
		});
	});
});
