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

export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
	const result = await pool.query(SQL(strings, ...values));
	return result.rows;
};

export const db = {
	pool: pool,
	tutor: createTutorRepo(pool),
	pending_tutor: createPendingTutorRepo(pool),
	// student: student,
	// guardian: guardian
};
