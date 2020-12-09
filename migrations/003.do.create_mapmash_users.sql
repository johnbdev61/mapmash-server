CREATE TABLE users (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  user_name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
);

alter table mashes
  ADD COLUMN
    author_id INTEGER REFERENCES users(id)
    ON DELETE SET NULL;