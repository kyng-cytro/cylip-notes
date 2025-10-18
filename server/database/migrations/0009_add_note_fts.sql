-- Custom SQL migration file, put your code below! --
CREATE VIRTUAL TABLE note_fts USING fts5(
  note_id UNINDEXED,
  user_id UNINDEXED,
  title,
  content,
  tokenize = 'porter'
);
