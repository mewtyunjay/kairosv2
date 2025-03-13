/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6c5ce7',
          dark: '#a29bfe'
        },
        background: {
          light: '#faf6f1', // Updated to light beige
          dark: '#1a1a1a'
        },
        text: {
          light: '#2d3436',
          dark: '#f5f6fa'
        },
        category: {
          work: '#ff7675',
          personal: '#74b9ff',
          health: '#55efc4',
          shopping: '#ffeaa7',
          other: '#b2bec3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Young Serif', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      transitionDuration: {
        DEFAULT: '300ms'
      },
      boxShadow: {
        header: '0 2px 4px rgba(0,0,0,0.1)',
        card: '0 4px 6px rgba(0,0,0,0.07)'
      },
      minHeight: {
        card: '120px'
      }
    }
  },
  plugins: []
};