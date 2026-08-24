# UI STYLE INVENTORY

## PURPOSE

This document catalogs all visual styling patterns, design tokens, and UI components in the TA Portal. Use this as a reference when applying consistent visual changes or creating a rebrand.

---

## DESIGN SYSTEM: COLOR PALETTE

### CSS Custom Properties (Design Tokens)

#### Primary Colors
```css
--bg:      #FBF5EA;  /* Warm paper beige background */
--surface: #F4EBDA;  /* Slightly darker paper surface */
--card:    #FFFDF8;  /* Off-white card background */
--card2:   #F0E4CE;  /* Alternative card background */
```

#### Accent Colors
```css
--accent:  #C63D2F;  /* Primary red (buttons, links, highlights) */
--accent2: #3E7A54;  /* Success green (approved, positive states) */
--warn:    #D9A441;  /* Warning yellow/gold */
--danger:  #C63D2F;  /* Danger red (same as accent) */
```

#### Text Colors
```css
--text:    #2B2420;  /* Primary dark brown text */
--muted:   #6B5F53;  /* Secondary muted text */
```

#### UI Colors
```css
--border:  #E4D8C2;  /* Light brown borders */
--error:   #C63D2F;  /* Error state (same as accent) */
--success: #3E7A54;  /* Success state (same as accent2) */
```

#### Dashboard-Specific Colors
```css
--sidebar: 240px;    /* Sidebar width (not a color, but in :root) */
```

### Color Usage Guidelines

