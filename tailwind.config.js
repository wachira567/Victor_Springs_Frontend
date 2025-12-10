import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Assuming you are using a modern sans-serif like Inter, Satoshi, or Plus Jakarta Sans
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // A richer, deeper primary palette (Rose/Coral vibe)
        primary: {
          50: '#fff0f1',
          100: '#ffe3e6',
          200: '#ffcbd2',
          300: '#ffa0ad',
          400: '#ff6b81',
          500: '#f43f5e', // Main Brand Color
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        // A sophisticated secondary palette (Deep Ocean/Slate)
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Rich Neutrals for typography
        dark: {
          900: '#0A0A0A',
          800: '#171717',
          700: '#262626',
        }
      },
      boxShadow: {
        // Custom "deep glass" shadows
        'glass': '0 8px 32px 0 rgba( 31, 38, 135, 0.07 )',
        'glass-hover': '0 8px 32px 0 rgba( 31, 38, 135, 0.15 )',
        'glow': '0 0 20px -5px rgba(244, 63, 94, 0.4)',
      },
      backgroundImage: {
        // Subtle noise texture for premium feel
        'noise': "url('https://grainy-gradients.vercel.app/noise.svg')",
      },
      animation: {
        'slow-pan': 'kenBurnsEffect 25s infinite alternate ease-in-out',
      },
      keyframes: {
        kenBurnsEffect: {
          "0%": { transform: "scale(1) translate(0, 0)" },
          "100%": { transform: "scale(1.15) translate(-5%, -5%)" },
        },
      },
    },
  },
  plugins: [
    // You might need to install this package: npm i tailwind-scrollbar-hide
    require('tailwind-scrollbar-hide'),
    addVariablesForColors,
  ],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}