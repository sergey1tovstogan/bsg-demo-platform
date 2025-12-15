# Observability Card - Current Agenda-Based Navigation

## Overview
This document describes the CURRENT implementation of the observability component card with agenda-based navigation.

---

## 1. Agenda Structure

### Agenda Items

**Item 1:**
- Title: "Introduction"
- Short description: "Understanding the difference between monitoring and observability"
- Icon/visual: 💡 Lightbulb

**Item 2:**
- Title: "Big Picture"
- Short description: "Monitoring vs Observability - the complete comparison"
- Icon/visual: 💡 Lightbulb

**Item 3:**
- Title: "Core Pillars"
- Short description: "The three fundamental data types: Metrics, Logs, and Traces"
- Icon/visual: 📊 Layers

**Item 4:**
- Title: "The Stack"
- Short description: "Data flow through Collector, Storage, and Visualization tiers"
- Icon/visual: 🖥️ Server

**Item 5:**
- Title: "Temenos Stack"
- Short description: "Temenos-specific observability architecture with OTEL"
- Icon/visual: 📦 Box

**Item 6:**
- Title: "Temenos Monitoring Flow"
- Short description: "Interactive animated visualization of the data flow"
- Icon/visual: 🔄 Workflow

---

## 2. Animation Preferences

### Agenda Entry Animation
- Animation type: fade-in
- Duration: 0.3s per item
- Delay between items: 0.1s
- Easing: ease-out

### Page Transition Animation
- Type: fade
- Duration: 0.3s
- Behavior when clicking agenda items: animated transition with fade

---

## 3. Content Page Structure

### Layout
- Header: Shows page title with gradient underline
- Content area: Full width with max-width container (1200px)
- Footer/Navigation: Fixed position at bottom with navigation buttons

### Navigation Buttons
- Back button:
  - Label: "Previous"
  - Position: bottom-left
  - Style: secondary with icon

- Next button:
  - Label: "Next"
  - Position: bottom-right
  - Style: primary with icon
  - Behavior on last page: Shows completion message with "Back to Introduction" button

- Navigation menu:
  - Position: top of page
  - Shows all 6 pages as clickable buttons with icons
  - Current page highlighted in primary color

---

## 4. Content for Each Page

### Page 1: Introduction
**Content includes:**
- Main title: "Understanding Observability"
- Subtitle: "In modern software systems, knowing what's happening isn't enough. You need to know why it's happening."
- Story section with heading "A Story to Begin"
- Scenario: "Imagine: Some payments fail randomly."
- Monitoring vs Observability comparison
- Car dashboard vs mechanic's toolkit analogy
- Call-to-action button: "Start Exploring" → navigates to Big Picture

### Page 2: Big Picture
**Content includes:**
- NO main title (intentional)
- Two-column comparison layout
- Monitoring column (red/orange theme):
  - Question: "Is the system working?"
  - 4 bullet points
  - "Like your car's dashboard light" analogy
- Observability column (teal theme):
  - Question: "Why is it not working?"
  - 4 bullet points
  - "Like the mechanic's toolkit" analogy
- Analogy section at bottom
- Call-to-action: "Explore the Core Pillars" → navigates to Pillars

### Page 3: Core Pillars
**Content includes:**
- Title: "The Three Core Pillars"
- Subtitle explaining fundamental data types
- Three pillar cards with colored borders:
  - Metrics (Red): CPU, memory, latency, throughput, error rates
  - Logs (Blue): Error messages, stack traces, user actions
  - Traces (Green): Request journeys, timing, dependencies
- Each card has summary tagline
- "How They Work Together" section with 3-step example scenario
- Call-to-action: "See the Observability Stack" → navigates to Stack

### Page 4: The Stack
**Content includes:**
- Title: "The Observability Stack"
- Subtitle about data flow stages
- Three-tier vertical architecture diagram:
  - Tier 1 - Collector (Purple): OpenTelemetry, Fluentd, Telegraf
  - Tier 2 - Storage (Blue): Prometheus, Elasticsearch, Tempo
  - Tier 3 - Visualization (Pink): Grafana, Kibana, Jaeger UI
- Data Flow section with 4 numbered steps
- Completion card with "Back to Introduction" button

### Page 5: Temenos Stack
**Content includes:**
- Title: "Temenos Telemetry Stack"
- Subtitle about modern architecture
- Three-column architecture visualization:
  - Product Container (Blue): TEMN Meter, TEMN Tracer, TEMN Logger
  - Side-car Container (Purple): OTEL Collector
  - Aggregation & Visualization (Green): Prometheus, Jaeger, Elasticsearch, Grafana
- Key Features section with 3 cards
- Architecture Flow section with 4 colored steps

### Page 6: Temenos Monitoring Flow
**Content includes:**
- Interactive animated visualization component
- Play/Pause/Reset controls
- Animated data flow showing metrics, logs, and traces
- Shows path from Temenos through OTEL Collector to visualization tools
- Real-time animation with colored dots flowing through architecture

---

## 5. MD File Organization

**Current Structure:** Separate MD files per page (will be created)

```
content/observability/
├── observability-current-agenda.md (this file - overall structure)
├── observability-page-1-introduction.md
├── observability-page-2-big-picture.md
├── observability-page-3-pillars.md
├── observability-page-4-stack.md
├── observability-page-5-temenos-stack.md
└── observability-page-6-monitoring-flow.md
```

