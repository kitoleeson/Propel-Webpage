/** @format */

type StudentGuardianType = {
	student_id: number;
	guardian_id: number;
	relationship_type: string;
	is_primary_biller: boolean;
};

export const createGuardianRepo = (sql: any, pool: any) => {
	const get = async (student_id: number, guardian_id: number, db: any = sql) => {
		return db`SELECT * FROM student_guardian WHERE student_id = ${student_id} AND guardian_id = ${guardian_id};`;
	};

	const getAll = async (db: any = sql) => {
		return db`SELECT * FROM student_guardian ORDER BY student_id`;
	};

	const getStudents = async (guardian_id: number, db: any = sql) => {
		return db`
         SELECT s.*
         FROM students s
         JOIN student_guardian sg ON s.student_id = sg.student_id
         WHERE sg.guardian_id = ${guardian_id};
      `;
	};

	const insert = (data: StudentGuardianType, db: any = sql) => {
		return db`
         INSERT INTO student_guardian (student_id, guardian_id, relationship_type, is_primary_biller)
         VALUES (${data.student_id}, ${data.guardian_id}, ${data.relationship_type}, ${data.is_primary_biller})
         RETURNING *;
      `;
	};

	const removeByStudentId = (student_id: number, db: any = sql) => {
		return db`
         DELETE FROM student_guardian WHERE student_id = ${student_id};
      `;
	};

	const removeByGuardianId = (guardian_id: number, db: any = sql) => {
		return db`
         DELETE FROM student_guardian WHERE guardian_id = ${guardian_id};
      `;
	};

	const removeByStudentName = (gov_first_name: string, gov_last_name: string, db: any = sql) => {
		return db`
         DELETE FROM student_guardian sg
         JOIN students s ON sg.student_id = s.student_id
         WHERE s.gov_first_name = ${gov_first_name} AND s.gov_last_name = ${gov_last_name};
      `;
	};

	const removeByGuardianName = (gov_first_name: string, gov_last_name: string, db: any = sql) => {
		return db`
         DELETE FROM student_guardian sg
         JOIN guardians g ON sg.guardian_id = g.guardian_id
         WHERE g.gov_first_name = ${gov_first_name} AND g.gov_last_name = ${gov_last_name};
      `;
	};

	const update = (student_id: number, guardian_id: number, data: StudentGuardianType, db: any = sql) => {
		return db`
         UPDATE student_guardian
         SET
            student_id = ${data.student_id},
            guardian_id = ${data.guardian_id},
            relationship_type = ${data.relationship_type},
            is_primary_biller = ${data.is_primary_biller}
         WHERE student_id = ${student_id} AND guardian_id = ${guardian_id}
         RETURNING *;
      `;
	};

	const setPrimaryBiller = (student_id: number, guardian_id: number, db: any = sql) => {
		return db`
         UPDATE student_guardian
         SET is_primary_biller = (guardian_id = ${guardian_id})
         WHERE student_id = ${student_id}
         AND EXISTS (
            SELECT 1 FROM student_guardian WHERE student_id = ${student_id} AND guardian_id = ${guardian_id}
         );
      `;
	};

	return {
		get: {
			get,
			getAll,
			getStudents,
		},
		insert,
		remove: {
			byStudentId: removeByStudentId,
			byGuardianId: removeByGuardianId,
			byStudentName: removeByStudentName,
			byGuardianName: removeByGuardianName,
		},
		update,
		setPrimaryBiller,
	};
};
