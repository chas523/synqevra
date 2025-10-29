import { createTheme } from "@mantine/core";

//after editing this file you have to run "npx tailwind-preset-mantine theme.js -o theme.css"
//to update the theme.css file that is imported inside globals.css
//it allows us to override mantile breakpoints to match tailwindcss breakpoints
const theme = createTheme({
  breakpoints: {
    xs: "32em",
    sm: "40em", // 640px - Tailwind sm
    md: "48em", // 768px - Tailwind md
    lg: "64em", // 1024px - Tailwind lg
    xl: "80em", // 1280px - Tailwind xl
    "2xl": "96em", // 1536px - Tailwind 2xl
  },
});

export default theme;
