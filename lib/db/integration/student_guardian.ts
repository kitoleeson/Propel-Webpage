/** @format */

import { DBTypes } from "../dbtypes";

export const createStudentGuardianRepo = (sql: any, pool: any) => {
	const get = async (student_id: number, guardian_id: number, db: any = sql): Promise<DBTypes.StudentGuardianRow[]> => {
		return db`SELECT * FROM student_guardian WHERE student_id = ${student_id} AND guardian_id = ${guardian_id};`;
	};

	const getAll = async (db: any = sql): Promise<DBTypes.StudentGuardianRow[]> => {
		return db`SELECT * FROM student_guardian ORDER BY student_id ASC, guardian_id ASC;`;
	};

	const getStudents = async (guardian_id: number, db: any = sql): Promise<DBTypes.StudentsRow[]> => {
		return db`
         SELECT s.*
         FROM students s
         JOIN student_guardian sg ON s.student_id = sg.student_id
         WHERE sg.guardian_id = ${guardian_id};
      `;
	};

	const getGuardians = async (student_id: number, db: any = sql): Promise<DBTypes.GuardiansRow[]> => {
		return db`
         SELECT g.*
         FROM guardians g
         JOIN student_guardian sg ON g.guardian_id = sg.guardian_id
         WHERE sg.student_id = ${student_id};
      `;
	};

	const insert = (data: DBTypes.StudentGuardian, db: any = sql): Promise<DBTypes.StudentGuardianRow[]> => {
		return db`
         INSERT INTO student_guardian (student_id, guardian_id, relationship_type, is_primary_biller)
         VALUES (${data.student_id}, ${data.guardian_id}, ${data.relationship_type}, ${data.is_primary_biller})
         RETURNING *;
      `;
	};

	const remove = (student_id: number, guardian_id: number, db: any = sql): Promise<DBTypes.StudentGuardianRow[]> => {
		return db`
			DELETE FROM student_guardian
			WHERE student_id = ${student_id} AND guardian_id = ${guardian_id}
			RETURNING *;
		`;
	};

	const removeByStudentId = (student_id: number, db: any = sql): Promise<DBTypes.StudentGuardianRow[]> => {
		return db`DELETE FROM student_guardian WHERE student_id = ${student_id} RETURNING *;`;
	};

	const removeByGuardianId = (guardian_id: number, db: any = sql): Promise<DBTypes.StudentGuardianRow[]> => {
		return db`DELETE FROM student_guardian WHERE guardian_id = ${guardian_id} RETURNING *;`;
	};

	// IMPLEMENT LATER: maybe do remove by emails rather than names, since multiple people can have the same name but not the same email
	const removeByStudentName = (gov_first_name: string, gov_last_name: string, db: any = sql): Promise<DBTypes.StudentGuardianRow[]> => {
		return db`
         DELETE FROM student_guardian sg
         USING students s WHERE sg.student_id = s.student_id
         AND s.gov_first_name = ${gov_first_name} AND s.gov_last_name = ${gov_last_name}
			RETURNING *;
      `;
	};

	const removeByGuardianName = (gov_first_name: string, gov_last_name: string, db: any = sql): Promise<DBTypes.StudentGuardianRow[]> => {
		return db`
         DELETE FROM student_guardian sg
         USING guardians g WHERE sg.guardian_id = g.guardian_id
         AND g.gov_first_name = ${gov_first_name} AND g.gov_last_name = ${gov_last_name}
			RETURNING *;
      `;
	};

	const update = (data: DBTypes.StudentGuardian, db: any = sql): Promise<DBTypes.StudentGuardianRow[]> => {
		return db`
         UPDATE student_guardian
         SET
            relationship_type = ${data.relationship_type},
            is_primary_biller = ${data.is_primary_biller}
         WHERE student_id = ${data.student_id} AND guardian_id = ${data.guardian_id}
         RETURNING *;
      `;
	};

	// UPDATE URGENTISH: check if new primary biller has billing_account, create one if not, then update student_billing to link billing_account
	const setPrimaryBillerGuardian = async (student_id: number, guardian_id: number, db: any = sql): Promise<DBTypes.StudentGuardianRow[]> => {
		const client = await pool.connect();
		const tx = sql(client);
		try {
			await client.query("BEGIN");
			const exists = await get(student_id, guardian_id, tx);
			if (exists.length === 0) throw new Error("Student-Guardian relationship does not exist");

			// const has_billing_account_response = await tx`
			// 	SELECT *
			// 	FROM billing_accounts
			// 	WHERE type = 'guardian' AND owner_id = ${guardian_id};
			// `;
			// const has_billing_account = has_billing_account_response.length === 0;

			// // get information from owner account
			// if (!has_billing_account) await tx`
			// 	INSERT INTO billing_accounts (type, owner_id, display_name, email, first_invoice)
			// 	VALUES (${data.type}, ${data.owner_id}, ${data.display_name}, ${data.email}, ${data.first_invoice})
			// 	RETURNING *;
			// `;

			// // continue logic

			await tx`
				UPDATE student_guardian
				SET is_primary_biller = false
				WHERE student_id = ${student_id};
			`;

			return tx`
				UPDATE student_guardian
				SET is_primary_biller = true
				WHERE student_id = ${student_id} AND guardian_id = ${guardian_id}
				RETURNING *;
			`;
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		} finally {
			client.release();
		}
	};

	return {
		get: {
			get,
			getAll,
			getStudents,
			getGuardians,
		},
		insert,
		remove: {
			remove: remove,
			byStudentId: removeByStudentId,
			byGuardianId: removeByGuardianId,
			byStudentName: removeByStudentName,
			byGuardianName: removeByGuardianName,
		},
		update,
		setPrimaryBiller: {
			guardian: setPrimaryBillerGuardian,
			// student: setPrimaryBillerStudent, // ADD SOON
		},
	};
};
