/** @format */

import { FormValues, subjectSchema } from "../validation/tutorForm/tutorFormSchema";
import { z } from "zod";

type tutorType = Omit<FormValues, "subjects"> & {
	subjects: string;
};

const parse1030 = (subject: string, courses: string[]) => {
	switch (courses.length) {
		case 1:
			return courses[0].replace(" (AP)", "");
		case 2:
			if (courses.some((c) => c.includes("10"))) return courses.some((c) => c.includes("20")) ? `${subject} 10-20` : `${subject} 10 & 30`;
			else return `${subject} 20-30`;
		case 3:
			return `${subject} 10-30`;
		default:
			return "";
	}
};

const parse2030 = (subject: string, courses: string[]) => {
	switch (courses.length) {
		case 1:
			return courses[0].replace(" (AP)", "");
		case 2:
			return `${subject} 20-30`;
		default:
			return "";
	}
};

const parsePhysics = (courses: string[]) => {
	switch (courses.length) {
		case 1:
			return courses[0].replace(" (AP)", "");
		case 2:
			if (courses.some((c) => c.includes("20"))) return courses.some((c) => c.includes("30")) ? `Physics 20-30` : `Physics 20 & C`;
			else return `Physics 30 & C`;
		case 3:
			return `Physics 20-30 & C`;
		default:
			return "";
	}
};

const parseAdvancedMath = (courses: string[]) => {
	switch (courses.length) {
		case 1:
			return courses[0].replace(" (AP)", "");
		case 2:
			if (courses.some((c) => c.includes("31"))) return courses.some((c) => c.includes("Math 35")) ? `Math 31 & 35` : `Math 31 & Stats 35`;
			else return `Math 35 & Stats 35`;
		case 3:
			return "Math 31-35 & Stats 35";
		default:
			return "";
	}
};

export const parseSubjects = (subjects: z.infer<typeof subjectSchema>) => {
	const subjectArray: string[] = [];

	subjectArray.push(parse1030("Math", subjects.math));
	subjectArray.push(parseAdvancedMath(subjects.advanced_math));
	subjectArray.push(parse1030("Science", subjects.science));
	subjectArray.push(parsePhysics(subjects.physics));
	subjectArray.push(parse2030("Chemistry", subjects.chemistry));
	subjectArray.push(parse2030("Biology", subjects.biology));
	subjectArray.push(parse1030("Computer Science", subjects.computer_science));
	subjectArray.push(parse1030("Social Studies", subjects.social_studies));
	subjectArray.push(parse1030("English", subjects.english));
	subjects.languages.forEach((l) => subjectArray.push(l));

	return subjectArray.filter(Boolean).join(", ");
};

