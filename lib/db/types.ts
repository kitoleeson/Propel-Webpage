/** @format */

import { SubjectFormValues } from "../validation/tutorForm/tutorFormSchema";

export namespace DBTypes {
	type CompleteRecord<T, K extends keyof T> = T & Required<Pick<T, K>>;

	export type BillingAccounts = {
		billing_id?: number;
		display_name: string;
		email: string;
		first_invoice: boolean;
		student_id?: number;
		guardian_id?: number;
	};
	export type BillingAccountsRow = CompleteRecord<BillingAccounts, "billing_id">;

	export type Guardians = {
		guardian_id?: number;
		gov_first_name: string;
		gov_last_name: string;
		pref_name?: string;
		email: string;
		phone?: string;
		pref_communication: "Email" | "Text Message";
	};
	export type GuardiansRow = CompleteRecord<Guardians, "guardian_id">;

	export type Invoices = {
		invoice_id?: number;
		billing_id: number;
		biweek_start: Date;
		date_sent: Date;
		total_hours: number;
		total_amount: number;
	};
	export type InvoicesRow = CompleteRecord<Invoices, "invoice_id">;

	export type Payments = {
		payment_id?: number;
		billing_id: number;
		invoice_id: number;
		amount: number;
		payment_date: Date;
		method: string;
	};
	export type PaymentsRow = CompleteRecord<Payments, "payment_id">;

	export type Payroll = {
		payroll_id?: number;
		biweek_start: Date;
		total_hours: number;
		total_amount: number;
		date_generated: Date;
	};
	export type PayrollRow = CompleteRecord<Payroll, "payroll_id">;

	export type PayrollEntries = {
		entry_id?: number;
		payroll_id: number;
		tutor_id: number;
		total_hours: number;
		total_amount: number;
	};
	export type PayrollEntriesRow = CompleteRecord<PayrollEntries, "entry_id">;

	export type PendingStudentTutor = {
		pending_student_tutor_id?: number;
		student_id: number;
		tutor_id: number;
		usual_duration: number;
		hourly_rate: number;
		subjects: string;
		markup: number;
		travel_fee: number;
		had_session: boolean;
	};
	export type PendingStudentTutorRow = CompleteRecord<PendingStudentTutor, "pending_student_tutor_id">;

	export type PendingTutors = {
		pending_tutor_id?: number;
		tutor_id: number;
		created_at: Date;
		gov_first_name: string;
		gov_last_name: string;
		pref_name?: string;
		email: string;
		phone: string;
		date_hired: Date;
		prior_experience: number;
		current_rate: number;
		accepting_students: number;
		emerg_contact_name: string;
		emerg_contact_phone: string;
		emerg_contact_relationship?: string;
		availability?: string;
		in_person: "In-Person Only" | "Online Only" | "Hybrid";
		city?: string;
		location?: string;
		subjects_json: SubjectFormValues;
		current_uni?: string;
		current_degree?: "Bachelor's Degree" | "Master's Degree" | "Associate's Degree" | "Doctorate" | "Vocational Certificate" | "Other";
		field_of_study?: string;
		year_of_study?: number;
		current_fav_class?: string;
		academic_interests?: string;
		bio?: string;
		hobbies?: string;
		high_school?: string;
		high_school_city?: string;
		fav_high_school_class?: string;
		ap_ib_credentials?: "AP Scholar" | "AP Scholar with Honours" | "AP Scholar with Distinction" | "IB Certificate" | "IB Diploma" | "N/A";
	};
	export type PendingTutorsRow = CompleteRecord<PendingTutors, "pending_tutor_id">;

	export type Sessions = {
		session_id?: number;
		assignment_id: number;
		session_date: Date;
		duration_hours: number;
		exam_prep: boolean;
		notes?: string;
	};
	export type SessionsRow = CompleteRecord<Sessions, "session_id">;

	export type StudentBilling = {
		student_id: number;
		billing_id: number;
	};
	export type StudentBillingRow = StudentBilling;

	export type StudentGuardian = {
		student_id: number;
		guardian_id: number;
		relationship_type: string;
		is_primary_biller: boolean;
	};
	export type StudentGuardianRow = StudentGuardian;

	export type StudentTutor = {
		assignment_id?: number;
		student_id: number;
		tutor_id: number;
		usual_duration: number;
		hourly_rate: number;
		subjects: string;
		markup: number;
		travel_fee: number;
		had_session: boolean;
	};
	export type StudentTutorRow = CompleteRecord<StudentTutor, "assignment_id">;

	export type Students = {
		student_id?: number;
		gov_first_name: string;
		gov_last_name: string;
		pref_name?: string;
		grade?: number;
		city: string;
		email?: string;
		phone?: string;
		pref_communication: "Email" | "Text Message";
		how_found_us?: string;
	};
	export type StudentsRow = CompleteRecord<Students, "student_id">;

	export type TutorSubjects = {
		tutor_subject_id?: number;
		tutor_id: number;
		subject: string;
		specialty: 0 | 1 | 2;
	};
	export type TutorSubjectsRow = CompleteRecord<TutorSubjects, "tutor_subject_id">;

	// ONCE TUTOR 6 FILLS OUT FORM, MAKE ALL DATABASE COLUMNS NOT NULLABLE
	export type Tutors = {
		tutor_id?: number;
		gov_first_name: string;
		gov_last_name: string;
		pref_name?: string;
		display_name?: string;
		email: string;
		phone: string;
		date_hired: Date;
		prior_experience: number;
		current_rate: number;
		accepting_students: number;
		emerg_contact_name: string;
		emerg_contact_phone: string;
		emerg_contact_relationship?: string;
		availability?: string;
		in_person: "In-Person Only" | "Online Only" | "Hybrid";
		city?: string;
		location?: string;
		subjects: string;
		current_uni?: string;
		current_degree?: "Bachelor's Degree" | "Master's Degree" | "Associate's Degree" | "Doctorate" | "Vocational Certificate" | "Other";
		field_of_study?: string;
		year_of_study?: number;
		current_fav_class?: string;
		academic_interests?: string;
		bio?: string;
		hobbies?: string;
		high_school?: string;
		high_school_city?: string;
		fav_high_school_class?: string;
		ap_ib_credentials?: "AP Scholar" | "AP Scholar with Honours" | "AP Scholar with Distinction" | "IB Certificate" | "IB Diploma" | "N/A";
	};
	export type TutorsRow = CompleteRecord<Tutors, "tutor_id">;

	export type OwnersRow = {
		billing_id: number;
		first_invoice: boolean;
		gov_first_name: string;
		gov_last_name: string;
		email: string;
		pref_communication: "Email" | "Text Message";
		owner_type: "student" | "guardian";
	};
}
