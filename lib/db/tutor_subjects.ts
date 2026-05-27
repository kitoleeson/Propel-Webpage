/** @format */

export type TutorSubjectsType = {
	tutor_id: number;
	subject: string;
};

export const createTutorSubjectsRepo = (sql: any, pool: any) => {
	const getSubjects = async (tutor_id: number, db: any = sql) => {
		return db`SELECT subject FROM tutor_subjects WHERE tutor_id = ${tutor_id};`;
	};

	const getTutors = async (subject: string, db: any = sql) => {
		return db`SELECT tutor_id FROM tutor_subjects WHERE subject = ${subject};`;
	};

	const getAcceptingTutors = async (subject: string, db: any = sql) => {
		return db`
			SELECT
				t.tutor_id,
				t.gov_first_name,
				t.gov_last_name,
				t.pref_name,
				t.availability,
				t.in_person,
				t.location,
				t.current_uni,
				t.current_degree,
				t.year_of_study,
				t.accepting_students
			FROM tutor_subjects ts JOIN tutors t ON ts.tutor_id = t.tutor_id
			WHERE ts.subject = ${subject} AND t.accepting_students > 0;
		`;
	};

	const getAll = async (db: any = sql) => {
		return db`SELECT * FROM tutor_subjects ORDER BY tutor_id, subject;`;
	};

	const insert = (data: TutorSubjectsType, db: any = sql) => {
		return db`
         INSERT INTO tutor_subjects (tutor_id, subject)
         VALUES (${data.tutor_id}, ${data.subject})
         ON CONFLICT (tutor_id, subject) DO NOTHING
         RETURNING *;
      `;
	};

	const find = (data: TutorSubjectsType, db: any = sql) => {
		return db`
         SELECT *
			FROM tutor_subjects
         WHERE tutor_id = ${data.tutor_id} AND subject = ${data.subject};
      `;
	};

	const removeByTutor = (tutor_id: number, db: any = sql) => {
		return db`DELETE FROM tutor_subjects WHERE tutor_id = ${tutor_id} RETURNING *;`;
	};

	const update = async (tutor_id: number, subjects: string[], db: any = sql) => {
		const client = await pool.connect();
		const tx = sql(client);
		try {
			await client.query("BEGIN");
			await removeByTutor(tutor_id);
			const result = await addSubjects(tutor_id, subjects, tx);
			await client.query("COMMIT");
			return result.rows;
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		} finally {
			client.release();
		}
	};

	const addSubjects = (tutor_id: number, subjects: string[], db: any = sql) => {
		const tutor_ids = Array(subjects.length).fill(tutor_id);
		return db`
         INSERT INTO tutor_subjects (tutor_id, subject)
         SELECT * FROM UNNEST(${tutor_ids}::int[], ${subjects}::text[])
         ON CONFLICT (tutor_id, subject) DO NOTHING
         RETURNING *;
      `;
	};

	return {
		get: {
			getSubjects,
			getTutors,
			getAcceptingTutors,
			getAll,
		},
		find,
		insert,
		removeByTutor,
		update,
		addSubjects,
	};
};