export const createTutorRepo = (sql: any, pool: any) => {
	const find = async (gov_first_name: string, gov_last_name: string, db: any = sql) => {
		const result = await db`
         SELECT tutor_id
         FROM tutors
         WHERE gov_first_name = ${gov_first_name} AND gov_last_name = ${gov_last_name};
      `;
		return result.rows[0]?.tutor_id ?? null;
	};

	const insert = (data: tutorType, db: any = sql) => {
		return db`
         INSERT INTO tutors (
            gov_first_name, gov_last_name, pref_name, email, phone,
            date_hired, prior_experience, current_rate, accepting_students,
            emerg_contact_name, emerg_contact_phone, emerg_contact_relationship,
            availability, in_person, city, location,
            subjects,
            current_uni, current_degree, field_of_study, year_of_study, current_fav_class, academic_interests,
            bio, hobbies,
            high_school, high_school_city, fav_high_school_class, ap_ib_credentials
         )
         VALUES (
            ${data.gov_first_name}, ${data.gov_last_name}, ${data.pref_name || null}, ${data.email}, ${data.phone},
            ${data.date_hired.toISOString().split("T")[0]}, ${data.prior_experience}, ${data.current_rate}, ${data.accepting_students},
            ${data.emerg_contact_name}, ${data.emerg_contact_phone}, ${data.emerg_contact_relationship || null},
            ${data.availability || null}, ${data.in_person}, ${data.city || null}, ${data.location || null},
            ${data.subjects},
            ${data.current_uni || null}, ${data.current_degree || null}, ${data.field_of_study || null}, ${data.year_of_study || null}, ${data.current_fav_class || null}, ${data.academic_interests || null},
            ${data.bio || null}, ${data.hobbies || null},
            ${data.high_school || null}, ${data.high_school_city || null}, ${data.fav_high_school_class || null}, ${data.ap_ib_credentials || null}
         )
         RETURNING *;
      `;
	};

	const insertWithSubjects = async (data: FormValues, db: any = sql) => {
		const flattened = Object.values(data.subjects).flat();
		const parsedTutor: tutorType = {
			...data,
			subjects: parseSubjects(data.subjects),
		};
		const client = await pool.connect();
		const tx = sql(client);
		try {
			await client.query("BEGIN");
			const result = await insert(parsedTutor, tx);
			if (flattened.length > 0) await addSubjects(result.rows[0].tutor_id, flattened, tx);
			await client.query("COMMIT");
			return result.rows;
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		} finally {
			client.release();
		}
	};

	const removeById = (id: number, db: any = sql) => {
		return db`
         DELETE FROM tutors WHERE tutor_id = ${id};
      `;
	};

	const removeByName = (gov_first_name: string, gov_last_name: string, db: any = sql) => {
		return db`
         DELETE FROM tutors
         WHERE gov_first_name = ${gov_first_name} AND gov_last_name = ${gov_last_name};
      `;
	};

	const update = (id: number, data: tutorType, db: any = sql) => {
		return db`
         UPDATE tutors
         SET
            gov_first_name = ${data.gov_first_name},
            gov_last_name = ${data.gov_last_name},
            pref_name = ${data.pref_name || null},
            email = ${data.email},
            phone = ${data.phone},

            date_hired = ${data.date_hired.toISOString().split("T")[0]},
            prior_experience = ${data.prior_experience},
            current_rate = ${data.current_rate},
            accepting_students = ${data.accepting_students},

            emerg_contact_name = ${data.emerg_contact_name},
            emerg_contact_phone = ${data.emerg_contact_phone},
            emerg_contact_relationship = ${data.emerg_contact_relationship || null},

            availability = ${data.availability || null},
            in_person = ${data.in_person},
            city = ${data.city || null},
            location = ${data.location || null},

            subjects = ${data.subjects},

            current_uni = ${data.current_uni || null},
            current_degree = ${data.current_degree || null},
            field_of_study = ${data.field_of_study || null},
            year_of_study = ${data.year_of_study || null},
            current_fav_class = ${data.current_fav_class || null},
            academic_interests = ${data.academic_interests || null},

            bio = ${data.bio || null},
            hobbies = ${data.hobbies || null},

            high_school = ${data.high_school || null},
            high_school_city = ${data.high_school_city || null},
            fav_high_school_class = ${data.fav_high_school_class || null},
            ap_ib_credentials = ${data.ap_ib_credentials || null}
         WHERE tutor_id = ${id}
         RETURNING *;
      `;
	};

	const addSubject = (id: number, subject: string, db: any = sql) => {
		return db`
         INSERT INTO tutor_subjects (tutor_id, subject)
         VALUES (${id}, ${subject})
         ON CONFLICT (tutor_id, subject) DO NOTHING
         RETURNING *;
      `;
	};

	const addSubjects = (id: number, subjects: string[], db: any = sql) => {
		if (!subjects.length) return;
		const ids = Array(subjects.length).fill(id);
		return db`
         INSERT INTO tutor_subjects (tutor_id, subject)
         SELECT * FROM UNNEST(${ids}::int[], ${subjects}::text[])
         ON CONFLICT (tutor_id, subject) DO NOTHING;
      `;
	};

	const deleteSubjects = (id: number, db: any = sql) => {
		return db`
         DELETE FROM tutor_subjects
         WHERE tutor_id = ${id};
      `;
	};

	const updateWithSubjects = async (data: FormValues, db: any = sql) => {
		const flattened = Object.values(data.subjects).flat();
		const parsedTutor: tutorType = {
			...data,
			subjects: parseSubjects(data.subjects),
		};
		const client = await pool.connect();
		const tx = sql(client);
		try {
			await client.query("BEGIN");
			const id = await find(data.gov_first_name, data.gov_last_name, tx);
			if (!id) throw new Error("Tutor not found");
			const result = await update(id, parsedTutor, tx);
			await deleteSubjects(id, tx);
			await addSubjects(id, flattened, tx);
			await client.query("COMMIT");
			return result.rows;
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		} finally {
			client.release();
		}
	};

	return {
		find,
		insert,
		insertWithSubjects,
		remove: {
			byId: removeById,
			byName: removeByName,
		},
		update,
		updateWithSubjects,
		addSubject,
		addSubjects,
	};
};
