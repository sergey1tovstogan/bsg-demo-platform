---
# Page Metadata
page_id: "obs-pillars"
title: "The Three Core Pillars"
subtitle: "Observability is built on three fundamental data types that work together to give you complete visibility into your systems."
order: 3
category: "observability"

# Animations
page_enter_animation: "fade-in"
animation_duration: "0.3s"
---

# The Three Core Pillars

## Page Subtitle
Observability is built on three fundamental data types that work together to give you complete visibility into your systems.

---

## LAYOUT

### Layout Type
- [x] Single Column (full width)
- [ ] Two Columns (50/50)
- [ ] Two Columns (60/40)
- [ ] Three Columns
- [ ] Custom Grid

### Background
- Color: `#ffffff`
- Image:
- Gradient:

---

## CONTENT SECTIONS

### Section 1: The Three Pillars

**Type:** cards-grid
**Position:** full-width
**Animation:** stagger-fade-in | delay: 0.3s | stagger: 0.15s

**Grid Layout:** 3 columns (stacks to 1 column on mobile)

#### Card 1: Metrics
- Icon: 📊
- Title: **Metrics**
- Color Theme: Red/Orange
- Border Color: `#ef4444`
- Border Width: `3px`
- Background: `#ffffff`
- Shadow: medium

**Description:**
Quantitative measurements that tell you **what's happening** in your system

**Examples List:**
- CPU usage
- Memory consumption
- Request latency
- Throughput (requests/sec)
- Error rates

**Summary Tagline:**
💭 *Think: Numbers and graphs over time*

**Style:**
- Title Color: `#dc2626`
- Icon Size: `48px`
- Padding: `24px`
- Border Radius: `12px`

**Interactive:**
- Click Action: show-popup-1
- Hover Effect: lift + border glow (red)

---

#### Card 2: Logs
- Icon: 📝
- Title: **Logs**
- Color Theme: Blue
- Border Color: `#3b82f6`
- Border Width: `3px`
- Background: `#ffffff`
- Shadow: medium

**Description:**
Detailed event records that help you troubleshoot issues and understand **what happened**

**Examples List:**
- Error messages
- Stack traces
- User actions
- System events
- Debug information

**Summary Tagline:**
💭 *Think: Your application's diary*

**Style:**
- Title Color: `#2563eb`
- Icon Size: `48px`
- Padding: `24px`
- Border Radius: `12px`

**Interactive:**
- Click Action: show-popup-2
- Hover Effect: lift + border glow (blue)

---

#### Card 3: Traces
- Icon: 🔍
- Title: **Traces**
- Color Theme: Green
- Border Color: `#10b981`
- Border Width: `3px`
- Background: `#ffffff`
- Shadow: medium

**Description:**
End-to-end request flow that shows **how requests move** through distributed systems

**Examples List:**
- Request journey across services
- Timing of each step
- Service dependencies
- Bottleneck identification
- Error propagation

**Summary Tagline:**
💭 *Think: GPS tracking for your data*

**Style:**
- Title Color: `#059669`
- Icon Size: `48px`
- Padding: `24px`
- Border Radius: `12px`

**Interactive:**
- Click Action: show-popup-3
- Hover Effect: lift + border glow (green)

---

### Section 2: How They Work Together

**Type:** text-box
**Position:** full-width
**Animation:** fade-in-up | delay: 0.9s

**Heading:** How They Work Together

**Content:**
The real power of observability comes when these three pillars work in harmony. Here's a real-world example:

**Example Scenario:**

**Step 1:** 📊 **Metrics** alert you that response time increased by 300%

**Step 2:** 🔍 **Traces** show the slowdown is in the payment service

**Step 3:** 📝 **Logs** reveal a database connection pool exhaustion error

**Result:** You now know exactly what's wrong, where it's happening, and why - all within seconds.

**Style:**
- Background: `#f0f9ff`
- Border Left: `4px solid #3b82f6`
- Border Radius: `8px`
- Padding: `32px`
- Shadow: small

**Visual Enhancement:**
- Use arrow icons (→) or vertical flow arrows between steps
- Each step number should be in a colored circle matching the pillar color
- "Result" should be highlighted with a subtle green background

