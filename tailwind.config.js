/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      zIndex: {
        max: "2147483647",
      },
    },
  },
  prefix: "gb-",
  plugins: [],
};
