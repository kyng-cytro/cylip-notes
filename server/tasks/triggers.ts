export default defineTask({
  meta: {
    name: "db:trigger",
    description: "Seed db with required triggers",
  },
  async run() {
    console.log("Running trigger seed task");
    try {
      await useDrizzle().run(
        `
          CREATE TRIGGER IF NOT EXISTS notes_insert_trigger
          AFTER INSERT ON notes
          BEGIN
              INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
              VALUES (unixepoch(), 'notes', NEW.user_id, 'insert');
          END;

          CREATE TRIGGER IF NOT EXISTS notes_update_trigger
          AFTER UPDATE ON notes
          BEGIN
              INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
              VALUES (unixepoch(), 'notes', NEW.user_id, 'update');
          END;

          CREATE TRIGGER IF NOT EXISTS notes_delete_trigger
          AFTER DELETE ON notes
          BEGIN
              INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
              VALUES (unixepoch(), 'notes', OLD.user_id, 'delete');
          END;

          CREATE TRIGGER IF NOT EXISTS labels_insert_trigger
          AFTER INSERT ON labels
          BEGIN
              INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
              VALUES (unixepoch(), 'labels', NEW.user_id, 'insert');
          END;

          CREATE TRIGGER IF NOT EXISTS labels_update_trigger
          AFTER UPDATE ON labels
          BEGIN
              INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
              VALUES (unixepoch(), 'labels', NEW.user_id, 'update');
          END;

          CREATE TRIGGER IF NOT EXISTS labels_delete_trigger
          AFTER DELETE ON labels
          BEGIN
              INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
              VALUES (unixepoch(), 'labels', OLD.user_id, 'delete');
          END;

          CREATE TRIGGER IF NOT EXISTS user_update_trigger
          AFTER UPDATE ON users
          BEGIN
              INSERT OR REPLACE INTO change_logs (id, table_name, user_id, operation)
              VALUES (unixepoch(), 'users', NEW.id, 'update');
          END;
      `,
      );
      return { result: "success" };
    } catch (err) {
      console.log(err);
      return { result: `Failed ${err}` };
    }
  },
});
