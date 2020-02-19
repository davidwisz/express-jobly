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
    company_handle text NOT NULL REFERENCES companies,
    date_posted timestamp with time zone
);
