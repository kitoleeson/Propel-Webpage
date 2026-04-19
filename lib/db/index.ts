/** @format */

import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import SQL from "sql-template-strings";

import { createTutorRepo } from "./tutor";
import { createPendingTutorRepo } from "./pending_tutor";

if (typeof window === "undefined") neonConfig.webSocketConstructor = ws;

const url: string | undefined = process.env.APP_ENV === "prod" ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV;
if (!url) throw new Error("Database URL is not defined");

const pool = new Pool({ connectionString: url });

export const sql = (strings_or_client: any, ...values: any[]) => {
	const transaction: boolean = strings_or_client && typeof strings_or_client.query === "function";

	if (transaction) {
		return async (s: any, ...v: any[]) => {
			const query = s.raw ? SQL(s, ...v) : s;
			return await strings_or_client.query(query);
		};
	} else {
		const query = strings_or_client.raw ? SQL(strings_or_client, ...values) : strings_or_client;
		return pool.query(query);
	}
};

export const db = {
	pool: pool,
	tutor: createTutorRepo(sql, pool),
	pending_tutor: createPendingTutorRepo(sql, pool),
	// student: student,
	// guardian: guardian
};
