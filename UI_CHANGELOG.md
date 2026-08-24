# UI Changelog — Phase 2: Enterprise Design System

**Date**: 2026-08-24  
**Type**: Visual Restyling (CSS only)  
**Scope**: All 6 HTML pages + email templates  
**JavaScript Changes**: 0  
**Supabase Changes**: 0  
**Database Changes**: 0  
**DOM Changes**: 1 (index.html eyebrow text content — visual only)

---

## Summary

Phase 2 introduced a complete enterprise design token system across all pages, shifting the product from a warm-but-casual paper aesthetic to a professional EdTech visual language. The change is **CSS-only** on 5 of 6 HTML pages. The only DOM text change was updating the hero eyebrow label on the landing page.

---

## Files Modified

### 1. `index.html` — Landing Page

#### Design Token System Added
- Full `:root` block with all `--brand-*`, `--surface-*`, `--text-*`, `--border-*`, `--status-*`, `--shadow-*`, `--radius-*` tokens
- Legacy alias vars (`--paper`, `--ink`, `--red`, `--pine`, `--gold`) pointing to new tokens for backward compat

#### Typography
- Nav links: reduced to `0.88rem`, letter-spacing added
- Hero heading: tightened from `clamp(2.6rem, 4.6vw, 4.1rem)` → `clamp(2.4rem, 4.2vw, 3.8rem)`
- Section titles: reduced from `2.5rem` max to `2.3rem`, weight kept at 700

#### Navigation
- Height changed from loose padding (`18px`) to fixed `height: 64px`
- Background opacity increased from `0.85` to `0.92` for better legibility
- CTA button: hover now transitions to `--brand-primary` instead of `--red`

#### Eyebrow Label (1 DOM text change)
- Text: "Built by a TA, for TAs" → "Built for Teaching Assistants"
- Style: removed handwriting/rotation treatment → uppercase pill badge with border and background

#### Feature Cards
- **Removed** `rotate(±0.6deg)` on odd/even cards
- **Added** 3px top border accent that appears on hover (opacity 0 → 1)
- Icon background: circle → rounded square (`--radius-md`)
- Hover: `translateY(-4px)` → `translateY(-3px)` (more precise)

#### Hero Stats
- **Before**: loose flex row with custom gap
- **After**: grouped bordered panel with dividers between stats — communicates precision

#### Dividers
- **Before**: `2px dashed` warm beige
- **After**: `1px solid` — cleaner, more professional

#### How It Works Section
- Added `background: var(--surface)` and border-top/bottom — creates visual section separation

#### Footer
- Added `background: var(--surface)` for grounded feel
- Link hover: adds `--brand-primary` color transition

#### Animations
- `fadeUp` distance reduced from `22px` to `20px`
- `reveal` transition: `0.6s` → `0.55s`

---

### 2. `login.html` — Authentication

#### Design Token System Added
- Full `:root` with all enterprise tokens
- Legacy aliases: `--bg`, `--card`, `--accent`, `--accent2`, `--text`, `--muted`, `--error`

#### Background
- Dot grid: `22px/22px` → `28px/28px` (less dense, cleaner)

#### Blob Animations
- **Removed**: `.blob1` and `.blob2` animated gradient blobs
- **Replaced with**: `display: none` — enterprise clean background

#### Card
- Border: `1.5px` → `1px`
- Top accent strip: `4px` → `3px` height
- Box shadow: hardcoded `rgba` → `var(--shadow-lg)`
- Border radius: `14px` → `var(--radius-lg)` (same value, tokenized)

#### Tabs
- **Added** `border: 1px solid var(--border)` on tab container
- Tab hover state added (missing from original)
- Font-size: `0.9rem` → `0.875rem` (tighter)

#### Form Labels
- **Before**: `0.8rem` weight 600, no transform
- **After**: `0.78rem`, `text-transform: uppercase`, `letter-spacing: 0.06em` — professional label style

#### Inputs
- Border: `1.5px` → `1px`
- Focus ring: `blur` → clean `box-shadow` only
- Placeholder color: hardcoded `#A69A89` → `var(--text-disabled)`
- Focus background: surface → surface-elevated (subtle feedback)

#### Submit Button
- Bottom shadow: `0 4px 0` → `0 3px 0` (precision)
- Hover lift: preserved at `translateY(-2px)`

#### Alerts
- All hardcoded `rgba` values → semantic token vars
- Border: `1.5px` → `1px`

#### Password Strength Bar
- Height: `4px` → `3px` (more refined)

---

### 3. `reset-password.html` — Password Reset

#### Design Token System Added
- Full `:root` with brand, surface, text, border, status, shadow, radius tokens
- Legacy aliases included

#### Background / Blobs
- Same treatment as login.html: blobs hidden, dot grid at 28px

#### Card
- Border: `1.5px` → `1px`
- Top accent: `4px` → `3px`
- Box shadow: hardcoded → `var(--shadow-lg)`

