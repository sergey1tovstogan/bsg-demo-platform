# BSG Demo Platform - Unified Layout Specification

**Version:** 1.1
**Date:** December 16, 2024
**Status:** Prototype Complete - Ready for Team Review
**Purpose:** Establish consistent visual design across all component cards
**Prototype:** Design System Showcase component with 10 comprehensive pages

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design Philosophy](#2-design-philosophy)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Component Styling](#6-component-styling)
7. [Navigation Patterns](#7-navigation-patterns)
8. [Backgrounds & Surfaces](#8-backgrounds--surfaces)
9. [Interactive States](#9-interactive-states)
10. [Accessibility](#10-accessibility)
11. [Implementation Guidelines](#11-implementation-guidelines)
12. [Appendix: Current State Analysis](#appendix-current-state-analysis)

---

## 1. Executive Summary

### 1.1 Purpose

This document defines the **unified visual design system** for all component cards in the BSG Demo Platform. It establishes consistent colors, typography, spacing, and component styling based on Temenos brand identity while maintaining the existing layout structures.

### 1.2 Scope

**WHAT THIS CHANGES:**
- Colors (brand alignment)
- Typography (fonts, sizes, weights)
- Component styling (tabs, buttons, cards)
- Backgrounds and surfaces
- Interactive states (hover, active, focus)

**WHAT THIS DOES NOT CHANGE:**
- Page structures and layouts
- Navigation patterns
- Component functionality
- Content organization
- User workflows

### 1.3 Key Objectives

1. **Brand Consistency:** Align with Temenos visual identity
2. **Professional Appearance:** Modern, clean, banking-grade UI
3. **Readability:** Ensure all text is legible in both themes
4. **Accessibility:** WCAG 2.1 AA compliance
5. **Coherence:** Unified experience across all cards

### 1.4 Reference Implementation

The **Security Card → SaaS Security Services** tab navigation is selected as the reference model for its:
- Clean horizontal tab layout
- Clear active/inactive states
- Smooth transitions
- Professional appearance
- Good contrast in both modes

---

## 2. Design Philosophy

### 2.1 Core Principles

1. **Clarity Over Decoration:** Information should be immediately accessible
2. **Consistency Over Innovation:** Similar elements should look and behave the same
3. **Professional Over Trendy:** Banking-grade reliability and trust
4. **Accessible By Default:** No user left behind

### 2.2 Visual Hierarchy

```
Primary Brand Color (Temenos Blue) → Trust, Authority, Primary Actions
Secondary Colors → Information Categories, Status, Feedback
Neutral Colors → Structure, Text, Backgrounds
Accent Colors → Highlights, Calls-to-Action, Interactive Elements
```

### 2.3 Temenos Brand Essence

**Industry:** Financial Technology (Banking Software)
**Brand Values:** Trust, Innovation, Reliability, Professionalism
**Visual Identity:** Deep blues convey stability and expertise

---

## 3. Color System

### 3.1 Temenos Brand Colors (Primary Palette)

#### Primary Brand Color
```
Temenos Navy (Primary)
HEX: #003366
RGB: rgb(0, 51, 102)
Usage: Primary buttons, headers, key interactive elements, brand moments
```

#### Supporting Brand Colors
```
Temenos Blue (Light)
HEX: #0066CC
RGB: rgb(0, 102, 204)
Usage: Links, secondary actions, highlights

Temenos Cyan (Accent)
HEX: #00A3E0
RGB: rgb(0, 163, 224)
Usage: Accents, hover states, interactive feedback
```

### 3.2 Extended Color Palette

#### Functional Colors

**Success / Positive**
```
Green 500
HEX: #10B981
RGB: rgb(16, 185, 129)
Usage: Success messages, completed states, positive indicators
```

**Warning**
```
Amber 500
HEX: #F59E0B
RGB: rgb(245, 158, 11)
Usage: Warnings, important notices, alerts requiring attention
```

**Error / Critical**
```
Red 500
HEX: #EF4444
RGB: rgb(239, 68, 68)
Usage: Errors, critical alerts, destructive actions
```

**Information**
```
Blue 400
HEX: #60A5FA
RGB: rgb(96, 165, 250)
Usage: Information callouts, tips, neutral highlights
```

#### Neutral Palette (Slate Scale)

**Light Mode**
```
Slate 50:  #F8FAFC - Page background
Slate 100: #F1F5F9 - Surface hover
Slate 200: #E2E8F0 - Borders light
Slate 300: #CBD5E1 - Borders medium
Slate 400: #94A3B8 - Disabled elements
Slate 500: #64748B - Secondary text
Slate 600: #475569 - Body text
Slate 700: #334155 - Headings
Slate 800: #1E293B - Dark surfaces (dark mode)
Slate 900: #0F172A - Primary text, dark backgrounds
```

**Dark Mode**
```
Slate 900: #0F172A - Page background
Slate 800: #1E293B - Surface default
Slate 700: #334155 - Surface hover
Slate 600: #475569 - Borders
Slate 500: #64748B - Disabled elements
Slate 400: #94A3B8 - Secondary text
Slate 300: #CBD5E1 - Body text
Slate 200: #E2E8F0 - Headings
Slate 100: #F1F5F9 - Primary text emphasis
Slate 50:  #F8FAFC - Highest contrast text
```

### 3.3 Component Category Colors

Each card type maintains its identity color for icons and accents:

```
Integration:      #3B82F6 (Blue 500)
Data Architecture: #10B981 (Emerald 500)
Deployment:       #8B5CF6 (Violet 500)
Security:         #EF4444 (Red 500)
Observability:    #F59E0B (Amber 500)
Design Time:      #6366F1 (Indigo 500)
```

**Usage:** Component icons, card highlights, category badges
**Principle:** Identity colors provide visual wayfinding but do not override primary brand for interactive elements

### 3.4 CSS Custom Properties

**File:** `/frontend/src/index.css`

```css
:root {
  /* Temenos Brand Colors */
  --color-temenos-navy: #003366;
  --color-temenos-blue: #0066CC;
  --color-temenos-cyan: #00A3E0;

  /* Primary Interactive Colors */
  --color-primary: #003366;           /* Temenos Navy */
  --color-primary-hover: #004080;     /* Lighter navy */
  --color-primary-active: #002244;    /* Darker navy */

  /* Secondary Interactive Colors */
  --color-secondary: #0066CC;         /* Temenos Blue */
  --color-secondary-hover: #0052A3;
  --color-secondary-active: #003D7A;

  /* Accent Color */
  --color-accent: #00A3E0;            /* Temenos Cyan */
  --color-accent-hover: #008FC7;
  --color-accent-active: #007BAE;

  /* Functional Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #60A5FA;

  /* Neutral Colors - Light Mode */
  --color-background: #F8FAFC;        /* Slate 50 */
  --color-surface: #FFFFFF;           /* White */
  --color-surface-hover: #F1F5F9;     /* Slate 100 */
  --color-surface-raised: #FFFFFF;    /* White with shadow */

  --color-border-light: #E2E8F0;      /* Slate 200 */
  --color-border-medium: #CBD5E1;     /* Slate 300 */
  --color-border-strong: #94A3B8;     /* Slate 400 */

  --color-text-primary: #0F172A;      /* Slate 900 */
  --color-text-secondary: #64748B;    /* Slate 500 */
  --color-text-disabled: #94A3B8;     /* Slate 400 */
  --color-text-on-primary: #FFFFFF;   /* White on brand colors */
}

.dark {
  /* Neutral Colors - Dark Mode */
  --color-background: #0F172A;        /* Slate 900 */
  --color-surface: #1E293B;           /* Slate 800 */
  --color-surface-hover: #334155;     /* Slate 700 */
  --color-surface-raised: #1E293B;    /* Slate 800 with shadow */

  --color-border-light: #334155;      /* Slate 700 */
  --color-border-medium: #475569;     /* Slate 600 */
  --color-border-strong: #64748B;     /* Slate 500 */

  --color-text-primary: #F8FAFC;      /* Slate 50 */
  --color-text-secondary: #94A3B8;    /* Slate 400 */
  --color-text-disabled: #64748B;     /* Slate 500 */
  --color-text-on-primary: #FFFFFF;   /* White on brand colors */
}
```

### 3.5 Color Usage Guidelines

#### Primary Actions
- **Background:** Temenos Navy (#003366)
- **Text:** White
- **Hover:** Lighter navy (#004080)
- **Active/Selected:** Temenos Navy with enhanced shadow

#### Secondary Actions
- **Background:** Transparent or Slate 100/700
- **Border:** Slate 300/600
- **Text:** Slate 700/200
- **Hover:** Slate 200/600 background

#### Tabs (Active State)
- **Background:** Temenos Navy (#003366)
- **Text:** White
- **Border Bottom:** 3px solid Temenos Cyan (#00A3E0)
- **Shadow:** medium

#### Tabs (Inactive State)
- **Background:** Transparent
- **Text:** Slate 600 / Slate 300
- **Hover Background:** Slate 100 / Slate 700
- **Border Bottom:** None

#### Links
- **Color:** Temenos Blue (#0066CC)
- **Hover:** Temenos Cyan (#00A3E0)
- **Visited:** Temenos Navy (#003366) at 80% opacity

#### Card Backgrounds
- **Light Mode:** White with subtle shadow
- **Dark Mode:** Slate 800 with subtle glow

---

## 4. Typography

### 4.1 Font Family

**Primary Font Stack:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
             'Helvetica Neue', Arial, sans-serif;
```

**Rationale:**
- **Inter:** Modern, highly readable, professional
- **Fallbacks:** System fonts ensure consistent experience
- **Banking Appropriate:** Clean, trustworthy appearance

### 4.2 Type Scale

#### Headings

**H1 - Page Title**
```
Font Size: 2rem (32px)
Font Weight: 700 (Bold)
Line Height: 1.2
Letter Spacing: -0.02em (tight)
Color: Slate 900 / Slate 50
Usage: Main page headings, component card titles
Tailwind: text-3xl font-bold tracking-tight
```

**H2 - Section Title**
```
Font Size: 1.5rem (24px)
Font Weight: 600 (Semi-Bold)
Line Height: 1.3
Letter Spacing: -0.01em
Color: Slate 800 / Slate 100
Usage: Major sections within cards
Tailwind: text-2xl font-semibold
```

**H3 - Subsection Title**
```
Font Size: 1.25rem (20px)
Font Weight: 600 (Semi-Bold)
Line Height: 1.4
Letter Spacing: normal
Color: Slate 700 / Slate 200
Usage: Card sections, tab content headings
Tailwind: text-xl font-semibold
```

**H4 - Component Title**
```
Font Size: 1.125rem (18px)
Font Weight: 600 (Semi-Bold)
Line Height: 1.5
Letter Spacing: normal
Color: Slate 700 / Slate 200
Usage: Component headings, list titles
Tailwind: text-lg font-semibold
```

**H5 - Minor Heading**
```
Font Size: 1rem (16px)
Font Weight: 600 (Semi-Bold)
Line Height: 1.5
Letter Spacing: normal
Color: Slate 600 / Slate 300
Usage: Small section titles, labels
Tailwind: text-base font-semibold
```

#### Body Text

**Body Large**
```
Font Size: 1.125rem (18px)
Font Weight: 400 (Regular)
Line Height: 1.7
Color: Slate 700 / Slate 300
Usage: Introductory text, important descriptions
Tailwind: text-lg leading-relaxed
```

**Body Regular**
```
Font Size: 1rem (16px)
Font Weight: 400 (Regular)
Line Height: 1.6
Color: Slate 600 / Slate 300
Usage: Standard body text, paragraphs
Tailwind: text-base leading-normal
```

**Body Small**
```
Font Size: 0.875rem (14px)
Font Weight: 400 (Regular)
Line Height: 1.5
Color: Slate 600 / Slate 400
Usage: Secondary information, metadata, captions
Tailwind: text-sm
```

**Body Extra Small**
```
Font Size: 0.75rem (12px)
Font Weight: 400 (Regular)
Line Height: 1.4
Color: Slate 500 / Slate 400
Usage: Footnotes, timestamps, auxiliary info
Tailwind: text-xs
```

#### Special Text

**Label**
```
Font Size: 0.875rem (14px)
Font Weight: 500 (Medium)
Line Height: 1.4
Letter Spacing: 0.01em
Text Transform: uppercase
Color: Slate 600 / Slate 400
Usage: Form labels, category tags
Tailwind: text-sm font-medium uppercase tracking-wide
```

**Code / Monospace**
```
Font Family: 'Fira Code', 'Monaco', 'Courier New', monospace
Font Size: 0.875rem (14px)
Font Weight: 400 (Regular)
Line Height: 1.6
Background: Slate 100 / Slate 800
Padding: 2px 6px
Border Radius: 4px
Usage: Inline code, technical identifiers
Tailwind: font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded
```

### 4.3 Text Color Standards

**Light Mode**
```
Primary Text:   Slate 900 (#0F172A)
Secondary Text: Slate 600 (#475569)
Muted Text:     Slate 500 (#64748B)
Disabled Text:  Slate 400 (#94A3B8)
```

**Dark Mode**
```
Primary Text:   Slate 50  (#F8FAFC)
Secondary Text: Slate 300 (#CBD5E1)
Muted Text:     Slate 400 (#94A3B8)
Disabled Text:  Slate 500 (#64748B)
```

### 4.4 Typography Best Practices

1. **Hierarchy:** Use size and weight to establish clear hierarchy
2. **Contrast:** Minimum 4.5:1 ratio for body text, 3:1 for headings
3. **Line Length:** 60-80 characters per line for optimal readability
4. **Spacing:** Consistent vertical rhythm using 4px baseline grid
5. **Emphasis:** Use color sparingly; prefer weight and size

---

## 5. Spacing & Layout

### 5.1 Spacing Scale

**Based on 4px baseline grid:**

```
xs:   0.25rem (4px)   - Tight spacing, inline elements
sm:   0.5rem  (8px)   - Small gaps, compact layouts
md:   1rem    (16px)  - Default spacing, standard gaps
lg:   1.5rem  (24px)  - Section spacing, card padding
xl:   2rem    (32px)  - Major section breaks
2xl:  3rem    (48px)  - Page-level spacing
3xl:  4rem    (64px)  - Hero sections, major divisions
```

**Tailwind Classes:**
```
p-1  = 4px    gap-1  = 4px    m-1  = 4px
p-2  = 8px    gap-2  = 8px    m-2  = 8px
p-4  = 16px   gap-4  = 16px   m-4  = 16px
p-6  = 24px   gap-6  = 24px   m-6  = 24px
p-8  = 32px   gap-8  = 32px   m-8  = 32px
p-12 = 48px   gap-12 = 48px   m-12 = 48px
p-16 = 64px   gap-16 = 64px   m-16 = 64px
```

### 5.2 Container Standards

**Page Container**
```
Max Width: 1400px (max-w-7xl)
Padding X: 24px (px-6) on mobile, 32px (px-8) on desktop
Padding Y: 32px (py-8)
Margin: Auto-centered (mx-auto)
```

**Card Container**
```
Padding: 24px (p-6)
Border Radius: 12px (rounded-xl)
Background: Surface color
Shadow: Medium (shadow-md)
Border: 1px solid border-light
```

**Content Section**
```
Padding Bottom: 48px (pb-12) between major sections
Padding Top: 32px (pt-8) for first section
Gap Between Items: 16px (gap-4) for related content
```

### 5.3 Grid Systems

**Card Grid (HomePage)**
```
Columns: 3 columns on desktop, 2 on tablet, 1 on mobile
Gap: 24px (gap-6)
Tailwind: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

**Two-Column Layout**
```
Ratio: 50/50 or 60/40 depending on content
Gap: 32px (gap-8)
Tailwind: grid grid-cols-1 lg:grid-cols-2 gap-8
```

**Three-Column Layout**
```
Equal Width: 33.33% each
Gap: 24px (gap-6)
Tailwind: grid grid-cols-1 md:grid-cols-3 gap-6
```

### 5.4 Vertical Rhythm

**Between Elements:**
```
Heading → Body:      12px (mt-3)
Body → Body:         16px (mt-4)
List Items:          8px (space-y-2)
Section → Section:   48px (mt-12)
Component → Component: 24px (space-y-6)
```

**Within Components:**
```
Card Header → Content:  16px (pt-4)
Tab Bar → Tab Content:  24px (pt-6)
Button Group Spacing:   12px (gap-3)
Form Field Spacing:     16px (space-y-4)
```

---

## 6. Component Styling

### 6.1 Buttons

#### Primary Button (Call-to-Action)
```css
Background: Temenos Navy (#003366)
Text: White
Font Size: 16px (text-base)
Font Weight: 600 (font-semibold)
Padding: 12px 24px (px-6 py-3)
Border Radius: 8px (rounded-lg)
Shadow: Medium (shadow-md)
Transition: all 200ms

Hover:
  Background: #004080 (lighter navy)
  Shadow: Large (shadow-lg)
  Transform: translateY(-1px)

Active:
  Background: #002244 (darker navy)
  Shadow: Small (shadow-sm)
  Transform: translateY(0)

Disabled:
  Background: Slate 300 / Slate 700
  Text: Slate 500 / Slate 400
  Cursor: not-allowed
  Opacity: 0.6
```

**Tailwind Classes:**
```
bg-[#003366] text-white font-semibold px-6 py-3 rounded-lg shadow-md
hover:bg-[#004080] hover:shadow-lg hover:-translate-y-0.5
active:bg-[#002244] active:shadow-sm
disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60
transition-all duration-200
```

#### Secondary Button
```css
Background: Transparent
Border: 2px solid Slate 300 / Slate 600
Text: Slate 700 / Slate 200
Font Size: 16px (text-base)
Font Weight: 600 (font-semibold)
Padding: 10px 22px (to account for border)
Border Radius: 8px (rounded-lg)
Transition: all 200ms

Hover:
  Background: Slate 100 / Slate 700
  Border Color: Temenos Blue (#0066CC)
  Text: Temenos Blue (#0066CC) / Temenos Cyan (#00A3E0)

Active:
  Background: Slate 200 / Slate 600
  Border Color: Temenos Navy (#003366)
```

**Tailwind Classes:**
```
bg-transparent border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200
font-semibold px-5.5 py-2.5 rounded-lg
hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-[#0066CC] hover:text-[#0066CC] dark:hover:text-[#00A3E0]
active:bg-slate-200 dark:active:bg-slate-600 active:border-[#003366]
transition-all duration-200
```

#### Icon Button
```css
Size: 40px × 40px (w-10 h-10)
Background: Transparent
Text/Icon: Slate 600 / Slate 400
Border Radius: 8px (rounded-lg)
Padding: 8px (p-2)

Hover:
  Background: Slate 100 / Slate 700
  Text/Icon: Temenos Navy / Temenos Cyan

Active:
  Background: Slate 200 / Slate 600
  Scale: 0.95
```

### 6.2 Tabs (Reference: Security Card SaaS Services)

#### Tab Container
```css
Display: Flex row
Background: White / Slate 800
Border Bottom: 1px solid Slate 200 / Slate 700
Padding: 0px (tabs provide their own padding)
Gap: 4px (gap-1)
Overflow X: Auto (horizontal scroll on mobile)
Position: Sticky top-0 (optional, keeps tabs visible on scroll)
Z-Index: 10
Shadow: sm (subtle elevation)
```

**Tailwind Classes:**
```
flex flex-row bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700
gap-1 overflow-x-auto sticky top-0 z-10 shadow-sm
```

#### Active Tab
```css
Background: Temenos Navy (#003366)
Text: White
Font Size: 16px (text-base)
Font Weight: 600 (font-semibold)
Padding: 12px 20px (px-5 py-3)
Border Radius: 8px 8px 0 0 (rounded-t-lg)
Border Bottom: 3px solid Temenos Cyan (#00A3E0)
Shadow: Medium (shadow-md)
Transform: scale(1.02)
Transition: all 200ms
Icon Size: 20px (w-5 h-5)
Gap: 8px (gap-2)
```

**Tailwind Classes:**
```
bg-[#003366] text-white font-semibold text-base px-5 py-3 rounded-t-lg
border-b-3 border-[#00A3E0] shadow-md scale-105
flex items-center gap-2
transition-all duration-200
```

#### Inactive Tab
```css
Background: Transparent
Text: Slate 600 / Slate 300
Font Size: 16px (text-base)
Font Weight: 500 (font-medium)
Padding: 12px 20px (px-5 py-3)
Border Radius: 8px 8px 0 0 (rounded-t-lg)
Border Bottom: None
Transition: all 200ms
Icon Size: 20px (w-5 h-5)
Gap: 8px (gap-2)

Hover:
  Background: Slate 100 / Slate-700
  Text: Slate 900 / Slate 100
  Transform: translateY(-2px)
```

**Tailwind Classes:**
```
bg-transparent text-slate-600 dark:text-slate-300 font-medium text-base px-5 py-3 rounded-t-lg
hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100
hover:-translate-y-0.5
flex items-center gap-2
transition-all duration-200
cursor-pointer
```

#### Tab Content Area
```css
Background: Slate 50 / Slate 900
Padding: 24px (p-6)
Min Height: 500px
Overflow Y: Auto
Animation: Fade in (300ms)
```

**Tailwind Classes:**
```
bg-slate-50 dark:bg-slate-900 p-6 min-h-[500px] overflow-y-auto
animate-fade-in
```

### 6.3 Cards

#### Standard Card
```css
Background: White / Slate 800
Border: 1px solid Slate 200 / Slate 700
Border Radius: 12px (rounded-xl)
Padding: 24px (p-6)
Shadow: Medium (shadow-md)
Transition: all 200ms

Hover:
  Shadow: Large (shadow-lg)
  Transform: translateY(-4px)
  Border Color: Slate 300 / Slate 600
```

**Tailwind Classes:**
```
bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-md
hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600
transition-all duration-200
```

#### Component Selection Card (HomePage)
```css
Background: White / Slate 800
Border: 2px solid transparent
Border Radius: 24px (rounded-3xl)
Padding: 32px (p-8)
Height: 260px (fixed)
Display: Flex column
Justify: Center
Align: Center
Text Align: Center
Cursor: Pointer
Transition: all 300ms
Position: Relative
Overflow: Hidden

Gradient Border Effect:
  Pseudo-element with gradient background
  Category color at 50% opacity

Hover:
  Transform: translateY(-8px)
  Shadow: 2xl with category color glow
  Border: 2px solid category color

Active/Selected:
  Border: 3px solid Temenos Navy
  Shadow: 2xl with Temenos Navy glow
```

**Icon Styling in Card:**
```css
Size: 48px (w-12 h-12)
Color: Category color
Background: Category color at 10% opacity
Padding: 12px (p-3)
Border Radius: 16px (rounded-2xl)
Shadow: Category color glow

Hover:
  Scale: 1.1
  Rotate: 3deg
  Shadow: Enhanced glow
```

#### Card Header
```css
Border Bottom: 1px solid Slate 200 / Slate 700
Padding Bottom: 16px (pb-4)
Margin Bottom: 16px (mb-4)
```

#### Card Footer
```css
Border Top: 1px solid Slate 200 / Slate 700
Padding Top: 16px (pt-4)
Margin Top: 16px (mt-4)
Display: Flex
Justify: space-between
```

### 6.4 Form Elements

#### Input Field
```css
Background: White / Slate 800
Border: 1px solid Slate 300 / Slate 600
Border Radius: 8px (rounded-lg)
Padding: 10px 12px (px-3 py-2.5)
Font Size: 16px (text-base)
Color: Slate 900 / Slate 50
Transition: all 200ms

Focus:
  Border: 2px solid Temenos Blue (#0066CC)
  Outline: 4px solid Temenos Blue at 20% opacity
  Background: White / Slate 700

Disabled:
  Background: Slate 100 / Slate 700
  Color: Slate 400 / Slate 500
  Cursor: not-allowed
```

**Tailwind Classes:**
```
bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-base
text-slate-900 dark:text-slate-50
focus:border-2 focus:border-[#0066CC] focus:ring-4 focus:ring-[#0066CC]/20
disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed
transition-all duration-200
```

#### Select / Dropdown
```css
Same as Input Field
Chevron Icon: Right-aligned, Slate 500
Padding Right: 36px (to accommodate icon)
```

#### Checkbox / Radio
```css
Size: 20px (w-5 h-5)
Border: 2px solid Slate 300 / Slate 600
Border Radius: 4px (rounded) for checkbox, 50% for radio
Background: White / Slate 800

Checked:
  Background: Temenos Navy (#003366)
  Border: Temenos Navy
  Checkmark: White

Focus:
  Ring: 4px Temenos Blue at 20% opacity
```

### 6.5 Badges & Tags

#### Status Badge
```css
Padding: 4px 12px (px-3 py-1)
Border Radius: 12px (rounded-full)
Font Size: 12px (text-xs)
Font Weight: 600 (font-semibold)
Text Transform: Uppercase
Letter Spacing: 0.05em

Success: bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400
Warning: bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400
Error:   bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400
Info:    bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400
```

#### Category Tag
```css
Padding: 4px 10px (px-2.5 py-1)
Border Radius: 6px (rounded-md)
Font Size: 12px (text-xs)
Font Weight: 500 (font-medium)
Background: Category color at 10% opacity
Text: Category color (darker in light mode, lighter in dark mode)
Border: 1px solid category color at 30% opacity
```

### 6.6 Tooltips

```css
Background: Slate 900 / Slate 100
Text: White / Slate 900
Font Size: 14px (text-sm)
Padding: 8px 12px (px-3 py-2)
Border Radius: 6px (rounded-md)
Shadow: Large (shadow-lg)
Max Width: 200px
Arrow: 6px triangle matching background
Z-Index: 50
Animation: Fade in + slide (150ms)
```

### 6.7 Loading States

#### Spinner
```css
Border: 3px solid Slate 200 / Slate-700
Border Top: 3px solid Temenos Navy / Temenos Cyan
Border Radius: 50% (rounded-full)
Size: 40px (w-10 h-10)
Animation: Spin (1s linear infinite)
```

**Tailwind Classes:**
```
border-4 border-slate-200 dark:border-slate-700 border-t-[#003366] dark:border-t-[#00A3E0]
rounded-full w-10 h-10 animate-spin
```

#### Bouncing Dots
```css
Three dots with staggered bounce animation
Size: 8px (w-2 h-2)
Color: Temenos Navy / Temenos Cyan
Border Radius: 50% (rounded-full)
Animation: Bounce with delays (0ms, 150ms, 300ms)
Gap: 4px (gap-1)
```

**Usage:** Inline loading indicators, subtle feedback

#### Progress Bar
```css
Container:
  Width: 128px (w-32)
  Height: 8px (h-2)
  Background: Slate 200 / Slate 700
  Border Radius: 9999px (rounded-full)
  Overflow: hidden

Fill:
  Height: 100%
  Background: Gradient from Temenos Navy to Temenos Cyan
  Animation: Pulse (2s ease-in-out infinite)
```

#### Skeleton Loader
```css
Background: Slate 200 / Slate-700
Border Radius: 8px (rounded-lg)
Animation: Pulse (2s ease-in-out infinite)
Height: Varies by content (text: 20px, image: 200px, etc.)
```

### 6.8 Alert & Notification Patterns

#### Alert Structure
```css
Container:
  Background: {Color}-50 / {Color}-900 at 20% opacity
  Border Left: 4px solid {Color}-500
  Padding: 16px (p-4)
  Border Radius: 0 8px 8px 0 (rounded-r-lg)
  Display: Flex
  Gap: 12px (gap-3)

Icon:
  Size: 20px (w-5 h-5)
  Color: {Color}-600 / {Color}-400
  Flex: Shrink 0
  Margin Top: 2px (mt-0.5)

Content:
  Heading: Font semibold, {Color}-800 / {Color}-300
  Message: Text sm, {Color}-700 / {Color}-400
```

**Alert Types:**

**Success Alert**
```jsx
<div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg">
  <div className="flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
    <div>
      <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Success!</h4>
      <p className="text-sm text-green-700 dark:text-green-400">Your changes have been saved successfully.</p>
    </div>
  </div>
</div>
```

**Warning Alert**
```jsx
<div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
  <div className="flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
    <div>
      <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Warning</h4>
      <p className="text-sm text-amber-700 dark:text-amber-400">Please review your input before continuing.</p>
    </div>
  </div>
</div>
```

**Error Alert**
```jsx
<div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
  <div className="flex items-start gap-3">
    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
    <div>
      <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Error</h4>
      <p className="text-sm text-red-700 dark:text-red-400">An error occurred while processing your request.</p>
    </div>
  </div>
</div>
```

**Info Alert**
```jsx
<div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
  <div className="flex items-start gap-3">
    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
    <div>
      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Information</h4>
      <p className="text-sm text-blue-700 dark:text-blue-400">Here's some helpful information for you to review.</p>
    </div>
  </div>
</div>
```

### 6.9 Gradient Accent Cards

#### Gradient Card Pattern
```css
Background: Gradient from {Color}-50 to {Adjacent Color}-50 (light mode)
            Gradient from {Color}-900/20 to {Adjacent Color}-900/20 (dark mode)
Border: 2px solid {Color}-200 / {Color}-800
Border Radius: 12px (rounded-xl)
Padding: 24px (p-6)
Shadow: sm (subtle)

Icon Container:
  Background: {Color}-500
  Size: 40px (w-10 h-10)
  Border Radius: 8px (rounded-lg)
  Display: Flex center
  Icon: w-6 h-6 text-white

Title: Font semibold text-lg, Slate 900 / White
Value: Font bold text-2xl, {Color}-600 / {Color}-400
Label: Text sm, Slate 600 / Slate 300
```

**Example Gradients:**
```
Blue Stats: from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20
Green Stats: from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20
Purple Stats: from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20
```

**Usage:** Statistics cards, KPI displays, dashboard metrics

---

## 7. Navigation Patterns

### 7.1 Horizontal Tab Navigation (Recommended Standard)

**Use Case:** Multi-view components (Security SaaS Services, Integration APIs/Events)

**Structure:**
```
┌────────────────────────────────────────────────┐
│ [Tab 1 Active] [Tab 2] [Tab 3] [Tab 4]       │ ← Tab Bar
├────────────────────────────────────────────────┤
│                                                │
│  Tab Content Area (scrollable)                │
│                                                │
└────────────────────────────────────────────────┘
```

**Styling:** See Section 6.2 (Tabs)

**Behavior:**
- Click tab to switch views
- Active tab has Temenos Navy background + Cyan border
- Smooth content fade transitions (300ms)
- Tab bar sticky on scroll (optional)

### 7.2 Page Navigation Buttons (Sequential Content)

**Use Case:** Multi-page flows (Observability: Intro → Big Picture → Pillars → Stack)

**Structure:**
```
┌────────────────────────────────────────────────┐
│ (1 Intro) (2 Big Picture) (3 Pillars) ...     │ ← Page Buttons
├────────────────────────────────────────────────┤
│                                                │
│  Page Content                                  │
│                                                │
│                                                │
│  [← Previous]              [Next →]            │ ← Footer Nav
└────────────────────────────────────────────────┘
```

**Page Button Styling:**
```css
Size: 40px × 40px (w-10 h-10) circular or 120px × 40px rectangular
Background: Slate 100 / Slate 700 (inactive), Temenos Navy (active)
Text: Slate 700 / Slate 300 (inactive), White (active)
Border Radius: 8px (rounded-lg) or 20px (rounded-full)
Font Size: 14px (text-sm)
Font Weight: 500 (font-medium)
Display: Flex (inline on desktop, wrap on mobile)
Gap: 8px (gap-2)

Active:
  Background: Temenos Navy
  Text: White
  Border: 2px solid Temenos Cyan
  Shadow: md

Hover (inactive):
  Background: Slate 200 / Slate-600
  Text: Slate 900 / Slate-100
```

### 7.3 Sub-Card Grid (Category Drill-Down)

**Use Case:** Hierarchical content (Security: 9 sub-categories)

**Structure:**
```
┌────────────────────────────────────────────────┐
│  Security Content                              │
│                                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │  Card 1 │ │  Card 2 │ │  Card 3 │         │ ← Grid of Cards
│  └─────────┘ └─────────┘ └─────────┘         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │  Card 4 │ │  Card 5 │ │  Card 6 │         │
│  └─────────┘ └─────────┘ └─────────┘         │
│                                                │
│  [← Back]                                      │
└────────────────────────────────────────────────┘
```

**Grid Layout:**
- 3 columns on desktop, 2 on tablet, 1 on mobile
- Gap: 24px (gap-6)
- Each card uses Component Selection Card styling (Section 6.3)
- Click card to open detail view
- Back button returns to grid

### 7.4 Breadcrumb Navigation

**Optional enhancement for deep navigation**

```css
Display: Flex row
Align Items: Center
Gap: 8px (gap-2)
Font Size: 14px (text-sm)
Color: Slate 500 / Slate 400

Separator: "/"  or  chevron-right icon
Current Page: Temenos Navy / Temenos Cyan, font-semibold
Previous Pages: Links with hover underline
```

**Example:**
```
Home / Security / SaaS Security Services / Overview
```

---

## 8. Backgrounds & Surfaces

### 8.1 Page Background

**Light Mode**
```css
Background: Slate 50 (#F8FAFC)
Optional Subtle Gradient: from-slate-50 to-slate-100
```

**Dark Mode**
```css
Background: Slate 900 (#0F172A)
Optional Subtle Gradient: from-slate-900 to-slate-800
```

### 8.2 Surface Elevation (Z-Axis)

**Flat (Elevation 0)**
```css
Background: Page background color
Shadow: None
Use: Page background, full-bleed sections
```

**Raised (Elevation 1)**
```css
Background: Surface color (White / Slate 800)
Shadow: shadow-sm (subtle shadow)
Border: 1px solid Slate 200 / Slate 700
Use: Cards, panels, form containers
```

**Floating (Elevation 2)**
```css
Background: Surface color
Shadow: shadow-md (medium shadow)
Border: None or 1px solid Slate 200 / Slate 700
Use: Modals, dropdowns, tooltips, popovers
```

**Modal (Elevation 3)**
```css
Background: Surface color
Shadow: shadow-2xl (large shadow)
Backdrop: rgba(0, 0, 0, 0.5) in light mode, rgba(0, 0, 0, 0.7) in dark mode
Use: Dialogs, overlays, important notifications
```

### 8.3 Glassmorphism (Optional Enhancement)

**For Hero Sections or Feature Highlights**
```css
Background: rgba(255, 255, 255, 0.1) / rgba(30, 41, 59, 0.5)
Backdrop Filter: blur(10px) saturate(180%)
Border: 1px solid rgba(255, 255, 255, 0.2) / rgba(148, 163, 184, 0.1)
Shadow: shadow-xl
```

**Usage:** Hero sections, feature callouts, special announcements

---

## 9. Interactive States

### 9.1 Hover States

**General Principle:** Subtle visual feedback without jarring changes

**Buttons:**
- Background lightens (primary) or fills (secondary)
- Shadow increases slightly
- Slight upward translation (-2px)
- 200ms transition

**Links:**
- Color changes to Temenos Cyan
- Underline appears or thickens
- 150ms transition

**Cards:**
- Shadow increases (md → lg)
- Border color strengthens
- Upward translation (-4px)
- 200ms transition

**Tabs:**
- Background fills (inactive → light fill)
- Text darkens/brightens
- Slight upward translation (-2px)
- 200ms transition

### 9.2 Focus States

**All Interactive Elements:**
- Outline: 3px solid Temenos Blue (#0066CC) at 50% opacity
- Outline Offset: 2px (provides breathing room)
- No browser default outline
- Visible in both light and dark modes

**Tailwind Classes:**
```
focus:outline-none focus:ring-3 focus:ring-[#0066CC]/50 focus:ring-offset-2
```

**Keyboard Navigation:**
- Tab order follows logical reading flow
- Focus states clearly visible
- Skip links provided for accessibility

### 9.3 Active/Pressed States

**Buttons:**
- Background darkens
- Shadow decreases (lg → sm)
- Scale slightly (0.98)
- No translation (pressed feeling)
- 100ms transition

**Cards:**
- Border becomes more prominent
- Shadow decreases
- Scale slightly (0.99)
- 100ms transition

**Tabs:**
- Enhanced border bottom (active state maintained)
- Slight scale (1.02)
- 100ms transition

### 9.4 Disabled States

**All Interactive Elements:**
- Opacity: 0.6
- Cursor: not-allowed
- Background: Muted neutral (Slate 200-300 / Slate 600-700)
- Text: Slate 400 / Slate 500
- No hover effects
- No shadows
- Clear visual indication of non-interactivity

### 9.5 Loading States

**Buttons During Loading:**
- Spinner icon replaces text or appears alongside
- Disabled state applied
- "Loading..." text (optional)
- Cursor: wait

**Content Areas:**
- Skeleton screens (pulsing gray rectangles)
- Or centered spinner
- Maintain layout (no content shift)
- Smooth fade-in when content loads

### 9.6 Error States

**Form Fields:**
- Border: 2px solid Error Red (#EF4444)
- Background: Red-50 / Red-900 at 10% opacity
- Icon: Red exclamation mark
- Error message below field in Red-600 / Red-400

**Content Areas:**
- Red-50 / Red-900 at 20% opacity background
- Red-600 / Red-400 border
- Error icon and message
- Retry button (if applicable)

### 9.7 Success States

**Form Fields:**
- Border: 2px solid Success Green (#10B981)
- Icon: Green checkmark
- Success message in Green-600 / Green-400

**Notifications:**
- Green-50 / Green-900 at 20% opacity background
- Green-600 / Green-400 border
- Checkmark icon
- Auto-dismiss after 3-5 seconds (optional)

---

## 10. Accessibility

### 10.1 Color Contrast

**WCAG 2.1 AA Compliance Required**

**Text Contrast Ratios:**
- Normal text (< 18pt): Minimum 4.5:1
- Large text (≥ 18pt or 14pt bold): Minimum 3:1
- Interactive elements: Minimum 3:1

**Testing:**
- Use contrast checkers during design
- Test all text on all backgrounds in both modes
- Ensure brand colors meet requirements

**Adjustments:**
- If Temenos Navy text on white fails: Use Slate 900 for body text
- If white text on Temenos Navy fails: Acceptable for buttons/active tabs (large text)
- Secondary text must meet 4.5:1 even in muted colors

### 10.2 Keyboard Navigation

**Requirements:**
- All interactive elements accessible via Tab
- Logical tab order (left-to-right, top-to-bottom)
- Visible focus indicators (Section 9.2)
- Enter/Space to activate buttons/links
- Escape to close modals/dropdowns
- Arrow keys for tab navigation (optional enhancement)

**Skip Links:**
- "Skip to main content" link at top
- Hidden until focused
- Jumps to main content area

### 10.3 Screen Readers

**Semantic HTML:**
- Use proper heading hierarchy (H1 → H2 → H3)
- Use `<button>` for buttons, `<a>` for links
- Use `<nav>`, `<main>`, `<header>`, `<footer>` landmarks
- Use `<label>` for form fields

**ARIA Labels:**
- `aria-label` for icon-only buttons
- `aria-labelledby` for complex components
- `aria-current="page"` for active navigation items
- `aria-expanded` for collapsible sections
- `aria-hidden="true"` for decorative icons

**Alt Text:**
- All images have descriptive alt text
- Decorative images: `alt=""` (not read by screen readers)
- Icons with meaning: aria-label on parent element

### 10.4 Motion & Animation

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Respect User Preferences:**
- Detect `prefers-reduced-motion` media query
- Disable all animations if set to reduce
- Maintain functionality without animations

### 10.5 Text Scaling

**Support 200% Zoom:**
- Test all layouts at 200% browser zoom
- No horizontal scrolling required
- All content remains readable
- Interactive elements remain accessible

**Relative Units:**
- Use rem/em for font sizes (not px)
- Use % or viewport units for layouts
- Avoid fixed pixel heights on text containers

### 10.6 Color Blindness

**Do Not Rely on Color Alone:**
- Use icons + color for status
- Use text labels + color for categories
- Use patterns or shapes in data visualizations

**Safe Color Combinations:**
- Blue + Orange (instead of red/green)
- Test with color blindness simulators
- Ensure sufficient contrast in grayscale

---

## 11. Implementation Guidelines

### 11.1 Rollout Strategy

**Phase 1: Global Styles (Week 1)**
1. Update `tailwind.config.js` with new color palette
2. Update `index.css` with CSS custom properties
3. Update global typography classes
4. Test in both light and dark modes
5. No visual changes yet (just infrastructure)

**Phase 2: Common Components (Week 2)**
6. Update button components
7. Update tab components (reference: Security SaaS Services)
8. Update card components
9. Update form components
10. Test all components in isolation

**Phase 3: Card-by-Card Rollout (Weeks 3-4)**
11. Security Card (already using tab pattern)
12. Integration Card
13. Observability Card
14. Data Architecture Card
15. Deployment Card
16. Design Time Card

**Phase 4: Final Polish (Week 5)**
17. Consistency review across all cards
18. Accessibility audit
19. Performance testing
20. Dark mode verification
21. Cross-browser testing

### 11.2 File Structure

**CSS Variables**
```
/frontend/src/index.css
- Define all color variables
- Define animation keyframes
- Define global utility classes
```

**Tailwind Config**
```
/frontend/tailwind.config.js
- Extend theme with Temenos colors
- Configure custom color palette
- Add custom spacing scale
- Configure typography plugin
```

**Component Styling**
```
/frontend/src/components/[ComponentName].tsx
- Use Tailwind utility classes
- Reference CSS variables when needed
- Avoid inline styles where possible
```

### 11.3 Testing Checklist

**Visual Testing:**
- [ ] Light mode: All colors correct, good contrast
- [ ] Dark mode: All colors correct, good contrast
- [ ] Typography: Hierarchy clear, sizes correct
- [ ] Spacing: Consistent rhythm, no overlaps
- [ ] Hover states: Smooth, appropriate feedback
- [ ] Focus states: Visible, meets accessibility standards
- [ ] Active states: Clear pressed feeling
- [ ] Disabled states: Clear non-interactivity

**Responsive Testing:**
- [ ] Desktop (1920px): Full layout, no issues
- [ ] Laptop (1366px): Adjusted layout, readable
- [ ] Tablet (768px): Mobile-friendly, columns stack
- [ ] Mobile (375px): Single column, touch-friendly

**Accessibility Testing:**
- [ ] Keyboard navigation: All elements accessible
- [ ] Screen reader: Logical reading order
- [ ] Color contrast: WCAG AA compliance
- [ ] Zoom 200%: No layout breaks
- [ ] Reduced motion: Animations disabled

**Cross-Browser Testing:**
- [ ] Chrome: Full functionality
- [ ] Firefox: Full functionality
- [ ] Safari: Full functionality
- [ ] Edge: Full functionality

### 11.4 Code Examples

#### Applying Button Styles
```jsx
// Primary Button
<button className="bg-[#003366] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#004080] hover:shadow-lg hover:-translate-y-0.5 active:bg-[#002244] active:shadow-sm transition-all duration-200">
  Get Started
</button>

// Secondary Button
<button className="bg-transparent border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold px-5.5 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-[#0066CC] hover:text-[#0066CC] dark:hover:text-[#00A3E0] transition-all duration-200">
  Learn More
</button>
```

#### Applying Tab Styles
```jsx
// Tab Container
<div className="flex flex-row bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 gap-1 overflow-x-auto sticky top-0 z-10 shadow-sm">

  {/* Active Tab */}
  <button className="bg-[#003366] text-white font-semibold text-base px-5 py-3 rounded-t-lg border-b-3 border-[#00A3E0] shadow-md scale-105 flex items-center gap-2 transition-all duration-200">
    <Icon className="w-5 h-5" />
    Overview
  </button>

  {/* Inactive Tab */}
  <button className="bg-transparent text-slate-600 dark:text-slate-300 font-medium text-base px-5 py-3 rounded-t-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:-translate-y-0.5 flex items-center gap-2 transition-all duration-200 cursor-pointer">
    <Icon className="w-5 h-5" />
    Architecture
  </button>

</div>

{/* Tab Content */}
<div className="bg-slate-50 dark:bg-slate-900 p-6 min-h-[500px] overflow-y-auto animate-fade-in">
  {/* Content here */}
</div>
```

#### Applying Card Styles
```jsx
// Standard Card
<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">
    Card Title
  </h3>
  <p className="text-base text-slate-600 dark:text-slate-300 leading-normal">
    Card content goes here...
  </p>
</div>
```

#### Using CSS Variables
```jsx
// In component
<div style={{
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-text-on-primary)',
  padding: '1rem',
  borderRadius: '0.5rem'
}}>
  Primary Colored Element
</div>
```

### 11.5 Migration Notes

**DO NOT CHANGE:**
- Layout structures (grid configurations, flex containers)
- Component logic (state management, event handlers)
- Navigation patterns (routing, page flows)
- Content organization (section order, hierarchies)

**DO CHANGE:**
- Color values (to Temenos brand colors)
- Typography classes (to standardized scale)
- Button/tab styling (to unified design)
- Spacing values (to consistent scale)
- Shadows and borders (to unified elevation)

**PRESERVE:**
- Existing animations (just adjust colors if needed)
- Interactive behaviors (click handlers, transitions)
- Responsive breakpoints (unless improving mobile experience)
- Accessibility features (ARIA labels, semantic HTML)

**BACKWARDS COMPATIBILITY:**
- Use CSS variables for easy theme switching
- Maintain existing class names where possible
- Add new classes, don't remove old ones immediately
- Gradual migration per card (not all at once)

---

## Appendix: Current State Analysis

### A.1 Security Card - SaaS Security Services

**Current Tab Styling (Reference Implementation):**
```
Active Tab:
  - Background: #818CF8 (Indigo-400)
  - Text: White
  - Shadow: md
  - Scale: 1.05

Inactive Tab:
  - Background: Slate-100 / Slate-700
  - Text: Slate-600 / Slate-300
  - Hover: Slate-200 / Slate-600
```

**Proposed Changes:**
```
Active Tab:
  - Background: #003366 (Temenos Navy) ✓ Changed
  - Border Bottom: #00A3E0 (Temenos Cyan) ✓ Added
  - Rest: Same

Inactive Tab:
  - Same (already neutral, works well)
```

**Impact:** Minimal - only color values change, structure preserved

### A.2 Integration Card - API Overview

**Current Tab Styling:**
```
Tabs use blue theme (#3B82F6)
Follows similar pattern to Security
```

**Proposed Changes:**
```
Active: #003366 (Temenos Navy)
Border: #00A3E0 (Temenos Cyan)
Category accent: Keep #3B82F6 for Integration icon/badges
```

### A.3 Observability Card

**Current Page Button Styling:**
```
Active: Indigo-600 background
Inactive: Transparent with slate text
Icons: Lightbulb, Layers, Server, Box, Workflow
```

**Proposed Changes:**
```
Active: #003366 (Temenos Navy) background
Border: #00A3E0 (Temenos Cyan) bottom border
Inactive: Same neutral treatment
Icons: Keep current (functional, not brand)
```

### A.4 Data Architecture Card

**Current Styling:**
```
Emerald theme (#10B981) throughout
Interactive diagram with animated paths
Component boxes with emerald glow
```

**Proposed Changes:**
```
Primary actions/buttons: #003366 (Temenos Navy)
Keep emerald for: Category icon, data flow paths, component highlights
Reason: Emerald provides good visual distinction for "data" theme
```

### A.5 Typography Inconsistencies Found

**Issue 1: Heading Sizes Vary**
- Some cards: text-3xl for H1
- Other cards: text-2xl for H1
- Proposed: Standardize to text-3xl (32px) for all H1

**Issue 2: Body Text Sizes**
- Some cards: text-sm (14px)
- Other cards: text-base (16px)
- Proposed: Standardize to text-base (16px) for body, text-sm for captions

**Issue 3: Font Weights**
- Inconsistent use of font-medium (500) vs font-semibold (600)
- Proposed: font-semibold for all headings, font-medium for labels, font-normal for body

### A.6 Spacing Inconsistencies

**Card Padding:**
- Range: p-4 (16px) to p-8 (32px)
- Proposed: Standard p-6 (24px) for all cards

**Section Gaps:**
- Range: space-y-4 to space-y-8
- Proposed: space-y-6 (24px) for related sections, space-y-12 (48px) for major sections

**Button Groups:**
- Range: gap-2 to gap-4
- Proposed: gap-3 (12px) standard

### A.7 Color Usage Audit

**Current Primary Colors Used:**
```
Blue (#3B82F6):       Integration, various buttons
Emerald (#10B981):    Data Architecture, success states
Violet (#8B5CF6):     Deployment
Red (#EF4444):        Security, error states
Amber (#F59E0B):      Observability, warnings
Indigo (#6366F1):     Design Time, some tabs
```

**Proposed Primary Color:**
```
Temenos Navy (#003366): All primary buttons, active tabs, primary actions
```

**Category Colors Preserved:**
```
Same as above - used only for icons, badges, category identification
Not used for interactive elements (buttons, tabs)
```

### A.8 Dark Mode Consistency

**Current State:**
- Some cards: Excellent dark mode support
- Some cards: Inconsistent contrast
- Some components: Hard-coded colors (not theme-aware)

**Action Items:**
- Audit all hard-coded color values
- Replace with CSS variables or Tailwind dark: variants
- Test all cards in dark mode
- Ensure 4.5:1 contrast ratios

---

## Appendix B: Design Rationale

### Why Temenos Navy (#003366)?

1. **Brand Alignment:** Official Temenos brand color
2. **Professional:** Deep blue conveys trust, stability, banking expertise
3. **Contrast:** Excellent contrast with white text (meets WCAG AAA at 12.6:1)
4. **Versatile:** Works in both light and dark modes
5. **Distinctive:** Stands out from generic blue (#3B82F6) used in many apps

### Why Temenos Cyan (#00A3E0) as Accent?

1. **Brand Consistency:** Part of Temenos color family
2. **Visual Interest:** Bright cyan provides energy and modernity
3. **Contrast:** Works well with navy (complementary relationship)
4. **Accessibility:** High contrast against dark backgrounds
5. **Functional:** Good for highlights, active states, links

### Why Inter Font?

1. **Readability:** Designed for digital interfaces
2. **Professional:** Used by Temenos and many financial platforms
3. **Open Source:** No licensing issues
4. **Variable Font:** Supports all weights
5. **Wide Support:** Excellent cross-browser compatibility

### Why This Tab Design?

1. **Proven Pattern:** Security SaaS Services demonstrates effectiveness
2. **Clear Active State:** No ambiguity about current selection
3. **Smooth Transitions:** Professional feel
4. **Accessible:** High contrast, keyboard navigable
5. **Scalable:** Works with 2-10 tabs, mobile-friendly

---

## Document Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2024-12-15 | Initial draft for team review | Claude Code |
| 1.1 | 2024-12-16 | Added comprehensive prototype & enhanced patterns | Claude Code |

**Version 1.1 Additions:**
- Created Design System Showcase component with 10 interactive pages
- Added detailed Alert & Notification patterns (Section 6.8)
- Added Gradient Accent Cards pattern (Section 6.9)
- Added Bouncing Dots and Progress Bar loading indicators
- Added comprehensive code examples for all alert types
- Updated prototype status to "Complete"

---

## Next Steps

### Immediate Actions (Completed ✓)
1. ✅ **Prototype Creation:** Design System Showcase component created
2. ✅ **Comprehensive Examples:** 10 pages showcasing all layout features
   - Overview (Design principles)
   - Typography (All heading levels, body text, special styles)
   - Colors (Brand colors, functional colors, category colors)
   - Buttons (Primary, secondary, icon, states)
   - Cards (Standard, gradient, interactive)
   - Forms (Inputs, selects, checkboxes, states)
   - Navigation (Tabs, page buttons, breadcrumbs)
   - Components (Badges, tags, loaders, alerts)
   - Spacing (Scale, grids, vertical rhythm)
   - Animations (Hover effects, transitions, focus states)

### Next Actions for Team
1. **Team Review:** Present the live Design System Showcase to the team
   - Access via "Design System Showcase" card on homepage
   - Review all 10 pages of comprehensive examples
   - Test in both light and dark modes
2. **Feedback Collection:** Gather input from all stakeholders
   - Color preferences and brand alignment
   - Typography readability and hierarchy
   - Component styling and interactions
   - Accessibility concerns
3. **Refinement:** Adjust specification based on feedback
4. **Final Approval:** Lock specification as v2.0 Final
5. **Rollout Planning:** Create implementation schedule (see Section 11.1)
6. **Card-by-Card Implementation:** Apply unified layout to existing cards
7. **Documentation Update:** Update this document with lessons learned

---

**END OF UNIFIED LAYOUT SPECIFICATION**

This document is a living specification. As the platform evolves, this document should be updated to reflect new patterns, components, and brand guidelines. All changes should be versioned and approved by the design lead.
