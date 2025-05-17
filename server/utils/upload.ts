const { baseUrl } = useRuntimeConfig().public;
export const getImagePath = (id: string) => {
  return `${baseUrl}/profile-pictures/${id}`;
};