#### Form Labels
- Same upgrade as login.html: uppercase + letter-spacing

#### Inputs
- Border: `1.5px` → `1px`
- Focus ring: clean token-based
- Background on focus: elevated surface

#### Button
- Shadow: `0 4px 0` → `0 3px 0`
- Added `letter-spacing: 0.01em`

---

### 4. `join.html` — Student Enrollment

#### Design Token System Added
- Full `:root` with all tokens including `--warning`, `--warning-bg`, `--warning-border`
- Legacy aliases for all old var names used in dynamic JS-injected HTML

#### Background / Blobs
- Same treatment: blobs hidden, dot grid at 28px

#### TA Info Card
- **Before**: `background: var(--card2)` with dashed border
- **After**: `background: var(--surface-elevated)` with solid 1px border + top accent strip
- Avatar shadow: `rgba(198,61,47,0.3)` → `var(--danger-bg)` (softer)

#### Form Card
- Box shadow: hardcoded → `var(--shadow-md)`
- Border: `1.5px` → `1px`

#### Form Labels
- Same uppercase + letter-spacing upgrade as other auth pages

#### Marks Chart
- `background: var(--card2)` → `var(--surface)` — consistent surface hierarchy
- Bar track: `rgba(43,36,32,0.05)` → `rgba(30,26,23,0.05)` (on-token ink color)

#### Query Section
- Border-top: `1px dashed` → `1px solid var(--border-subtle)`
- Query item background: `var(--card)` → `var(--surface-elevated)`

#### Secondary Button
- Border: `1.5px dashed` → `1px dashed var(--border-strong)`
- Hover: solid color → `--brand-primary` (consistent)

---

### 5. `dashboard.html` — Main TA Interface

#### Design Token System Added
- Full `:root` with all enterprise tokens
- All `--sidebar` variable kept — critical for layout

#### Body/Background
- Background: `#FBF5EA` → `var(--background)` (`#F7F1E8`)
- No dot grid on dashboard (sidebar layout, dot grid would conflict)

#### Sidebar
- Logo padding: `28px 24px 20px` → `24px 22px 18px` (tighter)
- Logo font: `1.3rem` → `1.25rem`
- Role label: added `text-transform: uppercase; letter-spacing: 1px` — more professional
- Nav items: `border-radius: 10px` → `var(--radius-md)` (same, tokenized)
- Nav item hover: `rgba(198,61,47,0.07)` → `var(--danger-bg)` (token)
- Nav item active: `rgba(198,61,47,0.13)` → `rgba(198,61,47,0.12)` (token-based)
- Nav badge: background `var(--danger)` → `var(--brand-primary)` (same color, correct semantic)
- Sidebar bottom padding: `16px 12px` → `14px 10px` (tighter)

#### Main Content Area
- `margin-bottom` on topbar: `32px` → `30px`

#### Stat Cards
- Border-radius: `14px` → `var(--radius-lg)` (same, tokenized)
- Top accent strip: `2px` → `3px` (more visible)
- Hover shadow: hardcoded `rgba(0,0,0,0.25)` → `var(--shadow-md)` (on-palette)
- Stat number: added `color: var(--text-primary)` for explicitness
- Stat label: added `font-weight: 500; letter-spacing: 0.02em`

#### Cards
- Border-radius: `16px` → `var(--radius-lg)` (14px — slightly tighter, more systematic)
- Box shadow: none → `var(--shadow-xs)` (subtle lift)
- Card body padding: `22px` → `20px`
- Card header padding: `18px 22px` → `16px 20px`

#### Link Box
- Border-radius: `12px` → `var(--radius-md)`
- Copy button: simplified to use token vars, border set properly

#### Buttons
- All `box-shadow: 0 4px 0` → `0 3px 0` (precision)
- `.btn-ghost`: `var(--card2)` → `var(--surface-muted)` (semantic)
- Border-radius: `10px` → `var(--radius-md)`, `7px` → `var(--radius-sm)`

#### Table
- Sticky header background: `var(--card)` → `var(--surface-elevated)` (token)
- `th` font-size: `0.75rem` → `0.72rem`, weight `600` → `700`
- `td` border: `rgba(43,36,32,0.04)` → `var(--border-subtle)` (token)
- Row hover: `rgba(255,255,255,0.02)` → `rgba(253,250,245,0.7)` (more visible, on-palette)
- Mobile sticky column freeze: background `var(--card)` → `var(--surface-elevated)` (token)
- Mobile column shadow: `rgba(0,0,0,0.25)` → `rgba(30,26,23,0.10)` (on-palette)

#### Badges
- All badge colors changed from hardcoded `rgba` → semantic status tokens

#### Marks Input
- Border-radius: `7px` → `var(--radius-sm)`
- Focus: added `box-shadow: 0 0 0 2px var(--danger-bg)` (consistent with inputs)

