# Animations Reference

**Purpose:** Complete guide to animations and transitions in the Content Template System
**Use this for:** Adding smooth, professional animations to your content
**Related:** section-types-reference.md, interactions-guide.md

---

## Overview

Animations define **HOW content appears and transitions**. All animation timing, curves, and visual effects are handled by `UNIFIED_LAYOUT_SPECIFICATION.md`.

Content creators only need to specify:
- **WHAT** should animate (section, element, transition)
- **WHEN** it should animate (on load, on click, on scroll)
- **WHICH** animation style to use (fade, slide, scale, etc.)

**You do NOT configure:**
- Animation duration (handled by spec)
- Easing curves (handled by spec)
- Colors or styles (handled by spec)

---

## Animation Categories

### 1. Entry Animations (Currently Implemented)
How elements appear when page loads

### 2. Hover Effects (Currently Implemented)
How elements respond to mouse hover interactions

### 3. Future Animation Types (Not Yet Implemented)
The following categories are planned for future releases:
- Click/Active Animations (pulse, ripple)
- Transition Animations (page navigation)
- Expandable Animations (collapsible content)
- Loading Animations (loading states)

---

## Currently Implemented Entry Animations

Applied when elements first appear on page load or in agenda grids.

**✅ IMPLEMENTED ANIMATION TYPES:**
1. **fade-in** - Simple opacity fade
2. **slide-in-left** - Slides in from left side
3. **slide-in-right** - Slides in from right side
4. **scale-in** - Grows from smaller size
5. **stagger-fade-in** - Sequential fade for multiple items

**Note:** Other animation types mentioned in this document (slide-in-up, slide-in-down, bounce-in, etc.) are for reference and future implementation.

---

### fade-in ✅
Element fades from transparent to visible.

```yaml
card:
  settings:
    default_animation: "fade-in"
```

```yaml
agenda:
  animation:
    type: "fade-in"
```

**Use for:**
- General purpose (default)
- Subtle, professional appearance
- Text content
- Page sections

**Effect:** Opacity 0 → 1

---

### slide-in-left ✅
Element slides in from left side.

```yaml
card:
  settings:
    default_animation: "slide-in-left"
```

```yaml
agenda:
  animation:
    type: "slide-in-left"
```

**Use for:**
- Sidebar content
- Sequential items
- Reading flow emphasis
- Agenda grids

**Effect:** Moves from left (-100px) + fades in

---

### slide-in-right ✅
Element slides in from right side.

```yaml
card:
  settings:
    default_animation: "slide-in-right"
```

```yaml
agenda:
  animation:
    type: "slide-in-right"
```

**Use for:**
- Sidebar opposite content
- Alternative views
- Contextual information
- Reversed flow

**Effect:** Moves from right (+100px) + fades in

---

### scale-in ✅
Element grows from small to full size.

```yaml
card:
  settings:
    default_animation: "scale-in"
```

```yaml
agenda:
  animation:
    type: "scale-in"
```

**Use for:**
- Icons and badges
- Important callouts
- Interactive elements
- Emphasizing content

**Effect:** Scale 0.8 → 1.0 + fades in

---

### stagger-fade-in ✅
Children elements fade in sequentially with configurable delay.

```yaml
agenda:
  animation:
    type: "stagger-fade-in"
    delay_between_items: "0.1s"  # Time between each item
```

**Use for:**
- Lists of items
- Grid layouts
- Agenda cards (recommended)
- Navigation menus

**Effect:** Each child fades in with delay between them

**Delay Configuration:**
The `delay_between_items` parameter supports:
- **Seconds:** `"0.05s"`, `"0.1s"`, `"0.5s"`, `"1s"`, `"2s"`
- **Milliseconds:** `"50ms"`, `"100ms"`, `"500ms"`, `"1000ms"`

**Recommended delay values:**
- `"0.05s"` or `"50ms"` - Fast (10+ items)
- `"0.1s"` or `"100ms"` - Standard (recommended, 5-10 items)
- `"0.2s"` or `"200ms"` - Moderate (3-5 items)
- `"0.5s"` or `"500ms"` - Slow (2-3 items, dramatic effect)