| Color | Primary Use | Secondary Use | Never Use For |
|-------|-------------|---------------|---------------|
| `--accent` (#C63D2F) | Buttons, links, active states | Error messages, warnings | Success states |
| `--accent2` (#3E7A54) | Success messages, approved badges | Positive stats | Buttons (reserved for accent) |
| `--text` (#2B2420) | Body text, headings | Button text (on light backgrounds) | Backgrounds |
| `--muted` (#6B5F53) | Secondary text, labels, placeholders | Disabled states | Primary content |
| `--bg` (#FBF5EA) | Page background | Card backgrounds (via --card) | Text |
| `--border` (#E4D8C2) | Dividers, card borders | Input borders | Text, backgrounds |

### Semantic Color Mapping

| Meaning | Color Variable | Hex Value | Usage |
|---------|----------------|-----------|-------|
| Primary action | `--accent` | #C63D2F | Login button, submit button, primary CTA |
| Success / Approved | `--accent2` | #3E7A54 | Approved badge, success alerts, checkmarks |
| Warning / Pending | `--warn` | #D9A441 | Pending badge, warning messages |
| Error / Rejected | `--error` | #C63D2F | Rejected badge, error alerts, validation errors |
| Neutral | `--muted` | #6B5F53 | Disabled states, optional fields, meta info |

---

## TYPOGRAPHY

### Font Families

#### Body Text
```css
font-family: 'Plus Jakarta Sans', sans-serif;
```
**Weights Used**: 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold), 800 (extra-bold)

**Google Fonts Import**:
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
```

#### Headings
```css
font-family: 'Fraunces', serif;
```
**Weights Used**: 500, 600, 700, 800, 900
**Variable Font**: Uses optical sizing (`opsz` 9-144)

**Google Fonts Import**:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800;9..144,900&display=swap" rel="stylesheet"/>
```

#### Handwriting Accent
```css
font-family: 'Caveat', cursive;
```
**Weights Used**: 600, 700

**Google Fonts Import**:
```html
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap" rel="stylesheet"/>
```

### Typography Scale

#### Headings
| Element | Font Family | Size (rem) | Size (clamp) | Weight | Usage |
|---------|-------------|------------|--------------|--------|-------|
| Page Title (H1) | Fraunces | 1.6 | clamp(2.6rem, 4.6vw, 4.1rem) | 700-800 | Hero headlines, main page titles |
| Section Title (H2) | Fraunces | 1.15-2.5 | clamp(1.7rem, 3.4vw, 2.5rem) | 600-700 | Section headings |
| Card Title (H3) | Fraunces | 1.0-1.08 | - | 600-700 | Card headers, component titles |
| Subsection | Fraunces | 0.95-1.2 | - | 600-700 | Smaller headings |

#### Body Text
| Element | Font Family | Size (rem) | Weight | Line Height | Usage |
|---------|-------------|------------|--------|-------------|-------|
| Body | Plus Jakarta Sans | 0.88-0.92 | 400 | 1.5-1.7 | Paragraph text |
| Large Body | Plus Jakarta Sans | 1.0-1.08 | 400 | 1.75 | Hero descriptions, important copy |
| Small Text | Plus Jakarta Sans | 0.75-0.82 | 500-600 | 1.4-1.6 | Labels, meta info, captions |
| Micro Text | Plus Jakarta Sans | 0.68-0.73 | 600-700 | 1.3 | Badges, tiny labels |

#### Monospace
| Element | Font Family | Size | Usage |
|---------|-------------|------|-------|
| URLs | `monospace` (system) | 0.85rem | Link display boxes |

### Text Styles

#### Letter Spacing
- Uppercase labels: `2.5px` (e.g., badge labels, section tags)
- Uppercase small: `1px` (e.g., table headers)
- Default headings: `-0.5px` to `-1px` (tighter tracking for display)
- Body text: default (no custom spacing)

#### Text Transform
- Badges: `uppercase`
- Table headers: `uppercase`
- Section tags: `uppercase`
- Labels: typically `uppercase`
- Everything else: default case

---

## SPACING & LAYOUT

### Spacing Scale (Pixels)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight gaps, icon spacing |
| sm | 6-8px | Compact padding, small gaps |
| md | 10-14px | Default button padding, input padding |
| lg | 16-22px | Card padding, section margins |
| xl | 24-32px | Page padding, large card padding |
| 2xl | 36-48px | Section spacing, hero padding |
| 3xl | 60-100px | Major section spacing |

### Border Radius

| Element Type | Radius | Usage |
|--------------|--------|-------|
| Small components | 7-8px | Badges, small buttons |
| Default | 10px | Buttons, inputs, cards |
| Medium | 12-14px | Larger cards, containers |
| Large | 16-18px | Hero sections, major containers |
| Pills | 100px | Pill-shaped buttons, tags |
| Circles | 50% | Avatars, icon containers |

### Container Widths

| Context | Max Width | Usage |
|---------|-----------|-------|
| Hero | 620px | Hero text content |
| Marketing content | 520px | Section titles |
| Form card | 480px | Auth forms, narrow forms |
| Profile form | 600px | Profile settings |
| Dashboard content | 820px | Teacher view, analytics |
| Full width | none | Dashboard main area |

### Grid Systems

#### Stats Row (Dashboard)
```css
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 16px;
```
**Responsive**: 2 columns on tablet, 2 columns on mobile

#### Features Grid (Landing Page)
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
gap: 22px;
```

#### Profile Grid
```css
display: grid;
grid-template-columns: 1fr 1fr;
gap: 16px;
```
**Responsive**: Single column on mobile

---

## COMPONENT PATTERNS

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--accent);
  color: #fff;
  padding: 13-15px 20-30px;
  border-radius: 10px;
  font-weight: 600-700;
  font-size: 0.88-0.98rem;
  box-shadow: 0 4px 0 #9E2E22; /* 3D press effect */
}
.btn-primary:hover {
  transform: translateY(-2px);
}
.btn-primary:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #9E2E22;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1.5px solid var(--text);
  padding: 15px 30px;
  border-radius: 9px;
}
```

#### Ghost Button
```css
.btn-ghost {
  background: var(--card2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 20px;
}
```

#### Success Button
```css
.btn-success {
  background: var(--accent2);
  color: #fff;
  box-shadow: 0 4px 0 #2C5A3F;
}
```

#### Danger Button
```css
.btn-danger {
  background: rgba(198,61,47,0.1);
  color: var(--danger);
  border: 1px solid rgba(198,61,47,0.3);
}
```

#### Small Button
```css
.btn-sm {
  padding: 6px 14px;
  font-size: 0.8rem;
  border-radius: 7px;
}
```

### Form Inputs

#### Text Input
```css
.form-input {
  width: 100%;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  color: var(--text);
  font-size: 0.9rem;
}
.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(198,61,47,0.1);
  outline: none;
}
```

#### Input with Icon
```css
.input-wrap {
  position: relative;
}
.input-wrap .icon {
  position: absolute;
  left: 13-14px;
  opacity: 0.55-0.6;
}
.input-wrap input {
  padding-left: 40-42px; /* Extra space for icon */
}
```

### Cards

#### Standard Card
```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14-16px;
  padding: 22-24px;
  margin-bottom: 18-20px;
}
```

#### Card Header
```css
.card-header {
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

#### Stat Card (with hover effect)
```css
.stat-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 22px;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}
.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent); /* or variant color */
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.25);
}
```

#### Feature Card (with tilt)
```css
.feature-card {
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 28px 26px;
  position: relative;
}
.feature-card:nth-child(odd) {
  transform: rotate(-0.6deg);
}
.feature-card:nth-child(even) {
  transform: rotate(0.6deg);
}
.feature-card:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 14px 30px var(--shadow);
  border-color: var(--gold);
}
```

### Badges

#### Status Badges
```css
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.badge-pending {
  background: rgba(247,201,72,0.12);
  color: var(--warn);
  border: 1px solid rgba(247,201,72,0.25);
}
.badge-approved {
  background: rgba(62,122,84,0.1);
  color: var(--accent2);
  border: 1px solid rgba(62,122,84,0.3);
}
.badge-rejected {
  background: rgba(198,61,47,0.1);
  color: var(--danger);
  border: 1px solid rgba(198,61,47,0.3);
}
```

#### Navigation Badge (notification count)
```css
.nav-badge {
  margin-left: auto;
  background: var(--danger);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 100px;
  min-width: 20px;
  text-align: center;
}
```

### Alerts

```css
.alert {
  border-radius: 10px;
  padding: 12px 15px;
  font-size: 0.84-0.85rem;
  margin-bottom: 16px;
  line-height: 1.5;
  display: none;
}
.alert.error {
  background: rgba(198,61,47,0.08);
  border: 1.5px solid rgba(198,61,47,0.3);
  color: var(--error);
  display: block;
}
.alert.success {
  background: rgba(62,122,84,0.08);
  border: 1.5px solid rgba(62,122,84,0.3);
  color: var(--success);
  display: block;
}
```

### Tables

#### Standard Table
```css
table {
  width: 100%;
  border-collapse: collapse;
}
th {
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--muted);
  font-weight: 600;
  padding: 10px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
