import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1a2e',
        primary: '#e94560',
        secondary: '#0f3460',
        accent: '#FF5722',
        dark: '#111111',
      },
      fontFamily: {
        dunggeunmo: ['DungGeunMo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
