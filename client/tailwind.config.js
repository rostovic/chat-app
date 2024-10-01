/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "selector",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        "70%": "70%",
      },
      colors: {
        customColor: "red",
        darkCustomColor: "green",
        chatBackgroundColor: "gray-100",
        darkChatBackgroundColor: "brown",
      },
    },
  },
  plugins: [],
};