td {
  padding: 13px 16px;
  font-size: 0.88rem;
  border-bottom: 1px solid rgba(43,36,32,0.04);
}
tr:hover td {
  background: rgba(255,255,255,0.02);
}
```

#### Gradebook Table (Sticky Headers)
```css
#marks-table {
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}
#marks-table thead th {
  position: sticky;
  top: 0;
  z-index: 4;
  background: var(--card);
}
```

**Mobile Adaptation**:
- Name + Roll No columns frozen (sticky left)
- Horizontal scroll for marks columns
- Minimum column widths enforced

---

## VISUAL EFFECTS

### Shadows

#### Card Shadows
```css
box-shadow: 0 12px 32px rgba(43,36,32,0.06); /* Subtle */
box-shadow: 0 16px 40px rgba(43,36,32,0.08); /* Medium */
box-shadow: 0 8px 28px rgba(0,0,0,0.25);      /* Hover */
```

#### Button 3D Press Effect
```css
box-shadow: 0 4px 0 #9E2E22; /* Default */
box-shadow: 0 2px 0 #9E2E22; /* Pressed */
```

#### Focus Ring
```css
box-shadow: 0 0 0 3px rgba(198,61,47,0.12); /* Accent focus */
box-shadow: 0 0 0 3px rgba(62,122,84,0.1);  /* Success focus */
```

### Transitions

#### Standard Transitions
```css
transition: background 0.2s;
transition: color 0.2s;
transition: border-color 0.2s;
transition: transform 0.2s;
transition: opacity 0.2s;
```

#### Combined Transitions
```css
transition: transform 0.15s, box-shadow 0.15s;
transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
```

### Animations

#### Fade Up (Page Load)
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(26px); }
  to   { opacity: 1; transform: translateY(0); }
}
animation: fadeUp 0.6s ease both;
```

