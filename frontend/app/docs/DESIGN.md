---
name: Axiom Surface
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#89ceff'
  on-secondary: '#00344d'
  secondary-container: '#00a2e6'
  on-secondary-container: '#00344e'
  tertiary: '#ffb695'
  on-tertiary: '#571f00'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  code-sm:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1440px
  sidebar-width: 240px
  gutter: 16px
---

## Brand & Style

The design system is engineered for high-performance enterprise environments where density, clarity, and speed are paramount. It draws inspiration from technical tools like Vercel and Linear, prioritizing utility over decoration to foster a "flow state" for power users.

The aesthetic is **Sophisticated Minimalism**. It utilizes a "Utility-First" visual language:
- **High Information Density:** A tight 4px grid ensures data-rich environments remain legible without excessive scrolling.
- **Precision Engineering:** UI elements use thin, high-contrast borders rather than heavy shadows to define structure, mimicking the feel of a professional IDE.
- **Intentional Friction:** Interactions are snappy, with motion used only to provide functional feedback or context during state transitions.
- **Technical Elegance:** A monochromatic foundation allows the vibrant accent color to act as a heat map for primary actions and status indicators.

## Colors

The palette is anchored in a neutral scale ranging from deep charcoals to pure whites, ensuring maximum contrast and a focused atmosphere.

- **Primary (Electric Indigo):** Used exclusively for primary actions, active states, and critical progress indicators.
- **Secondary (Cyber Blue):** Reserved for subtle highlights, informational badges, and secondary interactive elements.
- **Neutral / Backgrounds:** 
    - In **Dark Mode**, the canvas is a deep `#0A0A0B`, with surfaces layered using `#171719` and `#262629`. 
    - In **Light Mode**, the canvas is pure white `#FFFFFF`, with surfaces using `#F9FAFB` and `#F3F4F6`.
- **Borders:** Instead of shadows, use 1px solid strokes. Dark mode utilizes silver/white at low opacities (10-15%); light mode uses neutral grays (8-10%).

## Typography

This design system utilizes **Inter** as its primary workhorse for its exceptional legibility and neutral, systematic tone. For technical metadata and code snippets, **JetBrains Mono** or **Geist** provides a developer-centric precision.

- **Headings:** Use semi-bold weights with slight negative letter-spacing to create a tight, authoritative "locked-in" feel.
- **Body Text:** Standardized at 14px for enterprise density. Ensure a 1.4-1.5x line height to maintain readability in data-heavy views.
- **Labels:** Use all-caps or medium weights for small UI labels (12px) to differentiate them from interactive body text.

## Layout & Spacing

The layout system is based on a rigid **4px geometric grid**. All dimensions, padding, and margins must be multiples of 4.

- **The Shell:** A fixed-width collapsible sidebar (240px) anchors the navigation. The main content area uses a fluid grid with a maximum container width of 1440px to prevent excessive line lengths.
- **Tables & Lists:** Use "Compact" (32px row height) and "Default" (44px row height) variants. Internal cell padding should be `spacing.md` (16px) horizontally to ensure data separation.
- **Breakpoints:**
    - Mobile (<768px): Sidebar collapses into a bottom-sheet or full-screen overlay. 16px horizontal margins.
    - Tablet (768px - 1024px): Sidebar collapses to an icon-only "rail" (64px).
    - Desktop (>1024px): Full persistent sidebar and multi-column grid layouts.

## Elevation & Depth

This design system avoids traditional drop shadows in favor of **Tonal Elevation** and **Hard Outlines**.

- **Z-Axis Hierarchy:**
    - **Level 0 (Base):** The main background.
    - **Level 1 (Card/Surface):** A subtle background shift (1 step lighter/darker) with a 1px solid border.
    - **Level 2 (Dropdowns/Modals):** High-contrast background with a slightly more pronounced border (`rgba(255,255,255,0.2)` in dark mode) and a very tight 4px blur shadow to separate the element from the layer immediately below.
- **Interactive States:** Instead of raising an element on hover, use border-color changes (e.g., transitioning from a subtle gray to the primary Indigo).

## Shapes

The shape language is disciplined and consistent.
- **Base Components:** Buttons, inputs, and small cards use a **8px (0.5rem)** radius (`rounded-md`).
- **Layout Containers:** Larger sections or main content blocks may use a slightly larger **16px (1rem)** radius (`rounded-lg`) to soften the overall structure.
- **Small Elements:** Tags and status badges use a **4px (0.25rem)** radius to maintain a sharp, technical appearance.

## Components

### Buttons
- **Primary:** Solid Electric Indigo with white text. High contrast, no gradient.
- **Secondary:** Ghost style with a 1px border. In dark mode, use a silver/gray border that brightens on hover.
- **Ghost:** No border or background until hover; used for utility actions in dense toolbars.

### Data Tables
- Use a monochromatic palette. 
- **Header:** 12px Medium caps with a bottom border of 1px.
- **Hover State:** Row background shifts slightly (`#1C1C1E` in dark mode).

### Kanban Cards
- 8px border radius. 
- Minimal padding (12px).
- Use colored "pills" or thin vertical 4px left-borders to denote priority or status without cluttering the card face.

### Input Fields
- Dark Mode: Background `#0A0A0B` with a `#262629` border.
- Focus State: Border transitions to Primary Color with a 0px offset, 2px "ring" of the same color at 30% opacity.

### Sidebar
- Collapsible navigation with a "Command Palette" trigger (KBD: Cmd+K) prominently displayed. 
- Active links use a subtle background highlight and a vertical primary-color "indicator" on the left edge.