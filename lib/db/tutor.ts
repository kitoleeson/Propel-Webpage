/** @format */

import { TutorFormValues } from "../validation/tutorForm/tutorFormSchema";
import parseSubjects from "./subjects";

// export type TutorType = Omit<TutorFormValues, "subjects"> & {
// 	tutor_id?: number;
// 	display_name?: string;
// 	subjects: string;
// };

export type TutorType = {
	tutor_id?: number;

	gov_first_name: TutorFormValues["gov_first_name"];
	gov_last_name: TutorFormValues["gov_last_name"];
	pref_name?: TutorFormValues["pref_name"];
	display_name?: string;
	email: TutorFormValues["email"];
	phone: TutorFormValues["phone"];

	date_hired: TutorFormValues["date_hired"];
	prior_experience: NonNullable<TutorFormValues["prior_experience"]>;
	current_rate: NonNullable<TutorFormValues["current_rate"]>;
	accepting_students: NonNullable<TutorFormValues["accepting_students"]>;

	emerg_contact_name: TutorFormValues["emerg_contact_name"];
	emerg_contact_phone: TutorFormValues["emerg_contact_phone"];
	emerg_contact_relationship: TutorFormValues["emerg_contact_relationship"];

	availability: TutorFormValues["availability"];
	in_person: NonNullable<TutorFormValues["in_person"]>;
	city: TutorFormValues["city"];
	location?: TutorFormValues["location"];

	subjects: string;

	current_uni: TutorFormValues["current_uni"];
	current_degree: NonNullable<TutorFormValues["current_degree"]>;
	field_of_study: TutorFormValues["field_of_study"];
	year_of_study: NonNullable<TutorFormValues["year_of_study"]>;
	current_fav_class: TutorFormValues["current_fav_class"];
	academic_interests: TutorFormValues["academic_interests"];

	bio: TutorFormValues["bio"];
	hobbies: TutorFormValues["hobbies"];

	high_school: TutorFormValues["high_school"];
	high_school_city: TutorFormValues["high_school_city"];
	fav_high_school_class: TutorFormValues["fav_high_school_class"];
	ap_ib_credentials: NonNullable<TutorFormValues["ap_ib_credentials"]>;
};

export const createTutorRepo = (sql: any, pool: any) => {
	const get = async (id: number, db: any = sql) => {
		return db`SELECT * FROM tutors WHERE tutor_id = ${id};`;
	};

	const getAll = async (db: any = sql) => {
		return db`
			SELECT *, COALESCE(pref_name, gov_first_name) as display_name
			FROM tutors
			WHERE availability IS NOT NULL
			ORDER BY accepting_students DESC, gov_last_name ASC, gov_first_name ASC;`;
	};

	const find = async (gov_first_name: string, gov_last_name: string, db: any = sql) => {
		const result = await db`
         SELECT tutor_id
         FROM tutors
         WHERE gov_first_name ILIKE ${gov_first_name} AND gov_last_name ILIKE ${gov_last_name};
      `;
		return result.rows[0]?.tutor_id ?? null;
	};

	const insert = (data: TutorType, db: any = sql) => {
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

	const insertWithSubjects = async (data: TutorFormValues, db: any = sql) => {
		const flattened = Object.values(data.subjects).flat();
		const parsedTutor: TutorType = {
			...data,
			subjects: parseSubjects(data.subjects),
		} as TutorType;
		const client = await pool.connect();
		const tx = sql(client);
		try {
			await client.query("BEGIN");
			const result = await insert(parsedTutor, tx);
			if (flattened.length > 0) await addSubjects(result.rows[0].tutor_id, flattened, tx);
			await client.query("COMMIT");
			return result;
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		} finally {
			client.release();
		}
	};

	const removeById = (tutor_id: number, db: any = sql) => {
		return db`
         DELETE FROM tutors WHERE tutor_id = ${tutor_id};
      `;
	};

	const removeByName = (gov_first_name: string, gov_last_name: string, db: any = sql) => {
		return db`
         DELETE FROM tutors
         WHERE gov_first_name = ${gov_first_name} AND gov_last_name = ${gov_last_name};
      `;
	};

	const update = (tutor_id: number, data: TutorType, db: any = sql) => {
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
         WHERE tutor_id = ${tutor_id}
         RETURNING *;
      `;
	};

	const addSubjects = (tutor_id: number, subjects: string[], db: any = sql) => {
		const ids = Array(subjects.length).fill(tutor_id);
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

	const updateWithSubjects = async (data: TutorFormValues, db: any = sql) => {
		const flattened = Object.values(data.subjects).flat();
		const parsedTutor: TutorType = {
			...data,
			subjects: parseSubjects(data.subjects),
		} as TutorType;
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
			return result;
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		} finally {
			client.release();
		}
	};

	return {
		get: {
			get,
			getAll,
		},
		find,
		insert: {
			insert,
			insertWithSubjects,
		},
		remove: {
			byId: removeById,
			byName: removeByName,
		},
		update: {
			update,
			updateWithSubjects,
		},
	};
};
