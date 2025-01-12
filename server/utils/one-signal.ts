const { apiKey } = useRuntimeConfig().onesignal;
const { url, appId } = useRuntimeConfig().public.onesignal;

type PushTemplate = {
  "note-reminder": {
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
      template_name: keyof PushTemplate;
      custom_data: PushTemplate[keyof PushTemplate];
    })
  | (BasePushOptions & {
      type: "custom";
      title: string;
      content: string;
    });

const templates: Record<"dev" | "prod", Record<keyof PushTemplate, string>> = {
  dev: {
    "note-reminder": "26946aef-dc53-4b90-af00-62a2eb4a43c3",
  },
  prod: {
    "note-reminder": "c618dc78-f11a-496b-b66f-a89c168b55cb",
  },
};

export const sendPushNotification = async (options: PushOptions) => {
  const { type, recipients } = options;

  const environment = import.meta.dev ? "dev" : "prod";

  const data = {
    app_id: appId,
    target_channel: "push",
    ...(type === "template" && {
      custom_data: options.custom_data,
      template_id: templates[environment][options.template_name],
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
