# University of Pretoria (up.ac.za) — Design System

> Based on the live UP website, Drupal 10 custom theme `up2024`, and official UP brand identity.  
> Brand essence: **"Make today matter"** | Motto: *Ad Destinatum Persequor*

---

## 1. Brand Colours

UP's identity uses three official brand colours: Blue, Red, and Ochre.

| Name        | Hex       | RGB                | Usage                                              |
|-------------|-----------|--------------------|----------------------------------------------------|
| UP Blue     | `#003B7A` | rgb(0, 59, 122)    | Primary — navigation bar, links, headings, CTAs    |
| UP Red      | `#C8102E` | rgb(200, 16, 46)   | Accent — alerts, active states, hover highlights   |
| UP Ochre    | `#C77B2E` | rgb(199, 123, 46)  | Secondary accent — dividers, tags, warm highlights |
| White       | `#FFFFFF` | rgb(255, 255, 255) | Page backgrounds, card surfaces, nav text on blue  |
| Light Grey  | `#F4F4F4` | rgb(244, 244, 244) | Alternating section backgrounds                    |
| Mid Grey    | `#666666` | rgb(102, 102, 102) | Subtext, captions, metadata                        |
| Dark Text   | `#1A1A1A` | rgb(26, 26, 26)    | Body copy                                          |
| Footer Dark | `#002050` | rgb(0, 32, 80)     | Footer background (deeper navy)                    |

### Colour Usage Principles

- **Blue dominates** — used for the top navigation bar, primary buttons, section headers, and active nav items.
- **Red is used sparingly** — for hover states on links, error messaging, and bold accent moments.
- **Ochre is decorative** — used as a subtle divider line, category tag background, or pull-quote accent; never for body text.
- **White space is generous** — large white content areas let photography breathe.

---

## 2. Typography

UP's website uses a clean, modern type stack suited for an academic institution.

### Type Stack

| Role           | Font Family                          | Weight     | Size (Desktop)  |
|----------------|--------------------------------------|------------|-----------------|
| Display / Hero | `Georgia`, serif                     | 700 (Bold) | 48–60px         |
| Page Headings  | `Arial`, `Helvetica Neue`, sans-serif| 700        | 28–36px         |
| Sub-headings   | `Arial`, `Helvetica Neue`, sans-serif| 600        | 20–24px         |
| Body Copy      | `Arial`, `Helvetica Neue`, sans-serif| 400        | 16px            |
| Captions / UI  | `Arial`, `Helvetica Neue`, sans-serif| 400        | 13–14px         |
| Navigation     | `Arial`, `Helvetica Neue`, sans-serif| 600        | 15px            |

### Type Scale (CSS)

```css
:root {
  --font-display: Georgia, "Times New Roman", serif;
  --font-body: Arial, "Helvetica Neue", Helvetica, sans-serif;

  --text-xs:   0.8125rem;  /* 13px — labels, fine print */
  --text-sm:   0.875rem;   /* 14px — captions, metadata */
  --text-base: 1rem;       /* 16px — body copy */
  --text-lg:   1.125rem;   /* 18px — lead paragraphs */
  --text-xl:   1.25rem;    /* 20px — sub-headings */
  --text-2xl:  1.5rem;     /* 24px — section titles */
  --text-3xl:  1.875rem;   /* 30px — page titles */
  --text-4xl:  2.25rem;    /* 36px — major headings */
  --text-hero: 3rem;       /* 48px — hero headline */

  --line-height-tight:  1.2;
  --line-height-normal: 1.6;
  --line-height-loose:  1.8;
}
```

---

## 3. Colour Tokens (CSS Variables)

```css
:root {
  /* Brand */
  --color-primary:        #003B7A;
  --color-primary-dark:   #002050;
  --color-primary-light:  #1A5FA0;
  --color-accent-red:     #C8102E;
  --color-accent-ochre:   #C77B2E;

  /* Neutrals */
  --color-white:          #FFFFFF;
  --color-bg-light:       #F4F4F4;
  --color-border:         #E0E0E0;
  --color-text-muted:     #666666;
  --color-text:           #1A1A1A;
  --color-footer-bg:      #002050;
  --color-footer-text:    #B8C8DC;

  /* States */
  --color-hover:          #1A5FA0;
  --color-focus-ring:     #C77B2E;
  --color-active-nav:     #C8102E;
}
```