**Interactive:**
- Click Action: show-popup-4
- Hover Effect: border-highlight

---

### Section 3: Visual Connector (Optional Enhancement)

**Type:** arrow-animation
**Position:** custom

**Arrow Connections:**
1. From Metrics card (bottom) → To "Step 1" in Section 2
2. From Traces card (bottom) → To "Step 2" in Section 2
3. From Logs card (bottom) → To "Step 3" in Section 2

**Arrow Style:**
- Type: dashed
- Color: Matches source card color
- Width: `2px`
- Animation: draw
- Duration: `1.5s`
- Delay: `1.2s`

---

### Section 4: Call to Action

**Type:** button-group
**Position:** center
**Animation:** bounce-in | delay: 1.5s

#### Button 1
- Label: "🖥️ See the Observability Stack"
- Style: primary
- Size: large
- Action: navigate
- Target: "stack" (page 4)

**Style:**
- Background: `#3b82f6`
- Padding: `16px 32px`
- Border Radius: `8px`
- Font Size: `18px`

---

## POPUPS / MODALS

### Popup 1: Metrics Deep Dive
**Trigger:** Click on Metrics card
**Size:** large
**Animation:** scale-in

**Title:** 📊 Metrics: The Numbers That Matter

**Content:**
Metrics are **numerical measurements** that change over time. They answer questions like "How fast?" and "How many?"

### Types of Metrics

**1. Counters** (Always Increasing)
- Total requests served
- Total errors encountered
- Total bytes transferred

**2. Gauges** (Can Go Up or Down)
- Current CPU usage (%)
- Memory consumption (MB)
- Active connections

**3. Histograms** (Distribution of Values)
- Request duration distribution
- Response size distribution
- Database query time distribution

### Example Metric

```json
{
  "metric": "http.requests.total",
  "value": 1543,
  "timestamp": "2025-12-12T10:30:00Z",
  "tags": {
    "endpoint": "/api/users",
    "status": "200",
    "method": "GET"
  }
}
```

### Why Metrics Matter

**Fast to Query:** Aggregated data means quick dashboards
**Efficient Storage:** Small data size, long retention periods
**Great for Alerts:** Easy to set thresholds and triggers
**Historical Trends:** Visualize patterns over time

### Real-World Use Cases

- **Capacity Planning:** "Do we need more servers?"
- **SLA Monitoring:** "Are we meeting our 99.9% uptime target?"
- **Performance Tracking:** "Is the new release faster?"
- **Cost Optimization:** "Which services consume the most resources?"

**Include Image:**
- Path: `/assets/diagrams/metrics-dashboard-example.png`
- Caption: "Example Grafana dashboard showing key metrics"

**Action Buttons:**
- Button 1: "View Demo Dashboard" | Action: open-url | URL: `https://demo.temenos.com/grafana`

**Close Button:** yes
**Backdrop Click to Close:** yes

---

### Popup 2: Logs Deep Dive
**Trigger:** Click on Logs card
**Size:** large
**Animation:** scale-in

**Title:** 📝 Logs: Your Application's Story

**Content:**
Logs are **immutable, timestamped records** of discrete events in your system. They're your application's diary, recording everything that happens.

### Log Levels

**ERROR** 🔴 Something failed
- Example: `"Failed to process payment: Connection timeout"`
- Use when: An operation fails and requires attention

**WARN** 🟡 Something unexpected but handled
- Example: `"Retry attempt 2/3 for user service"`
- Use when: Recoverable issues or deprecation notices

**INFO** 🟢 Normal but significant events
- Example: `"User john@example.com logged in"`
- Use when: Important business events or milestones

**DEBUG** 🔵 Detailed diagnostic information
- Example: `"Cache hit for key: user_preferences_123"`
- Use when: Troubleshooting requires detailed context

### Structured Logging

**Traditional Log (Hard to Parse):**
```
2025-12-12 10:30:15 ERROR Payment failed for user 12345 amount 99.99
```

