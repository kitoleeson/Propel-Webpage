/** @format */

import { DBTypes } from "../dbtypes";

export const createStudentTutorRepo = (sql: any, pool: any) => {
	const get = async (student_id: number, tutor_id: number, db: any = sql): Promise<DBTypes.StudentTutorRow[]> => {
		return db`SELECT * FROM student_tutor WHERE student_id = ${student_id} AND tutor_id = ${tutor_id};`;
	};

	const getAll = async (db: any = sql): Promise<DBTypes.StudentTutorRow[]> => {
		return db`SELECT * FROM student_tutor ORDER BY student_id ASC, tutor_id ASC;`;
	};

	const getStudents = async (tutor_id: number, db: any = sql): Promise<DBTypes.StudentsRow[]> => {
		return db`
         SELECT s.*
         FROM students s
         JOIN student_tutor st ON s.student_id = st.student_id
         WHERE st.tutor_id = ${tutor_id};
      `;
	};

	const getTutors = async (student_id: number, db: any = sql): Promise<DBTypes.TutorsRow[]> => {
		return db`
         SELECT t.*
         FROM tutors t
         JOIN student_tutor st ON t.tutor_id = st.tutor_id
         WHERE st.student_id = ${student_id};
      `;
	};

	const insert = (data: DBTypes.StudentTutor, db: any = sql): Promise<DBTypes.StudentTutorRow[]> => {
		return db`
         INSERT INTO student_tutor (student_id, tutor_id, usual_duration, hourly_rate, subjects, markup, travel_fee, had_session)
         VALUES (${data.student_id}, ${data.tutor_id}, ${data.usual_duration}, ${data.hourly_rate}, ${data.subjects}, ${data.markup}, ${data.travel_fee}, ${data.had_session})
         RETURNING *;
      `;
	};

	const remove = (student_id: number, tutor_id: number, db: any = sql): Promise<DBTypes.StudentTutorRow[]> => {
		return db`
         DELETE FROM student_tutor
         WHERE student_id = ${student_id} AND tutor_id = ${tutor_id}
			RETURNING *;
      `;
	};

	const removeByStudentId = (student_id: number, db: any = sql): Promise<DBTypes.StudentTutorRow[]> => {
		return db`DELETE FROM student_tutor WHERE student_id = ${student_id} RETURNING *;`;
	};

	const removeByTutorId = (tutor_id: number, db: any = sql): Promise<DBTypes.StudentTutorRow[]> => {
		return db`DELETE FROM student_tutor WHERE tutor_id = ${tutor_id} RETURNING *;`;
	};

	// IMPLEMENT LATER: maybe do remove by emails rather than names, since multiple people can have the same name but not the same email
	const removeByStudentName = (gov_first_name: string, gov_last_name: string, db: any = sql): Promise<DBTypes.StudentTutorRow[]> => {
		return db`
         DELETE FROM student_tutor st
         USING students s WHERE st.student_id = s.student_id
         AND s.gov_first_name = ${gov_first_name} AND s.gov_last_name = ${gov_last_name}
			RETURNING *;
      `;
	};

	const removeByTutorName = (gov_first_name: string, gov_last_name: string, db: any = sql): Promise<DBTypes.StudentTutorRow[]> => {
		return db`
         DELETE FROM student_tutor st
         USING tutors t WHERE st.tutor_id = t.tutor_id
         AND t.gov_first_name = ${gov_first_name} AND t.gov_last_name = ${gov_last_name}
			RETURNING *;
      `;
	};

	const update = (data: DBTypes.StudentTutor, db: any = sql): Promise<DBTypes.StudentTutorRow[]> => {
		return db`
         UPDATE student_tutor
         SET
            usual_duration = ${data.usual_duration},
            hourly_rate = ${data.hourly_rate},
            subjects = ${data.subjects},
            markup = ${data.markup},
            travel_fee = ${data.travel_fee},
            had_session = ${data.had_session}
         WHERE student_id = ${data.student_id} AND tutor_id = ${data.tutor_id}
         RETURNING *;
      `;
	};

	const setHadSession = (student_id: number, tutor_id: number, set_to: boolean = true, db: any = sql): Promise<DBTypes.StudentTutorRow[]> => {
		return db`
         UPDATE student_tutor
         SET had_session = ${set_to}
         WHERE student_id = ${student_id} AND tutor_id = ${tutor_id}
         RETURNING *;
      `;
	};

	return {
		get: {
			get,
			getAll,
			getStudents,
			getTutors,
		},
		insert,
		remove: {
			remove: remove,
			byStudentId: removeByStudentId,
			byTutorId: removeByTutorId,
			byStudentName: removeByStudentName,
			byTutorName: removeByTutorName,
		},
		update,
		setHadSession,
	};
};
