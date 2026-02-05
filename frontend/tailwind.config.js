/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          pink: '#E91E63',
          'pink-light': '#FCE4EC', 
          'pink-hover': '#C2185B',
        },
        secondary: {
          'blue-dark': '#3B4A5C',
          blue: '#1E40AF',
          'blue-light': '#DBEAFE',
        },
        status: {
          success: '#10B981',
          'success-light': '#ECFDF5',
          error: '#EF4444',
          'error-light': '#FEE2E2',
          warning: '#F59E0B',
          'warning-light': '#FEF3C7',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [],
}
