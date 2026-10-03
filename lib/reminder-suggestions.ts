import { addDays, addHours, nextMonday, set } from "date-fns";

type Suggestion = { label: string; date: Date };

const at = (date: Date, hours: number) =>
  set(date, { hours, minutes: 0, seconds: 0, milliseconds: 0 });

export const reminderSuggestions = (now = new Date()): Suggestion[] =>
  [
    { label: "In 1 hour", date: addHours(now, 1) },
    { label: "Tonight", date: at(now, 20) },
    { label: "Tomorrow morning", date: at(addDays(now, 1), 9) },
    { label: "Next week", date: at(nextMonday(now), 9) },
  ].filter(({ date }) => date > now);
