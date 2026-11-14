/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#e1e9f2',
          200: '#c3d3e5',
          300: '#94b3d3',
          400: '#5e8ebe',
          500: '#3970a7',
          600: '#2b588b',
          700: '#234670',
          800: '#1e3c5f',
          900: '#0f172a', // Deep navy primary accent
          950: '#0a0f1d',
        },
        brand: {
          violet: '#6366f1',
          teal: '#0d9488',
        },
        appBg: '#fcfbfc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
