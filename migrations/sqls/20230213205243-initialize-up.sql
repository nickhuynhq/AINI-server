/* Replace with your SQL commands */
-- Table: public.users

-- DROP TABLE IF EXISTS public.users;
DROP EXTENSION IF EXISTS citext cascade;
CREATE EXTENSION citext;
CREATE DOMAIN domain_email AS citext
CHECK(
   VALUE ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
);

-- Users: Main table of the database that contains the information of the users registered in our application. The data that will be stored in this table will be the name
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

-- Posts: Database table with all the posts from all the users. Each post will contain the title, description, and the main content of the post.
CREATE TABLE IF NOT EXISTS public.posts
(
    id serial PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    picture TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT (NOW()),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS public.posts_likes_users (
    created_at timestamp NOT NULL DEFAULT (NOW()),
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

ALTER TABLE IF EXISTS public.posts
    OWNER to postgres;

ALTER TABLE IF EXISTS public.posts_likes_users
    OWNER to postgres;