/** @type {import('tailwindcss').Config} */
export default {
  content:['./index.html','./src/**/*.{js,jsx}'],
  theme:{extend:{
    colors:{
      brand:{50:'rgb(var(--brand-50) / <alpha-value>)',100:'rgb(var(--brand-100) / <alpha-value>)',200:'rgb(var(--brand-200) / <alpha-value>)',500:'rgb(var(--brand-500) / <alpha-value>)',600:'rgb(var(--brand-600) / <alpha-value>)',700:'rgb(var(--brand-700) / <alpha-value>)',900:'rgb(var(--brand-900) / <alpha-value>)'},
      ink:'rgb(var(--ink) / <alpha-value>)'
    },
    boxShadow:{soft:'0 12px 35px rgba(16,35,60,.08)',panel:'0 18px 55px rgba(15,23,42,.10)'}
  }},plugins:[]
};
