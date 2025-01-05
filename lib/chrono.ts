import * as chrono from "chrono-node";

export const parseDateString = (
  str: string,
  opts: { forwardDate?: boolean } = { forwardDate: true },
) => {
  return chrono.parseDate(str, undefined, opts);
};