---

## 4. Layout & Grid

### Page Width

- **Max content width:** `1280px`
- **Gutter (left/right padding):** `24px` mobile → `40px` tablet → `80px` desktop
- **Column grid:** 12-column CSS grid

### Breakpoints

```css
/* Mobile first */
--bp-sm:  640px;   /* Small devices */
--bp-md:  768px;   /* Tablets */
--bp-lg:  1024px;  /* Laptops */
--bp-xl:  1280px;  /* Desktops */
--bp-2xl: 1536px;  /* Large screens */
```

### Spacing Scale

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  24px;
  --space-6:  32px;
  --space-8:  48px;
  --space-10: 64px;
  --space-12: 80px;
  --space-16: 96px;
}
```

---

## 5. Navigation Structure

### Top Utility Bar

Sits above the main nav. Background: `--color-primary` (UP Blue). Text: white.

**Left side (audience personalisation):**
- "Personalise Your UP Experience" label
- Links: Students · Parents & Guardians · Alumni · Visitors · Media · Library · News

**Right side:**
- Log in
- My UP Login
- A-Z Index
- Search icon

### Main Navigation

Below the utility bar. Background: white. Logo left-aligned, nav items right-aligned.

**Desktop nav items (with mega-menu dropdowns):**
1. Home
2. About UP
3. Study
4. Research
5. Campus Life
6. Giving to UP
7. Contact Us

**Mega-menu example (About UP):**
- Our Story · Strategy · Management and Governance · UP Policies
- Teaching and Learning · Sustainable Development · Faculties
- Professional Services · Enterprises · Career Opportunities
- Tenders · Institutes and Centres · Digital Transformation
- Publications · Internationalisation and Strategic Partnerships

### Mobile Header

- Hamburger menu (☰) on the right
- UP mobile SVG logo centred
- All nav items collapse into an accordion drawer

### Quicklinks Bar (Contextual)

Appears below the hero on content pages:
- Email Us · FAQs · Virtual Campus · Give

---

## 6. Component Patterns

### Hero Section

```
┌─────────────────────────────────────────────────────┐
│  Full-width image (campus photography)               │
│                                                      │
│  ┌──────────────────────────────┐                   │
│  │  [Eyebrow / section label]   │                   │
│  │  H1: Bold headline text      │                   │
│  │  Subtitle paragraph          │                   │
│  │  [CTA Button — UP Blue]      │                   │
│  └──────────────────────────────┘                   │
└─────────────────────────────────────────────────────┘
```

- Full viewport-width image, 500–600px tall
- Heading overlaid on a semi-transparent dark overlay
- H1 in white, serif display font
- CTA button: white background, UP Blue text, or UP Blue background with white text

### Content Cards (Grid)

Used for news articles, faculties, programmes:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  [Image]     │  │  [Image]     │  │  [Image]     │
│              │  │              │  │              │
│  Category    │  │  Category    │  │  Category    │
│  tag         │  │  tag         │  │  tag         │
│              │  │              │  │              │
│  Card title  │  │  Card title  │  │  Card title  │
│  in bold     │  │  in bold     │  │  in bold     │
│              │  │              │  │              │
│  Short desc  │  │  Short desc  │  │  Short desc  │
│  text here.  │  │  text here.  │  │  text here.  │
│              │  │              │  │              │
│  Read more → │  │  Read more → │  │  Read more → │
└──────────────┘  └──────────────┘  └──────────────┘
```

- 3-column on desktop, 2-column on tablet, 1-column on mobile
- Card border: 1px `--color-border`
- Card hover: subtle box-shadow lift + blue top border accent
- Category label: small uppercase text in Ochre

### Buttons

```css
/* Primary — Blue */
.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
  padding: 12px 28px;
  font-weight: 600;
  font-size: 15px;
  border: none;
  border-radius: 2px;           /* Very slight radius — institutional feel */
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.btn-primary:hover {
  background-color: var(--color-hover);
}

/* Secondary — Outlined */
.btn-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: 10px 26px;
}
.btn-secondary:hover {
  background-color: var(--color-primary);
  color: #fff;
}

/* Accent — Red (alerts, urgent CTAs) */
.btn-accent {
  background-color: var(--color-accent-red);
  color: #fff;
}
```

