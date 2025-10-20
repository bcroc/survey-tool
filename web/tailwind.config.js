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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  // Temporary safelist to help migrate to Tailwind v4 while keeping existing utility usage.
  // This forces generation of commonly-used utilities until we complete a thorough migration.
  safelist: [
    { pattern: /^bg-(gray|primary|blue|red|green)-(50|100|200|300|400|500|600|700|800|900|950)$/ },
    { pattern: /^text-(gray|primary|blue|red|green)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^border-(gray|primary|blue|red|green)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^ring(-offset)?(-primary)?/ },
    { pattern: /^(btn|input|card|label|skeleton|sr-only)/ },
    { pattern: /^hover:.*$/ },
    { pattern: /^focus:.*$/ },
    { pattern: /^disabled:.*$/ },
    // common utilities used with @apply
    { pattern: /^(text|px|py|p|rounded|font|transition|duration|shadow|whitespace|w-|h-|m-|ring|animate|absolute|block|mb-|mt-|bg-|text-|border-).*/ },
  ],
  plugins: [],
  // Ensure important core plugins are enabled during migration
  corePlugins: {
    preflight: true,
    container: true,
    // keep other core plugins enabled by default
  },
  experimental: {
    // Enable any v4 experimental flags if needed (kept conservative)
  },
}
