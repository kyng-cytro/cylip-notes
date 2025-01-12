import { capitalize } from "@/utils/helpers";
import { endOfMinute, startOfMinute } from "date-fns";

export default defineTask({
  meta: {
    name: "notes:reminder",
    description: "Notifies user about reminders",
  },
  async run() {
    const db = useDrizzle();
    const now = new Date();
    const start = startOfMinute(now);
    const end = endOfMinute(now);
    const notes = await db.query.note.findMany({
      where: and(
        gte(tables.note.reminderAt, start),
        lte(tables.note.reminderAt, end),
      ),
      with: { user: true },
    });
    for (const note of notes) {
      await sendPushNotification({
        type: "template",
        recipients: [note.user.id],
        custom_data: {
          note_id: note.id,
          note_title: (note.title || "your note").toLocaleLowerCase(),
          name: capitalize(note.user.name.split(" ")[0] || "There"),
        },
        template_id: "26946aef-dc53-4b90-af00-62a2eb4a43c3",
      });
    }
    return { result: "success" };
  },
});
