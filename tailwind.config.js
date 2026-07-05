const designTokens = require("./src/constants/designTokens.json");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: designTokens.colors.brand,
        text: designTokens.colors.text,
        surface: designTokens.colors.surface,
        border: designTokens.colors.border,
        feedback: designTokens.colors.feedback,
      },
      fontFamily: {
        display: [designTokens.typography.fontFamilies.display],
        body: [designTokens.typography.fontFamilies.body],
        fallback: [designTokens.typography.fontFamilies.fallback],
      },
      borderRadius: designTokens.radius,
      spacing: designTokens.spacing,
      boxShadow: designTokens.shadows,
    },
  },
  plugins: [],
};
