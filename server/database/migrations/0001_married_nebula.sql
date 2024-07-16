-- Custom SQL migration file, put you code below! --
CREATE TRIGGER notes_insert_trigger
AFTER INSERT ON notes
BEGIN
    INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
    VALUES (unixepoch(), 'notes', NEW.user_id, 'insert');
END;
--> statement-breakpoint
CREATE TRIGGER notes_update_trigger
AFTER UPDATE ON notes
BEGIN
    INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
    VALUES (unixepoch(), 'notes', NEW.user_id, 'update');
END;
--> statement-breakpoint
CREATE TRIGGER notes_delete_trigger
AFTER DELETE ON notes
BEGIN
    INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
    VALUES (unixepoch(), 'notes', OLD.user_id, 'delete');
END;
--> statement-breakpoint
CREATE TRIGGER labels_insert_trigger
AFTER INSERT ON labels
BEGIN
    INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
    VALUES (unixepoch(), 'labels', NEW.user_id, 'insert');
END;
--> statement-breakpoint
CREATE TRIGGER labels_update_trigger
AFTER UPDATE ON labels
BEGIN
    INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
    VALUES (unixepoch(), 'labels', NEW.user_id, 'update');
END;
--> statement-breakpoint
CREATE TRIGGER labels_delete_trigger
AFTER DELETE ON labels
BEGIN
    INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
    VALUES (unixepoch(), 'labels', OLD.user_id, 'delete');
END;
--> statement-breakpoint
CREATE TRIGGER user_update_trigger
AFTER UPDATE ON users
BEGIN
    INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
    VALUES (unixepoch(), 'users', NEW.id, 'update');
END;
