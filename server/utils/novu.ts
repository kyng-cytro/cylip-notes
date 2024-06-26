import { Novu } from "@novu/node";

const { novu: novuEnv } = useRuntimeConfig();

const novu = new Novu(novuEnv.apiKey);

export const registerSubscriber = async (subscriber: User) => {
  const [firstName, lastName] = subscriber.name.split(" ");
  await novu.subscribers.identify(subscriber.id, {
    firstName,
    lastName,
    email: subscriber.email,
    ...(subscriber.picture && { avatar: subscriber.picture }),
  });
};

export const updateSubscriber = async (subscriber: User) => {
  const [firstName, lastName] = subscriber.name.split(" ");
  await novu.subscribers.update(subscriber.id, {
    firstName,
    lastName,
    email: subscriber.email,
    ...(subscriber.picture && { avatar: subscriber.picture }),
  });
};

export const sendSignInEmail = async (
  subscriberId: string,
  confirmationLink: string,
) => {
  await novu.trigger("sign-in-request", {
    to: {
      subscriberId,
    },
    payload: {
      confirmationLink,
    },
  });
};
