import * as chrono from "chrono-node";

export const parseDateString = (text: string) =>
  chrono.parseDate(text, undefined, { forwardDate: true });
