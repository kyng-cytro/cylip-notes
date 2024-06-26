import {
  adjectives,
  names,
  uniqueNamesGenerator,
} from "unique-names-generator";

export const generateName = (seed: string | number, length = 2) => {
  return uniqueNamesGenerator({
    seed,
    length,
    separator: " ",
    style: "capital",
    dictionaries: [adjectives, names],
  });
};
