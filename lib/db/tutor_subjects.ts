/** @format */

import { DBTypes } from "./types";

export const createTutorSubjectsRepo = (sql: any, pool: any) => {
	const getSubjectsByTutor = async (tutor_id: number, db: any = sql) => {
		return db`SELECT subject FROM tutor_subjects WHERE tutor_id = ${tutor_id};`;
	};

	const getAllSubjects = async (db: any = sql) => {
		return db`SELECT DISTINCT subject FROM tutor_subjects ORDER BY subject;`;
	};

	const getTutorsBySubject = async (subject: string, db: any = sql) => {
		return db`SELECT tutor_id, specialty FROM tutor_subjects WHERE subject = ${subject} ORDER BY specialty;`;
	};

	// maybe in the future: order by number of given subjects taught DESC and specialty ASC
	const getTutorsByOneOfSubjects = async (subjects: string[], db: any = sql) => {
		return db`SELECT DISTINCT tutor_id FROM tutor_subjects WHERE subject = ANY(${subjects}) ORDER BY tutor_id;`;
	};

	const getTutorsByAllOfSubjects = async (subjects: string[], db: any = sql) => {
		return db`
			SELECT tutor_id, SUM(specialty) as specialty_score
			FROM tutor_subjects
			WHERE subject = ANY(${subjects})
			GROUP BY tutor_id
			HAVING COUNT(DISTINCT subject) = ${subjects.length}
			ORDER BY specialty_score, tutor_id;
		`;
	};

	const getAcceptingTutorsBySubject = async (subject: string, db: any = sql) => {
		return db`
			SELECT
				t.tutor_id,
				COALESCE(t.pref_name, t.gov_first_name) as display_name,
				t.availability,
				t.in_person,
				t.location,
				t.current_uni,
				t.current_degree,
				t.field_of_study,
				t.year_of_study,
				ts.specialty
			FROM tutor_subjects ts JOIN tutors t ON ts.tutor_id = t.tutor_id
			WHERE ts.subject = ${subject} AND t.accepting_students > 0
			ORDER BY specialty;
		`;
	};

	// maybe in the future: order by number of given subjects taught DESC and specialty ASC
	const getAcceptingTutorsByOneOfSubjects = async (subjects: string[], db: any = sql) => {
		return db`
         SELECT
            t.tutor_id,
				COALESCE(t.pref_name, t.gov_first_name) as display_name,
            t.availability,
            t.in_person,
            t.location,
            t.current_uni,
            t.current_degree,
				t.field_of_study,
            t.year_of_study
         FROM tutors t
         WHERE t.accepting_students > 0
         AND t.tutor_id IN (
            SELECT ts.tutor_id
            FROM tutor_subjects ts
            WHERE ts.subject = ANY(${subjects})
         )
         ORDER BY t.tutor_id;
      `;
	};

	const getAcceptingTutorsByAllOfSubjects = async (subjects: string[], db: any = sql) => {
		return db`
			SELECT
				t.tutor_id,
				COALESCE(t.pref_name, t.gov_first_name) as display_name,
				t.availability,
				t.in_person,
				t.location,
				t.subjects,
				t.current_uni,
				t.current_degree,
				t.field_of_study,
				t.year_of_study,
				ss.specialty_score
			FROM tutors t
			JOIN (
				SELECT tutor_id, SUM(specialty) as specialty_score
				FROM tutor_subjects
				WHERE subject = ANY(${subjects})
				GROUP BY tutor_id
				HAVING COUNT(DISTINCT subject) = ${subjects.length}
			) ss ON t.tutor_id = ss.tutor_id
			WHERE t.accepting_students > 0
			ORDER BY ss.specialty_score, t.tutor_id;
		`;
	};

	const getAll = async (db: any = sql) => {
		return db`SELECT * FROM tutor_subjects ORDER BY specialty, tutor_id, subject;`;
	};

	const insert = (data: DBTypes.TutorSubjects, db: any = sql) => {
		return db`
         INSERT INTO tutor_subjects (tutor_id, subject, specialty)
         VALUES (${data.tutor_id}, ${data.subject}, ${data.specialty})
         ON CONFLICT (tutor_id, subject) DO NOTHING
         RETURNING *;
      `;
	};

	const find = (data: DBTypes.TutorSubjects, db: any = sql) => {
		return db`
         SELECT *
			FROM tutor_subjects
         WHERE tutor_id = ${data.tutor_id} AND subject = ${data.subject};
      `;
	};

	const removeByTutor = (tutor_id: number, db: any = sql) => {
		return db`DELETE FROM tutor_subjects WHERE tutor_id = ${tutor_id} RETURNING *;`;
	};

	const update = async (tutor_id: number, subjects: string[], specialties: (0 | 1 | 2)[], db: any = sql) => {
		const client = await pool.connect();
		const tx = sql(client);
		try {
			await client.query("BEGIN");
			await removeByTutor(tutor_id);
			const result = await addSubjects(tutor_id, subjects, specialties, tx);
			await client.query("COMMIT");
			return result.rows;
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		} finally {
			client.release();
		}
	};

	const addSubjects = (tutor_id: number, subjects: string[], specialties: (0 | 1 | 2)[], db: any = sql) => {
		const tutor_ids = Array(subjects.length).fill(tutor_id);
		return db`
         INSERT INTO tutor_subjects (tutor_id, subject, specialty)
         SELECT * FROM UNNEST(${tutor_ids}::int[], ${subjects}::text[], ${specialties}::int[])
         ON CONFLICT (tutor_id, subject) DO NOTHING
         RETURNING *;
      `;
	};

	return {
		get: {
			getSubjectsByTutor,
			getAllSubjects,
			getTutorsBySubject,
			getTutorsByOneOfSubjects,
			getTutorsByAllOfSubjects,
			getAcceptingTutorsBySubject,
			getAcceptingTutorsByOneOfSubjects,
			getAcceptingTutorsByAllOfSubjects,
			getAll,
		},
		find,
		insert,
		removeByTutor,
		update,
		addSubjects,
	};
};
