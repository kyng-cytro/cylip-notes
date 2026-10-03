import { capitalize } from "@/utils/helpers";
import { endOfMinute, startOfMinute } from "date-fns";

const findDueReminders = async (start: Date, end: Date) => {
  const db = useDrizzle();
  const user = { columns: { id: true, name: true } } as const;
  const [owned, shared] = await Promise.all([
    db.query.note.findMany({
      columns: { id: true, title: true },
      where: and(
        gte(tables.note.reminderAt, start),
        lte(tables.note.reminderAt, end),
      ),
      with: { user },
    }),
    db.query.noteMember.findMany({
      columns: {},
      where: and(
        gte(tables.noteMember.reminderAt, start),
        lte(tables.noteMember.reminderAt, end),
      ),
      with: { user, note: { columns: { id: true, title: true } } },
    }),
  ]);
  return [
    ...owned.map((note) => ({ note, user: note.user })),
    ...shared.map(({ note, user }) => ({ note, user })),
  ];
};

export default defineTask({
  meta: {
    name: "notes:reminder",
    description: "Notifies users about due reminders",
  },
  async run() {
    const now = new Date();
    const reminders = await findDueReminders(
      startOfMinute(now),
      endOfMinute(now),
    );
    for (const { note, user } of reminders) {
      await sendReminderNotification(user.id, {
        note_id: note.id,
        note_title: (note.title || "your note").toLocaleLowerCase(),
        name: capitalize(user.name.split(" ")[0] || "There"),
      });
    }
    return { result: `Sent ${reminders.length} reminders` };
  },
});