**Structured Log (Machine-Readable):**
```json
{
  "timestamp": "2025-12-12T10:30:15Z",
  "level": "ERROR",
  "message": "Payment failed",
  "user_id": "12345",
  "amount": 99.99,
  "error_code": "TIMEOUT",
  "service": "payment-api",
  "trace_id": "abc-123-xyz"
}
```

### Why Logs Matter

**Rich Context:** Full details about events
**Debugging Power:** Stack traces and error details
**Audit Trail:** Record of what happened and when
**Searchable:** Find specific events with queries

### Best Practices

✅ Use structured logging (JSON format)
✅ Include correlation IDs (trace_id)
✅ Log errors with full context
✅ Avoid logging sensitive data (passwords, tokens)
✅ Use appropriate log levels
❌ Don't log everything (causes noise)
❌ Don't log in tight loops (performance impact)

**Include Code Example:**

```javascript
// Good structured logging
logger.error('Payment processing failed', {
  userId: user.id,
  amount: transaction.amount,
  errorCode: error.code,
  traceId: span.traceId,
  retryAttempt: 2
});

// Bad unstructured logging
console.log('Error: ' + error);
```

**Action Buttons:**
- Button 1: "View Log Analysis Guide" | Action: open-url | URL: `https://docs.temenos.com/logs`

---

### Popup 3: Traces Deep Dive
**Trigger:** Click on Traces card
**Size:** large
**Animation:** scale-in

**Title:** 🔍 Traces: Follow the Journey

**Content:**
Traces track requests as they flow through distributed systems, showing the complete journey from start to finish.

### What is a Trace?

A **trace** represents the entire lifecycle of a request as it travels through your system. It's made up of multiple **spans** - each span represents a single operation.

### Trace Structure

```
Trace ID: abc-123-xyz (Request lifecycle)
├─ Span 1: API Gateway (20ms)
├─ Span 2: Auth Service (15ms)
├─ Span 3: Payment Service (180ms) ⚠️
│  ├─ Span 4: Database Query (150ms) 🔴
│  └─ Span 5: External API Call (25ms)
└─ Span 6: Notification Service (10ms)

Total Duration: 245ms
Bottleneck: Database Query (61% of total time)
```

### Example Trace Data

```json
{
  "traceId": "abc-123-xyz",
  "spanId": "span-4",
  "parentSpanId": "span-3",
  "serviceName": "payment-service",
  "operationName": "queryTransactions",
  "startTime": "2025-12-12T10:30:15.100Z",
  "duration": 150,
  "tags": {
    "db.type": "postgresql",
    "db.query": "SELECT * FROM transactions WHERE user_id = ?",
    "db.rows_returned": 1523
  },
  "status": "ok"
}
```

### Why Traces Matter

**Distributed Visibility:** See across microservices
**Performance Debugging:** Find slow operations
**Dependency Mapping:** Understand service relationships
**Error Tracking:** See where failures occur in the flow

### Real-World Use Cases

**Use Case 1: Debug Slow API**
- Trace shows request takes 2 seconds
- Drill down: Database span takes 1.8 seconds
- Root cause: Missing index on query

**Use Case 2: Find Cascade Failures**
- Trace shows authentication service timeout
- Causes payment service to retry
- Creates load spike across system

**Use Case 3: Optimize Performance**
- Trace reveals 10 sequential database calls
- Refactor to use batch query
- Reduce latency from 500ms to 50ms

### Distributed Tracing Standards

**OpenTelemetry** (Modern Standard)
- Vendor-neutral instrumentation
- Unified API for metrics, logs, traces
- Growing ecosystem support

**Trace Context Propagation:**
```
User Request → Service A (adds trace_id)
            → Service B (receives trace_id)
            → Service C (receives trace_id)

All spans share same trace_id = full picture
```

**Include Image:**
- Path: `/assets/diagrams/trace-visualization-example.png`
- Caption: "Example trace visualization in Jaeger showing service dependencies"

**Action Buttons:**
- Button 1: "View Live Trace Demo" | Action: open-url | URL: `https://demo.temenos.com/jaeger`
- Button 2: "Learn OpenTelemetry" | Action: open-url | URL: `https://opentelemetry.io`

