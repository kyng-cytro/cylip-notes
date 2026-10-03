import { useOneSignal } from "@onesignal/onesignal-vue3";

export const useOneSignalSetup = () => {
  const onesignal = useOneSignal();
  const { appId, safariWebId } = useRuntimeConfig().public.onesignal;

  const init = () => {
    onesignal.init({
      appId,
      persistNotification: true,
      safari_web_id: safariWebId,
      serviceWorkerPath: "push/onesignal/OneSignalSDKWorker.js",
      serviceWorkerParam: { scope: "/push/onesignal/" },
      autoResubscribe: !import.meta.dev,
      welcomeNotification: {
        title: "Hey there 👋",
        message:
          "Welcome to cylip|notes notifications. Future notifications will show up like this.",
      },
    });

    onesignal.User.PushSubscription.addEventListener("change", (e) => {
      if (e.current.token) {
        const { user } = useUser();
        if (!user.value?.id) return;
        onesignal.login(user.value.id);
      }
    });

    onesignal.Notifications.addEventListener("click", (e) => {
      if (e.result.actionId !== "reminder-okay") return;
      const id = e.result.url?.split("/").pop();
      if (id) useNoteStore().methods.setReminder(id, null);
    });
  };

  return { init, onesignal };
};
