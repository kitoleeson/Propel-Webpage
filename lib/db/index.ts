/** @format */

import { neon } from "@neondatabase/serverless";

const url: string | undefined = process.env.APP_ENV === "prod" ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV;
if (!url) throw new Error("Database URL is not defined");
const sql = neon(url);

import { createTutorRepo } from "./tutor";

export const db = {
	query: sql,
	tutor: createTutorRepo(sql),
	// student: student,
	// guardian: guardian
};
