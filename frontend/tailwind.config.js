/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['DIN Next Rounded', 'Feather', 'system-ui', '-apple-system', 'sans-serif'],
        'feather': ['Feather', 'system-ui', '-apple-system', 'sans-serif'],
        'feather-bold': ['Feather Bold', 'Feather', 'system-ui', '-apple-system', 'sans-serif'],
        'din-next': ['DIN Next Rounded', 'system-ui', '-apple-system', 'sans-serif'],
        'serif': ['DIN Next Rounded', 'Feather', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['DIN Next Rounded', 'Feather', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Exact Duolingo color palette from screenshots
        duolingo: {
          green: '#58cc02',        // Primary lime green from screenshots
          purple: '#ce82ff',       // Purple from "NEW WORD" text
          orange: '#ff9600',       // Orange from streak flame
          blue: '#1cb0f6',         // Blue from selected items and buttons
          red: '#ff4b4b',          // Red from heart/lives
          yellow: '#ffc800',       // Yellow from stars
          darkGreen: '#46a302',    // Darker green for accents
          lightBlue: '#4dabf7',    // Light blue from "I'M COMMITTED" button
          grey: '#8e8e93',         // Grey for secondary text
          lightGrey: '#f2f2f7',    // Light grey for backgrounds
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#58cc02", // Duolingo green
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#dc51ff", // Duolingo purple
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "#ff4b4b", // Duolingo red
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#ffc800", // Duolingo yellow
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "#58cc02",
          foreground: "white",
        },
        warning: {
          DEFAULT: "#ff9600",
          foreground: "white",
        },
        info: {
          DEFAULT: "#1cb0f6",
          foreground: "white",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
