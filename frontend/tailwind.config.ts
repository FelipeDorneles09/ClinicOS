import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      colors: {
        // ─── TailAdmin Dark Palette ─────────────────────────────────
        "bg-body":     "#1A222C",
        "boxdark":     "#24303F",
        "boxdark-2":   "#1D2A39",
        "stroke":      "#2E3A47",
        "body":        "#AEB7C0",
        "bodydark":    "#DEE4EE",
        "bodydark1":   "#AEB7C0",
        "bodydark2":   "#8A99AF",

        // ─── Primary (TailAdmin blue) ────────────────────────────────
        primary:       "#3C50E0",
        "primary-dark": "#3444C4",

        // ─── Semantic ────────────────────────────────────────────────
        success:       "#219653",
        danger:        "#D34053",
        warning:       "#FFA70B",
        info:          "#3BA2B8",

        // ─── Emerald (medical accent) ────────────────────────────────
        emerald: {
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },

        // ─── Meta (TailAdmin extras) ─────────────────────────────────
        "meta-1":  "#DC3545",
        "meta-2":  "#EFF2F7",
        "meta-3":  "#10B981",
        "meta-4":  "#313D4A",
        "meta-5":  "#259AE6",
        "meta-6":  "#FFBA00",
        "meta-7":  "#FF6766",
        "meta-8":  "#F0950C",
        "meta-9":  "#E5E7EB",

        // ─── Legacy zinc (still used in some places) ─────────────────
        zinc: { 950: "#09090b" },
      },
      boxShadow: {
        default:    "0 1px 3px rgba(0,0,0,0.4)",
        md:         "0 4px 6px -1px rgba(0,0,0,0.4)",
        lg:         "0 10px 15px -3px rgba(0,0,0,0.4)",
        "card":     "0 2px 8px rgba(0,0,0,0.3)",
        "sidebar":  "0 4px 24px rgba(0,0,0,0.5)",
      },
      animation: {
        shimmer:      "shimmer 1.6s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-in":   "floatIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        floatIn: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