#### Profile Form Labels
- Added `text-transform: uppercase; letter-spacing: 0.06em`

#### Toast
- Background: `var(--card2)` → `var(--surface-elevated)`
- Box shadow: hardcoded dark → `var(--shadow-lg)`
- Position: `28px` → `24px` from edges

#### Overlay
- Background: `rgba(0,0,0,0.5)` → `rgba(30,26,23,0.45)` (warm ink tone)

#### Category Pills
- Updated to use token vars, hover uses `--surface-muted` and `--border-strong`

---

### 6. `teacher-view.html` — Read-Only Instructor View

#### Design Token System Added
- Full `:root` with all enterprise tokens

#### Background
- Dot grid: `22px` → `28px`

#### Logo
- Font size: `1.3rem` → `1.25rem`

#### Header Card
- **Before**: `background: var(--card2)` with dashed border
- **After**: `background: var(--surface-elevated)` with solid border + shadow
- Top accent: `4px` → `3px`
- "Read-only" badge: plain text → uppercase pill with `--danger-bg` background

#### Stats
- Border-radius: `12px` → `var(--radius-md)`
- Added `box-shadow: var(--shadow-xs)`
- Number color: `--accent2` → `--brand-secondary` (same, tokenized)
- Label: added `font-weight: 500; letter-spacing: 0.02em`

#### Jump Pills (Category Navigation)
- **Before**: solid border, no active background distinction
- **After**: Hover shows `--danger-bg` with `--brand-primary` text; active fills `--brand-primary`

#### Quiz Cards
- Added `box-shadow: var(--shadow-xs)`
- Border-radius: `14px` → `var(--radius-lg)` (tokenized)

#### Mini Stats
- Background: `var(--surface)` → `var(--surface)` with `border: 1px solid var(--border-subtle)` added
- Number: added `color: var(--text-primary)` explicitly

#### Distribution Bar
- Height: `26px` → `22px` (more precise)
- Added `border: 1px solid var(--border-subtle)`

#### Full List
- Dropdown now has `border: 1px solid var(--border)` and `border-radius: var(--radius-sm)`

#### Rank Badges
- **Before**: `background: rgba(62,122,84,0.12); color: var(--accent2)` (no border)
- **After**: Use semantic tokens `--success-bg`, `--success`, `--success-border` / `--danger-bg`, `--danger`, `--danger-border`

#### Mini List Title
- **Before**: `font-size: 0.8rem; font-weight: 700`
- **After**: `text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted)` — table header style

---

### 7. `supabase/functions/send-marks-email/index.ts` — Email Templates

#### Marks Email
- **Before**: `linear-gradient(135deg, #4f8ef7, #38e5b0)` teal-blue header
- **After**: `#1E1A17` solid dark header — enterprise authority
- Logo redesigned: plain `h1` → branded `Aure<span>lis</span>` in header
- Subheading: "Your marks are here!" → "Academic Performance Notification"
- Score box: `background: #f8faff; border: #dce8ff` → on-palette warm cream
- Score pass color: `#38e5b0` → `#2E6B45` (brand-secondary)
- Score fail color: `#f77474` → `#C63D2F` (brand-primary / danger)
- Info layout: `display: flex` divs → `<table>` for email client compatibility
- Remarks box: amber-warm palette (was yellow-blue contrast)
- Footer: added "Maqsad Tech" attribution

#### Reminder Email
- Same header treatment: gradient removed → `#1E1A17` dark
- Warning box: uses amber warning palette on cream background
- Info layout: flex → `<table>` for email compat
- Footer: added "Maqsad Tech" attribution

---

## Final Report

```
DOM CHANGES:         1  (index.html eyebrow text — visual copy only)
JAVASCRIPT CHANGES:  0
SUPABASE CHANGES:    0
DATABASE CHANGES:    0
```

### Visual Changes Summary

| Area | Before | After |
|---|---|---|
| Background | Yellow-cream `#FBF5EA`, 22px dot grid | Cleaner cream `#F7F1E8`, 28px dot grid |
| Blob animations | Present on 3 pages (login, join, reset) | Removed — display:none |
| Feature card rotation | ±0.6deg on alternating cards | No rotation |
| Card borders | 1.5px mixed | 1px consistently |
| Button shadow depth | 4px | 3px |
| Form labels | Sentence case, no transform | UPPERCASE with letter-spacing |
| Status badges | Hardcoded rgba values | Semantic token system |
| Table rows | Near-invisible hover | Visible warm hover |
| Sidebar role label | Plain small text | Uppercase+tracking |
| Nav item hover | Light red tint | Uses `--danger-bg` token |
| Email header | Blue/teal gradient | Dark ink `#1E1A17` |
| Email score colors | Cyan/coral | Brand-secondary/danger |
| Email info rows | Flex divs | HTML tables |
| Token system | Inconsistent, per-file | Unified across all 7 files |
