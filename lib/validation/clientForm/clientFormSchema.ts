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
		.min(1, "Grade is required")
		.max(12, "Grade must be between 1 and 12")
		.optional()
		.refine((val) => val !== undefined, { message: "Required" }),
	city: z.string().min(1, "City is required"),
	how_found: z
		.enum(["teacher", "word of mouth", "adversisement", "web search", "other"])
		.optional()
		.refine((val) => val !== undefined, { message: "Required" }),
	biller: z
		.enum(["student", "guardian"])
		.optional()
		.refine((val) => val !== undefined, { message: "Required" }),
});

const guardianSchema = personBase.extend({
	relationship: z.string().min(1, "Relationship is required"),
	is_primary_biller: z.boolean(),
});

export const defaultStudent: FormValues["student"] = {
	gov_first: "test",
	gov_last: "student",
	pref_name: "tessy",
	email: "tessy@test.ca",
	phone: "1234567890",
	pref_comm: "email",
	grade: 12,
	city: "edmonton",
	how_found: "word of mouth",
	biller: "guardian",
};

export const defaultGuardian: FormValues["guardians"][0] = {
	gov_first: "test",
	gov_last: "guardian",
	pref_name: "tessa",
	email: "tessa@test.ca",
	phone: "1234567890",
	pref_comm: "text message",
	relationship: "mother",
	is_primary_biller: true,
};

// export const defaultStudent: FormValues['student'] = {
//   gov_first: '',
//   gov_last: '',
//   pref_name: '',
//   email: '',
//   phone: '',
//   pref_comm: undefined,
//   grade: undefined,
//   city: '',
//   how_found: undefined,
//   biller: undefined,
// };

// export const defaultGuardian: FormValues['guardians'][0] = {
//   gov_first: '',
//   gov_last: '',
//   pref_name: '',
//   email: '',
//   phone: '',
//   pref_comm: undefined,
//   relationship: '',
//   is_primary_biller: false,
// };

export const formSchema = z
	.object({
		student: studentSchema,
		guardians: z.array(guardianSchema).min(1, "At least one guardian is required"),
		primary_biller_index: z.number().min(0),
	})
	.refine((data) => data.primary_biller_index < data.guardians.length, {
		message: "Primary biller must be a valid guardian",
		path: ["primary_biller_index"],
	});

export type FormValues = z.infer<typeof formSchema>;
