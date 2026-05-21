/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./index.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        dangrek: ["Dangrek-Regular"],
        darling: ["IngridDarling-Regular"],
        inria: ["InriaSans-Regular"],
        inter: ["Inter-Variable"],
        "inter-italic": ["Inter-VariableItalic"],
        inconsolata: ["Inconsolata"],
      },
    },
  },
  plugins: [],
};
