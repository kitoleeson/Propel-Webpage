/** @format */

import { StudentFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;

describe("Student Repository Integration Tests", () => {
	beforeAll(async () => {
		({ db } = await import("@/lib/db"));
	});

	beforeEach(async () => {
		await db.pool.query("TRUNCATE TABLE students RESTART IDENTITY CASCADE");
	});

	const createMockStudent = (overrides = {}): StudentFormValues => ({
		gov_first_name: "Test",
		gov_last_name: "Student",
		pref_name: "Tessa",
		email: "test.student@example.ca",
		phone: "(123) 456-7890",
		pref_communication: "Text Message",
		grade: 12,
		city: "Edmonton",
		how_found_us: "Word of Mouth",
		biller: "Guardian",
		...overrides,
	});

	describe("Insert & Find", () => {
		it("should insert a new student", async () => {
			const mockData = createMockStudent();
			const result = await db.student.insert(mockData);
			expect(result.rows[0]).toBeDefined();
		});

		it("should insert a new student and retrieve their ID by name", async () => {
			const mockData = createMockStudent({ gov_first_name: "Alice" });
			const result = await db.student.insert(mockData);
			expect(result.rows[0]).toBeDefined();

			const studentId = await db.student.find("Alice", "Student");
			expect(typeof studentId).toBe("number");
			expect(studentId).toEqual(1);
		});

		it("should error on duplicate email", async () => {
			await db.student.insert(createMockStudent({ gov_first_name: "Student1", email: "test@example.ca", phone: "(123) 456-7890" }));
			try {
				await db.student.insert(createMockStudent({ gov_first_name: "Student2", email: "test@example.ca", phone: "(098) 765-4321" }));
				throw new Error("Database should have thrown a unique email constraint error");
			} catch (error: any) {
				expect(error.code).toBe("23505");
				expect(error.message).toContain("duplicate key value violates unique constraint");
				expect(error.message).toContain("email");
			}
		});

		// ADD ONCE UNIQUE PHONE CONSTRAINT IS ADDED TO DB
		// it("should error on duplicate phone", async () => {
		// 	await db.student.insert(createMockStudent({ gov_first_name: "Student1", email: "test1@example.ca", phone: "(123) 456-7890" }));
		// 	try {
		// 		await db.student.insert(createMockStudent({ gov_first_name: "Student2", email: "test2@example.ca", phone: "(123) 456-7890" }));
		// 		throw new Error("Database should have thrown a unique phone constraint error");
		// 	} catch (error: any) {
		// 		expect(error.code).toBe("23505");
		// 		expect(error.message).toContain("duplicate key value violates unique constraint");
		// 		expect(error.message).toContain("phone");
		// 	}
		// });
	});

	describe("Get Operations", () => {
		it("should fetch a specific student by ID", async () => {
			const mockData = createMockStudent({ gov_first_name: "Bob", email: "bob@test.com" });
			const inserted = await db.student.insert(mockData);
			const id = inserted.rows[0].student_id;

			const result = await db.student.get.get(id);
			expect(result.rows[0].gov_first_name).toBe("Bob");
			expect(result.rows[0].email).toBe("bob@test.com");
		});

		it("should return all students", async () => {
			for (let i = 1; i <= 3; i++) await db.student.insert(createMockStudent({ gov_first_name: `Student${i}`, email: `student${i}@test.com`, phone: `(${i}${i}${i}) 456-7890` }));
			const result = await db.student.get.getAll();
			expect(Array.isArray(result.rows)).toBe(true);
			expect(result.rows.length).toEqual(3);
			expect(result.rows[0].gov_first_name).toBe("Student1");
			expect(result.rows[1].gov_first_name).toBe("Student2");
			expect(result.rows[2].gov_first_name).toBe("Student3");
		});
	});

	describe("Update Operations", () => {
		it("should update student details successfully", async () => {
			const mockData = createMockStudent({ gov_first_name: "Charlie" });
			const inserted = await db.student.insert(mockData);
			const id = inserted.rows[0].student_id;
			expect(inserted.rows[0].pref_name).toBe("Tessa");

			const updatedData = { ...mockData, pref_name: "Chuck" };
			const updated = await db.student.update(id, updatedData);

			expect(updated.rows[0].pref_name).toBe("Chuck");
		});
	});

	describe("Delete Operations", () => {
		it("should remove a student by ID", async () => {
			const mockData = createMockStudent({ gov_first_name: "DeleteMe" });
			const inserted = await db.student.insert(mockData);
			const id = inserted.rows[0].student_id;

			await db.student.remove.byId(id);

			const check = await db.student.get.get(id);
			expect(check.rows.length).toEqual(0);
		});

		it("should remove a student by name", async () => {
			const mockData = createMockStudent({ gov_first_name: "Delete", gov_last_name: "Me" });
			const inserted = await db.student.insert(mockData);
			const id = inserted.rows[0].student_id;

			await db.student.remove.byName("Delete", "Me");

			const check = await db.student.get.get(id);
			expect(check.rows.length).toEqual(0);
		});
	});
});
