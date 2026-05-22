/** @format */

export type BillingAccountType = {
	student_id: number;
	billing_id: number;
};

export const createStudentBillingRepo = (sql: any, pool: any) => {
	const get = async (student_id: number, db: any = sql) => {
		return db`SELECT * FROM student_billing WHERE student_id = ${student_id};`;
	};

	const getAll = async (db: any = sql) => {
		return db`SELECT * FROM student_billing ORDER BY student_id`;
	};

	const insert = (data: BillingAccountType, db: any = sql) => {
		return db`
	      INSERT INTO student_billing (student_id, billing_id)
	      VALUES (${data.student_id}, ${data.billing_id})
	      RETURNING *;
	   `;
	};

	const removeByStudent = (student_id: number, db: any = sql) => {
		return db`
	      DELETE FROM student_billing WHERE student_id = ${student_id};
	   `;
	};

	const update = (student_id: number, billing_id: number, db: any = sql) => {
		return db`
	      UPDATE student_billing
	      SET
	         billing_id = ${billing_id},
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