### MD File Format
- Use frontmatter: Yes
- Frontmatter fields: page_id, title, subtitle, order, category
- Content format: Standard markdown with special directives for components

---

## 6. Technical Implementation Details

### Component Architecture
- [x] Existing ComponentDetail.tsx modified with agenda mode
- [x] ObservabilityContent.tsx is main component
- [x] TemenosMonitoringFlow.tsx for animated visualization
- [x] React Router with component routes

### State Management
- [x] React Router with URL params (e.g., `/components/observability`)
- [x] Component-local state (useState) for page navigation
- [x] Page state stored in `currentPage` variable
- Database-driven content via MongoDB API

### Responsive Behavior
- Mobile view: Single column, stacked layout, touch-optimized buttons
- Tablet view: Adjusted spacing, same structure as desktop
- Desktop view: Full multi-column layouts where applicable

---

## 7. Database Storage

### Content Storage
- **Database:** MongoDB (Cosmos DB)
- **Collection:** `content`
- **Component ID:** `observability`
- **Content IDs:** obs-intro, obs-big-picture, obs-pillars, obs-stack, obs-temenos-stack
- **Python Script:** `/backend/scripts/create_observability_content.py`

### Document Structure
Each page stored as:
```json
{
  "content_id": "obs-intro",
  "component_id": "observability",
  "type": "page",
  "order": 1,
  "page_name": "introduction",
  "title": "Understanding Observability",
  "body_json": { /* full content structure */ },
  "created_at": "...",
  "updated_at": "..."
}
```

---

## 8. Additional Requirements

### Accessibility
- Keyboard navigation: Tab through navigation buttons, Enter to activate
- Screen reader: Page title announced on page change
- Focus indicators: Visible blue outline on all interactive elements

### Special Features
- [x] Navigation menu showing current position
- [x] Smooth transitions between pages
- [x] Animated visualization on page 6
- [x] Color-coded sections and cards
- [x] Responsive design

### Styling Preferences
- Theme: Uses existing Material-UI theme
- Custom colors:
  - Red/Orange: Metrics, Monitoring
  - Blue: Logs, Storage
  - Teal/Cyan: Observability
  - Green: Traces, Aggregation
  - Purple: Collectors
  - Pink: Visualization
- Card style on agenda: Elevated cards with hover effects
- Spacing: Comfortable (24px standard spacing)

---

## 9. Current Navigation Flow

```
Landing → Introduction (Page 1)
   ↓
   → "Start Exploring" button → Big Picture (Page 2)
   ↓
   → "Explore the Core Pillars" button → Core Pillars (Page 3)
   ↓
   → "See the Observability Stack" button → The Stack (Page 4)
   ↓
   → No explicit button, use navigation menu → Temenos Stack (Page 5)
   ↓
   → No explicit button, use navigation menu → Temenos Monitoring Flow (Page 6)
```

**Navigation Menu:** Available on all pages, allows jumping to any page directly

**Previous/Next Buttons:** Available on all pages for sequential navigation

---

## 10. Images and Assets

### Current Images
- `/frontend/src/components/observability/Observability Stack diagram.png`
- `/frontend/src/components/observability/3Piliar.png`
- `/frontend/src/components/observability/MonitoringArchitecture.png`

### Image Usage
Currently images are NOT displayed in the component. Content is text and card-based. Images available but not actively used.

---

## 11. Next Steps / Modifications Needed

**To convert to full agenda-based navigation:**

1. **Create landing agenda page:**
   - Show all 6 items as animated cards
   - Click on any item to jump to that page
   - Replace current immediate "Introduction" display

2. **Add back-to-agenda buttons:**
   - Each page needs "← Back to Agenda" button
   - Returns to the landing agenda page

3. **Enhance page transitions:**
   - Add slide animations instead of just fade
   - Consider directional animations (left/right based on forward/back)

4. **Add progress indicator:**
   - Show "Page X of 6" on each page
   - Progress bar at top showing position in sequence

5. **Update MD files:**
   - Create MD files for each page as separate documents
   - Define content, layout, and interactions in MD format
   - Allow editing MD files to update content without code changes

---

## Implementation Checklist

Current state:
- [x] Six content pages created and working
- [x] Navigation between pages with Previous/Next
- [x] Navigation menu showing all pages
- [x] Content stored in MongoDB
- [x] Responsive design implemented
- [x] Animated visualization for monitoring flow
- [ ] Landing agenda page (not yet implemented)
- [ ] Back-to-agenda navigation (not yet implemented)
- [ ] MD file-based content editing (not yet implemented)
- [ ] Enhanced animations (basic fade only)
- [ ] Progress indicator (not yet implemented)

---

## How to Use This Document

**For Understanding:**
- Review this document to understand current structure
- Compare with individual page MD files

**For Modifications:**
1. Edit this document to change overall structure
2. Edit individual page MD files to change page content
3. Tell Claude: "Update observability card based on the MD files"
4. Claude will read the files and update the implementation

**For New Pages:**
1. Add new item to section 1 (Agenda Structure)
2. Add new page description to section 4 (Content for Each Page)
3. Create new page MD file using the page-content-template.md
4. Tell Claude to implement the new page
