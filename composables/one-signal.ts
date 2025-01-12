import { useOneSignal } from "@onesignal/onesignal-vue3";

export const useOneSignalSetup = () => {
  const onesignal = useOneSignal();
  const { appId, safariWebId } = useRuntimeConfig().public.onesignal;

  const init = () => {
    // init OneSignal
    onesignal.init({
      appId,
      persistNotification: true,
      safari_web_id: safariWebId,
      autoResubscribe: !import.meta.dev,
      welcomeNotification: {
        title: "Hey there 👋",
        message:
          "Welcome to cylip|notes notifications. Future notifications will show up like this.",
      },
    });

    // listen and login to OneSignal
    onesignal.User.PushSubscription.addEventListener("change", (e) => {
      if (e.current.token) {
        const { user } = useUser();
        if (!user.value?.id) return;
        onesignal.login(user.value.id);
      }
    });

    onesignal.Notifications.addEventListener("click", async (e) => {
      if (e.result.actionId === "reminder-okay") {
        const id = e.result.url?.split("/").pop();
        console.log(e.notification.additionalData);
        if (!id) return;
        await $fetch(`/api/notes/${id}`, {
          method: "PATCH",
          body: { field: "reminder_at", value: null },
        });
      }
    });
  };

  return { init, onesignal };
};
