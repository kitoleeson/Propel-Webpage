/** @format */

import { DBTypes } from "../dbtypes";

export const createGuardianRepo = (sql: any, pool: any) => {
	const get = async (id: number, db: any = sql): Promise<DBTypes.GuardiansRow[]> => {
		return db`SELECT * FROM guardians WHERE guardian_id = ${id};`;
	};

	const getAll = async (db: any = sql): Promise<DBTypes.GuardiansRow[]> => {
		return db`SELECT * FROM guardians ORDER BY guardian_id`;
	};

	const getByEmail = async (email: string, db: any = sql): Promise<(DBTypes.GuardiansRow & { relationship_type: "Other" | "Mother" | "Father" | "Parent" | "Legal Guardian" })[]> => {
		return db`
         SELECT g.*, sg.relationship_type
			FROM guardians g JOIN student_guardian sg ON g.guardian_id = sg.guardian_id
         WHERE email = ${email};
      `;
	};

	const find = async (gov_first_name: string, gov_last_name: string, db: any = sql): Promise<number | null> => {
		const rows = await db`
         SELECT guardian_id
         FROM guardians
         WHERE gov_first_name ILIKE ${gov_first_name} AND gov_last_name ILIKE ${gov_last_name};
      `;
		return rows[0]?.guardian_id ?? null;
	};

	const insert = (data: DBTypes.Guardians, db: any = sql): Promise<DBTypes.GuardiansRow[]> => {
		return db`
         INSERT INTO guardians (gov_first_name, gov_last_name, pref_name, email, phone, pref_communication)
         VALUES (${data.gov_first_name}, ${data.gov_last_name}, ${data.pref_name || null}, ${data.email}, ${data.phone}, ${data.pref_communication?.toLowerCase()})
         RETURNING *;
      `;
	};

	const removeById = (id: number, db: any = sql): Promise<DBTypes.GuardiansRow[]> => {
		return db`
         DELETE FROM guardians WHERE guardian_id = ${id};
      `;
	};

	const removeByName = (gov_first_name: string, gov_last_name: string, db: any = sql): Promise<DBTypes.GuardiansRow[]> => {
		return db`
         DELETE FROM guardians
         WHERE gov_first_name = ${gov_first_name} AND gov_last_name = ${gov_last_name};
      `;
	};

	const update = (id: number, data: DBTypes.Guardians, db: any = sql): Promise<DBTypes.GuardiansRow[]> => {
		return db`
         UPDATE guardians
         SET
            gov_first_name = ${data.gov_first_name},
            gov_last_name = ${data.gov_last_name},
            pref_name = ${data.pref_name || null},
            email = ${data.email},
            phone = ${data.phone},
            pref_communication = ${data.pref_communication?.toLowerCase()}
         WHERE guardian_id = ${id}
         RETURNING *;
      `;
	};

	return {
		get: {
			get,
			getAll,
			getByEmail,
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
