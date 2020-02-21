DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;


CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees integer,
    description text,
    logo_url text
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary FLOAT,
    equity FLOAT(1) NOT NULL CHECK (equity >= 0),
    company_handle text NOT NULL REFERENCES companies ON DELETE CASCADE,
    date_posted timestamp with time zone
);

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    photo_url text,
    is_admin BOOLEAN NOT NULL DEFAULT 'false'
);
