/** @format */

import { z } from "zod";

const personBase = z.object({
	gov_first_name: z.string().min(1, "First name is required"),
	gov_last_name: z.string().min(1, "Last name is required"),
	pref_name: z.string().optional(),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(1, "Phone number is required"),
	pref_communication: z
		.enum(["Email", "Text Message"])
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
	how_found_us: z
		.enum(["Teacher", "Family Member", "Word of Mouth", "Advertisement", "Web Search", "Other"])
		.optional()
		.refine((val) => val !== undefined, { message: "Required" }),
	biller: z
		.enum(["Student", "Guardian"])
		.optional()
		.refine((val) => val !== undefined, { message: "Required" }),
});

const guardianSchema = personBase.extend({
	relationship: z
		.enum(["Mother", "Father", "Parent", "Legal Guardian", "Other"])
		.optional()
		.refine((val) => val !== undefined, { message: "Required" }),
	is_primary_biller: z.boolean(),
});

// export const defaultStudent: ClientFormValues["student"] = {
// 	gov_first_name: "test",
// 	gov_last_name: "student",
// 	pref_name: "tessy",
// 	email: "tessy@test.ca",
// 	phone: "1234567890",
// 	pref_communication: "email",
// 	grade: 12,
// 	city: "edmonton",
// 	how_found_us: "word of mouth",
// 	biller: "guardian",
// };

// export const defaultGuardian: ClientFormValues["guardians"][0] = {
// 	gov_first_name: "test",
// 	gov_last_name: "guardian",
// 	pref_name: "tessa",
// 	email: "tessa@test.ca",
// 	phone: "1234567890",
// 	pref_communication: "text message",
// 	relationship: "mother",
// 	is_primary_biller: false,
// };

export const defaultStudent: ClientFormValues["student"] = {
	gov_first_name: "",
	gov_last_name: "",
	pref_name: "",
	email: "",
	phone: "",
	pref_communication: undefined,
	grade: undefined,
	city: "",
	how_found_us: undefined,
	biller: undefined,
};

export const defaultGuardian: ClientFormValues["guardians"][0] = {
	gov_first_name: "",
	gov_last_name: "",
	pref_name: "",
	email: "",
	phone: "",
	pref_communication: undefined,
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
		const guardianBilling = data.student.biller === "Guardian";

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