**Example:**
```yaml
agenda:
  title: "Animations Showcase"
  subtitle: "Explore all animation capabilities"

  animation:
    type: "stagger-fade-in"
    delay_between_items: "0.2s"  # 200ms between each card

  items:
    - id: "item-1"  # Appears first
    - id: "item-2"  # Appears after 0.2s
    - id: "item-3"  # Appears after 0.4s
```

---

## Not Yet Implemented (Reference Only)

The following animations are documented for future implementation but are **not currently functional**:

### slide-in-up ❌ (Not Implemented)
Element slides up from below.

```yaml
settings:
  default_animation: "slide-in-up"  # NOT IMPLEMENTED
```

---

### slide-in-down ❌ (Not Implemented)
Element slides down from above.

```yaml
settings:
  default_animation: "slide-in-down"  # NOT IMPLEMENTED
```

---

### bounce-in ❌ (Not Implemented)
Element bounces into place.

```yaml
settings:
  default_animation: "bounce-in"  # NOT IMPLEMENTED
```

---

## Currently Implemented Hover Effects

Applied when user hovers over interactive elements.

**✅ IMPLEMENTED HOVER EFFECTS:**
1. **zoom** - Element slightly enlarges
2. **lift** - Element rises with enhanced shadow
3. **glow** - Subtle glow/border highlight
4. **border** - Border color change
5. **brightness** - Image brightness increases

**Supported in these section types:**
- `feature_grid` - Individual features can have hover effects
- `clickable_cards` - Individual cards can have hover effects
- `gallery` - Individual images can have hover effects

---

### zoom ✅
Element slightly enlarges.

```yaml
- type: "feature_grid"
  features:
    - name: "Feature"
      icon: "Star"
      description: "Feature description"
      hover_effect: "zoom"
```

**Use for:**
- Images
- Cards
- Buttons
- Clickable elements

**Effect:** Scale 1.0 → 1.05

---

### lift ✅
Element rises with shadow.

```yaml
- type: "clickable_cards"
  cards:
    - title: "Feature"
      description: "Feature description"
      hover_effect: "lift"
```

**Use for:**
- Cards
- Panels
- Interactive containers

**Effect:** Translates up (-4px) + enhanced shadow

---

### glow ✅
Element gets subtle glow effect.

```yaml
- type: "feature_grid"
  features:
    - name: "Security"
      icon: "Shield"
      description: "Security feature"
      hover_effect: "glow"
```

**Use for:**
- Icons
- Badges
- Special elements

**Effect:** Subtle ring glow effect

---

### border ✅
Border color change or appearance.

```yaml
- type: "gallery"
  images:
    - src: "/images/architecture.png"
      alt: "Architecture diagram"
      hover_effect: "border"
```

**Use for:**
- Images in grids
- Outlined elements
- Selection indicators

**Effect:** Border color transition to blue

---

### brightness ✅
Image brightness increases.

```yaml
- type: "gallery"
  images:
    - src: "/images/screenshot.png"
      alt: "Screenshot"
      hover_effect: "brightness"
```

**Use for:**
- Image galleries
- Photo grids
- Thumbnails

**Effect:** Brightness filter 1.0 → 1.1

---

## Not Yet Implemented Interaction Animations

---

### Click/Active Animations

#### pulse
Brief pulse effect on click.

```yaml
- type: "expandable_card"
  trigger: "click"
  click_animation: "pulse"
```

**Use for:**
- Buttons
- Toggle elements
- Interactive controls

**Effect:** Quick scale pulse

---

#### ripple
Material design ripple effect.

```yaml
- type: "clickable_cards"
  cards:
    - title: "Feature"
      click_animation: "ripple"
```

**Use for:**
- Cards
- Flat buttons
- Touch interfaces

**Effect:** Expanding circle from click point

---

## Expandable Animations

For collapsible/expandable content sections.

