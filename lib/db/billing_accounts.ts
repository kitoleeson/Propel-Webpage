/** @format */

export type BillingAccountType = {
	type: "student" | "guardian";
	owner_id: number;
	display_name: string;
	email: string;
	first_invoice: boolean;
};

export const createBillingAccountsRepo = (sql: any, pool: any) => {
	const get = async (billing_id: number, db: any = sql) => {
		return db`SELECT * FROM billing_accounts WHERE billing_id = ${billing_id};`;
	};

	const getByOwner = async (type: "student" | "guardian", owner_id: number, db: any = sql) => {
		return db`SELECT * FROM billing_accounts WHERE owner_id = ${owner_id} AND type = ${type};`;
	};

	const getAll = async (db: any = sql) => {
		return db`SELECT * FROM billing_accounts ORDER BY billing_id`;
	};

	const getOwner = async (billing_id: number, db: any = sql) => {
		const client = await pool.connect();
		const tx = sql(client);
		try {
			await client.query("BEGIN");
			const response = await get(billing_id, tx);
			if (response.length === 0) throw new Error("Student-Guardian relationship does not exist");
			const billing_account = response.rows[0];

			return tx`
				SELECT *
            FROM ${billing_account.type + "s"}
            WHERE ${billing_account.type + "_id"} = ${billing_id};
			`;
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		} finally {
			client.release();
		}
	};

	const insert = (data: BillingAccountType, db: any = sql) => {
		return db`
	      INSERT INTO billing_accounts (type, owner_id, display_name, email, first_invoice)
	      VALUES (${data.type}, ${data.owner_id}, ${data.display_name}, ${data.email}, ${data.first_invoice})
	      RETURNING *;
	   `;
	};

	const removeById = (billing_id: number, db: any = sql) => {
		return db`
	      DELETE FROM billing_accounts WHERE billing_id = ${billing_id};
	   `;
	};

	const update = (billing_id: number, data: BillingAccountType, db: any = sql) => {
		return db`
	      UPDATE billing_accounts
	      SET
	         type = ${data.type},
	         owner_id = ${data.owner_id},
	         display_name = ${data.display_name || null},
	         email = ${data.email},
	         first_invoice = ${data.first_invoice},
	      WHERE billing_id = ${billing_id}
	      RETURNING *;
	   `;
	};

	const setFirstInvoice = (billing_id: number, set_to: boolean = true, db: any = sql) => {
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
			getByOwner,
			getOwner,
			getAll,
		},
		insert,
		remove: removeById,
		update,
		setFirstInvoice,
	};
};
