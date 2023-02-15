/* Replace with your SQL commands */
-- Table: public.users

-- DROP TABLE IF EXISTS public.users;
DROP EXTENSION IF EXISTS citext cascade;
CREATE EXTENSION citext;
CREATE DOMAIN domain_email AS citext
CHECK(
   VALUE ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
);

CREATE TABLE IF NOT EXISTS public.users
(
    id serial PRIMARY KEY NOT NULL,
    firstname text NOT NULL,
    lastname text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    picture text,
    email citext NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);



ALTER TABLE IF EXISTS public.users
    OWNER to postgres;