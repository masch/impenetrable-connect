/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Surface Colors
        surface: "#fcf9f2",
        "surface-container-low": "#f6f3ec",
        "surface-container-highest": "#e5e2db",
        "surface-container-lowest": "#ffffff",

        // Primary Colors - Terracotta for buttons
        primary: "#8c3d2b",
        "primary-base": "#2b868c",
        "primary-container": "#8c3d2b",
        "primary-fixed": "#ffdad2",

        // Text on colors
        "on-surface": "#1c1c18",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#3d0600",

        // Secondary Colors
        secondary: "#47664b",
        "secondary-container": "#c8ecc9",
        "on-secondary-fixed": "#03210c",

        // Tertiary & Status Colors
        "tertiary-container": "#764d00",
        "on-tertiary-fixed": "#291800",

        // Error Colors
        "error-container": "#ffdad6",
        error: "#ba1a1a",
        "on-error-container": "#93000a",

        // Outline
        "outline-variant": "#dbc1bb",

        // Tab bar colors
        "tab-inactive": "#666666",

        // Moment of Day Colors
        "moment-breakfast": "#F59E0B",
        "moment-breakfast/20": "rgba(245, 158, 11, 0.125)",
        "moment-breakfast/40": "rgba(245, 158, 11, 0.25)",
        "moment-lunch": "#10B981",
        "moment-lunch/20": "rgba(16, 185, 129, 0.125)",
        "moment-lunch/40": "rgba(16, 185, 129, 0.25)",
        "moment-snack": "#F97316",
        "moment-snack/20": "rgba(249, 115, 22, 0.125)",
        "moment-snack/40": "rgba(249, 115, 22, 0.25)",
        "moment-dinner": "#8B5CF6",
        "moment-dinner/20": "rgba(139, 92, 246, 0.125)",
        "moment-dinner/40": "rgba(139, 92, 246, 0.25)",
      },
      fontFamily: {
        // Section 3: Manrope for headlines, Inter for body
        display: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      // Section 5: Sharp angular buttons (0 border-radius)
      borderRadius: {
        none: "0",
        DEFAULT: "0",
      },
      // Section 6: Minimum touch targets (48x48dp minimum)
      minHeight: {
        button: "5.5rem", // 88px / 16 in tailwind scale
        touch: "3rem", // 48dp minimum
      },
      // Spacing scale (Section 6)
      spacing: {
        "scale-4": "1rem",
        "scale-6": "1.5rem",
        "scale-8": "2rem",
      },
      objectFit: {
        contain: "contain",
        cover: "cover",
        coverl: "cover",
      },
    },
  },
  plugins: [],
};
