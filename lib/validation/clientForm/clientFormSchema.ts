/** @format */

import { z } from "zod";

const personBase = z.object({
	gov_first: z.string().min(1, "First name is required"),
	gov_last: z.string().min(1, "Last name is required"),
	pref_name: z.string().optional(),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(1, "Phone number is required"),
	pref_comm: z
		.enum(["email", "text message"])
		.optional()
		.refine((val) => val !== undefined, { message: "Required" }),
});

const studentSchema = personBase.extend({
	grade: z
		.number()
		.int()
		.min(1, "Grade is required")
		.max(12, "Grade must be between 1 and 12")
		.optional()
		.refine((val) => val !== undefined, { message: "Required" }),
	city: z.string().min(1, "City is required"),
	how_found: z
		.enum(["teacher", "family member", "word of mouth", "advertisement", "web search", "other"])
		.optional()
		.refine((val) => val !== undefined, { message: "Required" }),
	biller: z
		.enum(["student", "guardian"])
		.optional()
		.refine((val) => val !== undefined, { message: "Required" }),
});

const guardianSchema = personBase.extend({
	relationship: z
		.enum(["mother", "father", "parent", "legal guardian", "other"])
		.optional()
		.refine((val) => val !== undefined, { message: "Required" }),
	is_primary_biller: z.boolean(),
});

// export const defaultStudent: ClientFormValues["student"] = {
// 	gov_first: "test",
// 	gov_last: "student",
// 	pref_name: "tessy",
// 	email: "tessy@test.ca",
// 	phone: "1234567890",
// 	pref_comm: "email",
// 	grade: 12,
// 	city: "edmonton",
// 	how_found: "word of mouth",
// 	biller: "guardian",
// };

// export const defaultGuardian: ClientFormValues["guardians"][0] = {
// 	gov_first: "test",
// 	gov_last: "guardian",
// 	pref_name: "tessa",
// 	email: "tessa@test.ca",
// 	phone: "1234567890",
// 	pref_comm: "text message",
// 	relationship: "mother",
// 	is_primary_biller: false,
// };

export const defaultStudent: ClientFormValues["student"] = {
	gov_first: "",
	gov_last: "",
	pref_name: "",
	email: "",
	phone: "",
	pref_comm: undefined,
	grade: undefined,
	city: "",
	how_found: undefined,
	biller: undefined,
};

export const defaultGuardian: ClientFormValues["guardians"][0] = {
	gov_first: "",
	gov_last: "",
	pref_name: "",
	email: "",
	phone: "",
	pref_comm: undefined,
	relationship: undefined,
	is_primary_biller: false,
};

export const formSchema = z
	.object({
		student: studentSchema,
		guardians: z.array(guardianSchema),
		primary_biller_index: z.number().min(-1),
	})
	.superRefine((data, ctx) => {
		const guardianBilling = data.student.biller === "guardian";

		if (guardianBilling) {
			if (data.guardians.length < 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "At least one guardian is required",
					path: ["guardians"],
				});
			} else if (data.primary_biller_index >= data.guardians.length) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Primary biller must be a valid guardian",
					path: ["primary_biller_index"],
				});
			}
		}
	});

export type ClientFormValues = z.infer<typeof formSchema>;
