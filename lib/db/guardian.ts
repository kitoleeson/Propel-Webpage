/** @format */

import { GuardianFormValues } from "../validation/clientForm/clientFormSchema";

export const createGuardianRepo = (sql: any, pool: any) => {
	const get = async (id: number, db: any = sql) => {
		return db`SELECT * FROM guardians WHERE guardian_id = ${id};`;
	};

	const getAll = async (db: any = sql) => {
		return db`SELECT * FROM guardians ORDER BY guardian_id`;
	};

	const getByIdAndEmail = async (id: number, email: string, db: any = sql) => {
		return db`
         SELECT * FROM guardians
         WHERE guardian_id = ${id} AND email = ${email};
      `;
	};

	const getStudents = async (guardian_id: number, db: any = sql) => {
		return db`
         SELECT s.*
         FROM students s
         JOIN student_guardian sg ON s.student_id = sg.student_id
         WHERE sg.guardian_id = ${guardian_id};
      `;
	};

	const find = async (gov_first_name: string, gov_last_name: string, db: any = sql) => {
		const result = await db`
         SELECT guardian_id
         FROM guardians
         WHERE gov_first_name = ${gov_first_name} AND gov_last_name = ${gov_last_name};
      `;
		return result.rows[0]?.guardian_id ?? null;
	};

	const insert = (data: GuardianFormValues, db: any = sql) => {
		return db`
         INSERT INTO guardians (gov_first_name, gov_last_name, pref_name, email, phone, pref_communication)
         VALUES (${data.gov_first_name}, ${data.gov_last_name}, ${data.pref_name || null}, ${data.email}, ${data.phone}, ${data.pref_communication})
         RETURNING *;
      `;
	};

	const removeById = (id: number, db: any = sql) => {
		return db`
         DELETE FROM guardians WHERE guardian_id = ${id};
      `;
	};

	const removeByName = (gov_first_name: string, gov_last_name: string, db: any = sql) => {
		return db`
         DELETE FROM guardians
         WHERE gov_first_name = ${gov_first_name} AND gov_last_name = ${gov_last_name};
      `;
	};

	const update = (id: number, data: GuardianFormValues, db: any = sql) => {
		return db`
         UPDATE guardians
         SET
            gov_first_name = ${data.gov_first_name},
            gov_last_name = ${data.gov_last_name},
            pref_name = ${data.pref_name || null},
            email = ${data.email},
            phone = ${data.phone},
            pref_communication = ${data.pref_communication},
         WHERE guardian_id = ${id}
         RETURNING *;
      `;
	};

	return {
		get: {
			get,
			getAll,
			getByIdAndEmail,
			getStudents,
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
