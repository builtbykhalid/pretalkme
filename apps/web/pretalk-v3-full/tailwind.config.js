/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter","-apple-system","BlinkMacSystemFont","sans-serif"] },
      keyframes: {
        shimmer: { "0%":{"background-position":"-200% center"},"100%":{"background-position":"200% center"} },
        fadeUp:  { "0%":{opacity:"0",transform:"translateY(28px)"},"100%":{opacity:"1",transform:"translateY(0)"} },
        fadeIn:  { "0%":{opacity:"0"},"100%":{opacity:"1"} },
        slideDown:{ "0%":{opacity:"0",transform:"translateY(-14px)"},"100%":{opacity:"1",transform:"translateY(0)"} },
        scaleIn: { "0%":{opacity:"0",transform:"scale(0.96)"},"100%":{opacity:"1",transform:"scale(1)"} },
        pulseGlow:{ "0%,100%":{"box-shadow":"0 0 0 0 rgba(34,197,94,0.25)"},"50%":{"box-shadow":"0 0 0 10px rgba(34,197,94,0)"} },
        float:   { "0%,100%":{transform:"translateY(0)"},"50%":{transform:"translateY(-8px)"} },
      },
      animation: {
        shimmer:   "shimmer 3s linear infinite",
        fadeUp:    "fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both",
        fadeIn:    "fadeIn 0.5s ease both",
        slideDown: "slideDown 0.28s cubic-bezier(0.22,1,0.36,1) both",
        scaleIn:   "scaleIn 0.28s cubic-bezier(0.22,1,0.36,1) both",
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
        float:     "float 4s ease-in-out infinite",
      },
      transitionTimingFunction: { spring:"cubic-bezier(0.22,1,0.36,1)" },
    },
  },
  plugins: [],
};
