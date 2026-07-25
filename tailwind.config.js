/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Primary Asura Purple
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          glow: '#a855f7',
        },
        asura: {
          bg: '#0c0d14',         // Deep obsidian background
          card: '#121422',       // Card background
          cardHover: '#181a2e',  // Card hover
          border: '#23263d',     // Subtle border
          accent: '#8b5cf6',     // Violet accent
          gold: '#f59e0b',       // Rating gold
          emerald: '#10b981',    // Completed green
          rose: '#f43f5e',       // Hot tag
          cyan: '#06b6d4',       // New tag
        },
        sepia: {
          bg: '#fbf0d9',
          card: '#f4e4c1',
          text: '#433422',
          border: '#e6d3a7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        reading: ['Georgia', 'serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px -3px rgba(139, 92, 246, 0.45)',
        'glow-gold': '0 0 20px -3px rgba(245, 158, 11, 0.45)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
        'asura-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to right, rgba(12, 13, 20, 0.95), rgba(12, 13, 20, 0.7), transparent)',
        'card-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.4) 100%)',
      }
    },
  },
  plugins: [],
}