### Section Divider Accent

A thin ochre horizontal rule used between major page sections:

```css
.section-divider::before {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background-color: var(--color-accent-ochre);
  margin-bottom: 24px;
}
```

### Statistics / Numbers Block

Dark navy background (`--color-footer-bg`), white text, three or four columns:

```
┌─────────────────────────────────────────────────────┐
│  [UP Blue / Dark Navy background]                    │
│                                                      │
│   56 000+           12 000+          118 years       │
│   Students          Postgrads        of Excellence   │
│                                                      │
│   9                 7                5               │
│   Faculties         Campuses         Hospitals       │
└─────────────────────────────────────────────────────┘
```

---

## 7. Footer

**Layout (4 columns on desktop, stacked on mobile):**

```
┌─────────────────────────────────────────────────────────┐
│  [UP Shield Logo — white SVG]                            │
├──────────────┬──────────────┬──────────────┬────────────┤
│ Core         │ Quick        │ Contact      │ App        │
│ Functions    │ Links        │ Us           │ Downloads  │
│              │              │              │            │
│ Sustainable  │ Counselling  │ Student      │ Google     │
│ Development  │ Careline:    │ Service      │ Play Store │
│              │ 0800-747-747 │ Centre:      │            │
│ Teaching &   │              │ 012 420 3111 │ Apple      │
│ Learning     │ Crisis:      │              │ App Store  │
│              │ 0800-006-428 │ UPOnline:    │            │
│ Research     │              │ 012 420 8325 │            │
│              │ 24h Ops:     │              │            │
│              │ 012 420 2310 │              │            │
├──────────────┴──────────────┴──────────────┴────────────┤
│ © University of Pretoria 2026. All rights reserved.      │
│ Careers@UP · Tenders@UP · Ethics Hotline · Privacy ·    │
│ Disclaimer · Terms of Use                                │
└─────────────────────────────────────────────────────────┘
```

- Background: `#002050` (deep navy)
- Link text: `#B8C8DC` (muted light blue)
- Hover: white
- Headings: white, font-weight 600

---

## 8. Iconography & Imagery Style

**Icons:**
- Simple, outlined SVG icons (no fills)
- Consistent 24×24px size in nav and UI
- Colour: inherits from context (white on dark, blue on light)

**Photography:**
- Campus life — students on lawns, in lecture halls, in labs
- Diverse, documentary-style, not overly staged
- Warm South African light — golden tones complement the Ochre accent
- Always full-bleed in hero sections
- 16:9 or square crop for cards

---

## 9. Accessibility

| Requirement               | Implementation                              |
|---------------------------|---------------------------------------------|
| Colour contrast (AA)      | All text meets WCAG 2.1 AA (4.5:1 minimum) |
| Skip link                 | "Skip to main content" — first tab stop     |
| Keyboard navigation       | Full tab/arrow support on mega-menus        |
| Focus indicator           | Ochre focus ring (`--color-focus-ring`)     |
| Alt text                  | All images require descriptive alt text     |
| ARIA roles                | `role="navigation"`, `role="banner"` etc.  |
| Reduced motion            | Transitions disabled via `prefers-reduced-motion` |

---

## 10. UP Identity Quick Reference

| Element      | Value                                              |
|--------------|----------------------------------------------------|
| Full name    | University of Pretoria (Universiteit van Pretoria) |
| Nickname     | Tuks / Tukkies                                     |
| Tagline      | Make today matter                                  |
| Motto        | Ad Destinatum Persequor                            |
| Founded      | 4 March 1908                                       |
| Location     | Hatfield, Pretoria, Gauteng, South Africa          |
| CMS          | Drupal 10                                          |
| Theme        | Custom `up2024`                                    |
| Logo formats | SVG (horizontal desktop), SVG (mobile compact)     |
| Logo symbol  | Shield — represents industriousness, heritage, unity |
| Logo colours | Blue shield + Red detail + Ochre bees              |

---

*Last updated: June 2026. Verify specific hex values against the UP Brand Hub at `https://www1.up.ac.za` before production use.*
