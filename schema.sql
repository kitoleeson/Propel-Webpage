-- schema.sql
BEGIN;

-- =========================
-- DROP TABLES
-- =========================

DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS student_billing;
DROP TABLE IF EXISTS billing_accounts;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS student_tutor;
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS student_guardian;
DROP TABLE IF EXISTS tutors;
DROP TABLE IF EXISTS guardians;
DROP TABLE IF EXISTS students;

-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;

COMMIT;

BEGIN;

-- =========================
-- CLIENTS
-- =========================

CREATE TABLE IF NOT EXISTS students (
    student_id SERIAL PRIMARY KEY,
    gov_first_name TEXT NOT NULL,
    gov_last_name TEXT NOT NULL,
    pref_name TEXT,
    grade TEXT,
    city TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    pref_communication TEXT NOT NULL
        CHECK (pref_communication IN ('email','text message')),
    how_found_us TEXT
        CHECK (how_found_us IN ('teacher', 'word of mouth', 'advertisement', 'web search', 'other'))
);

CREATE TABLE IF NOT EXISTS guardians (
    guardian_id SERIAL PRIMARY KEY,
    gov_first_name TEXT NOT NULL,
    gov_last_name TEXT NOT NULL,
    pref_name TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    pref_communication TEXT NOT NULL
        CHECK (pref_communication IN ('email','text message'))
);

CREATE TABLE IF NOT EXISTS student_guardian (
    student_id INTEGER NOT NULL REFERENCES students(student_id),
    guardian_id INTEGER NOT NULL REFERENCES guardians(guardian_id),
    relationship_type TEXT,
    is_primary_biller BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (student_id, guardian_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS one_primary_biller
ON student_guardian (student_id)
WHERE is_primary_biller;

-- =========================
-- TUTORS
-- =========================

CREATE TABLE IF NOT EXISTS tutors (
    tutor_id SERIAL PRIMARY KEY,
    gov_first_name TEXT NOT NULL,
    gov_last_name TEXT NOT NULL,
    pref_name TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    date_hired DATE NOT NULL,
    prior_experience INTEGER NOT NULL,
    current_rate NUMERIC(6, 2) NOT NULL,
    emerg_contact_name TEXT NOT NULL,
    emerg_contact_phone TEXT NOT NULL,
    emerg_contact_relationship TEXT,
    availability TEXT,
    subjects TEXT NOT NULL,
    current_uni TEXT,
    current_degree TEXT,
    year_of_study INTEGER,
    current_fav_class TEXT,
    bio TEXT,
    hobbies TEXT,
    academic_interests TEXT,
    ap_ib_credentials TEXT,
    high_school TEXT,
    fav_high_school_class TEXT
);

-- =========================
-- SESSIONS
-- =========================

CREATE TABLE IF NOT EXISTS student_tutor (
    assignment_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(student_id),
    tutor_id INTEGER NOT NULL REFERENCES tutors(tutor_id),
    usual_duration NUMERIC(4, 2) NOT NULL,
    hourly_rate NUMERIC(6, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    subjects TEXT NOT NULL,
    CHECK (end_date IS NULL OR end_date >= start_date),
    UNIQUE (student_id, tutor_id, start_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS one_active_assignment
ON student_tutor (student_id, tutor_id)
WHERE end_date IS NULL;

CREATE TABLE IF NOT EXISTS sessions (
    session_id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL REFERENCES student_tutor(assignment_id),
    session_date DATE NOT NULL,
    duration_hours NUMERIC(4, 2) NOT NULL CHECK (duration_hours > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS one_session_per_day
ON sessions (assignment_id, session_date);

-- =========================
-- BILLING
-- =========================

CREATE TABLE IF NOT EXISTS billing_accounts (
    billing_id SERIAL PRIMARY KEY,
    type TEXT NOT NULL
        CHECK (type IN ('guardian','student')),
    owner_id INTEGER NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    first_invoice BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS student_billing (
    student_id INTEGER NOT NULL REFERENCES students(student_id),
    billing_id INTEGER NOT NULL REFERENCES billing_accounts(billing_id),
    PRIMARY KEY (student_id)
);

-- =========================
-- INVOICING
-- =========================

CREATE TABLE IF NOT EXISTS invoices (
    invoice_id SERIAL PRIMARY KEY,
    billing_id INTEGER NOT NULL REFERENCES billing_accounts(billing_id),
    biweek_start DATE NOT NULL,
    date_sent DATE NOT NULL,
    total_hours NUMERIC(5, 2) NOT NULL CHECK (total_hours > 0),
    total_amount NUMERIC(8, 2) NOT NULL,
    UNIQUE (billing_id, biweek_start)
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    billing_id INTEGER NOT NULL REFERENCES billing_accounts(billing_id),
    invoice_id INTEGER NOT NULL REFERENCES invoices(invoice_id),
    amount NUMERIC(8, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('eTransfer', 'cash'))
);

-- =========================
-- PAYROLL
-- =========================

CREATE TABLE IF NOT EXISTS payroll (
    payroll_id SERIAL PRIMARY KEY,
    tutor_id INTEGER NOT NULL REFERENCES tutors(tutor_id),
    biweek_start DATE NOT NULL,
    total_hours NUMERIC(5, 2) NOT NULL CHECK (total_hours > 0),
    total_amount NUMERIC(8, 2) NOT NULL CHECK (total_amount > 0),
    date_paid DATE NOT NULL,
    UNIQUE (tutor_id, biweek_start)
);

COMMIT;

-- ADD UNIQUE CONSTRAINT BACK TO EMAIL AFTER TESTING
-- ALTER TABLE billing_accounts
-- ADD CONSTRAINT billing_accounts_email_key UNIQUE (email);