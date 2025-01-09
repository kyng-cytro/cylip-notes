const { apiKey } = useRuntimeConfig().onesignal;
const { url, appId } = useRuntimeConfig().public.onesignal;

type PushTemplate = {
  "26946aef-dc53-4b90-af00-62a2eb4a43c3": {
    name: string;
    note_id: string;
    note_title: string;
  };
};

type BasePushOptions = {
  extras?: {};
  recipients: string[] | string;
};

type PushOptions =
  | (BasePushOptions & {
      type: "template";
      template_id: keyof PushTemplate;
      custom_data: PushTemplate[keyof PushTemplate];
    })
  | (BasePushOptions & {
      type: "custom";
      title: string;
      content: string;
    });

export const sendPushNotification = async (options: PushOptions) => {
  const { type, recipients } = options;
  const data = {
    app_id: appId,
    target_channel: "push",
    ...(type === "template" && {
      template_id: options.template_id,
      custom_data: options.custom_data,
    }),
    ...(type === "custom" && {
      headings: { en: options.title },
      contents: { en: options.content },
    }),
    include_aliases: {
      external_id: Array.isArray(recipients) ? recipients : [recipients],
    },
  };
  try {
    await $fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
      },
      body: data,
    });
  } catch (error) {
    console.error(error);
  }
};
