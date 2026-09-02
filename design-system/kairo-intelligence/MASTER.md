# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** KAIRO Intelligence
**Generated:** 2026-08-18 07:47:50
**Category:** Environmental Intelligence / Analytics SaaS
**Design Dials:** Variance 6/10 (Balanced / Modern) | Motion 4/10 (Standard) | Density 7/10 (Standard)

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#2BD4A7` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#38BDF8` | `--color-secondary` |
| Accent/CTA | `#2BD4A7` | `--color-accent` |
| Background | `#07110F` | `--color-background` |
| Foreground | `#F4FBF8` | `--color-foreground` |
| Muted | `#94A99F` | `--color-muted` |
| Border | `rgba(209,255,242,.13)` | `--color-border` |
| Destructive | `#FB7185` | `--color-destructive` |
| Ring | `#60E9C4` | `--color-ring` |

**Color Notes:** KAIRO emerald is the only brand CTA color. Blue, amber, violet, cyan, and rose are reserved for data semantics. Glass surfaces must remain opaque enough for WCAG AA text contrast.

### Typography

- **Heading Font:** Manrope / IBM Plex Sans Arabic
- **Body Font:** Manrope / IBM Plex Sans Arabic
- **Mood:** dashboard, data, analytics, code, technical, precise
- **Arabic rule:** Arabic headings use normal letter spacing, `dir="rtl"`, and line-height ≥1.28. Body copy uses line-height ≥1.7.

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
```

### Spacing Variables

*Density: 7/10 — Standard*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(180deg, #62EDC7, #2BD4A7);
  color: #032219;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: rgba(255,255,255,.055);
  color: #F4FBF8;
  border: 1px solid rgba(209,255,242,.13);
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: rgba(13,28,23,.72);
  border: 1px solid rgba(209,255,242,.13);
  backdrop-filter: blur(24px) saturate(145%);
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #1E40AF;
  outline: none;
  box-shadow: 0 0 0 3px #1E40AF20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: rgba(10,23,19,.92);
  border: 1px solid rgba(209,255,242,.13);
  backdrop-filter: blur(28px) saturate(145%);
  border-radius: 24px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** KAIRO Apple Glass Intelligence

**Keywords:** dark mode, cinematic, ambient light, glassmorphism, deep black, indigo, glow, blur, atmospheric, reanimated, haptic, premium, layered, frosted glass, linear gradient

**Best For:** Developer tools, pro productivity apps, fintech/trading dashboards, media/streaming platforms, AI tool interfaces, high-end gaming companion apps

**Key Effects:** Expo.out Bezier(0.16,1,0.3,1) easing; spring modals (damping:20 stiffness:90); haptic-linked press (Impact Light/Medium); animated ambient light blobs (Reanimated translateX/Y slow oscillation); BlurView glassmorphism headers/nav (intensity 20); scale press 0.97 → 1.0; avoid pure #000000 (OLED smear)

### Page Pattern

**Pattern Name:** AI Personalization Landing

- **Conversion Strategy:** 20%+ conversion with personalization. Requires analytics integration. Fallback for new users.
- **CTA Placement:** Context-aware placement based on user segment
- **Section Order:** 1. Dynamic hero (personalized), 2. Relevant features, 3. Tailored testimonials, 4. Smart CTA

---

## Motion

**Stagger List** (Standard) — Trigger: load or scroll | Duration: 300-450ms | Easing: `back.out(1.4)`

```js
gsap.from('.grid-item', { opacity: 0, scale: 0.92, y: 16, duration: 0.4, stagger: { each: 0.06, from: 'start', grid: 'auto' }, ease: 'back.out(1.4)' });
```

**Framework notes:** grid: 'auto' lets GSAP infer rows/columns from a CSS grid layout for a natural wave stagger

- ✅ Combine with from: 'center' for a bento-grid layout to draw the eye inward first
- ❌ Don't use back.out on dense data tables; the overshoot reads as sloppy on informational UI
- ⚡ Group DOM writes; avoid interleaving layout reads (getBoundingClientRect) between staggered tweens

---

## Anti-Patterns (Do NOT Use)

- ❌ Cheap visuals
- ❌ Fast animations

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
