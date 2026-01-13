module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ffffff',
        secondary: {
          light: '#f0f0f1',
          dark: '#133458',
          accent: '#96a79c',
        },
        slate: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          400: '#cbd5e1',
          300: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
};
