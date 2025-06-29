/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        'dark-base': '#0D1412',
        'dark-surface': '#1A1F1D',
        'dark-glass': 'rgba(255, 255, 255, 0.05)',
        'dark-border': 'rgba(255, 255, 255, 0.1)',
        'dark-text': '#E8E8E8',
        'dark-text-secondary': '#A0A0A0',
        
        // Light theme colors
        'light-base': '#FAFAFA',
        'light-surface': '#FFFFFF',
        'light-glass': 'rgba(0, 0, 0, 0.05)',
        'light-border': 'rgba(0, 0, 0, 0.1)',
        'light-text': '#1A1A1A',
        'light-text-secondary': '#6B7280',
        
        // Shared accent colors - darker green for light theme
        'lime-accent': '#65A30D', // Darker green for light theme
        'lime-glow': 'rgba(225, 252, 2, 0.2)',
      },
      fontFamily: {
        'editorial': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(225, 252, 2, 0.3)',
        'glow-lg': '0 0 40px rgba(225, 252, 2, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'glass': '16px',
      },
    },
  },
  plugins: [],
};