### slide-down
Content slides down smoothly.

```yaml
- type: "expandable_section"
  expanded:
    animation: "slide-down"
```

**Use for:**
- Expandable sections (default)
- Accordions
- Dropdowns

**Effect:** Height 0 → auto with smooth transition

---

### slide-up
Content slides up when collapsing.

```yaml
- type: "expandable_section"
  expanded:
    animation: "slide-up"
  collapsed_animation: "slide-up"
```

**Use for:**
- Bottom-aligned content
- Upward expanding menus

**Effect:** Height auto → 0 from bottom

---

### fade-in
Content fades in without sliding.

```yaml
- type: "expandable_card"
  expanded:
    animation: "fade-in"
```

**Use for:**
- Simple reveals
- Subtle changes
- Text-heavy content

**Effect:** Opacity 0 → 1

---

### scale-expand
Content scales from small to full.

```yaml
- type: "expandable_section"
  expanded:
    animation: "scale-expand"
```

**Use for:**
- Modal-like expansions
- Dramatic reveals
- **Use sparingly!**

**Effect:** Scale + fade from center

---

## Page Transition Animations

How pages transition during navigation.

### fade
Old page fades out, new page fades in.

```yaml
card:
  settings:
    transition_speed: "300ms"
    page_transition: "fade"  # default
```

**Use for:**
- Default (smooth, professional)
- Most content types
- Clean transitions

**Effect:** Crossfade between pages

---

### slide-left
New page slides in from right (moving left).

```yaml
card:
  settings:
    page_transition: "slide-left"
```

**Use for:**
- Forward navigation
- Hierarchical drill-down
- Left-to-right reading

**Effect:** Page slides right to left

---

### slide-right
New page slides in from left (moving right).

```yaml
card:
  settings:
    page_transition: "slide-right"
```

**Use for:**
- Back navigation
- Reverse hierarchy
- Right-to-left reading

**Effect:** Page slides left to right

---

### scale-fade
New page scales up while fading in.

```yaml
card:
  settings:
    page_transition: "scale-fade"
```

**Use for:**
- Modal-like pages
- Focused detail views
- Special content

**Effect:** Scale 0.95 → 1.0 + fade

---

### instant
No transition animation.

```yaml
card:
  settings:
    page_transition: "instant"
```

**Use for:**
- Performance optimization
- Large content pages
- Accessibility preference

**Effect:** Immediate page swap

---

## Loading Animations

For loading states and spinners.

### spinner
Rotating circle.

```yaml
- type: "loading"
  style: "spinner"
```

**Use for:**
- Default loading state
- API calls
- Content loading

---

### dots
Bouncing dots.

```yaml
- type: "loading"
  style: "dots"
```

**Use for:**
- Lightweight indicators
- Inline loading
- Text loading

---

### pulse
Pulsing element.

```yaml
- type: "loading"
  style: "pulse"
```

**Use for:**
- Skeleton screens
- Content placeholders

---

### skeleton
Content-shaped placeholders.

```yaml
- type: "loading"
  style: "skeleton"
  layout: "card"  # card, list, text
```

**Use for:**
- Better UX (shows structure)
- Card grids
- List views

---

## Animation Speed Settings

Configure global animation timing.

### Global Speed

```yaml
card:
  settings:
    transition_speed: "300ms"  # fast, normal, slow, or milliseconds
```

**Speed presets:**
- `fast`: 150ms (snappy, modern)
- `normal`: 300ms (default, balanced)
- `slow`: 500ms (deliberate, emphasis)
- Custom: `"250ms"`, `"400ms"`, etc.

**Guidelines:**
- Entry animations: 300-500ms
- Hover effects: 150-200ms
- Page transitions: 300-400ms
- Expandables: 200-300ms

---

### Per-Section Speed

```yaml
- type: "expandable_section"
  expanded:
    animation: "slide-down"
    animation_speed: "fast"  # Override global
```

---

## Animation Best Practices

### 1. Consistent Direction
Use consistent animation directions for similar actions.

