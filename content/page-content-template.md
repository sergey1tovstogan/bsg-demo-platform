---
# Page Metadata
page_id: "page-1"
title: "What is Observability?"
subtitle: "Understanding modern application monitoring"
order: 1
category: "observability"

# Animations
page_enter_animation: "fade-in"  # Options: fade-in, slide-in-right, slide-in-left, slide-up, zoom-in, none
animation_duration: "0.5s"
---

# Page Title
What is Observability?

## Page Subtitle (optional)
Understanding modern application monitoring and how it helps teams

---

## LAYOUT

<!-- Define how content is organized on the page -->

### Layout Type
- [ ] Single Column (full width)
- [x] Two Columns (50/50)
- [ ] Two Columns (60/40)
- [ ] Three Columns
- [ ] Custom Grid (describe below)

### Background
- Color: `#ffffff` (or leave empty for default)
- Image: `` (path to background image, optional)
- Gradient: `` (e.g., `linear-gradient(to right, #667eea, #764ba2)`)

---

## CONTENT SECTIONS

<!-- Each section is a content block on the page. Add as many as needed. -->

### Section 1: Introduction

**Type:** text-box
**Position:** left-column
**Animation:** fade-in-up | delay: 0.2s

**Content:**
Observability is the practice of understanding the internal state of your system by examining its outputs. Unlike traditional monitoring, observability allows you to ask new questions without predicting them in advance.

**Key Points:**
- Monitor application health in real-time
- Understand system behavior through logs, metrics, and traces
- Proactive issue detection and resolution

**Style:**
- Background: `#f5f7fa`
- Border: `2px solid #3b82f6`
- Border Radius: `8px`
- Padding: `24px`
- Shadow: `medium` (none, small, medium, large)

**Interactive:**
- Click Action: show-popup-1
- Hover Effect: lift (lift, glow, border-highlight, none)

---

### Section 2: Architecture Diagram

**Type:** image
**Position:** right-column
**Animation:** slide-in-right | delay: 0.4s

**Image:**
- Path: `/assets/diagrams/observability-architecture.png`
- Alt Text: "Observability Architecture Overview"
- Max Width: `100%`
- Border: yes
- Shadow: large

**Caption:** "Three pillars of observability working together"

**Interactive:**
- Click Action: show-popup-2
- Zoom on Hover: yes

---

### Section 3: Three Pillars

**Type:** cards-grid
**Position:** full-width
**Animation:** stagger-fade-in | delay: 0.6s | stagger: 0.1s

**Grid Layout:** 3 columns

#### Card 1: Metrics
- Icon: `📊` (emoji or path to icon)
- Title: **Metrics**
- Description: Numeric measurements of system behavior over time
- Background: `#ecfdf5`
- Border Color: `#10b981`
- Click Action: show-popup-3
- Hover: lift

#### Card 2: Logs
- Icon: `📝`
- Title: **Logs**
- Description: Detailed records of discrete events in your system
- Background: `#fef3c7`
- Border Color: `#f59e0b`
- Click Action: show-popup-4
- Hover: lift

#### Card 3: Traces
- Icon: `🔍`
- Title: **Traces**
- Description: Request paths through distributed systems
- Background: `#dbeafe`
- Border Color: `#3b82f6`
- Click Action: show-popup-5
- Hover: lift

---

### Section 4: Code Example

**Type:** code-block
**Position:** full-width
**Animation:** fade-in | delay: 0.8s

**Language:** javascript
**Title:** "Setting Up Basic Observability"

```javascript
import { Logger, Metrics, Tracer } from '@observability/sdk';

// Initialize observability
const logger = new Logger({ service: 'api' });
const metrics = new Metrics({ service: 'api' });
const tracer = new Tracer({ service: 'api' });

// Log events
logger.info('Request received', { endpoint: '/users' });

// Track metrics
metrics.increment('requests.total', { endpoint: '/users' });

// Create trace spans
const span = tracer.startSpan('process-request');
// ... do work ...
span.end();
```

