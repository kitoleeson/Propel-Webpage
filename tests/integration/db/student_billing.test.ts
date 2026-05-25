/** @format */

import { BillingAccountType } from "@/lib/db/billing_accounts";
import { GuardianFormValues, StudentFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;

describe("Student Billing Repository Integration Tests", () => {
	beforeAll(async () => {
		({ db } = await import("@/lib/db"));
	});

	beforeEach(async () => {
		await db.pool.query("TRUNCATE TABLE student_guardian, guardians, students, billing_accounts, student_billing RESTART IDENTITY CASCADE");
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

	const createMockGuardianBiller = async (overrides = {}): Promise<BillingAccountType> => {
		const mockData = createMockGuardian(overrides);
		const result = await db.guardian.insert(mockData);
		const guardian = result.rows[0];
		return {
			display_name: (guardian.pref_name || guardian.gov_first_name) + " " + guardian.gov_last_name,
			first_invoice: true,
			guardian_id: guardian.guardian_id,
			...mockData,
		};
	};

	const createMockGuardianBillerPair = async (studentOverrides = {}, guardianOverrides = {}) => {
		const student = (await db.student.insert(createMockStudent(studentOverrides))).rows[0];
		const guardian = (await db.guardian.insert(createMockGuardian(guardianOverrides))).rows[0];
		const student_guardian = (
			await db.student_guardian.insert({
				student_id: student.student_id,
				guardian_id: guardian.guardian_id,
				relationship_type: "Parent",
				is_primary_biller: true,
			})
		).rows[0];
		const billing_account = (
			await db.billing_account.insert({
				display_name: (guardian.pref_name || guardian.gov_first_name) + " " + guardian.gov_last_name,
				email: guardian.email,
				first_invoice: true,
				guardian_id: guardian.guardian_id,
			})
		).rows[0];
		const student_billing = (
			await db.student_billing.insert({
				student_id: student.student_id,
				billing_id: billing_account.billing_id,
			})
		).rows[0];
		return { student: student, guardian: guardian, student_guardian: student_guardian, billing_account: billing_account, student_billing: student_billing };
	};

	const createMockStudentBillerPair = async (studentOverrides = {}, guardianOverrides = {}) => {
		const student = (await db.student.insert(createMockStudent(studentOverrides))).rows[0];
		const billing_account = (
			await db.billing_account.insert({
				display_name: (student.pref_name || student.gov_first_name) + " " + student.gov_last_name,
				email: student.email,
				first_invoice: true,
				student_id: student.student_id,
			})
		).rows[0];
		const student_billing = (
			await db.student_billing.insert({
				student_id: student.student_id,
				billing_id: billing_account.billing_id,
			})
		).rows[0];
		return { student: student, billing_account: billing_account, student_billing: student_billing };
	};

	describe("Insert & Find", () => {
		it("should insert a new student_billing guardian pair", async () => {
			const { student, guardian, student_guardian, billing_account, student_billing } = await createMockGuardianBillerPair();
			expect(student_guardian).toBeDefined();
			expect(student_guardian.student_id).toEqual(student.student_id);
			expect(student_guardian.guardian_id).toEqual(guardian.guardian_id);
			expect(billing_account.guardian_id).toEqual(guardian.guardian_id);
			expect(student_billing.student_id).toEqual(student.student_id);
			expect(student_billing.billing_id).toEqual(billing_account.billing_id);
		});

		it("should insert a new student_billing student pair", async () => {
			const { student, billing_account, student_billing } = await createMockStudentBillerPair();
			expect(billing_account.student_id).toEqual(student.student_id);
			expect(student_billing.billing_id).toEqual(billing_account.billing_id);
		});

		it("should error insert on non-existant billing_id", async () => {
			const student = (await db.student.insert(createMockStudent())).rows[0];
			await expect(db.student_billing.insert({ student_id: student.student_id, billing_id: 1 })).rejects.toThrow(/violates foreign key constraint.*billing_id_fkey/);
		});

		it("should error insert on non-existant student_id", async () => {
			const billing_account = (await db.billing_account.insert(await createMockGuardianBiller())).rows[0];
			await expect(db.student_billing.insert({ student_id: 1, billing_id: billing_account.billing_id })).rejects.toThrow(/violates foreign key constraint.*student_id_fkey/);
		});

		it("should error insert on duplicate student_id", async () => {
			const { student, billing_account } = await createMockGuardianBillerPair();
			await expect(db.student_billing.insert({ student_id: student.student_id, billing_id: billing_account.billing_id })).rejects.toThrow(/duplicate key value violates unique constraint.*student_billing_pkey/);
		});
	});

	describe("Get Operations", () => {
		it("should get a student_billing guardian pair by student ID", async () => {
			const { student, billing_account } = await createMockGuardianBillerPair();
			const result = await db.student_billing.get.get(student.student_id);
			expect(result.rows.length).toEqual(1);
			expect(result.rows[0].student_id).toEqual(student.student_id);
			expect(result.rows[0].billing_id).toEqual(billing_account.billing_id);
		});

		it("should get a student_billing student pair by student ID", async () => {
			const { student, billing_account } = await createMockStudentBillerPair();
			const result = await db.student_billing.get.get(student.student_id);
			expect(result.rows.length).toEqual(1);
			expect(result.rows[0].student_id).toEqual(student.student_id);
			expect(result.rows[0].billing_id).toEqual(billing_account.billing_id);
		});

		it("should get all student_billing pairs ordered by ascending student ID", async () => {
			const pairs = [];
			for (let i = 0; i < 3; i++)
				pairs.push(
					await createMockGuardianBillerPair(
						{ gov_first_name: `Student${i + 1}`, email: `student${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` },
						{ gov_first_name: `Guardian${i + 1}`, email: `guardian${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` },
					),
				);

			const result = await db.student_billing.get.getAll();
			expect(result.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) {
				expect(result.rows[i].student_id).toEqual(pairs[i].student.student_id);
				expect(result.rows[i].billing_id).toEqual(pairs[i].billing_account.billing_id);
			}
		});

		it("should error get on non-existent student ID", async () => {
			const result = await db.student_billing.get.get(1);
			expect(result.rows.length).toEqual(0);
		});
	});

	describe("Update Operations", () => {
		it("should update billing_id", async () => {
			const { student } = await createMockStudentBillerPair();
			const billing_account2 = (await db.billing_account.insert(await createMockGuardianBiller({ email: "new@example.ca", phone: "(111) 111-1111" }))).rows[0];
			const result = await db.student_billing.update(student.student_id, billing_account2.billing_id);
			expect(result.rows.length).toEqual(1);
			expect(result.rows[0].billing_id).toEqual(billing_account2.billing_id);
			expect((await db.student_billing.get.get(student.student_id)).rows[0].billing_id).toEqual(billing_account2.billing_id);
		});

		it("should error update on non-existent student ID", async () => {
			const billing_account = (await db.billing_account.insert(await createMockGuardianBiller())).rows[0];
			const result = await db.student_billing.update(1, billing_account.billing_id);
			expect(result.rows.length).toEqual(0);
		});

		it("should error update on non-existent billing ID", async () => {
			const { student } = await createMockStudentBillerPair();
			await expect(db.student_billing.update(student.student_id, 2)).rejects.toThrow(/violates foreign key constraint.*billing_id_fkey/);
		});
	});

	describe("Delete Operations", () => {
		it("should remove a student_billing pair by student ID", async () => {
			const { student, billing_account } = await createMockStudentBillerPair();
			const result = await db.student_billing.remove(student.student_id);
			expect(result.rowCount).toEqual(1);
			expect(result.rows[0].student_id).toEqual(student.student_id);
			expect(result.rows[0].billing_id).toEqual(billing_account.billing_id);

			const getResult = await db.student_billing.get.get(student.student_id);
			expect(getResult.rows.length).toEqual(0);
		});

		it("should error when trying to remove a non-existent student_billing pair", async () => {
			const result = await db.student_billing.remove(1);
			expect(result.rowCount).toEqual(0);
		});
	});
});
