ALTER TABLE notes ADD COLUMN global_order integer NOT NULL DEFAULT 0;
ALTER TABLE notes ADD COLUMN label_order integer;

UPDATE notes
SET global_order = created_at;

UPDATE notes
SET label_order = created_at
WHERE label_id IS NOT NULL;
