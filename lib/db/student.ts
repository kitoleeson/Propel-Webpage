/** @format */

import { StudentFormValues } from "../validation/clientForm/clientFormSchema";

export const createStudentRepo = (sql: any, pool: any) => {
	const get = async (id: number, db: any = sql) => {
		return db`SELECT * FROM students WHERE student_id = ${id};`;
	};

	const getAll = async (db: any = sql) => {
		return db`SELECT * FROM students ORDER BY student_id`;
	};

	const find = async (gov_first_name: string, gov_last_name: string, db: any = sql) => {
		const result = await db`
         SELECT student_id
         FROM students
         WHERE gov_first_name = ${gov_first_name} AND gov_last_name = ${gov_last_name};
      `;
		return result.rows[0]?.student_id ?? null;
	};

	const insert = (data: StudentFormValues, db: any = sql) => {
		return db`
         INSERT INTO students (gov_first_name, gov_last_name, pref_name, grade, city, email, phone, pref_communication, how_found_us)
         VALUES (${data.gov_first_name}, ${data.gov_last_name}, ${data.pref_name || null}, ${data.grade || null}, ${data.city || null}, ${data.email}, ${data.phone}, ${data.pref_communication}, ${data.how_found_us || null})
         RETURNING *;
      `;
	};

	const removeById = (id: number, db: any = sql) => {
		return db`
         DELETE FROM students WHERE student_id = ${id};
      `;
	};

	const removeByName = (gov_first_name: string, gov_last_name: string, db: any = sql) => {
		return db`
         DELETE FROM students
         WHERE gov_first_name = ${gov_first_name} AND gov_last_name = ${gov_last_name};
      `;
	};

	const update = (id: number, data: StudentFormValues, db: any = sql) => {
		return db`
         UPDATE students
         SET
            gov_first_name = ${data.gov_first_name},
            gov_last_name = ${data.gov_last_name},
            pref_name = ${data.pref_name || null},
            grade = ${data.grade || null},
            city = ${data.city || null},
            email = ${data.email},
            phone = ${data.phone},
            pref_communication = ${data.pref_communication},
            how_found_us = ${data.how_found_us || null}
         WHERE student_id = ${id}
         RETURNING *;
      `;
	};

	return {
		get: {
			get,
			getAll,
		},
		find,
		insert,
		remove: {
			byId: removeById,
			byName: removeByName,
		},
		update,
	};
};
