import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // KidVenture Pass Brand Colors
        'adventure-orange': '#E07856',
        'explorer-teal': '#2B8B81',
        'deep-play-blue': '#1A3A52',
        'warm-cream': '#F5E8E0',
        // Extended palette
        'kvp': {
          orange: {
            50: '#FEF5F2',
            100: '#FCE8E2',
            200: '#F9D5C9',
            300: '#F3B8A3',
            400: '#E99273',
            500: '#E07856',
            600: '#CC5A38',
            700: '#AB472C',
            800: '#8C3C28',
            900: '#743526',
          },
          teal: {
            50: '#F0F9F8',
            100: '#D9F0ED',
            200: '#B6E1DC',
            300: '#87CBC4',
            400: '#58AEA5',
            500: '#2B8B81',
            600: '#247269',
            700: '#215C56',
            800: '#1F4A46',
            900: '#1D3E3B',
          },
          blue: {
            50: '#F2F6F8',
            100: '#E0E8ED',
            200: '#C4D3DC',
            300: '#9BB3C3',
            400: '#6B8CA3',
            500: '#4F6F88',
            600: '#435A72',
            700: '#3A4B5F',
            800: '#1A3A52',
            900: '#142D41',
          },
          cream: {
            50: '#FDFCFB',
            100: '#FAF7F4',
            200: '#F5E8E0',
            300: '#EDD9CD',
            400: '#E2C4B3',
            500: '#D5AD98',
            600: '#C4927A',
            700: '#A87561',
            800: '#8A5F4F',
            900: '#724E42',
          },
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'glow-teal': '0 0 20px rgba(43, 139, 129, 0.3)',
        'glow-orange': '0 0 20px rgba(224, 120, 86, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

export default config
