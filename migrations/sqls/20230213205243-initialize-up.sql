/* Replace with your SQL commands */
-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id bigint NOT NULL,
    firstname character varying(256) COLLATE pg_catalog."default" NOT NULL,
    lastname character varying(256) COLLATE pg_catalog."default" NOT NULL,
    email character varying(256) COLLATE pg_catalog."default" NOT NULL,
    password character varying(256) COLLATE pg_catalog."default" NOT NULL,
    username character varying(256) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;