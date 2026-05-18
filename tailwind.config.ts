import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "hsl(262, 100%, 97%)",
          100: "hsl(262, 90%, 93%)",
          200: "hsl(262, 85%, 85%)",
          300: "hsl(262, 80%, 75%)",
          400: "hsl(262, 75%, 65%)",
          500: "hsl(262, 70%, 55%)",
          600: "hsl(262, 65%, 48%)",
          700: "hsl(262, 60%, 40%)",
          800: "hsl(262, 55%, 32%)",
          900: "hsl(262, 50%, 22%)",
          950: "hsl(262, 45%, 12%)",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
          card: "hsl(var(--surface-card))",
          border: "hsl(var(--surface-border))",
        },
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
        },
        success: { DEFAULT: "hsl(142, 70%, 45%)", light: "hsl(142, 70%, 90%)" },
        warning: { DEFAULT: "hsl(38, 95%, 55%)", light: "hsl(38, 95%, 92%)" },
        danger: { DEFAULT: "hsl(4, 85%, 55%)", light: "hsl(4, 85%, 94%)" },
        accent: {
          orange: "hsl(25, 95%, 58%)",
          teal: "hsl(174, 72%, 45%)",
          pink: "hsl(330, 80%, 60%)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, hsl(262, 70%, 55%), hsl(302, 70%, 55%))",
        "gradient-dark": "linear-gradient(135deg, hsl(224, 20%, 8%), hsl(262, 25%, 12%))",
        "gradient-card": "linear-gradient(135deg, hsl(224, 18%, 14%), hsl(262, 20%, 16%))",
        "gradient-hero": "radial-gradient(ellipse at top left, hsl(262, 50%, 25%), hsl(224, 20%, 8%) 60%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideDown: { from: { opacity: "0", transform: "translateY(-16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        float: { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulseSoft: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
      },
      boxShadow: {
        brand: "0 8px 32px hsl(262 70% 55% / var(--brand-shadow-opacity))",
        card: "0 4px 24px hsl(var(--shadow-color) / var(--shadow-opacity))",
        glow: "0 0 40px hsl(262 70% 55% / var(--brand-shadow-opacity))",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
