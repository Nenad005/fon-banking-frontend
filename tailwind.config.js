/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./index.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        dangrek: ["Dangrek-Regular"],
        darling: ["IngridDarling-Regular"],
        "inria-light": ["InriaSans-Light"],
        "inria-light-italic": ["InriaSans-LightItalic"],
        "inria-regular": ["InriaSans-Regular"],
        "inria-regular-italic": ["InriaSans-Italic"],
        "inria-bold": ["InriaSans-Bold"],
        "inria-bold-italic": ["InriaSans-BoldItalic"],
        inter: ["Inter-Variable"],
        "inter-italic": ["Inter-VariableItalic"],
        inconsolata: ["Inconsolata"],
      },
      colors: {
        tirquise: "#004B7C",
        magenta: "#D057A0",
        cyan: "#60C3AD",
        yellow: "#FFCD67",
      },
    },
  },
  plugins: [],
};
