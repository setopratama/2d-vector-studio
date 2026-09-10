/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '0px',
      },
      colors: {
        industrial: {
          bg: '#fafaf9',      // stone-50
          card: '#ffffff',    // white
          border: '#e7e5e4',  // stone-200
          borderDark: '#1c1917', // stone-900
          text: '#1c1917',    // stone-900
          muted: '#78716c',   // stone-500
          dim: '#a8a29e',     // stone-400
        }
      }
    },
  },
  plugins: [],
}
