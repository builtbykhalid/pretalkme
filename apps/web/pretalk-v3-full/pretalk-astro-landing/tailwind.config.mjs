/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        pt: {
          dark:   '#221A40',
          darker: '#160F2E',
          green:  '#48D951',
          'green-muted': 'rgba(72,217,81,0.12)',
          'green-dark':  '#35A83C',
          bg:     '#F4F1FF',
          'bg-2': '#EDE9FF',
          border: '#E8E5F5',
        },
      },
      animation: {
        float:   'float 4s ease-in-out infinite',
        float2:  'float 4s ease-in-out 0.8s infinite',
        float3:  'float 4s ease-in-out 1.6s infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.22,1,0.36,1) both',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        slideUp: {
          '0%':   { opacity:'0', transform:'translateY(28px)' },
          '100%': { opacity:'1', transform:'translateY(0)' },
        },
      },
      boxShadow: {
        card:  '0 4px 24px rgba(34,26,64,0.08)',
        'card-hover': '0 12px 40px rgba(34,26,64,0.14)',
        float: '0 8px 32px rgba(34,26,64,0.12)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
