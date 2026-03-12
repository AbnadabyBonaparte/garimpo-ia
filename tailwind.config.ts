/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        /* ═══════════════════════════════════════════
           LEI 1 ALSHAM: ZERO CORES HARDCODED
           Todas as cores via CSS variables definidas
           em src/styles/theme.css (SSOT ÚNICO)
        ═══════════════════════════════════════════ */
        background: {
          deep: 'var(--color-bg-deep)',
          surface: 'var(--color-bg-surface)',
          'surface-alt': 'var(--color-bg-surface-alt)',
        },
        foreground: {
          DEFAULT: 'var(--color-text-primary)',
          muted: 'var(--color-text-secondary)',
        },
        amber: {
          DEFAULT: 'var(--color-amber)',
          dark: 'var(--color-amber-dark)',
        },
        cyan: {
          DEFAULT: 'var(--color-cyan)',
        },
        green: {
          DEFAULT: 'var(--color-green)',
        },
        red: {
          DEFAULT: 'var(--color-red)',
        },
        alsham: {
          DEFAULT: 'var(--color-alsham)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        /* Sistema 8px do brandbook */
        '1x': 'var(--spacing-xs)',
        '2x': 'var(--spacing-sm)',
        '3x': 'var(--spacing-md)',
        '4x': 'var(--spacing-lg)',
        '6x': 'var(--spacing-xl)',
        '8x': 'var(--spacing-2xl)',
        '10x': 'var(--spacing-3xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        'elevation-1': 'var(--shadow-elevation-1)',
        'elevation-2': 'var(--shadow-elevation-2)',
        'glow-amber': 'var(--shadow-glow-amber)',
        'glow-cyan': 'var(--shadow-glow-cyan)',
      },
      animation: {
        'score-count': 'scoreCount 1200ms ease-in-out',
        'slide-in': 'slideIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-scan': 'pulseScan 1500ms ease-in-out infinite',
        'card-unlock': 'cardUnlock 600ms ease-out',
      },
      keyframes: {
        scoreCount: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseScan: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        cardUnlock: {
          '0%': { filter: 'blur(4px)', opacity: '0.5' },
          '100%': { filter: 'blur(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
