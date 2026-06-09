/** @format */

import { DBTypes } from "./types";

export const createBillingAccountsRepo = (sql: any, pool: any) => {
	const get = async (billing_id: number, db: any = sql) => {
		return db`SELECT * FROM billing_accounts WHERE billing_id = ${billing_id};`;
	};

	const getByGuardianOwner = async (guardian_id: number, db: any = sql) => {
		return db`
         SELECT * FROM billing_accounts 
         WHERE guardian_id = ${guardian_id};
      `;
	};

	const getByStudentOwner = async (student_id: number, db: any = sql) => {
		return db`
         SELECT * FROM billing_accounts 
         WHERE student_id = ${student_id};
      `;
	};

	const getAll = async (db: any = sql) => {
		return db`SELECT * FROM billing_accounts ORDER BY billing_id`;
	};

	const getOwner = async (billing_id: number, db: any = sql) => {
		return db`
      SELECT 
         ba.billing_id,
         ba.display_name,
         ba.first_invoice,
         COALESCE(s.gov_first_name, g.gov_first_name) AS gov_first_name,
         COALESCE(s.gov_last_name, g.gov_last_name) AS gov_last_name,
         COALESCE(s.email, g.email) AS email,
         COALESCE(s.pref_communication, g.pref_communication) AS pref_communication,
         CASE 
            WHEN ba.student_id IS NOT NULL THEN 'student'
            ELSE 'guardian'
         END AS owner_type
      FROM billing_accounts ba
      LEFT JOIN students s ON ba.student_id = s.student_id
      LEFT JOIN guardians g ON ba.guardian_id = g.guardian_id
      WHERE ba.billing_id = ${billing_id}
   `;
	};

	const insert = (data: DBTypes.BillingAccounts, db: any = sql) => {
		return db`
	      INSERT INTO billing_accounts (display_name, email, first_invoice, student_id, guardian_id)
	      VALUES (${data.display_name}, ${data.email}, ${data.first_invoice}, ${data.student_id}, ${data.guardian_id})
	      RETURNING *;
	   `;
	};

	const removeById = (billing_id: number, db: any = sql) => {
		return db`
	      DELETE FROM billing_accounts WHERE billing_id = ${billing_id} RETURNING *;
	   `;
	};

	const update = (billing_id: number, data: { display_name: string; email: string }, db: any = sql) => {
		return db`
	      UPDATE billing_accounts
	      SET
	         display_name = ${data.display_name || null},
	         email = ${data.email}
	      WHERE billing_id = ${billing_id}
	      RETURNING *;
	   `;
	};

	const setFirstInvoice = (billing_id: number, set_to: boolean = false, db: any = sql) => {
		return db`
         UPDATE billing_accounts
         SET first_invoice = ${set_to}
         WHERE billing_id = ${billing_id}
         RETURNING *;
      `;
	};

	return {
		get: {
			get,
			getByGuardianOwner,
			getByStudentOwner,
			getOwner,
			getAll,
		},
		insert,
		remove: removeById,
		update,
		setFirstInvoice,
	};
};
