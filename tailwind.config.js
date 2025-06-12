module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'background-dark': '#1A1A1A',
        'surface-dark': '#2C2C2C',
        'text-primary-dark': '#E0E0E0',
        'text-secondary-dark': '#A0A0A0',
        'border-dark': '#404040',
        'accent-purple': '#8B5CF6',
        'accent-blue': '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'input-focus': '0 0 0 2px #3B82F6',
        'modal': '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 20px 50px -12px rgba(0, 0, 0, 0.4)',
        'chat-input': '0 -4px 12px -1px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        'scale-in': 'scale-in 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}