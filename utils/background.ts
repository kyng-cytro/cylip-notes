import type { Background as NoteBackground } from "@/lib/sync/protocol";

type BackgroundOption = {
  type: "color" | "image";
  name: string;
  light: string;
  dark: string;
};

export const preloadRoutes = ["/app", "/public"];

export const backgrounds: BackgroundOption[] = [
  { type: "color", name: "mint-green", light: "#DFFFD6", dark: "#2C784D" },
  { type: "color", name: "lavender", light: "#EFEAFF", dark: "#624FA0" },
  { type: "color", name: "blush-pink", light: "#FFE4E1", dark: "#CC6A62" },
  { type: "color", name: "powder-blue", light: "#E3F2FD", dark: "#4872A8" },
  { type: "color", name: "ivory", light: "#FFFAE3", dark: "#C8A04F" },
  { type: "color", name: "ash-gray", light: "#F2F2F2", dark: "#8A8A8A" },
  { type: "color", name: "muted-coral", light: "#FFD1C1", dark: "#C25B58" },
  { type: "color", name: "sage-green", light: "#E5E8C8", dark: "#8D9D5E" },
  { type: "color", name: "slate-blue", light: "#C6D8FF", dark: "#4960A1" },
  { type: "color", name: "butter-yellow", light: "#FFF7C7", dark: "#C29A1A" },
  { type: "color", name: "sky-teal", light: "#D9F7F5", dark: "#2F6F74" },
  { type: "color", name: "mauve", light: "#F7E6F9", dark: "#8B4A8F" },
  { type: "color", name: "warm-taupe", light: "#F1E9E4", dark: "#7A6354" },
  { type: "color", name: "peach", light: "#FFE9D6", dark: "#C06A3F" },
  { type: "color", name: "sunset-orange", light: "#FFE2C4", dark: "#B85A1C" },
  { type: "color", name: "cobalt", light: "#E0EBFF", dark: "#233E8B" },
  { type: "color", name: "clay", light: "#F2E4D9", dark: "#805A3B" },
  { type: "color", name: "pine-forest", light: "#E4F1EC", dark: "#2D5845" },
  { type: "color", name: "honeydew", light: "#F1FFE8", dark: "#4D7A32" },
  { type: "color", name: "steel-gray", light: "#E8EBF0", dark: "#4A4F59" },
  { type: "color", name: "ice-blue", light: "#EAFEFF", dark: "#3A7C88" },
  { type: "color", name: "burgundy", light: "#F5E6EA", dark: "#6D1B2B" },
  { type: "color", name: "maple", light: "#FFF1DD", dark: "#A36822" },
  { type: "color", name: "orchid-storm", light: "#F7D9FF", dark: "#5A0070" },
  {
    type: "image",
    name: "birthday-card",
    light: "/backgrounds/birthday-card-light.png",
    dark: "/backgrounds/birthday-card-dark.png",
  },
];

export const getBackgroundOptions = (isDark: boolean) =>
  backgrounds.map(({ name, type, dark, light }) => {
    return { name, type, value: isDark ? dark : light };
  });

export const applyBackground = (
  isDark: boolean,
  background: NoteBackground | undefined,
) => {
  const option = backgrounds.find(
    ({ name, type }) => name === background?.value && type === background?.type,
  );
  if (!option) return "";
  const value = isDark ? option.dark : option.light;
  return option.type === "color"
    ? `background-color: ${value};`
    : `background-image: url(${value});background-size: cover;background-position: center top;`;
};
