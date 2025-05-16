const { baseUrl } = useRuntimeConfig().public;
export const getImagePath = (id: string) => {
  return `${baseUrl}/api/profile-pictures/${id}`;
};
