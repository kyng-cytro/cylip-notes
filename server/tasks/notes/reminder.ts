export default defineTask({
  meta: {
    name: "notes:reminder",
    description: "Notifies user about reminders",
  },
  async run(event) {
    const { userId } = event.payload as { userId: string };
    await sendPushNotification({
      type: "template",
      recipients: userId,
      template_id: "26946aef-dc53-4b90-af00-62a2eb4a43c3",
      custom_data: { name: "Cytro", note_id: "1", note_title: "test note" },
    });
    return { result: "success" };
  },
});
