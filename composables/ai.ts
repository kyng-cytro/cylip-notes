export const requestAI = async <T>(
  path: string,
  body: Record<string, string>,
) => {
  const result = await $fetch<T>(path, { method: "POST", body });
  await useUser().refreshUser();
  return result;
};
