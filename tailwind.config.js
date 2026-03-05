/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores de Mariett Alcayaga (extraída del PDF)
        primary: {
          DEFAULT: '#1e3a5f', // Azul oscuro principal
          dark: '#152947',
          light: '#2e5c8a',
        },
        secondary: {
          DEFAULT: '#2e5c8a', // Azul medio
          light: '#7eb5d6',
        },
        accent: {
          DEFAULT: '#7eb5d6', // Azul claro
          light: '#b8d9ed',
          pale: '#d4e8f4',
        },
        sage: {
          DEFAULT: '#a8c5b5', // Verde salvia
          light: '#c5d9cc',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