#### Spin (Loading Spinner)
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
animation: spin 0.7s linear infinite;
```

#### Pop In (Success Icons)
```css
@keyframes popIn {
  from { transform: scale(0) rotate(-15deg); opacity: 0; }
  to   { transform: scale(1) rotate(-12deg); opacity: 1; }
}
animation: popIn 0.5s 1.1s cubic-bezier(.34,1.56,.64,1) both;
```

#### Pulse (Sync Indicator)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
animation: pulse 2s infinite;
```

#### Shimmer (Loading Skeleton)
```css
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
animation: shimmer 1.4s infinite;
```

### Background Patterns

#### Dot Grid (Page Background)
```css
background-image: radial-gradient(
  circle at 1px 1px,
  rgba(43,36,32,0.06) 1px,
  transparent 0
);
background-size: 22px 22px;
```

#### Gradient Blobs (Decorative)
```css
.blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(110px);
  opacity: 0.15-0.16;
  pointer-events: none;
}
.blob1 {
  width: 500-550px;
  height: 500-550px;
  background: var(--accent);
  top: -150px;
  left: -150px;
  animation: d1 12-13s ease-in-out infinite;
}
.blob2 {
  width: 350-400px;
  height: 350-400px;
  background: var(--accent2);
  bottom: -100-120px;
  right: -100-120px;
  animation: d2 14-15s ease-in-out infinite;
}
```

---

## ICONOGRAPHY

### Icon Strategy
**NO ICON LIBRARY USED** - All icons are:
1. Emoji (📊, 🎓, ✅, ⚠️, etc.)
2. Inline SVG (navigation icons, close buttons, etc.)
3. Unicode symbols (·, →, ←, etc.)

### Common Emoji Icons
| Icon | Unicode | Usage |
|------|---------|-------|
| 📊 | U+1F4CA | Marks, statistics, grades |
| 🎓 | U+1F393 | Education, graduation, students |
| ✅ | U+2705 | Success, approved, completed |
| ⚠️ | U+26A0 | Warning, attention, missing |
| 📧 | U+1F4E7 | Email, contact |
| 💬 | U+1F4AC | Chat, WhatsApp, messages |
| 🔗 | U+1F517 | Links, connections |
| 👤 | U+1F464 | User, profile |
| 🔒 | U+1F512 | Password, security |
| 📱 | U+1F4F1 | Mobile, phone |
| ➕ | U+2795 | Add, create new |
| ✏️ | U+270F | Edit, write |
| 🔍 | U+1F50D | Search |
| 📄 | U+1F4C4 | Document, file |
| 🚪 | U+1F6AA | Logout, exit |

### SVG Icon Style
- **Stroke-based** (not filled)
- **Stroke width**: 1.5-2px
- **Line cap**: round
- **Line join**: round
- **Size**: 16-22px for UI icons
- **Color**: currentColor (inherits text color)

---

## RESPONSIVE DESIGN

### Breakpoints

| Breakpoint | Width | Target Device | Major Changes |
|------------|-------|---------------|---------------|
| Mobile S | ≤480px | Small phones | 1-column layouts, compact padding |
| Mobile M | ≤500px | Medium phones | 2-column stat grids |
| Mobile L | ≤600px | Large phones | Profile grid → 1 column |
| Mobile Nav | ≤640px | All mobile | Hide nav links, show burger menu |
| Tablet | ≤900px | Tablets | Hero → 1 column, sidebar → drawer |

### Mobile-Specific Patterns

#### Sticky Columns (Gradebook)
```css
@media(max-width:900px) {
  #marks-table th:nth-child(1), 
  #marks-table td:nth-child(1) {
    position: sticky;
    left: 0;
    min-width: 100px;
    background: var(--card);
  }
  #marks-table th:nth-child(2), 
  #marks-table td:nth-child(2) {
    position: sticky;
    left: 100px;
    min-width: 70px;
    background: var(--card);
    box-shadow: 2px 0 4px rgba(0,0,0,0.25);
  }
}
```

#### Mobile Sidebar Toggle
```css
@media(max-width:900px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 40;
    display: none;
  }
  .overlay.show {
    display: block;
  }
}
```

