/** @format */

import { Pool, neonConfig, types } from "@neondatabase/serverless";
import ws from "ws";
import SQL from "sql-template-strings";

import { createTutorRepo } from "./integration/tutors";
import { createPendingTutorRepo } from "./integration/pending_tutor";
import { createGuardianRepo } from "./integration/guardians";
import { createStudentRepo } from "./integration/student";
import { createStudentGuardianRepo } from "./integration/student_guardian";
import { createBillingAccountsRepo } from "./integration/billing_accounts";
import { createStudentBillingRepo } from "./integration/student_billing";
import { createStudentTutorRepo } from "./integration/student_tutor";
import { createPendingStudentTutorRepo } from "./integration/pending_student_tutor";
import { createTutorSubjectsRepo } from "./integration/tutor_subjects";

if (typeof window === "undefined") neonConfig.webSocketConstructor = ws;

const url: string | undefined = process.env.DATABASE_URL || (process.env.APP_ENV === "prod" ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV);
if (!url) throw new Error("Database URL is not defined");

const pool = new Pool({ connectionString: url });
types.setTypeParser(1700, (value) => parseFloat(value));

pool.on("error", (error: any, client: any) => {
	console.error("Unexpected error on idle database client:", error.message);
});

export const sql = (strings_or_client: any, ...values: any[]) => {
	const transaction: boolean = strings_or_client && typeof strings_or_client.query === "function";

	if (transaction) {
		return async (s: any, ...v: any[]) => {
			const query = s.raw ? SQL(s, ...v) : s;
			const result = await strings_or_client.query(query);
			Object.defineProperty(result.rows, "meta", { value: result, enumerable: false });
			return result.rows;
		};
	} else {
		const query = strings_or_client.raw ? SQL(strings_or_client, ...values) : strings_or_client;
		return pool.query(query).then((result: any) => {
			Object.defineProperty(result.rows, "meta", { value: result, enumerable: false });
			return result.rows;
		});
	}
};

export const db = {
	pool: pool,
	tutor: createTutorRepo(sql, pool),
	pending_tutor: createPendingTutorRepo(sql, pool),
	tutor_subjects: createTutorSubjectsRepo(sql, pool),
	student_tutor: createStudentTutorRepo(sql, pool),
	pending_student_tutor: createPendingStudentTutorRepo(sql, pool),
	student: createStudentRepo(sql, pool),
	guardian: createGuardianRepo(sql, pool),
	student_guardian: createStudentGuardianRepo(sql, pool),
	billing_account: createBillingAccountsRepo(sql, pool),
	student_billing: createStudentBillingRepo(sql, pool),
};
