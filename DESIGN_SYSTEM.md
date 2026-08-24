# Aurelis Design System
**Version**: 2.0 — Enterprise EdTech  
**Organization**: Maqsad Tech  
**Date**: 2026-08-24

---

## Design Philosophy

Aurelis uses a **warm precision** aesthetic: a terracotta-and-cream palette that communicates academic credibility and reliability, combined with clean typographic hierarchy and purposeful spacing. The system deliberately avoids:

- Excessive gradients or glassmorphism
- Playful animations (blobs, card rotations)
- Neon colors or gaming-adjacent aesthetics
- Template-like visual patterns

The result should feel like **professional EdTech administration software** — trusted, organized, and mature.

---

## Color System

All colors are defined as CSS custom properties in `:root` on every page.

### Brand Colors

| Token | Value | Usage |
|---|---|---|
| `--brand-primary` | `#C63D2F` | Primary CTA, links, active state, logo accent |
| `--brand-primary-hover` | `#B03527` | Hover state on primary elements |
| `--brand-primary-active` | `#9E2E22` | Press/shadow on primary buttons |
| `--brand-secondary` | `#3E7A54` | Approval, success, positive indicators |
| `--brand-accent` | `#D9A441` | Warnings, highlights, column markers |

### Surface Colors

| Token | Value | Usage |
|---|---|---|
| `--background` | `#F7F1E8` | Page background |
| `--surface` | `#EFE6D4` | Sidebar, panels, table headers |
| `--surface-elevated` | `#FDFAF5` | Cards, modals, inputs |
| `--surface-muted` | `#EAE0CE` | Ghost buttons, pill backgrounds |

### Text Colors

| Token | Value | Usage |
|---|---|---|
| `--text-primary` | `#1E1A17` | Main body text, headings |
| `--text-secondary` | `#4A3F36` | Supporting copy |
| `--text-muted` | `#7A6E64` | Labels, placeholders, captions |
| `--text-disabled` | `#B0A89E` | Disabled inputs |
| `--text-inverse` | `#FDFAF5` | Text on dark backgrounds |

### Border Colors

| Token | Value | Usage |
|---|---|---|
| `--border` | `#DDD4C0` | Default component borders |
| `--border-subtle` | `#EAE0CE` | Row separators, dividers |
| `--border-strong` | `#C4B99E` | Emphasized borders, hover states |

### Status Colors

| Token | Value | Usage |
|---|---|---|
| `--success` | `#2E6B45` | Approved status text |
| `--success-bg` | `rgba(46,107,69,0.08)` | Approved status background |
| `--success-border` | `rgba(46,107,69,0.25)` | Approved status border |
| `--warning` | `#B8832A` | Pending status text |
| `--warning-bg` | `rgba(217,164,65,0.10)` | Pending status background |
| `--warning-border` | `rgba(217,164,65,0.30)` | Pending status border |
| `--danger` | `#C63D2F` | Error, rejected, destructive actions |
| `--danger-bg` | `rgba(198,61,47,0.08)` | Error background, danger zones |
| `--danger-border` | `rgba(198,61,47,0.25)` | Error borders |
| `--info` | `#2E5B8A` | Informational states |
| `--info-bg` | `rgba(46,91,138,0.08)` | Info background |
| `--info-border` | `rgba(46,91,138,0.25)` | Info border |

---

## Typography

### Typefaces

| Face | Source | Role |
|---|---|---|
| **Fraunces** | Google Fonts (serif) | Display, headings, logos, numbers |
| **Plus Jakarta Sans** | Google Fonts (sans-serif) | Body, labels, UI copy |

Caveat (handwriting) was present in the original design and is loaded on index.html but not actively used in the enterprise version — it is kept in the font import to avoid breaking any future use.

### Type Scale

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Display | Fraunces | clamp(2.4rem, 4.2vw, 3.8rem) | 700 | 1.10 | -0.75px |
| Page Heading | Fraunces | 1.55–1.6rem | 800 | 1.1 | -0.5px |
| Section Heading | Fraunces | clamp(1.6rem, 3.2vw, 2.3rem) | 700 | 1.18 | -0.4px |
| Card Heading | Fraunces | 0.97–1.1rem | 700 | 1.2 | -0.2px |
| Body | Plus Jakarta Sans | 0.875–0.95rem | 400 | 1.65 | — |
| Label (uppercase) | Plus Jakarta Sans | 0.68–0.78rem | 600–700 | — | 0.06em / 1.5–2.5px |
| Caption / Meta | Plus Jakarta Sans | 0.73–0.78rem | 400–500 | — | 0.02em |

### Usage Rules
- **Fraunces** for anything that requires authority or visual weight: titles, stat numbers, logo, CTAs
- **Plus Jakarta Sans** for everything functional: labels, body copy, table cells, form inputs
- Labels on form fields use **uppercase + letter-spacing** to communicate structure
- Do not use decorative fonts for body copy

