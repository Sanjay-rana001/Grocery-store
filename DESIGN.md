---
name: FreshMart NZ Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#404944'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#707974'
  outline-variant: '#bfc9c3'
  surface-tint: '#2b6954'
  primary: '#003527'
  on-primary: '#ffffff'
  primary-container: '#064e3b'
  on-primary-container: '#80bea6'
  inverse-primary: '#95d3ba'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#0e3427'
  on-tertiary: '#ffffff'
  tertiary-container: '#274b3c'
  on-tertiary-container: '#93baa7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f0d6'
  primary-fixed-dim: '#95d3ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#0b513d'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#c3ecd7'
  tertiary-fixed-dim: '#a8cfbc'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#294e3f'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  display-lg:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Lexend
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system is built to bridge the gap between high-end organic retail and modern digital efficiency. It targets a discerning New Zealand demographic that values quality, sustainability, and frictionless technology. 

The aesthetic is **Modern SaaS-inspired Minimalism** with a **Tactile** twist. It emphasizes clarity and "breathability" through generous whitespace, evoking the freshness of locally sourced Products. The emotional response is one of calm reliability—like walking into a high-end, well-organized boutique supermarket where every item has its place. 

Key visual hallmarks include:
- **Airy Composition:** Avoiding clutter to allow high-resolution food photography to take center stage.
- **Organic Precision:** A blend of geometric technical layouts with soft, organic curves and glass-like overlays.
- **Premium Utility:** Every interaction feels deliberate and high-performance, borrowing the "snappiness" of a modern productivity tool.

## Colors

The palette is rooted in the natural landscapes of Aotearoa, utilizing a sophisticated "Evergreen" stack.

- **Primary (Forest):** A deep, authoritative green used for branding, primary navigation, and headers. It signifies longevity and premium quality.
- **Secondary (Emerald):** A vibrant, "fresh" green used strictly for calls to action, highlights, and status indicators of freshness.
- **Tertiary (Sage):** A soft, desaturated green used for background washes, secondary chips, and subtle UI divisions.
- **Neutrals:** A range of Slate and Charcoal tones. True black is avoided to maintain a softer, more sophisticated "SaaS" feel. The base background is a cool, clean grey-white to reduce eye strain and make product colors pop.

## Typography

This system uses a dual-font approach to balance personality with utility.

**Lexend** is utilized for headlines. Its geometric yet open letterforms improve readability for high-speed scanning (essential for grocery lists) and provide an "active" and modern feeling.

**Inter** is the workhorse for all body copy, inputs, and UI labels. It provides the "SaaS" precision required for complex interfaces like checkout flows, nutrition labels, and account management.

**Key Rules:**
- Use `display-lg` sparingly for hero sections and marketing banners.
- `body-lg` is preferred for product descriptions to maintain a premium feel.
- Letter spacing is tightened slightly on large headings to keep them cohesive.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for Desktop to ensure the premium photography is consistently framed, transitioning to a **Fluid Grid** for Mobile.

- **Desktop:** 12-column grid, 1440px max width. 24px gutters provide enough "air" between product cards.
- **Mobile:** 2-column or 1-column layout depending on the component, with 20px side margins to prevent content from feeling cramped.
- **Spacing Rhythm:** Based on an 8px scale. Use `stack-lg` (48px) to separate major sections like "Seasonal Picks" from "Browse Categories" to maintain the "airy" brand promise.

## Elevation & Depth

Visual hierarchy is managed through **Tonal Layers** and **Glassmorphism**.

1.  **Level 0 (Surface):** The background (#F9FAFB).
2.  **Level 1 (Cards):** Pure white surfaces with a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.04)).
3.  **Level 2 (Overlays/Modals):** Glassmorphism. Surfaces use a semi-transparent white backdrop (opacity 70-80%) with a 12px-16px background blur. This is used for the sticky navigation bar, cart drawers, and product filter overlays.
4.  **Interactive:** Elements lift slightly on hover using a more pronounced shadow to indicate clickability.

Avoid heavy black shadows; instead, use shadows tinted with the Primary color (very low opacity) to keep the "organic" feel.

## Shapes

The shape language is defined by "2XL" roundedness to evoke softness and friendliness.

- **Base Components:** (Buttons, Inputs) Use `rounded-lg` (16px / 1rem).
- **Cards & Containers:** Use `rounded-xl` (24px / 1.5rem) or `rounded-2xl` (32px / 2rem) for large product containers and hero sections.
- **Interactive Indicators:** Small badges or tags (e.g., "Organic", "NZ Made") use a full pill-shape to contrast against the structured card grid.

## Components

### Buttons
Inspired by ShadCN/UI. 
- **Primary:** Solid Primary Green (#064E3B) with white text. No gradient. 
- **Secondary:** Sage Green background with Primary Green text. 
- **Ghost:** No background, subtle charcoal text, appears on hover.
- **Border-radius:** 12px for a modern, accessible look.

### Product Cards
The centerpiece of the system.
- **Style:** White background, Level 1 shadow, 24px corner radius.
- **Image:** Should occupy the top 60% of the card with a very subtle 1px inner border to define the image against the white card.
- **Typography:** Lexend Headline-sm for the product name, Inter Label-sm for the weight/unit price.

### Inputs & Search
- **Search Bar:** Glassmorphic background when floating, or a solid white background with a 1px Sage border.
- **Focus State:** 2px ring of Secondary Emerald with an offset.

### Glassmorphic Overlays
Used for the "Quick Add" cart drawer. It should blur the underlying product grid, creating a sense of depth without losing the context of the shopping experience.

### Chips & Badges
Small, pill-shaped elements. Use Sage Green for neutral information (e.g., "Dairy") and a soft Amber for alerts (e.g., "Low Stock").