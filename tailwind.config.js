const animate = require("tailwindcss-animate");
const typography = require("@tailwindcss/typography");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  safelist: ["dark"],
  prefix: "",

  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      height: {
        screen: ["100vh /* fallback for Opera, IE and etc. */", "100dvh"],
      },
      minHeight: {
        screen: ["100vh /* fallback for Opera, IE and etc. */", "100dvh"],
      },
      maxHeight: {
        screen: ["100vh /* fallback for Opera, IE and etc. */", "100dvh"],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            li: {
              p: {
                margin: 0,
              },
            },
          },
        },
      }),
    },
  },
  plugins: [animate, typography],
};