---

## Spacing

Spacing is not tokenized as CSS variables but follows an 8px base scale throughout the application:

| Step | Value | Common Use |
|---|---|---|
| 1 | 4px | Inner badge padding, tight gaps |
| 2 | 8px | Small gaps between inline elements |
| 3 | 12px | Component inner padding (compact) |
| 4 | 16px | Standard component padding |
| 5 | 20px | Card body padding |
| 6 | 24px | Card padding, section gaps |
| 7 | 32px | Main content padding |
| 8 | 48px | Section spacing |
| 9 | 64–96px | Page section padding |

---

## Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 3px rgba(30,26,23,0.08)` | Stat cards, pills, subtle lift |
| `--shadow-sm` | `0 2px 8px rgba(30,26,23,0.08), 0 1px 3px rgba(30,26,23,0.05)` | Form cards, TA info cards |
| `--shadow-md` | `0 4px 16px rgba(30,26,23,0.10), 0 2px 6px rgba(30,26,23,0.06)` | Modals, hover state elevation |
| `--shadow-lg` | `0 8px 32px rgba(30,26,23,0.12), 0 4px 12px rgba(30,26,23,0.07)` | Auth cards, toasts, login card |

All shadows use the warm ink tone `rgba(30,26,23,…)` rather than pure black to stay on-palette.

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | Badges, pills, marks inputs, small chips |
| `--radius-md` | `10px` | Inputs, buttons, small cards, nav items |
| `--radius-lg` | `14px` | Cards, modals, stat cards, TA info cards |
| `--radius-xl` | `20px` | CTA box, large hero elements |

---

## Button System

All buttons share the `.btn` base class on dashboard.html. On simpler pages, `.btn-submit` handles form submission.

### Button Variants

| Variant | Class | Background | Text | Shadow |
|---|---|---|---|---|
| Primary | `.btn-primary` | `--brand-primary` | `#fff` | `0 3px 0 --brand-primary-active` |
| Success | `.btn-success` | `--brand-secondary` | `#fff` | `0 3px 0 #2C5A3F` |
| Danger | `.btn-danger` | `--danger-bg` | `--danger` | border only |
| Ghost | `.btn-ghost` | `--surface-muted` | `--text-primary` | border only |
| Small | `.btn-sm` | — | — | `padding: 6px 13px`, `radius: --radius-sm` |

### Button Rules
- Primary and success buttons use a 3px bottom shadow for depth (reduced from original 4px for precision)
- All buttons animate with `translateY(-1px)` on hover
- Disabled state: `opacity: 0.48`, `cursor: not-allowed`
- Submit buttons on auth pages use `.btn-submit`: full-width, Fraunces font, 13px padding

---

## Input System

### Standard Input

```css
background: var(--surface)
border: 1px solid var(--border)
border-radius: var(--radius-md)
padding: 11px 14px 11px 38px  /* 38px left for icon */
font-size: 0.9rem
```

### Focus State
```css
border-color: var(--brand-primary)
box-shadow: 0 0 0 3px var(--danger-bg)
background: var(--surface-elevated)
```

### Label Style
```css
font-size: 0.78rem
font-weight: 600
text-transform: uppercase
letter-spacing: 0.06em
color: var(--text-muted)
```

### States
- **Placeholder**: `--text-disabled`
- **Disabled / read-only**: `opacity: 0.5`, `cursor: not-allowed`
- **Error**: border becomes `--brand-primary`, alert shown above button

---

## Card System

### Standard Card (dashboard.html)
```css
background: var(--surface-elevated)
border: 1px solid var(--border)
border-radius: var(--radius-lg)
box-shadow: var(--shadow-xs)
overflow: hidden
```

Card headers have `border-bottom: 1px solid var(--border)` and `padding: 16px 20px`.  
Card body has `padding: 20px`.

### Auth Card (login, reset-password)
Same base with `box-shadow: var(--shadow-lg)` and a 3px `--brand-primary` top accent strip.

### Feature Card (index.html)
No rotation (enterprise rule). Has a `--brand-primary` top border that appears on `:hover` via `opacity` transition.

---

## Navigation (Sidebar)

The sidebar is fixed-width (`--sidebar: 240px`, compact: `170px`) on the left edge.

### Nav Item States

| State | Background | Text Color |
|---|---|---|
| Default | transparent | `--text-muted` |
| Hover | `--danger-bg` | `--text-primary` |
| Active | `rgba(198,61,47,0.12)` | `--brand-primary` |

### Nav Badge
- Background: `--brand-primary`
- Font: 0.66rem, weight 700
- Shape: `100px` border-radius pill

### Sidebar Logo
- Font: Fraunces 800, 1.25rem
- "lis" portion: `--brand-primary`

---

## Alert / Status System

