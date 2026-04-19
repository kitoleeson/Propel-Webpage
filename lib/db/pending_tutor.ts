/** @format */

import { FormValues } from "../validation/tutorForm/tutorFormSchema";

export const createPendingTutorRepo = (sql: any, pool: any) => {
	const insert = (tutor_id: number, data: FormValues, db: any = sql) => {
		return db`
         INSERT INTO pending_tutors (
            tutor_id,
            gov_first_name, gov_last_name, pref_name, email, phone,
            date_hired, prior_experience, current_rate, accepting_students,
            emerg_contact_name, emerg_contact_phone, emerg_contact_relationship,
            availability, in_person, city, location,
            subjects_json,
            current_uni, current_degree, field_of_study, year_of_study, current_fav_class, academic_interests,
            bio, hobbies,
            high_school, high_school_city, fav_high_school_class, ap_ib_credentials
         ) VALUES (
            ${tutor_id},
            ${data.gov_first_name}, ${data.gov_last_name}, ${data.pref_name}, ${data.email}, ${data.phone},
            ${data.date_hired.toISOString().split("T")[0]}, ${data.prior_experience}, 
            ${data.current_rate}, ${data.accepting_students},
            ${data.emerg_contact_name}, ${data.emerg_contact_phone}, ${data.emerg_contact_relationship},
            ${data.availability}, ${data.in_person}, ${data.city}, ${data.location},
            ${JSON.stringify(data.subjects)},
            ${data.current_uni}, ${data.current_degree}, ${data.field_of_study}, 
            ${data.year_of_study}, ${data.current_fav_class}, ${data.academic_interests}, ${data.bio}, ${data.hobbies},
            ${data.high_school}, ${data.high_school_city}, ${data.fav_high_school_class}, ${data.ap_ib_credentials}
         ) RETURNING pending_tutor_id;
      `;
	};

	const removeById = (id: number, db: any = sql) => {
		return db`DELETE FROM pending_tutors WHERE pending_tutor_id = ${id}`;
	};

	const getById = (id: number, db: any = sql) => {
		return db`SELECT * FROM pending_tutors WHERE pending_tutor_id = ${id}`;
	};

	return { insert, removeById, getById };
};
