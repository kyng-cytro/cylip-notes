export default definePartyKitEventHandler(async (event) => {
  console.log(event.context.user);
  return;
});
