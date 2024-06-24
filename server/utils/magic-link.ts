const { baseUrl } = useRuntimeConfig().public;
export const sendMagicLink = async (userId: string, email: string) => {
  const token = await generateVerificationToken(userId);
  if (!token) return;
  const url = `${baseUrl}/verify-token/${token}`;
  console.log(url);
  // TODO: send email
};
