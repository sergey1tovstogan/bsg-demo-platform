# Observability Card - Agenda-Based Navigation Implementation Prompt

## Overview
Implement an agenda-based navigation system for the observability component card with the following structure:
- Landing page: Animated agenda with clickable items
- Content pages: Individual pages for each agenda topic
- Navigation: Back to agenda + Next page buttons on each content page
- Content management: Separate MD files for each page

---

## 1. Agenda Structure

### Agenda Items
Please list the agenda items in order. For each item, provide:

**Item 1:**
- Title: [e.g., "What is Observability?"]
- Short description: [1-2 sentences shown on agenda]
- Icon/visual: [Optional - icon name or emoji]

**Item 2:**
- Title: [e.g., "Monitoring Tools"]
- Short description:
- Icon/visual:

**Item 3:**
- Title: [e.g., "Logging Strategy"]
- Short description:
- Icon/visual:

**Item 4:**
- Title: [e.g., "Metrics & Tracing"]
- Short description:
- Icon/visual:

**Item 5:**
- Title: [e.g., "Best Practices"]
- Short description:
- Icon/visual:

[Add more items as needed]

---

## 2. Animation Preferences

### Agenda Entry Animation
- Animation type: [e.g., fade-in, slide-in, stagger]
- Duration: [e.g., 0.5s per item]
- Delay between items: [e.g., 0.1s]
- Easing: [e.g., ease-out, spring]

### Page Transition Animation
- Type: [e.g., fade, slide-left/right]
- Duration: [e.g., 0.3s]
- Behavior when clicking agenda items: [instant jump or animated transition]

---

## 3. Content Page Structure

### Layout
- Header: [Show page title? Show progress indicator (e.g., "2/5")?]
- Content area: [Full width or contained? Max width?]
- Footer/Navigation: [Fixed position or scrolls with content?]

### Navigation Buttons
- Back button:
  - Label: [e.g., "← Back to Agenda" or just "← Back"]
  - Position: [e.g., top-left, bottom-left]
  - Style: [primary, secondary, text button]

- Next button:
  - Label: [e.g., "Next →" or "Next: [Topic Name]"]
  - Position: [e.g., bottom-right]
  - Style: [primary, secondary]
  - Behavior on last page: [Hide? Show "Done" or "Back to Start"?]

---

## 4. Content for Each Page

### Page 1: [Title]
**Content to include:**
- [Describe what content should be on this page - e.g., overview text, diagrams, code examples, key points]
- [Specify any special components needed - e.g., architecture diagram, comparison table, code snippets]

### Page 2: [Title]
**Content to include:**
- [...]

### Page 3: [Title]
**Content to include:**
- [...]

[Repeat for each agenda item]

---

## 5. MD File Organization

### Preferred Structure
Choose one:

**Option A: Single MD file with sections**
```
content/observability.md
├── Frontmatter (metadata)
├── Agenda section
└── Page sections (## Page 1, ## Page 2, etc.)
```

**Option B: Separate MD files per page**
```
content/observability/
├── agenda.md (agenda metadata)
├── page-1-what-is-observability.md
├── page-2-monitoring-tools.md
├── page-3-logging-strategy.md
└── ...
```

**Option C: Other structure** (describe below)
[Your preferred structure]

### MD File Format
- Use frontmatter? [Yes/No - if yes, specify fields needed]
- Content format: [Standard markdown? Include special directives for components?]

---

## 6. Technical Implementation Details

### Component Architecture
Where should this be implemented?
- [ ] Modify existing ComponentDetail.tsx to add agenda mode
- [ ] Create new ObservabilityAgenda.tsx component
- [ ] Create separate router route for agenda view
- [ ] Other: [describe]

### State Management
How should navigation state be managed?
- [ ] React Router with URL params (e.g., `/observability/agenda`, `/observability/page/1`)
- [ ] Component-local state (useState)
- [ ] URL hash navigation (e.g., `/observability#page-2`)
- [ ] Other: [describe]

### Responsive Behavior
- Mobile view: [Stack agenda items? Different layout? Swipe gestures?]
- Tablet view: [Same as desktop? Adjusted spacing?]
- Desktop view: [Grid layout for agenda? Number of columns?]

---

## 7. PowerPoint Slide Content

### Do you have PowerPoint slides?
- [ ] Yes - I will provide slide content below or separately
- [ ] No - Use the structure above to create content

### Slide Content (if applicable)
[Paste or describe the content from your PowerPoint slides here]

**Slide 1 - Agenda:**
[Content]

**Slide 2:**
[Content]

**Slide 3:**
[Content]

[Continue for all slides]

---

## 8. Additional Requirements

### Accessibility
- Keyboard navigation: [Tab through agenda items? Arrow keys for next/back?]
- Screen reader: [Announce page numbers? Announce navigation?]

### Special Features
- [ ] Progress bar showing current position
- [ ] Breadcrumb navigation
- [ ] Skip to specific page from any page
- [ ] Print-friendly view of all pages
- [ ] Other: [describe]

### Styling Preferences
- Theme: [Use existing theme? Custom colors for observability section?]
- Card style on agenda: [Elevated cards? Flat? Bordered?]
- Spacing: [Compact? Comfortable? Spacious?]

---

## Implementation Checklist

When I implement this, I will:
1. ✓ Create the animated agenda landing page
2. ✓ Create individual content pages with navigation
3. ✓ Set up routing/navigation between agenda and pages
4. ✓ Create MD file(s) with the content structure
5. ✓ Implement animations as specified
6. ✓ Ensure responsive design works on all screen sizes
7. ✓ Test navigation flow (agenda → page → back → next → etc.)
8. ✓ Provide instructions on how to update MD files

---

## Ready to Implement?

Once you've filled in the sections above, send me this prompt with your specifications, and I'll implement the agenda-based navigation system for the observability card.
