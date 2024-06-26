const { baseUrl } = useRuntimeConfig().public;
export const sendMagicLink = async (userId: string) => {
  const token = await generateVerificationToken(userId);
  if (!token) return;
  const url = `${baseUrl}/verify-token/${token}`;
  console.log(url);
  await sendSignInEmail(userId, url);
};
