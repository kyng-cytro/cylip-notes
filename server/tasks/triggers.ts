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
          DROP TRIGGER IF EXISTS notes_insert_trigger;
          DROP TRIGGER IF EXISTS notes_update_trigger;
          DROP TRIGGER IF EXISTS notes_delete_trigger;
          DROP TRIGGER IF EXISTS labels_insert_trigger;
          DROP TRIGGER IF EXISTS labels_update_trigger;
          DROP TRIGGER IF EXISTS labels_delete_trigger;
          DROP TRIGGER IF EXISTS user_update_trigger;

          CREATE TRIGGER IF NOT EXISTS notes_insert_trigger
          AFTER INSERT ON notes
          BEGIN
              INSERT INTO change_logs (id, table_name, user_id, operation)
              VALUES (
                strftime('%Y%m%d%H%M%f', 'now') || '-' || lower(hex(randomblob(4))),
                'notes',
                NEW.user_id,
                'insert'
              );
          END;

          CREATE TRIGGER IF NOT EXISTS notes_update_trigger
          AFTER UPDATE ON notes
          BEGIN
              INSERT INTO change_logs (id, table_name, user_id, operation)
              VALUES (
                strftime('%Y%m%d%H%M%f', 'now') || '-' || lower(hex(randomblob(4))),
                'notes',
                NEW.user_id,
                'update'
              );
          END;

          CREATE TRIGGER IF NOT EXISTS notes_delete_trigger
          AFTER DELETE ON notes
          BEGIN
              INSERT INTO change_logs (id, table_name, user_id, operation)
              VALUES (
                strftime('%Y%m%d%H%M%f', 'now') || '-' || lower(hex(randomblob(4))),
                'notes',
                OLD.user_id,
                'delete'
              );
          END;

          CREATE TRIGGER IF NOT EXISTS labels_insert_trigger
          AFTER INSERT ON labels
          BEGIN
              INSERT INTO change_logs (id, table_name, user_id, operation)
              VALUES (
                strftime('%Y%m%d%H%M%f', 'now') || '-' || lower(hex(randomblob(4))),
                'labels',
                NEW.user_id,
                'insert'
              );
          END;

          CREATE TRIGGER IF NOT EXISTS labels_update_trigger
          AFTER UPDATE ON labels
          BEGIN
              INSERT INTO change_logs (id, table_name, user_id, operation)
              VALUES (
                strftime('%Y%m%d%H%M%f', 'now') || '-' || lower(hex(randomblob(4))),
                'labels',
                NEW.user_id,
                'update'
              );
          END;

          CREATE TRIGGER IF NOT EXISTS labels_delete_trigger
          AFTER DELETE ON labels
          BEGIN
              INSERT INTO change_logs (id, table_name, user_id, operation)
              VALUES (
                strftime('%Y%m%d%H%M%f', 'now') || '-' || lower(hex(randomblob(4))),
                'labels',
                OLD.user_id,
                'delete'
              );
          END;

          CREATE TRIGGER IF NOT EXISTS user_update_trigger
          AFTER UPDATE ON users
          BEGIN
              INSERT INTO change_logs (id, table_name, user_id, operation)
              VALUES (
                strftime('%Y%m%d%H%M%f', 'now') || '-' || lower(hex(randomblob(4))),
                'users',
                NEW.id,
                'update'
              );
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
