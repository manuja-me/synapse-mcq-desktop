/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
      colors: {
        void: {
          950: '#09090B',
          900: '#121215',
          850: '#18181B',
          800: '#27272A',
          700: '#3F3F46',
          600: '#52525B',
        },
        obsidian: {
          950: '#09090B',
          900: '#121215',
          850: '#18181B',
          800: '#27272A',
          700: '#3F3F46',
          600: '#52525B',
        },
        accent: {
          emerald: '#10B981',
          emeraldDark: '#059669',
          amber: '#F59E0B',
          rose: '#EF4444',
          cyan: '#06B6D4',
        },
        neon: {
          cyan: '#10B981',
          blue: '#38BDF8',
          violet: '#10B981',
          purple: '#10B981',
          emerald: '#10B981',
          rose: '#EF4444',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': 'none',
        'glow-violet': 'none',
        'glow-emerald': 'none',
        'glow-rose': 'none',
        'glow-amber': 'none',
        'glass': 'none',
      },
    },
  },
  plugins: [],
}
