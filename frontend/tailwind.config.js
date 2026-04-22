/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest:  { DEFAULT: '#1a4731', 2: '#1f5a3d', 3: '#2d7a56', light: '#e8f5ee' },
        gold:    { DEFAULT: '#c9a84c', 2: '#e8c96a', 3: '#f5e0a0', light: '#fef8e8' },
        cream:   { DEFAULT: '#faf7f2', 2: '#f3ede3', 3: '#e8dfd0' },
        ink:     { DEFAULT: '#1a1a18', 2: '#2e2e2a', 3: '#4a4a44' },
        muted:   { DEFAULT: '#7a7a70', 2: '#a0a090' },
        divider: '#ddd8ce',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'Courier New', 'monospace'],
      },
      boxShadow: {
        card:  '0 1px 3px rgba(26,71,49,0.06), 0 1px 2px rgba(26,71,49,0.04)',
        'card-hover': '0 4px 12px rgba(26,71,49,0.1), 0 2px 4px rgba(26,71,49,0.06)',
        panel: '0 1px 8px rgba(26,71,49,0.08)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.35s ease forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
