import type { NoteOptions } from "@/schemas/note";

export const useBackgroundOptions = () => {
  const colors = [
    { name: "mint-green", light: "#DFFFD6", dark: "#2C784D" },
    { name: "lavender", light: "#EFEAFF", dark: "#624FA0" },
    { name: "blush-pink", light: "#FFE4E1", dark: "#CC6A62" },
    { name: "powder-blue", light: "#E3F2FD", dark: "#4872A8" },
    { name: "ivory", light: "#FFFAE3", dark: "#C8A04F" },
    { name: "ash-gray", light: "#F2F2F2", dark: "#8A8A8A" },
    { name: "muted-coral", light: "#FFD1C1", dark: "#C25B58" },
    { name: "sage-green", light: "#E5E8C8", dark: "#8D9D5E" },
    { name: "slate-blue", light: "#C6D8FF", dark: "#4960A1" },
  ];
  const images = [{ name: "", light: "", dark: "" }];
  const colorOptions = (isDark: boolean) => {
    return colors.map(({ name, light, dark }) => ({
      name,
      value: isDark ? dark : light,
    }));
  };
  const getBackgroundOptionCode = (
    isDark: boolean,
    options: NoteOptions["background"],
  ) => {
    if (!options) return "";
    const { type, value } = options;
    if (type === "color") {
      const color = colors.find(({ name }) => name === value);
      if (!color) return "";
      return `background-color: ${isDark ? color.dark : color.light};`;
    }
    return "";
  };

  return { images, colors: colorOptions, getBackgroundOptionCode };
};
