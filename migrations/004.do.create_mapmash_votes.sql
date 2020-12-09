CREATE TABLE votes (
  is_upvote BOOLEAN,
  mashes_id INTEGER REFERENCES mashes(id),
  users_id INTEGER REFERENCES users(id),
  UNIQUE(mashes_id, users_id)
);