---

### Popup 4: Pillars Working Together - Extended Example
**Trigger:** Click on "How They Work Together" section
**Size:** large
**Animation:** fade-in

**Title:** 🔗 The Power of Combined Observability

**Content:**
Here's a complete real-world debugging scenario showing how metrics, logs, and traces work together.

### The Incident: Random Payment Failures

**Time:** 2025-12-12 10:30 AM
**Alert:** Payment success rate dropped from 99.5% to 85%

---

### Investigation Step by Step

**Step 1: Metrics Alert** 📊
```
Alert: Payment Success Rate Below Threshold
- Current: 85% (threshold: 95%)
- Impact: 150 failed payments in last 5 minutes
- Affected Users: ~45 users
```

**What we know:** Something is wrong with payments
**What we DON'T know:** Why it's failing, which part of the system

---

**Step 2: Check Traces** 🔍

Filter traces for failed payment requests:
```
Trace ID: xyz-789
Status: ERROR
Duration: 5000ms (timeout)

Spans:
├─ API Gateway: 10ms ✓
├─ Payment Service: 4990ms ⚠️
│  ├─ Validate Payment: 15ms ✓
│  ├─ Database Query: 4950ms 🔴 SLOW!
│  └─ Process Payment: (never reached)
```

**What we now know:**
- Problem is in the Payment Service
- Specifically: Database queries are taking ~5 seconds
- Causing timeouts before payment can process

---

**Step 3: Examine Logs** 📝

Search logs for Payment Service at the incident time:

```json
{
  "timestamp": "2025-12-12T10:30:22Z",
  "level": "ERROR",
  "service": "payment-service",
  "message": "Database connection pool exhausted",
  "active_connections": 50,
  "max_connections": 50,
  "wait_time_ms": 5000,
  "trace_id": "xyz-789"
}
```

**Root Cause Found:**
- Connection pool is at maximum capacity (50/50)
- New requests wait 5 seconds for available connection
- Timeout occurs before connection becomes available

---

**Step 4: Deep Dive - Why is Pool Exhausted?**

Check database metrics:
```
Metric: db.connections.active
Value: 50 (max capacity)
Duration: Sustained for 15 minutes

Metric: db.query.duration.p95
Value: 2500ms (usually 50ms)
```

Check database logs:
```sql
-- Slow query detected
SELECT * FROM transactions
WHERE user_id = ?
AND status = 'pending'
-- Duration: 2.5 seconds
-- Rows scanned: 1,500,000
```

**Final Root Cause:**
Missing index on `transactions.status` column causing full table scans

---

### The Fix

```sql
-- Add missing index
CREATE INDEX idx_transactions_status
ON transactions(status, user_id);
```

**Result:**
- Query time: 2500ms → 15ms
- Connection pool usage: 50/50 → 8/50
- Payment success rate: 85% → 99.7%
- Time to resolution: 12 minutes

---

### The Lesson

**Without Metrics:** You wouldn't know there was a problem
**Without Traces:** You couldn't pinpoint the slow service
**Without Logs:** You wouldn't see the connection pool error

**Together:** Complete picture from symptom to root cause ✨

---

### Key Takeaways

1. **Start with Metrics** - Detect anomalies and trends
2. **Use Traces** - Pinpoint where in the system
3. **Check Logs** - Understand why and see details
4. **Correlate with trace_id** - Connect all three pillars

**Visual Timeline:**
```
10:30:00 - Metrics show error rate spike
10:31:00 - Traces reveal slow database queries
10:32:00 - Logs show connection pool exhaustion
10:35:00 - Query analysis finds missing index
10:40:00 - Index created, problem resolved
10:42:00 - Metrics confirm recovery
```

**Action Buttons:**
- Button 1: "See More Examples" | Action: open-url | URL: `https://docs.temenos.com/observability-examples`

---

## ANIMATIONS TIMELINE

**Enable Advanced Animations:** yes

**Timeline:**
1. At 0s: Page title fades in
2. At 0.3s: Metrics card slides in from left and fades in
3. At 0.45s: Logs card slides up and fades in
4. At 0.6s: Traces card slides in from right and fades in
5. At 0.9s: "How They Work Together" section fades in from below
6. At 1.2s: Arrow animations draw from cards to example steps (optional)
7. At 1.5s: CTA button bounces in