**Good:**
- Forward navigation → slide-left
- Back navigation → slide-right

**Avoid:**
- Random directions for similar actions

---

### 2. Appropriate Speed
Match speed to content importance and size.

**Fast (150-200ms):**
- Hover effects
- Small elements
- Frequent interactions

**Normal (300ms):**
- Page transitions
- Card animations
- Default choice

**Slow (400-500ms):**
- Large elements
- Important content
- First-time reveals

---

### 3. Don't Overanimate
Less is more. Too many animations are distracting.

**Good:**
- Consistent entry animation
- Subtle hover effects
- Smooth page transitions

**Avoid:**
- Different animation for every element
- Bounce/spring effects everywhere
- Long, slow animations

---

### 4. Respect User Preferences
Support `prefers-reduced-motion` accessibility setting.

```yaml
card:
  settings:
    respect_reduced_motion: true  # default
```

When user has reduced motion preference:
- Entry animations → fade-in only
- Transitions → instant or fade
- Hovers → minimal effects

---

### 5. Test on Real Devices
Animations can feel different on:
- Mobile devices (lower power)
- Large screens (longer distances)
- Slow connections (delayed triggers)

---

### 6. Match Content Type

**Text-heavy pages:**
- Simple fade-in
- No sliding
- Fast transitions

**Visual galleries:**
- Stagger animations
- Zoom hover effects
- Smooth transitions

**Interactive dashboards:**
- Minimal animations
- Focus on data
- Quick feedback

---

## Animation Patterns

### Pattern 1: Standard Page

```yaml
sections:
  - type: "hero"
    # Inherits default_animation: "fade-in"

  - type: "text"
    # Also inherits default animation

  - type: "feature_grid"
    # Grid itself inherits animation
    # Individual cards can have hover effects
    features:
      - name: "Feature 1"
        hover_effect: "lift"  # Hover only
```

**Result:**
- Page loads → hero fades in → text fades in → grid fades in
- User hovers cards → cards lift

---

### Pattern 2: Staggered Entry

```yaml
agenda:
  animation:
    type: "stagger-fade-in"
    delay_between_items: "0.1s"

  items:
    - id: "item-1"  # Fades in first
    - id: "item-2"  # Fades in 0.1s later
    - id: "item-3"  # Fades in 0.2s later
```

**Result:** Sequential reveal creates visual flow

---

### Pattern 3: Interactive Expansion

```yaml
- type: "expandable_card"
  trigger: "click_icon"
  collapsed_title: "Learn More"
  expanded:
    animation: "slide-down"
    animation_speed: "normal"
```

**Result:**
- Initial state: Card visible, collapsed
- Click icon → content slides down
- Click again → content slides up

---

### Pattern 4: Image Gallery

```yaml
- type: "gallery"
  columns: 3
  animation: "stagger-fade-in"  # Entry animation
  images:
    - src: "/images/1.png"
      hover_effect: "zoom"  # Hover animation
```

**Result:**
- Page load → images stagger in
- Hover → image zooms slightly

---

## Debugging Animations

### Animation Not Working?

**Check:**
1. Animation name spelled correctly?
2. Section type supports that animation?
3. Global settings configured?
4. Browser supports CSS animations?

### Animation Too Slow/Fast?

**Adjust:**
```yaml
card:
  settings:
    transition_speed: "200ms"  # Faster
```

Or per-section:
```yaml
- type: "expandable_section"
  expanded:
    animation_speed: "fast"
```

### Animation Causing Performance Issues?

**Solutions:**
1. Use simpler animations (fade instead of slide)
2. Reduce stagger delay
3. Set `default_animation: "none"` for heavy pages
4. Use `instant` page transitions

---

## Animation Decision Tree

**Choosing an animation:**

