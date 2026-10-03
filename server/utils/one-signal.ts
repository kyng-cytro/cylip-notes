type ReminderData = { name: string; note_id: string; note_title: string };

const reminderTemplateId = import.meta.dev
  ? "26946aef-dc53-4b90-af00-62a2eb4a43c3"
  : "c618dc78-f11a-496b-b66f-a89c168b55cb";

export const sendReminderNotification = async (
  userId: string,
  data: ReminderData,
) => {
  const { apiKey } = useRuntimeConfig().onesignal;
  const { url, appId } = useRuntimeConfig().public.onesignal;
  try {
    await $fetch(url, {
      method: "POST",
      headers: { Authorization: `Key ${apiKey}` },
      body: {
        app_id: appId,
        target_channel: "push",
        template_id: reminderTemplateId,
        custom_data: data,
        include_aliases: { external_id: [userId] },
      },
    });
  } catch (error) {
    console.error(error);
  }
};
