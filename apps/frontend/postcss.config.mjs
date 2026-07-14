// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-simple-vars": {
      variables: {
        "mantine-breakpoint-xs": "36em",
        "mantine-breakpoint-sm": "40em",
        "mantine-breakpoint-md": "48em",
        "mantine-breakpoint-lg": "62em",
        "mantine-breakpoint-xl": "88em",
      },
    },
  },
};

export default config;
