import { joinURL } from "ufo";

export default defineEventHandler(async (event) => {
  const proxyUrl = useRuntimeConfig().public.onesignal.sdkUrl;
  const path = event.path.replace(/^\/api\/one-signal/, "");
  const target = joinURL(proxyUrl, path);
  return sendProxy(event, target);
});