**Style:**
- Theme: `dark` (dark, light)
- Show Line Numbers: yes
- Highlight Lines: `4-6, 9` (optional)
- Max Height: `400px` (scrollable if taller)

**Interactive:**
- Copy Button: yes
- Click Action: none

---

### Section 5: Call to Action

**Type:** button-group
**Position:** center
**Animation:** bounce-in | delay: 1s

#### Button 1
- Label: "🚀 Try Live Demo"
- Style: primary (primary, secondary, outline)
- Size: large
- Action: open-url
- URL: `https://demo.temenos.com/observability`
- Open in: new-tab

#### Button 2
- Label: "📖 Read Documentation"
- Style: outline
- Size: large
- Action: open-url
- URL: `https://docs.temenos.com/observability`
- Open in: new-tab

---

### Section 6: Animated Arrow Connector

**Type:** arrow-animation
**Position:** custom

**Arrow Path:**
- From: Section 1 (bottom-center)
- To: Section 3 (top-center)
- Style: dashed (solid, dashed, dotted)
- Color: `#3b82f6`
- Width: `2px`
- Animation: draw (draw, pulse, flow, none)
- Duration: `1.5s`
- Delay: `0.5s`

**Label on Arrow:** "Connects to pillars"

---

### Section 7: Statistics Bar

**Type:** stats-row
**Position:** full-width
**Animation:** count-up | delay: 0.7s

**Stats:**
1. Value: `99.9%` | Label: "System Uptime" | Icon: `⬆️`
2. Value: `< 100ms` | Label: "Response Time" | Icon: `⚡`
3. Value: `24/7` | Label: "Monitoring" | Icon: `👁️`
4. Value: `1000+` | Label: "Metrics Tracked" | Icon: `📈`

**Style:**
- Background: `#f9fafb`
- Separator: yes
- Icon Size: `32px`

---

## POPUPS / MODALS

<!-- Define popup content that appears when clicking interactive elements -->

### Popup 1: Introduction Details
**Trigger:** Click on Section 1
**Size:** medium (small, medium, large, full-screen)
**Animation:** scale-in

**Title:** Why Observability Matters

**Content:**
Traditional monitoring tells you *what* is wrong. Observability tells you *why* it's wrong.

**Key Benefits:**
- **Faster debugging**: Understand issues without reproducing them
- **Better user experience**: Detect problems before users report them
- **Data-driven decisions**: Make architectural choices based on real behavior

**Include Image:**
- Path: `/assets/images/observability-benefits.png`
- Position: center

**Include Video:** (optional)
- URL: `https://youtube.com/embed/xyz123`
- Autoplay: no

**Close Button:** yes
**Backdrop Click to Close:** yes

---

### Popup 2: Architecture Deep Dive
**Trigger:** Click on Section 2 (diagram)
**Size:** large
**Animation:** slide-in-right

**Title:** Observability Architecture

**Content:**
This architecture shows how data flows through the observability pipeline:

1. **Collection Layer**: Agents gather logs, metrics, and traces
2. **Processing Layer**: Data is parsed, filtered, and enriched
3. **Storage Layer**: Time-series databases and log stores
4. **Visualization Layer**: Dashboards and alerting

**Include Image:**
- Path: `/assets/diagrams/observability-architecture-detailed.png`
- Zoom: yes (allow zooming in popup)

**Action Buttons:**
- Button 1: "View in Full Screen" | Action: expand-image
- Button 2: "Download Diagram" | Action: download | File: `observability-architecture.pdf`

---

### Popup 3: Metrics Deep Dive
**Trigger:** Click on "Metrics" card
**Size:** medium
**Animation:** fade-in

**Title:** 📊 Metrics in Detail

**Content:**
Metrics are numerical measurements that change over time. They answer questions like "How fast?" and "How many?"

**Types of Metrics:**
- **Counters**: Always increasing (requests served, errors)
- **Gauges**: Can go up or down (CPU usage, memory)
- **Histograms**: Distribution of values (request duration)

