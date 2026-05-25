/** @format */

import { BillingAccountType } from "@/lib/db/billing_accounts";
import { GuardianFormValues, StudentFormValues } from "@/lib/validation/clientForm/clientFormSchema";
import { withNeonTestBranch } from "@/tests/test-setup";

withNeonTestBranch();

let db: typeof import("@/lib/db").db;

describe("Billing Accounts Repository Integration Tests", () => {
	beforeAll(async () => {
		({ db } = await import("@/lib/db"));
	});

	beforeEach(async () => {
		await db.pool.query("TRUNCATE TABLE billing_accounts, guardians, students RESTART IDENTITY CASCADE");
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

	const createMockStudentBiller = async (overrides = {}): Promise<BillingAccountType> => {
		const mockData = createMockStudent(overrides);
		const result = await db.student.insert(mockData);
		const student = result.rows[0];
		return {
			display_name: (student.pref_name || student.gov_first_name) + " " + student.gov_last_name,
			first_invoice: true,
			student_id: student.student_id,
			...mockData,
		};
	};

	const createMockBiller = (mockData: any, overrides = {}): BillingAccountType => {
		return {
			display_name: (mockData.pref_name || mockData.gov_first_name) + " " + mockData.gov_last_name,
			email: mockData.email,
			first_invoice: true,
			guardian_id: mockData.guardian_id,
			student_id: mockData.student_id,
			...overrides,
		};
	};

	describe("Insert & Find Operations", () => {
		it("should insert a new billing account for a guardian", async () => {
			const mockData = await createMockGuardianBiller();
			const result = await db.billing_account.insert(mockData);
			const guardianBiller = result.rows[0];
			expect(guardianBiller).toBeDefined();
			expect(guardianBiller.display_name).toEqual("Rose Toto");
			expect(guardianBiller.guardian_id).toEqual(mockData.guardian_id);
		});

		it("should insert a new billing account for a student", async () => {
			const mockData = await createMockStudentBiller();
			const result = await db.billing_account.insert(mockData);
			const studentBiller = result.rows[0];
			expect(studentBiller).toBeDefined();
			expect(studentBiller.display_name).toEqual("RM Man");
			expect(studentBiller.student_id).toEqual(mockData.student_id);
		});

		it("should error insert on both student_id and guardian_id", async () => {
			const mockData = await createMockGuardianBiller({ student_id: 1, guardian_id: 1 });
			await expect(db.billing_account.insert(mockData)).rejects.toThrow(/violates check constraint.*check_single_owner/);
		});

		it("should error insert on neither student_id or guardian_id", async () => {
			const mockData = await createMockGuardianBiller({ student_id: null, guardian_id: null });
			await expect(db.billing_account.insert(mockData)).rejects.toThrow(/violates check constraint.*check_single_owner/);
		});

		it("should error insert on non-existant guardian_id", async () => {
			const mockData = {
				display_name: "Rose Toto",
				email: "rosanna@africa.ca",
				first_invoice: true,
				guardian_id: 1,
			};
			await expect(db.billing_account.insert(mockData)).rejects.toThrow(/violates foreign key constraint.*guardian_id_fkey/);
		});

		it("should error insert on non-existant student_id", async () => {
			const mockData = {
				display_name: "Rose Toto",
				email: "rosanna@africa.ca",
				first_invoice: true,
				student_id: 1,
			};
			await expect(db.billing_account.insert(mockData)).rejects.toThrow(/violates foreign key constraint.*student_id_fkey/);
		});

		it("should error insert on duplicate email", async () => {
			const guardianData1 = createMockGuardian({ email: "guardian1@example.ca", phone: "(111) 456-7890" });
			const guardianData2 = createMockGuardian({ email: "guardian2@example.ca", phone: "(222) 456-7890" });
			const response1 = await db.guardian.insert(guardianData1);
			const response2 = await db.guardian.insert(guardianData2);
			await db.billing_account.insert(createMockBiller(response1.rows[0]));
			await expect(db.billing_account.insert(createMockBiller(response2.rows[0], { email: "guardian1@example.ca" }))).rejects.toThrow(/duplicate key value violates unique constraint.*email/);
		});

		it("should error insert on duplicate guardian_id", async () => {
			const mockData = await createMockGuardianBiller();
			await db.billing_account.insert(mockData);
			await expect(db.billing_account.insert({ ...mockData, email: "notthesame@example.ca" })).rejects.toThrow(/duplicate key value violates unique constraint.*guardian_id_key/);
		});

		it("should error insert on duplicate student_id", async () => {
			const mockData = await createMockStudentBiller();
			await db.billing_account.insert(mockData);
			await expect(db.billing_account.insert({ ...mockData, email: "notthesame@example.ca" })).rejects.toThrow(/duplicate key value violates unique constraint.*student_id_key/);
		});
	});

	describe("Get Operations", () => {
		it("should get a billing account by billing IDs", async () => {
			const mockData = await createMockGuardianBiller();
			const billerResult = await db.billing_account.insert(mockData);
			const billing_id = billerResult.rows[0].billing_id;
			const getResult = await db.billing_account.get.get(billing_id);
			expect(getResult.rows.length).toEqual(1);
			expect(getResult.rows[0].billing_id).toEqual(billing_id);
			expect(getResult.rows[0].display_name).toEqual("Rose Toto");
			expect(getResult.rows[0].first_invoice).toEqual(true);
		});

		it("should get all billing accounts ordered by ascending billing ID (guardians)", async () => {
			const pairs = [];
			for (let i = 0; i < 3; i++) {
				const mockData = await createMockGuardianBiller({ email: `biller${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` });
				const result = await db.billing_account.insert(mockData);
				pairs.push(result.rows[0]);
			}

			const result = await db.billing_account.get.getAll();
			expect(result.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) {
				expect(result.rows[i].guardian_id).toEqual(pairs[i].guardian_id);
				expect(result.rows[i].display_name).toEqual(pairs[i].display_name);
			}
		});

		it("should get all billing accounts ordered by ascending billing ID (students)", async () => {
			const pairs = [];
			for (let i = 0; i < 3; i++) {
				const mockData = await createMockStudentBiller({ email: `biller${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` });
				const result = await db.billing_account.insert(mockData);
				pairs.push(result.rows[0]);
			}

			const result = await db.billing_account.get.getAll();
			expect(result.rows.length).toEqual(3);
			for (let i = 0; i < 3; i++) {
				expect(result.rows[i].student_id).toEqual(pairs[i].student_id);
				expect(result.rows[i].display_name).toEqual(pairs[i].display_name);
			}
		});

		it("should get all billing accounts ordered by ascending billing ID (students and guardians)", async () => {
			const pairs = [];
			for (let i = 0; i < 3; i++) {
				const mockData1 = await createMockStudentBiller({ email: `biller${i + 1}@example.ca`, phone: `(${i}${i}${i}) 456-7890` });
				const mockData2 = await createMockGuardianBiller({ email: `biller${i + 4}@example.ca`, phone: `(${i + 4}${i + 4}${i + 4}) 456-7890` });
				const result1 = await db.billing_account.insert(mockData1);
				const result2 = await db.billing_account.insert(mockData2);
				pairs.push(result1.rows[0]);
				pairs.push(result2.rows[0]);
			}

			const result = await db.billing_account.get.getAll();
			expect(result.rows.length).toEqual(6);
			for (let i = 0; i < 6; i++) {
				expect(result.rows[i].student_id).toEqual(pairs[i].student_id);
				expect(result.rows[i].guardian_id).toEqual(pairs[i].guardian_id);
				expect(result.rows[i].display_name).toEqual(pairs[i].display_name);
			}
		});

		it("should get billing account by guardian owner", async () => {
			const mockData = await createMockGuardianBiller();
			const guardianBillerResult = await db.billing_account.insert(mockData);
			const guardianBiller = guardianBillerResult.rows[0];
			const result = await db.billing_account.get.getByOwner("guardian", guardianBiller.guardian_id);
			expect(result.rows[0].guardian_id).toEqual(guardianBiller.guardian_id);
			expect(result.rows[0].email).toEqual(guardianBiller.email);
			expect(result.rows[0].billing_id).toEqual(guardianBiller.billing_id);
		});

		it("should get billing account by student owner", async () => {
			const mockData = await createMockStudentBiller();
			const studentBillerResult = await db.billing_account.insert(mockData);
			const studentBiller = studentBillerResult.rows[0];
			const result = await db.billing_account.get.getByOwner("student", studentBiller.student_id);
			expect(result.rows[0].student_id).toEqual(studentBiller.student_id);
			expect(result.rows[0].email).toEqual(studentBiller.email);
			expect(result.rows[0].billing_id).toEqual(studentBiller.billing_id);
		});

		it("should get guardian owner of billing account", async () => {
			const mockBillerData = await createMockGuardianBiller();
			const billerResult = await db.billing_account.insert(mockBillerData);
			const result = await db.billing_account.get.getOwner(billerResult.rows[0].billing_id);
			expect(result.rows[0].gov_first_name).toEqual("Rosanna");
			expect(result.rows[0].email).toEqual("rosanna@africa.ca");
			expect(result.rows[0].pref_communication).toEqual("email");
		});

		it("should get student owner of billing account", async () => {
			const mockBillerData = await createMockStudentBiller();
			const billerResult = await db.billing_account.insert(mockBillerData);
			const result = await db.billing_account.get.getOwner(billerResult.rows[0].billing_id);
			expect(result.rows[0].gov_first_name).toEqual("Rocket");
			expect(result.rows[0].email).toEqual("rocket.man@mars.ca");
			expect(result.rows[0].pref_communication).toEqual("text message");
		});
	});

	describe("Update Operations", () => {
		it("should update display name", async () => {
			const guardianResult = await db.guardian.insert(createMockGuardian());
			const mockGuardian = guardianResult.rows[0];
			const billingAccountResponse = await db.billing_account.insert(createMockBiller(mockGuardian));
			const billing_id = billingAccountResponse.rows[0].billing_id;
			const result = await db.billing_account.update(billing_id, createMockBiller(mockGuardian, { display_name: "Rosy Toto" }));
			expect(result.rows.length).toEqual(1);
			expect(result.rows[0].email).toEqual(mockGuardian.email);
			expect(result.rows[0].display_name).toEqual("Rosy Toto");
		});

		it("should update email", async () => {
			const guardianResult = await db.guardian.insert(createMockGuardian());
			const mockGuardian = guardianResult.rows[0];
			const billingAccountResponse = await db.billing_account.insert(createMockBiller(mockGuardian));
			const billing_id = billingAccountResponse.rows[0].billing_id;
			const result = await db.billing_account.update(billing_id, createMockBiller(mockGuardian, { email: "new@example.ca" }));
			expect(result.rows.length).toEqual(1);
			expect(result.rows[0].display_name).toEqual((mockGuardian.pref_name || mockGuardian.gov_first_name) + " " + mockGuardian.gov_last_name);
			expect(result.rows[0].email).toEqual("new@example.ca");
		});

		it("should set first invoice to false", async () => {
			const mockData = await createMockGuardianBiller();
			const insertResult = await db.billing_account.insert(mockData);
			const guardianBiller = insertResult.rows[0];
			expect(guardianBiller.first_invoice).toEqual(true);
			await db.billing_account.setFirstInvoice(guardianBiller.billing_id);
			const result = await db.billing_account.get.get(guardianBiller.billing_id);
			expect(result.rows[0].first_invoice).toEqual(false);
		});

		it("should set first invoice to false then true", async () => {
			const mockData = await createMockGuardianBiller();
			const insertResult = await db.billing_account.insert(mockData);
			const guardianBiller = insertResult.rows[0];
			expect(guardianBiller.first_invoice).toEqual(true);
			await db.billing_account.setFirstInvoice(guardianBiller.billing_id);
			const result1 = await db.billing_account.get.get(guardianBiller.billing_id);
			expect(result1.rows[0].first_invoice).toEqual(false);
			await db.billing_account.setFirstInvoice(guardianBiller.billing_id, true);
			const result2 = await db.billing_account.get.get(guardianBiller.billing_id);
			expect(result2.rows[0].first_invoice).toEqual(true);
		});
	});

	describe("Delete Operations", () => {
		it("should remove a billing account by billing ID", async () => {
			const mockData = await createMockGuardianBiller();
			const insertResult = await db.billing_account.insert(mockData);
			expect(insertResult.rowCount).toEqual(1);
			const getResult1 = await db.billing_account.get.get(insertResult.rows[0].billing_id);
			expect(getResult1.rows.length).toEqual(1);
			const deleteResult = await db.billing_account.remove(insertResult.rows[0].billing_id);
			expect(deleteResult.rows.length).toEqual(1);
			const getResult2 = await db.billing_account.get.get(insertResult.rows[0].billing_id);
			expect(getResult2.rows.length).toEqual(0);
		});

		it("should error when trying to remove a billing account", async () => {
			const result = await db.billing_account.remove(1);
			expect(result.rowCount).toEqual(0);
		});
	});
});
