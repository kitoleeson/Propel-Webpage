/** @format */

import { DBTypes } from "@/lib/db/dbtypes";
import { tutorPlaceholder } from "@/lib/validation/tutorForm/tutorFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;

describe("Guardian Repository Integration Tests", () => {
	beforeAll(async () => {
		({ db } = await import("@/lib/db"));
	});

	beforeEach(async () => {
		await db.pool.query("TRUNCATE TABLE guardians RESTART IDENTITY CASCADE");
	});

	const createMockGuardian = (overrides = {}): DBTypes.Guardians => ({
		gov_first_name: "Rosanna",
		gov_last_name: "Toto",
		pref_name: "Rose",
		email: "rosanna@africa.ca",
		phone: "(123) 456-7890",
		pref_communication: "Email",
		...overrides,
	});

	describe("Insert & Find Operations", () => {
		it("should insert a new guardian", async () => {
			const mockData = createMockGuardian();
			const result = await db.guardian.insert(mockData);
			expect(result[0]).toBeDefined();
			expect(result[0].gov_first_name).toBe("Rosanna");
		});

		it("should insert a new guardian and retrieve their ID by name", async () => {
			const mockData = createMockGuardian({ gov_first_name: "Cecilia", gov_last_name: "Robinson" });
			const result = await db.guardian.insert(mockData);
			expect(result[0]).toBeDefined();

			const guardianId = await db.guardian.find("Cecilia", "Robinson");
			expect(typeof guardianId).toBe("number");
			expect(guardianId).toEqual(1);
		});

		it("should find a guardian ID by case-insensitive name", async () => {
			await db.guardian.insert(createMockGuardian({ gov_first_name: "Cecilia", gov_last_name: "Robinson" }));

			let guardianId;
			guardianId = await db.guardian.find("CECILIA", "ROBINSON");
			expect(typeof guardianId).toBe("number");
			expect(guardianId).toBe(1);

			guardianId = await db.guardian.find("cecilia", "robinson");
			expect(typeof guardianId).toBe("number");
			expect(guardianId).toBe(1);

			guardianId = await db.guardian.find("ceCILiA", "rOBinSoN");
			expect(typeof guardianId).toBe("number");
			expect(guardianId).toBe(1);
		});

		it("should error on duplicate email", async () => {
			await db.guardian.insert(createMockGuardian({ email: "mrs.robinson@graduate.ca" }));
			await expect(db.guardian.insert(createMockGuardian({ email: "mrs.robinson@graduate.ca" }))).rejects.toThrow(/duplicate key value violates unique constraint.*email/);
		});
	});

	describe("Get Operations", () => {
		it("should fetch a specific guardian by ID", async () => {
			const inserted = await db.guardian.insert(createMockGuardian({ gov_first_name: "Julio" }));
			const id = inserted[0].guardian_id;

			const result = await db.guardian.get.get(id);
			expect(result[0].gov_first_name).toBe("Julio");
		});

		it("should fetch a specific guardian by email", async () => {
			const guardian = (await db.guardian.insert(createMockGuardian({ gov_first_name: "Bobby", email: "bobby@toto.ca" })))[0];
			const studentData: DBTypes.Students = {
				gov_first_name: "Rocket",
				gov_last_name: "Man",
				pref_name: "RM",
				email: "rocket.man@mars.ca",
				phone: "(123) 456-7890",
				pref_communication: "Text Message",
				grade: 12,
				city: "Edmonton",
				how_found_us: "Word of Mouth",
			};
			const student = (await db.student.insert(studentData))[0];
			await db.student_guardian.insert({ student_id: student.student_id, guardian_id: guardian.guardian_id, relationship_type: "Parent", is_primary_biller: true });
			const result = await db.guardian.get.getByEmail("bobby@toto.ca");
			expect(result.length).toBe(1);
			expect(result[0].gov_first_name).toBe("Bobby");
			expect(result[0].relationship_type).toBe("Parent");
		});

		it("should error fetch a specific guardian by non-existent email", async () => {
			await db.guardian.insert(createMockGuardian({ gov_first_name: "Bobby", email: "bobby@toto.ca" }));
			const result = await db.guardian.get.getByEmail("bobby1@toto.ca");
			expect(result.length).toBe(0);
		});

		it("should return all guardians", async () => {
			const names = ["A-B-C", "1-2-3", "Do-Re-Mi"];
			for (let i = 1; i <= 3; i++) await db.guardian.insert(createMockGuardian({ gov_first_name: names[i - 1], email: `guardian${i}@test.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			const result = await db.guardian.get.getAll();
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toEqual(3);
			expect(result[0].gov_first_name).toBe("A-B-C");
			expect(result[1].gov_first_name).toBe("1-2-3");
			expect(result[2].gov_first_name).toBe("Do-Re-Mi");
		});
	});

	describe("Update Operations", () => {
		it("should update guardian details", async () => {
			const inserted = await db.guardian.insert(createMockGuardian({ gov_first_name: "Alejandro" }));
			const id = inserted[0].guardian_id;

			const updated = await db.guardian.update(id, createMockGuardian({ gov_first_name: "Alejandro", pref_name: "Alex" }));

			expect(updated[0].pref_name).toBe("Alex");
			expect(updated[0].gov_first_name).toBe("Alejandro");
		});

		it("should error update on duplicate email", async () => {
			for (let i = 1; i <= 2; i++) await db.guardian.insert(createMockGuardian({ email: `rosanna${i}@toto.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			await expect(db.guardian.update(1, createMockGuardian({ email: `rosanna2@toto.ca`, phone: `(111) 456-7890` }))).rejects.toThrow(/duplicate key value violates unique constraint.*email/);
		});

		it("should error update on duplicate phone", async () => {
			for (let i = 1; i <= 2; i++) await db.guardian.insert(createMockGuardian({ email: `rosanna${i}@toto.ca`, phone: `(${i}${i}${i}) 456-7890` }));
			await expect(db.guardian.update(1, createMockGuardian({ email: `rosanna1@toto.ca`, phone: `(222) 456-7890` }))).rejects.toThrow(/duplicate key value violates unique constraint.*phone/);
		});
	});

	describe("Delete Operations", () => {
		it("should remove a guardian by ID", async () => {
			const inserted = await db.guardian.insert(createMockGuardian({ gov_first_name: "Roberto" }));
			const id = inserted[0].guardian_id;

			await db.guardian.remove.byId(id);
			const result = await db.guardian.get.get(id);
			expect(result.length).toEqual(0);
		});

		it("should remove a guardian by name", async () => {
			await db.guardian.insert(createMockGuardian({ gov_first_name: "Roberto", gov_last_name: "Fernando" }));

			await db.guardian.remove.byName("Roberto", "Fernando");
			const id = await db.guardian.find("Roberto", "Fernando");
			expect(id).toBeNull();
		});

		it("should throw an error when trying to remove a non-existent student by ID", async () => {
			const result = await db.guardian.remove.byId(1);
			expect((result as any).meta.rowCount).toEqual(0);
		});
	});
});
