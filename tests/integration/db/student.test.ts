/** @format */

import { DBTypes } from "@/lib/db/types";
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

	describe("Insert & Find Operations", () => {
		it("should insert a new student", async () => {
			const mockData = createMockStudent();
			const result = await db.student.insert(mockData);
			expect(result[0]).toBeDefined();
			expect(result[0].gov_first_name).toBe("Rocket");
		});

		it("should insert a new student and retrieve their ID by name", async () => {
			const mockData = createMockStudent({ gov_first_name: "Bennie" });
			const result = await db.student.insert(mockData);
			expect(result[0]).toBeDefined();

			const studentId = await db.student.find("Bennie", "Man");
			expect(typeof studentId).toBe("number");
			expect(studentId).toEqual(1);
		});

		it("should insert a new student and retrieve their ID by case-insensitive name", async () => {
			const mockData = createMockStudent({ gov_first_name: "Bennie" });
			const result = await db.student.insert(mockData);
			expect(result[0]).toBeDefined();

			let studentId;
			studentId = await db.student.find("BENNIE", "MAN");
			expect(typeof studentId).toBe("number");
			expect(studentId).toEqual(1);

			studentId = await db.student.find("bennie", "man");
			expect(typeof studentId).toBe("number");
			expect(studentId).toEqual(1);

			studentId = await db.student.find("bEnnIE", "mAN");
			expect(typeof studentId).toBe("number");
			expect(studentId).toEqual(1);
		});

		it("should error insert on duplicate email", async () => {
			await db.student.insert(createMockStudent({ email: "rocket.man@mars.ca", phone: "(123) 456-7890" }));
			await expect(db.student.insert(createMockStudent({ email: "rocket.man@mars.ca", phone: "(098) 765-4321" }))).rejects.toThrow(/duplicate key value violates unique constraint.*email/);
		});

		it("should error insert on duplicate phone", async () => {
			await db.student.insert(createMockStudent({ email: "rocket.man1@mars.ca", phone: "(123) 456-7890" }));
			await expect(db.student.insert(createMockStudent({ email: "rocket.man2@mars.ca", phone: "(123) 456-7890" }))).rejects.toThrow(/duplicate key value violates unique constraint.*phone/);
		});
	});

	describe("Get Operations", () => {
		it("should fetch a specific student by ID", async () => {
			const mockData = createMockStudent({ gov_first_name: "Jet", email: "jet@magazine.ca" });
			const inserted = await db.student.insert(mockData);
			const id = inserted[0].student_id;

			const result = await db.student.get.get(id);
			expect(result[0].gov_first_name).toBe("Jet");
			expect(result[0].email).toBe("jet@magazine.ca");
		});

		it("should return all students", async () => {
			const names = ["A-B-C", "1-2-3", "Do-Re-Mi"];
			for (let i = 1; i <= 3; i++) await db.student.insert(createMockStudent({ gov_first_name: names[i - 1], email: `student${i}@test.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			const result = await db.student.get.getAll();
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toEqual(3);
			expect(result[0].gov_first_name).toBe("A-B-C");
			expect(result[1].gov_first_name).toBe("1-2-3");
			expect(result[2].gov_first_name).toBe("Do-Re-Mi");
		});
	});

	describe("Update Operations", () => {
		it("should update student details successfully", async () => {
			const mockData = createMockStudent({ gov_first_name: "Daniel" });
			const inserted = await db.student.insert(mockData);
			const id = inserted[0].student_id;
			expect(inserted[0].pref_name).toBe("RM");

			const updatedData = { ...mockData, pref_name: "Dan" };
			const updated = await db.student.update(id, updatedData);

			expect(updated[0].pref_name).toBe("Dan");
			expect(updated[0].gov_first_name).toBe("Daniel");
			expect(updated[0].gov_last_name).toBe("Man");
		});

		it("should error update on duplicate email", async () => {
			for (let i = 1; i <= 2; i++) await db.student.insert(createMockStudent({ email: `rocket.man${i}@mars.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			await expect(db.student.update(1, createMockStudent({ email: `rocket.man2@mars.ca`, phone: `(111) 456-7890` }))).rejects.toThrow(/duplicate key value violates unique constraint.*email/);
		});

		it("should error update on duplicate phone", async () => {
			for (let i = 1; i <= 2; i++) await db.student.insert(createMockStudent({ email: `rocket.man${i}@mars.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			await expect(db.student.update(1, createMockStudent({ email: `rocket.man1@mars.ca`, phone: `(222) 456-7890` }))).rejects.toThrow(/duplicate key value violates unique constraint.*phone/);
		});
	});

	describe("Delete Operations", () => {
		it("should remove a student by ID", async () => {
			const inserted = await db.student.insert(createMockStudent({ gov_first_name: "Nikita" }));
			const id = inserted[0].student_id;

			await db.student.remove.byId(id);
			const result = await db.student.get.get(id);
			expect(result.length).toEqual(0);
		});

		it("should remove a student by name", async () => {
			const inserted = await db.student.insert(createMockStudent({ gov_first_name: "Nikita", gov_last_name: "Levon" }));
			const id = inserted[0].student_id;

			await db.student.remove.byName("Nikita", "Levon");
			const result = await db.student.get.get(id);
			expect(result.length).toEqual(0);
		});

		it("should throw an error when trying to remove a non-existent student by ID", async () => {
			const result = await db.student.remove.byId(1);
			expect((result as any).meta.rowCount).toEqual(0);
		});
	});
});
