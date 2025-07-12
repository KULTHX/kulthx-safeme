import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}", "./views/**/*.hbs"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Using Inter font for a modern look
        display: ["Montserrat", "sans-serif"], // A more expressive font for headings
      },
      colors: {
        // Modern Dark Theme Palette
        darkPrimary: "#1a1a2e", // Deep blue-black
        darkSecondary: "#16213e", // Slightly lighter blue-black
        darkAccent: "#0f3460", // Darker blue for accents
        textLight: "#e0e0e0", // Light gray for main text
        textMuted: "#a0a0a0", // Muted gray for secondary text
        gradientStart: "#8a2be2", // Blue Violet
        gradientEnd: "#4169e1", // Royal Blue
        buttonPrimary: "#6a0dad", // Darker purple for buttons
        buttonSecondary: "#483d8b", // Slate Blue for secondary buttons
        borderDark: "#33334d", // Dark border color
        cardBackground: "#1e1e3f", // Card background color
        glassMorphism: "rgba(255, 255, 255, 0.05)", // For glass effect
        glassBorder: "rgba(255, 255, 255, 0.1)", // For glass effect border
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;