```
Do you need animation?
├─ No → animation: "none"
└─ Yes
   ├─ Is it an entry animation?
   │  ├─ Multiple items? → "stagger-fade-in"
   │  ├─ Important content? → "scale-in"
   │  └─ Normal content? → "fade-in"
   │
   ├─ Is it a hover effect?
   │  ├─ Image? → "zoom"
   │  ├─ Card? → "lift"
   │  └─ Icon? → "glow"
   │
   ├─ Is it expandable content?
   │  ├─ Vertical layout? → "slide-down"
   │  └─ Simple reveal? → "fade-in"
   │
   └─ Is it a page transition?
      ├─ Default → "fade"
      ├─ Forward nav → "slide-left"
      └─ Back nav → "slide-right"
```

---

## Complete Example

```yaml
card:
  id: "security-guide"
  name: "Security Guide"

  # Global animation settings
  settings:
    default_animation: "fade-in"  # Default for all sections
    transition_speed: "300ms"  # Global speed
    page_transition: "fade"  # Page navigation animation

  # Agenda with staggered entry
  agenda:
    animation:
      type: "stagger-fade-in"
      delay_between_items: "0.1s"
    items:
      - id: "intro"
        # Fades in with 0.1s stagger

# Individual page with sections
page:
  sections:
    # Hero inherits fade-in
    - type: "hero"
      heading: "Security Overview"

    # Image with hover effect
    - type: "image_clickable"
      image: "/images/architecture.png"
      hover_effect: "zoom"  # Zooms on hover

    # Expandable with custom animation
    - type: "expandable_section"
      collapsed:
        title: "Advanced Details"
      expanded:
        animation: "slide-down"  # Slides down on expand
        animation_speed: "normal"

    # Feature grid with hover
    - type: "feature_grid"
      features:
        - name: "Feature 1"
          hover_effect: "lift"  # Lifts on hover
```

---

## Quick Reference

### ✅ Currently Implemented Entry Animations

**For Card Settings (Page/Section Animations):**
```yaml
card:
  settings:
    default_animation: "fade-in"  # or slide-in-left, slide-in-right, scale-in
```

**For Agenda Grid Animations:**
```yaml
agenda:
  animation:
    type: "stagger-fade-in"  # or fade-in, slide-in-left, slide-in-right, scale-in
    delay_between_items: "0.1s"  # Only for stagger-fade-in
```

**Implemented Types:**
1. `fade-in` - Default, simple opacity fade
2. `slide-in-left` - Slides from left side
3. `slide-in-right` - Slides from right side
4. `scale-in` - Grows from smaller size
5. `stagger-fade-in` - Sequential fade (recommended for agenda grids)

**Stagger Delay Options:**
- `"0.05s"` or `"50ms"` - Fast (10+ items)
- `"0.1s"` or `"100ms"` - Standard (5-10 items) **[Recommended]**
- `"0.2s"` or `"200ms"` - Moderate (3-5 items)
- `"0.5s"` or `"500ms"` - Slow (2-3 items)
- `"1s"` or `"1000ms"` - Very slow (dramatic effect)

### ✅ Implemented Hover Effects

The following hover effects are **now functional**:
- **zoom** - Element scales up (1.0 → 1.05)
- **lift** - Element rises with enhanced shadow
- **glow** - Subtle ring glow effect
- **border** - Border color transition to blue
- **brightness** - Brightness filter (1.0 → 1.1)

**Supported in:**
- `feature_grid` sections
- `clickable_cards` sections
- `gallery` sections

### ❌ Not Yet Implemented (Reference Only)

The following are documented but **not functional**:
- Entry animations: slide-in-up, slide-in-down, bounce-in
- Click/Active animations: pulse, ripple
- Expandable animations: slide-down, slide-up, scale-expand
- Page transitions: fade, slide-left, slide-right, scale-fade, instant
- Loading animations: spinner, dots, pulse, skeleton

---

## Remember

**Content creators specify:**
- WHAT animates
- WHEN it animates
- WHICH animation style

**UNIFIED_LAYOUT_SPECIFICATION.md defines:**
- HOW animations look (curves, timing)
- Visual effects
- Performance optimization

---

**Last Updated:** January 10, 2026
**Version:** 1.2 - Added hover effects implementation (zoom, lift, glow, border, brightness)
