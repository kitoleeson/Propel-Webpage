/** @format */

import { DBTypes } from "../dbtypes";

export const createStudentBillingRepo = (sql: any, pool: any) => {
	const get = async (student_id: number, db: any = sql): Promise<DBTypes.StudentBillingRow[]> => {
		return db`SELECT * FROM student_billing WHERE student_id = ${student_id};`;
	};

	const getAll = async (db: any = sql): Promise<DBTypes.StudentBillingRow[]> => {
		return db`SELECT * FROM student_billing ORDER BY student_id`;
	};

	const insert = (data: DBTypes.StudentBilling, db: any = sql): Promise<DBTypes.StudentBillingRow[]> => {
		return db`
	      INSERT INTO student_billing (student_id, billing_id)
	      VALUES (${data.student_id}, ${data.billing_id})
	      RETURNING *;
	   `;
	};

	const removeByStudent = (student_id: number, db: any = sql): Promise<DBTypes.StudentBillingRow[]> => {
		return db`
	      DELETE FROM student_billing WHERE student_id = ${student_id} RETURNING *;
	   `;
	};

	const update = (student_id: number, billing_id: number, db: any = sql): Promise<DBTypes.StudentBillingRow[]> => {
		return db`
	      UPDATE student_billing
	      SET billing_id = ${billing_id}
	      WHERE student_id = ${student_id}
	      RETURNING *;
	   `;
	};

	return {
		get: {
			get,
			getAll,
		},
		remove: removeByStudent,
		insert,
		update,
	};
};
