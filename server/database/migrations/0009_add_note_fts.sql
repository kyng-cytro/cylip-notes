-- Custom SQL migration file, put your code below! --
CREATE VIRTUAL TABLE note_fts USING fts5(
  note_id UNINDEXED,
  user_id UNINDEXED,
  title,
  content,
  tokenize = 'porter'
);

CREATE TRIGGER IF NOT EXISTS note_fts_delete_trigger
AFTER DELETE ON notes
BEGIN
    DELETE FROM note_fts WHERE note_id = OLD.id;
END;