---

## ACCESSIBILITY PATTERNS

### Focus States
- All interactive elements have visible focus rings
- Focus color: accent red with 12% opacity shadow
- Focus ring width: 3px
- Never remove outlines without replacement

### Color Contrast
**Note**: Contrast ratios not formally audited but design uses:
- Dark text on light backgrounds (high contrast)
- Light text only on dark accent backgrounds
- Muted text for secondary information only

### Keyboard Navigation
- Tab order follows visual order
- Enter key submits forms
- Escape key closes modals (not implemented)
- Arrow keys for dropdown navigation (native select)

### Screen Reader Considerations
- Semantic HTML (nav, aside, main, section, article)
- Form labels associated with inputs (via for/id)
- Alt text on decorative images: missing (SVGs)
- ARIA labels: missing (icon buttons need labels)

---

## LOADING STATES

### Skeleton Loaders
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--card2) 25%,
    rgba(43,36,32,0.06) 50%,
    var(--card2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
  height: 20px;
  margin-bottom: 8px;
}
```

### Spinner
```css
.spinner {
  width: 17-18px;
  height: 17-18px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: none; /* shown via JS */
}
```

### Sync Indicator
```css
.sync-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent2);
  display: inline-block;
  margin-right: 6px;
  animation: pulse 2s infinite;
}
```

---

## EMPTY STATES

```css
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--muted);
}
.empty-state .empty-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}
.empty-state .empty-icon svg {
  opacity: 0.4;
  width: 32px;
  height: 32px;
  stroke-width: 1.5px;
}
.empty-state p {
  font-size: 0.88rem;
}
```

---

## TOAST NOTIFICATIONS

```css
.toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  background: var(--card2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 0.88rem;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 10px;
  transform: translateY(80px);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.toast.show {
  transform: translateY(0);
  opacity: 1;
}
```

---

## DESIGN PRINCIPLES OBSERVED

### 1. Warmth & Approachability
- Warm beige/paper color palette
- Rounded corners everywhere
- Soft shadows
- Handwriting font accents

### 2. Tactile & Physical
- 3D button press effects (box-shadow)
- Paper texture background (dot grid)
- Card elevation on hover
- Slight rotations on feature cards (organic feel)

### 3. Clarity & Hierarchy
- Clear type scale with distinct sizes
- Generous whitespace
- Strong color contrast for CTAs
- Consistent spacing rhythm

### 4. Playfulness
- Emoji icons throughout
- Animated gradient blobs
- Tilted cards
- Bouncy animations (cubic-bezier)

### 5. Performance
- Inline styles (no external CSS files)
- Minimal animations
- CSS-only effects (no JavaScript animations)
- System fonts as fallbacks

---

## REBRAND GUIDELINES

### Safe to Change
✅ All CSS color variables
✅ Font families (with fallbacks)
✅ Border radius values
✅ Spacing scale
✅ Shadow styles
✅ Animation timing
✅ Hover effects

### Risky to Change
⚠️ Layout structure (grid/flex patterns)
⚠️ Component class names used in JS
⚠️ Z-index stack
⚠️ Responsive breakpoints (affects JS logic)

### Do Not Change
❌ DOM IDs (used by JavaScript)
❌ State class names (.active, .show, .open)
❌ Data attributes (if any exist)
❌ Sticky positioning logic (gradebook columns)

---

## CONCLUSION

This inventory represents the **complete visual design system** of TA Portal.

**Design Philosophy**: Warm, approachable, paper-inspired UI with tactile interactions and playful details.

**Rebrand Effort**: **MEDIUM**
- Color palette: 1 hour (find-and-replace variables)
- Typography: 2-4 hours (test font replacements, adjust sizes)
- Component restyling: 4-8 hours (buttons, cards, shadows)
- Testing: 4 hours (responsive, states, interactions)

**Total Estimate**: 10-20 hours for complete visual rebrand

**Recommended Approach**:
1. Create new color palette in CSS variables
2. Test on one page first (e.g., login.html)
3. Verify all states (hover, focus, active, disabled)
4. Roll out to remaining pages
5. Test responsive behavior at all breakpoints
6. Verify accessibility (focus states, contrast)
