import type { NoteOptions } from "@/schemas/note";

export type Background = {
  type: "color" | "image";
  name: string;
  light: string;
  dark: string;
};

export const useBackgroundOptions = () => {
  const backgrounds: Background[] = [
    { type: "color", name: "mint-green", light: "#DFFFD6", dark: "#2C784D" },
    { type: "color", name: "lavender", light: "#EFEAFF", dark: "#624FA0" },
    { type: "color", name: "blush-pink", light: "#FFE4E1", dark: "#CC6A62" },
    { type: "color", name: "powder-blue", light: "#E3F2FD", dark: "#4872A8" },
    { type: "color", name: "ivory", light: "#FFFAE3", dark: "#C8A04F" },
    { type: "color", name: "ash-gray", light: "#F2F2F2", dark: "#8A8A8A" },
    { type: "color", name: "muted-coral", light: "#FFD1C1", dark: "#C25B58" },
    { type: "color", name: "sage-green", light: "#E5E8C8", dark: "#8D9D5E" },
    { type: "color", name: "slate-blue", light: "#C6D8FF", dark: "#4960A1" },
    {
      type: "image",
      name: "birthday-card",
      light: "/backgrounds/birthday-card-light.png",
      dark: "/backgrounds/birthday-card-dark.png",
    },
  ];

  const getOptions = (isDark: boolean) =>
    backgrounds.map(({ name, type, dark, light }) => {
      return { name, type, value: isDark ? dark : light };
    });

  const getBackgroundOptionCode = (
    isDark: boolean,
    options: NoteOptions["background"],
  ) => {
    if (!options) return "";
    const { type, value } = options;
    if (type === "color") {
      const color = backgrounds.find(({ name, type }) => {
        return name === value && type === "color";
      });
      if (!color) return "";
      return `background-color: ${isDark ? color.dark : color.light};`;
    }
    if (type === "image") {
      const image = backgrounds.find(({ name, type }) => {
        return name === value && type === "image";
      });
      if (!image) return "";
      return `background-image: url(${isDark ? image.dark : image.light});background-size: cover;background-position: center top;`;
    }
    return "";
  };

  return { options: getOptions, getBackgroundOptionCode };
};