All alerts share the same structural pattern — colored background, matching border, semantic text color.

```css
/* Error */
background: var(--danger-bg)
border: 1px solid var(--danger-border)
color: var(--danger)

/* Success */
background: var(--success-bg)
border: 1px solid var(--success-border)
color: var(--success)
```

---

## Badge System (Status Indicators)

Used in the students table and throughout the dashboard.

| Badge | Background | Text | Border |
|---|---|---|---|
| `.badge-pending` | `--warning-bg` | `--warning` | `--warning-border` |
| `.badge-approved` | `--success-bg` | `--success` | `--success-border` |
| `.badge-rejected` | `--danger-bg` | `--danger` | `--danger-border` |

All badges: `border-radius: 100px`, `font-size: 0.7rem`, `font-weight: 700`, `text-transform: uppercase`.

---

## Table System

### Header Row
```css
font-size: 0.72rem
text-transform: uppercase
letter-spacing: 1.5px
font-weight: 700
color: var(--text-muted)
background: var(--surface)
border-bottom: 1px solid var(--border)
```

### Data Row
```css
font-size: 0.875rem
border-bottom: 1px solid var(--border-subtle)
color: var(--text-primary)
```

### Hover Row
```css
background: rgba(253,250,245,0.7)
```

### Marks Input
```css
background: var(--surface)
border: 1px solid var(--border)
border-radius: var(--radius-sm)
focus: border-color --brand-primary, box-shadow 0 0 0 2px --danger-bg
```

### Mobile (Frozen Columns)
On `max-width: 900px`, the marks table switches to `table-layout: auto; width: max-content` with the first two columns (Name, Roll No) frozen via `position: sticky`. This behavior is preserved unchanged from the original implementation.

---

## Toast Notifications

```css
background: var(--surface-elevated)
border: 1px solid var(--border)
border-radius: var(--radius-lg)
box-shadow: var(--shadow-lg)
position: fixed; bottom: 24px; right: 24px
```

Enter/exit via `translateY(80px) → translateY(0)` with `opacity 0 → 1`.

---

## Background Pattern

All pages use a subtle dot grid:
```css
background-image: radial-gradient(circle, rgba(30,26,23,0.055) 1px, transparent 1px);
background-size: 28px 28px;
```

This replaces the original 22px denser grid for a cleaner, less prominent texture.

---

## Motion Principles

All transitions are `0.15s–0.3s ease`. Permitted properties:

- `opacity`
- `color`
- `background-color`
- `border-color`
- `box-shadow`
- `transform: translateY` (buttons, cards — maximum ±3px)

Not used:
- Layout shifts
- Large movement animations
- Blob/fluid animations
- Scroll-triggered effects

The `.reveal` scroll-fade on index.html (`opacity + translateY(22px)`) is retained as it is subtle and content-focused.

---

## Email Template System

Email templates in `send-marks-email/index.ts` use inline CSS for maximum email client compatibility.

### Email Structure
- **Background**: `#F0EAE0` (warm cream — on-palette)
- **Container**: `#FDFAF5`, `border-radius: 12px`, `border: 1px solid #DDD4C0`
- **Header**: `#1E1A17` (dark ink) — enterprise authority
- **Logo in header**: `Aure<span style="color:#C63D2F">lis</span>`
- **Body padding**: `30px 36px`
- **Info rows**: HTML `<table>` for email client compatibility
- **Footer**: `#F7F1E8` background, `#B0A89E` text, includes "Maqsad Tech"

### Score Color Logic
- Score ≥ 60%: `#2E6B45` (brand-secondary / success)
- Score < 60%: `#C63D2F` (brand-primary / danger)

---

## Responsive Principles

| Breakpoint | Behavior |
|---|---|
| `> 900px` | Full sidebar visible, multi-column layouts |
| `≤ 900px` | Sidebar hidden (slide-in via `.open`), single column, hamburger toggle |
| `≤ 640px` | Nav links hidden on landing, steps stack vertically |
| `≤ 500px` | Stat cards 2-column, auth forms single column |

---

## Legacy Alias Map

Every page defines alias variables so that any inline HTML or dynamically-injected content that references old variable names continues to resolve correctly:

| Old Name | Alias Target |
|---|---|
| `--bg` | `--background` |
| `--card` | `--surface-elevated` |
| `--card2` | `--surface-muted` |
| `--accent` | `--brand-primary` |
| `--accent2` | `--brand-secondary` |
| `--warn` | `--brand-accent` |
| `--text` | `--text-primary` |
| `--muted` | `--text-muted` |
| `--paper` | `--background` (index.html only) |
| `--ink` | `--text-primary` (index.html only) |
| `--red` | `--brand-primary` (index.html only) |
| `--pine` | `--brand-secondary` (index.html only) |
| `--gold` | `--brand-accent` (index.html only) |
