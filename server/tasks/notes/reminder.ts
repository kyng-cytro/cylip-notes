export default defineTask({
  meta: {
    name: "notes:reminder",
    description: "Notifies user about reminders",
  },
  async run() {
    return { result: "success" };
  },
});
