export default defineEventHandler(async () => {
  const { html } = await renderSignInEmail({ name: "John", url: "test" });
  console.log(html);
  return { status: "ok", html };
});
