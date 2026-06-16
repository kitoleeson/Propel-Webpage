/** @format */

import { DBTypes } from "../dbtypes";

export const createPendingStudentTutorRepo = (sql: any, pool: any) => {
	const insert = (data: DBTypes.PendingStudentTutor, db: any = sql): Promise<DBTypes.PendingStudentTutorRow[]> => {
		return db`
         INSERT INTO pending_student_tutor (student_id, tutor_id, usual_duration, hourly_rate, subjects, markup, travel_fee, had_session)
         VALUES (${data.student_id}, ${data.tutor_id}, ${data.usual_duration}, ${data.hourly_rate}, ${data.subjects}, ${data.markup}, ${data.travel_fee}, ${data.had_session})
         RETURNING *;
      `;
	};

	const remove = (student_id: number, tutor_id: number, db: any = sql): Promise<DBTypes.PendingStudentTutorRow[]> => {
		return db`
         DELETE FROM pending_student_tutor
         WHERE student_id = ${student_id} AND tutor_id = ${tutor_id}
			RETURNING *;
      `;
	};

	const removeByStudentId = (student_id: number, db: any = sql): Promise<DBTypes.PendingStudentTutorRow[]> => {
		return db`DELETE FROM pending_student_tutor WHERE student_id = ${student_id} RETURNING *;`;
	};

	const removeByTutorId = (tutor_id: number, db: any = sql): Promise<DBTypes.PendingStudentTutorRow[]> => {
		return db`DELETE FROM pending_student_tutor WHERE tutor_id = ${tutor_id} RETURNING *;`;
	};

	const get = async (student_id: number, tutor_id: number, db: any = sql): Promise<DBTypes.PendingStudentTutorRow[]> => {
		return db`SELECT * FROM pending_student_tutor WHERE student_id = ${student_id} AND tutor_id = ${tutor_id};`;
	};

	const getAll = async (db: any = sql): Promise<DBTypes.PendingStudentTutorRow[]> => {
		return db`SELECT * FROM pending_student_tutor ORDER BY student_id, tutor_id;`;
	};

	return {
		insert,
		remove: {
			remove,
			byStudentId: removeByStudentId,
			byTutorId: removeByTutorId,
		},
		get: { get, getAll },
	};
};