---

## ACCESSIBILITY

**Screen Reader Announcements:**
- Page load: "Page 3 of 6: The Three Core Pillars. Observability is built on three fundamental data types that work together to give you complete visibility into your systems."
- Card interactions: "Clickable card: Metrics. Opens detailed explanation. Press Enter or Space to activate."

**Keyboard Navigation:**
- Tab order: Metrics card → Logs card → Traces card → How They Work Together section → CTA button
- Enter/Space: Open detailed popups for cards and sections
- Escape: Close popups
- Arrow keys: Navigate between cards (left/right)

**Focus Indicators:**
- Style: `3px solid #3b82f6`
- Offset: `3px`
- Matches card border color when focused
- Visible on all interactive elements: yes

**Alternative Text:**
- Icons: "Metrics icon: Bar chart", "Logs icon: Document", "Traces icon: Magnifying glass"

---

## CUSTOM STYLES

```css
/* Pillars page specific styles */
.obs-pillars {
  max-width: 1200px;
  margin: 0 auto;
}

.obs-pillars .pillars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin: 48px 0;
}

@media (max-width: 968px) {
  .obs-pillars .pillars-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.obs-pillars .pillar-card {
  transition: all 0.3s ease;
}

.obs-pillars .pillar-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.obs-pillars .pillar-card.metrics:hover {
  border-color: #dc2626;
  box-shadow: 0 12px 24px rgba(239, 68, 68, 0.3);
}

.obs-pillars .pillar-card.logs:hover {
  border-color: #2563eb;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.3);
}

.obs-pillars .pillar-card.traces:hover {
  border-color: #059669;
  box-shadow: 0 12px 24px rgba(16, 185, 129, 0.3);
}

.obs-pillars .examples-list {
  list-style: none;
  padding-left: 0;
}

.obs-pillars .examples-list li::before {
  content: "▸ ";
  color: inherit;
  font-weight: bold;
  margin-right: 8px;
}

.obs-pillars .summary-tagline {
  font-style: italic;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
}
```

---

## NOTES FOR IMPLEMENTATION

- Each pillar card should have distinct color theming throughout (borders, icons, hover effects)
- The "How They Work Together" section should feel like a natural progression and show practical application
- Example scenario should use consistent formatting with step numbers in colored circles
- Popups should be comprehensive but not overwhelming - use progressive disclosure
- Mobile: Cards stack vertically, maintain visual hierarchy with colors
- Consider adding subtle animations when hovering over cards (icon bounce, border glow)
- Ensure all three cards have equal visual weight and spacing
- The arrow animations (if implemented) should feel smooth and not distract from content

---

## CHECKLIST

When implementing this page, ensure:
- [x] Three pillar cards display in equal-width grid on desktop
- [x] Cards stack properly on mobile devices
- [x] Each card has distinct color theme (red, blue, green)
- [x] Examples lists are clearly formatted and readable
- [x] Summary taglines are visually distinct (italicized, separated)
- [x] Hover effects work smoothly with color-matched glows
- [x] "How They Work Together" section tells a clear story
- [x] Example scenario uses visual formatting (colors, step numbers)
- [x] Popups provide deep dives without overwhelming
- [x] CTA button navigates to Stack page
- [x] Animations enhance (not distract from) content
- [x] Keyboard navigation works for all interactive elements
- [x] Screen reader announces content appropriately

---

## CONTENT SOURCES

**Original Data Source:**
- Database: MongoDB collection `content`
- Document ID: `obs-pillars`
- Script: `/backend/scripts/create_observability_content.py` (lines 72-133)

**Key Message:**
Introduce the three fundamental pillars of observability (Metrics, Logs, Traces) and demonstrate how they work together to provide complete system visibility.

**Tone:**
- Educational and comprehensive
- Uses clear examples and analogies
- Progressive disclosure (cards → popups with deep dives)
- Emphasizes the synergy between pillars
- Practical and actionable
