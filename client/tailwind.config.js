/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef6ff",
          100: "#d9ecff",
          500: "#1877f2",
          600: "#166fe0",
          700: "#125cbd",
        },
      },
    },
  },
  plugins: [],
};