**Example:**
```json
{
  "metric": "http.requests.total",
  "value": 1543,
  "timestamp": "2025-12-11T10:30:00Z",
  "tags": {
    "endpoint": "/api/users",
    "status": "200"
  }
}
```

---

### Popup 4: Logs Deep Dive
**Trigger:** Click on "Logs" card
**Size:** medium
**Animation:** fade-in

**Title:** 📝 Logs in Detail

**Content:**
Logs are immutable, timestamped records of discrete events.

**Log Levels:**
- ERROR: Something failed
- WARN: Something unexpected but handled
- INFO: Normal but significant events
- DEBUG: Detailed diagnostic information

---

### Popup 5: Traces Deep Dive
**Trigger:** Click on "Traces" card
**Size:** medium
**Animation:** fade-in

**Title:** 🔍 Traces in Detail

**Content:**
Traces follow requests as they flow through distributed systems.

**Use Cases:**
- Debug slow API calls
- Understand service dependencies
- Find bottlenecks in microservices

**Include Demo:**
- Action Button: "View Live Trace" | URL: `https://demo.temenos.com/trace/abc123`

---

## ANIMATIONS TIMELINE

<!-- Optional: Define complex animation sequences -->

**Enable Advanced Animations:** no

<!-- If yes, define timeline:
1. At 0s: Fade in title
2. At 0.2s: Slide in left column
3. At 0.4s: Slide in right column
4. At 0.6s: Stagger in cards (0.1s between each)
5. At 1.2s: Draw arrow from section 1 to section 3
-->

---

## ACCESSIBILITY

**Screen Reader Announcements:**
- Page load: "Page 1 of 5: What is Observability?"
- Interactive elements: Announce "clickable" for elements with popups

**Keyboard Navigation:**
- Tab through: cards, buttons, interactive elements
- Enter/Space: Trigger click actions
- Escape: Close popups

**Focus Indicators:**
- Style: `2px solid #3b82f6`
- Visible on all interactive elements: yes

---

## CUSTOM STYLES (Optional)

```css
/* Add custom CSS for this page if needed */
.page-1 {
  /* Custom styles */
}

.page-1 .highlight-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
```

---

## NOTES FOR IMPLEMENTATION

<!-- Any special instructions or clarifications -->

- The architecture diagram should be high resolution
- All popups should be dismissible with ESC key
- Mobile: Stack columns vertically
- Tablet: Keep two-column layout but adjust spacing
- Ensure all interactive elements are touch-friendly (min 44px tap targets)

---

## CHECKLIST

When implementing this page, ensure:
- [ ] All sections render in correct order
- [ ] Animations trigger as specified
- [ ] Popups open/close correctly
- [ ] External links work and open in correct target
- [ ] Responsive design works on mobile/tablet
- [ ] Keyboard navigation works for accessibility
- [ ] Images load correctly with fallbacks
- [ ] Code blocks have copy functionality

---

## QUICK REFERENCE

**How to use this template:**

1. **Copy this file** for each new page (e.g., `page-2-monitoring-tools.md`)
2. **Update metadata** at the top (page_id, title, order)
3. **Define layout** (columns, background)
4. **Add content sections** (text, images, cards, code, etc.)
5. **Add interactive elements** (popups, links, hover effects)
6. **Configure animations** (type, delays, durations)
7. **Test and refine** by asking me to implement or update

**To make changes:**
- Edit this MD file
- Tell me: "Update page-1 from the MD file"
- I'll read the file and update the implementation

**Common section types:**
- `text-box`: Paragraph content in a styled box
- `image`: Single image with optional interactions
- `cards-grid`: Multiple cards in a grid layout
- `code-block`: Syntax-highlighted code
- `button-group`: Action buttons
- `arrow-animation`: Animated connectors between sections
- `stats-row`: Horizontal statistics display
- `video`: Embedded or linked video content
- `quote`: Highlighted quote or testimonial
- `timeline`: Vertical timeline of events
- `comparison-table`: Side-by-side comparison
- `accordion`: Expandable sections
