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
    id SERIAL NOT NULL,
    firstname character varying(256) COLLATE pg_catalog."default" NOT NULL,
    lastname character varying(256) COLLATE pg_catalog."default" NOT NULL,
    email domain_email COLLATE pg_catalog."default" NOT NULL,
    username character varying(256) COLLATE pg_catalog."default" NOT NULL,
    password character varying(256) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;