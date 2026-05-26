/** @format */

import { TutorFormValues } from "../validation/tutorForm/tutorFormSchema";
import { StudentTutorType } from "./student_tutor";

export type PendingTutorType = TutorFormValues & { tutor_id: number };

export const createPendingStudentTutorRepo = (sql: any, pool: any) => {
	const insert = (data: StudentTutorType, db: any = sql) => {
		return db`
         INSERT INTO pending_student_tutor (student_id, tutor_id, usual_duration, hourly_rate, subjects, markup, travel_fee, had_session)
         VALUES (${data.student_id}, ${data.tutor_id}, ${data.usual_duration}, ${data.hourly_rate}, ${data.subjects}, ${data.markup}, ${data.travel_fee}, ${data.had_session})
         RETURNING *;
      `;
	};

	const remove = (student_id: number, tutor_id: number, db: any = sql) => {
		return db`
         DELETE FROM pending_student_tutor
         WHERE student_id = ${student_id} AND tutor_id = ${tutor_id};
      `;
	};

	const removeByStudentId = (student_id: number, db: any = sql) => {
		return db`DELETE FROM pending_student_tutor WHERE student_id = ${student_id};`;
	};

	const removeByTutorId = (tutor_id: number, db: any = sql) => {
		return db`DELETE FROM pending_student_tutor WHERE tutor_id = ${tutor_id};`;
	};

	const get = async (student_id: number, tutor_id: number, db: any = sql) => {
		return db`SELECT * FROM pending_student_tutor WHERE student_id = ${student_id} AND tutor_id = ${tutor_id};`;
	};

	const getAll = async (db: any = sql) => {
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
