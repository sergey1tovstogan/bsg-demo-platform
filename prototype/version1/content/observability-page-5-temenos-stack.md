---
# Page Metadata
page_id: "obs-temenos-stack"
title: "Temenos Telemetry Stack"
subtitle: "A modern observability architecture designed for Temenos products with integrated OpenTelemetry collectors and flexible visualization options."
order: 5
category: "observability"

# Animations
page_enter_animation: "fade-in"
animation_duration: "0.3s"
---

# Temenos Telemetry Stack

## Page Subtitle
A modern observability architecture designed for Temenos products with integrated OpenTelemetry collectors and flexible visualization options.

---

## LAYOUT

### Layout Type
- [ ] Single Column (full width)
- [ ] Two Columns (50/50)
- [ ] Two Columns (60/40)
- [x] Three Columns
- [ ] Custom Grid

### Background
- Color: `#f9fafb`
- Image:
- Gradient:

---

## CONTENT SECTIONS

### Section 1: Architecture Overview

**Type:** text-box
**Position:** full-width
**Animation:** fade-in-up | delay: 0.2s

**Content:**
The Temenos Telemetry Stack provides **production-ready observability** for Temenos products with minimal configuration. Built on industry-standard tools and protocols.

**Key Principles:**
- ✅ **Embedded Monitoring** - No external agents required
- ✅ **Flexible Deployment** - Side-car or standalone options
- ✅ **Vendor Neutral** - Uses OpenTelemetry standards
- ✅ **Multi-Environment** - Works across dev, staging, production

**Style:**
- Background: `#ffffff`
- Border: `none`
- Border Radius: `8px`
- Padding: `24px`
- Shadow: small

---

### Section 2: Three-Column Architecture

**Type:** custom-architecture-diagram
**Position:** full-width
**Animation:** stagger-fade-in | delay: 0.4s | stagger: 0.2s

**Column Layout:** 3 equal columns with connecting arrows

---

#### Column 1: Temenos Product Container

**Color Theme:** Blue (`#3b82f6`)
**Background:** `#eff6ff`
**Border:** `2px solid #3b82f6`
**Icon:** 📦

**Title:** Temenos Product Container

**Components:**

1. **TEMN Meter**
   - Library: OTEL libraries
   - Purpose: Metrics collection
   - Progress Bar: 75% (implementation status)
   - Color: Orange

2. **TEMN Tracer**
   - Library: OTEL libraries
   - Purpose: Distributed tracing
   - Progress Bar: 66% (implementation status)
   - Color: Blue

3. **TEMN Logger**
   - Library: Log4J
   - Purpose: Structured logging
   - Progress Bar: 80% (implementation status)
   - Color: Yellow

**Info Notes:**
- ℹ️ Temenos products embed TEMN Monitor in their code
- ℹ️ TEMN Monitor are wrapper of OTEL & Log4J libraries

**Style:**
- Padding: `24px`
- Border Radius: `12px`
- Shadow: medium
- Min Height: `400px`

**Interactive:**
- Click Action: show-popup-1
- Hover Effect: lift

---

#### Column 2: Side-car Container

**Color Theme:** Purple (`#9333ea`)
**Background:** `#faf5ff`
**Border:** `2px solid #9333ea`
**Icon:** 🔄

**Title:** Side-car Container

**Component:**

**OTEL Collector**
- Type: Central collection point
- Icon: 🎯
- Purpose: Aggregates telemetry from all monitors
- Protocols: OTLP, Jaeger, Zipkin, Prometheus

**Features:**
- Receives metrics from TEMN Meter
- Receives traces from TEMN Tracer
- Receives logs from TEMN Logger
- Processes and routes data to backends

**Info Notes:**
- ℹ️ Running OTEL Collector as side-car container simplifies network integration
- ℹ️ A standalone approach is also viable

**Deployment Options:**
- Option 1: Side-car (recommended) - One collector per application pod
- Option 2: Standalone - Single collector for multiple applications

**Style:**
- Padding: `24px`
- Border Radius: `12px`
- Shadow: medium
- Min Height: `400px`

**Interactive:**
- Click Action: show-popup-2
- Hover Effect: lift

---

#### Column 3: Aggregation & Visualization

**Color Theme:** Green (`#10b981`)
**Background:** `#ecfdf5`
**Border:** `2px solid #10b981`
**Icon:** 📊

**Title:** Aggregation & Visualization

**Tools Grid:**

1. **Prometheus**
   - Type Badge: Metrics
   - Badge Color: Orange (`#f97316`)
   - Icon: 📈
   - Purpose: Time-series metrics storage

2. **Jaeger**
   - Type Badge: Traces
   - Badge Color: Blue (`#3b82f6`)
   - Icon: 🔍
   - Purpose: Distributed trace visualization

3. **Elasticsearch**
   - Type Badge: Logs
   - Badge Color: Yellow (`#eab308`)
   - Icon: 📝
   - Purpose: Log aggregation and search

4. **Grafana**
   - Type Badge: Dashboards
   - Badge Color: Orange-600 (`#ea580c`)
   - Icon: 📊
   - Purpose: Unified visualization layer

**Info Notes:**
- ℹ️ Aggregation and visualization layer can easily be integrated with multiple environments

**Style:**
- Padding: `24px`
- Border Radius: `12px`
- Shadow: medium
- Min Height: `400px`
- Tool cards: Stacked vertically with small gap

**Interactive:**
- Click Action: show-popup-3
- Hover Effect: lift
- Individual tool cards clickable: show-popup-4 (Prometheus), show-popup-5 (Jaeger), etc.

---

### Section 3: Connecting Arrows

**Type:** arrow-animation
**Position:** between columns

**Arrow 1: Product → Collector**
- From: Column 1 (right edge, center)
- To: Column 2 (left edge, center)
- Style: solid
- Color: `#3b82f6`
- Width: `3px`
- Animation: flow (data dots moving right)
- Duration: `2s`
- Label: "Telemetry Data"

**Arrow 2: Collector → Backends**
- From: Column 2 (right edge, center)
- To: Column 3 (left edge, center)
- Style: solid
- Color: `#9333ea`
- Width: `3px`
- Animation: flow (data dots moving right)
- Duration: `2s`
- Label: "Processed Data"

**Split Arrows from Collector:**
- From OTEL Collector → Prometheus (metrics path, orange dots)
- From OTEL Collector → Jaeger (traces path, blue dots)
- From OTEL Collector → Elasticsearch (logs path, yellow dots)

---

### Section 4: Key Features

**Type:** cards-grid
**Position:** full-width
**Animation:** stagger-fade-in | delay: 0.8s | stagger: 0.1s

**Grid Layout:** 3 columns (stacks on mobile)

#### Feature 1: Embedded Monitoring
- Icon: 🔌
- Title: **Embedded Monitoring**
- Description: TEMN Monitor is embedded directly in Temenos products
- Background: `#eff6ff`
- Border Color: `#3b82f6`

**Details:**
- No external agents to install
- Automatic telemetry generation
- Minimal performance overhead
- Works out of the box

#### Feature 2: Flexible Deployment
- Icon: ⚙️
- Title: **Flexible Deployment**
- Description: Choose between side-car or standalone OTEL Collector
- Background: `#faf5ff`
- Border Color: `#9333ea`

**Details:**
- Side-car: Best isolation and simplicity
- Standalone: Better for resource efficiency
- Easy to switch between modes
- Kubernetes-native deployment

#### Feature 3: Multi-Environment
- Icon: 🌍
- Title: **Multi-Environment**
- Description: Integrates seamlessly across dev, staging, and production
- Background: `#ecfdf5`
- Border Color: `#10b981`

**Details:**
- Same stack across all environments
- Environment-specific configurations
- Centralized or distributed backends
- Easy promotion from dev to prod

---

### Section 5: Architecture Flow

**Type:** numbered-steps
**Position:** full-width
**Animation:** stagger-fade-in | delay: 1s | stagger: 0.15s

**Heading:** Architecture Flow

**Step 1:** (Blue theme)
Temenos products use **TEMN Monitor wrappers** to emit telemetry data

- Icon: 📦
- Badge Color: `#3b82f6`
- Visual: Product container icon

**Step 2:** (Purple theme)
**OTEL Collector** gathers all telemetry data

- Icon: 🔄
- Badge Color: `#9333ea`
- Visual: Collector funnel icon

**Step 3:** (Green theme)
Data is **distributed to specialized backends**

- Icon: 🎯
- Badge Color: `#10b981`
- Visual: Multiple arrows branching out

**Step 4:** (Orange theme)
**Grafana** provides unified dashboards

- Icon: 📊
- Badge Color: `#f97316`
- Visual: Dashboard icon

**Style:**
- Steps connected by vertical line
- Each step in colored box
- Icon and badge on left side
- Description on right side

---

### Section 6: Live Demo

**Type:** button-group
**Position:** center
**Animation:** bounce-in | delay: 1.3s

#### Button 1
- Label: "🚀 View Live Grafana Dashboard"
- Style: primary
- Size: large
- Action: open-url
- URL: `https://observability.temenos.com/grafana`
- Open in: new-tab

#### Button 2
- Label: "📚 Read Documentation"
- Style: outline
- Size: large
- Action: open-url
- URL: `https://docs.temenos.com/observability`
- Open in: new-tab

---

## POPUPS / MODALS

### Popup 1: Temenos Product Container Details
**Trigger:** Click on Column 1
**Size:** large
**Animation:** slide-in-left

**Title:** 📦 Temenos Product Container

**Content:**
The Temenos Product Container includes embedded monitoring capabilities through the **TEMN Monitor** library.

### TEMN Monitor Components

**TEMN Meter (75% Complete)**
- **Purpose:** Metrics collection and emission
- **Based on:** OpenTelemetry Metrics API
- **Collects:**
  - Request rates and latencies
  - Error rates and counts
  - Business metrics (transactions, accounts)
  - Resource usage (CPU, memory, connections)

**Implementation Status:**
- ✅ Core metrics API
- ✅ Automatic HTTP instrumentation
- ✅ Custom business metrics
- 🟡 Advanced aggregations (in progress)

---

**TEMN Tracer (66% Complete)**
- **Purpose:** Distributed tracing
- **Based on:** OpenTelemetry Trace API
- **Captures:**
  - Request spans across services
  - Database query timing
  - External API call traces
  - Error and exception details

**Implementation Status:**
- ✅ Automatic span creation
- ✅ Context propagation
- 🟡 Custom span attributes (in progress)
- 🟡 Span sampling strategies (in progress)

---

**TEMN Logger (80% Complete)**
- **Purpose:** Structured logging
- **Based on:** Log4J 2.x
- **Features:**
  - Structured JSON logging
  - Automatic trace ID injection
  - Log levels and filtering
  - Async logging for performance

**Implementation Status:**
- ✅ Structured logging framework
- ✅ Trace ID correlation
- ✅ Async appenders
- 🟡 Dynamic log level changes (in progress)

---

### Integration

All three components share:
- Common configuration
- Trace context propagation
- Consistent naming and tagging
- OTEL standard compliance

**Code Example:**

```java
// Using TEMN Monitor in Temenos application
import com.temenos.monitor.*;

public class PaymentService {
    private static final TemnMeter meter = TemnMonitor.getMeter();
    private static final TemnTracer tracer = TemnMonitor.getTracer();
    private static final TemnLogger logger = TemnMonitor.getLogger();

    public PaymentResult processPayment(PaymentRequest request) {
        // Start trace span
        Span span = tracer.startSpan("processPayment");

        // Increment metric
        meter.counter("payments.total").increment();

        try {
            // Business logic
            PaymentResult result = executePayment(request);

            // Log with trace context
            logger.info("Payment processed", Map.of(
                "paymentId", result.getId(),
                "amount", request.getAmount(),
                "traceId", span.getTraceId()
            ));

            return result;
        } catch (Exception e) {
            meter.counter("payments.errors").increment();
            logger.error("Payment failed", e);
            span.recordException(e);
            throw e;
        } finally {
            span.end();
        }
    }
}
```

**Close Button:** yes

---

### Popup 2: OTEL Collector Details
**Trigger:** Click on Column 2
**Size:** large
**Animation:** scale-in

**Title:** 🔄 OpenTelemetry Collector

**Content:**
The **OTEL Collector** is the central hub for telemetry data in the Temenos architecture.

### What is OTEL Collector?

The OpenTelemetry Collector is a vendor-agnostic way to receive, process, and export telemetry data. It acts as a smart proxy between your applications and observability backends.

### Architecture

```
┌─────────────────────────────────┐
│   OTEL Collector Components     │
├─────────────────────────────────┤
│  Receivers (Input)              │
│  ├─ OTLP (from TEMN Monitor)    │
│  ├─ Prometheus                  │
│  └─ Jaeger                      │
├─────────────────────────────────┤
│  Processors (Transform)         │
│  ├─ Batch                       │
│  ├─ Filter                      │
│  ├─ Attributes                  │
│  └─ Sampling                    │
├─────────────────────────────────┤
│  Exporters (Output)             │
│  ├─ Prometheus (metrics)        │
│  ├─ Jaeger (traces)             │
│  └─ Elasticsearch (logs)        │
└─────────────────────────────────┘
```

### Configuration Example

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024

  attributes:
    actions:
      - key: environment
        value: production
        action: insert

exporters:
  prometheus:
    endpoint: "prometheus:9090"

  jaeger:
    endpoint: "jaeger:14250"
    tls:
      insecure: true

  elasticsearch:
    endpoints: ["http://elasticsearch:9200"]
    logs_index: temenos-logs

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [batch, attributes]
      exporters: [prometheus]

    traces:
      receivers: [otlp]
      processors: [batch, attributes]
      exporters: [jaeger]

    logs:
      receivers: [otlp]
      processors: [batch, attributes]
      exporters: [elasticsearch]
```

### Deployment Options

**Option 1: Side-car (Recommended)**
- One collector per application pod
- Simplest network configuration
- Best isolation
- Slightly more resource usage

```yaml
# Kubernetes deployment with side-car
spec:
  containers:
  - name: temenos-app
    image: temenos/payment-service
  - name: otel-collector
    image: otel/opentelemetry-collector
    ports:
    - containerPort: 4317
```

**Option 2: Standalone**
- Single collector for multiple apps
- More resource efficient
- Requires service discovery
- Better for smaller deployments

### Benefits

✅ **Vendor Neutral** - Switch backends without code changes
✅ **Processing Power** - Filter, sample, enrich data
✅ **Reliability** - Buffering and retry logic
✅ **Security** - Single point for credential management
✅ **Flexibility** - Easy to add new exporters

**Action Buttons:**
- "View OTEL Collector Docs" | URL: `https://opentelemetry.io/docs/collector/`
- "Download Config Template" | Action: download | File: `otel-collector-config.yaml`

---

### Popup 3: Aggregation & Visualization Layer
**Trigger:** Click on Column 3
**Size:** large
**Animation:** slide-in-right

**Title:** 📊 Aggregation & Visualization Layer

**Content:**
The final layer provides storage, analysis, and visualization of telemetry data.

### The Four Tools

**1. Prometheus** 📈
- **Type:** Time-series database
- **Stores:** Metrics
- **Query Language:** PromQL
- **Retention:** Configurable (default 15 days)
- **Visualization:** Built-in graph UI

**Use Cases:**
- Real-time metrics dashboards
- Alerting based on metric thresholds
- Capacity planning and trending

**Example Query:**
```promql
# 95th percentile API latency
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket[5m])
)
```

---

**2. Jaeger** 🔍
- **Type:** Distributed tracing platform
- **Stores:** Traces and spans
- **UI:** Interactive trace visualization
- **Storage Backend:** Cassandra, Elasticsearch, or memory

**Use Cases:**
- Debug slow requests
- Understand service dependencies
- Find performance bottlenecks

**Features:**
- Trace search and filtering
- Service dependency graph
- Span details and tags
- Comparison view

---

**3. Elasticsearch** 📝
- **Type:** Search and analytics engine
- **Stores:** Logs
- **Query Language:** Elasticsearch DSL
- **Companion:** Kibana for visualization

**Use Cases:**
- Full-text log search
- Log aggregation and analysis
- Security and audit logs

**Example Query:**
```json
{
  "query": {
    "bool": {
      "must": [
        {"match": {"level": "ERROR"}},
        {"match": {"service": "payment-api"}},
        {"range": {"@timestamp": {"gte": "now-1h"}}}
      ]
    }
  }
}
```

---

**4. Grafana** 📊
- **Type:** Visualization platform
- **Connects to:** Prometheus, Jaeger, Elasticsearch
- **Purpose:** Unified dashboards

**Use Cases:**
- Single pane of glass
- Cross-cutting queries
- Custom dashboards
- Alerting and notifications

**Key Features:**
- Multiple data sources
- Rich visualization options
- Dashboard templates
- Alert integration (PagerDuty, Slack, etc.)

---

### Unified Dashboard Example

```
┌────────────────────────────────────────┐
│  Temenos Payment Service Overview     │
├────────────────────────────────────────┤
│  Metrics (from Prometheus)             │
│  ├─ Request Rate: 1,543 req/s         │
│  ├─ Error Rate: 0.15%                 │
│  └─ P95 Latency: 245ms                │
├────────────────────────────────────────┤
│  Traces (from Jaeger)                  │
│  ├─ Slowest Traces (last 1h)          │
│  └─ [Click to view full trace]        │
├────────────────────────────────────────┤
│  Logs (from Elasticsearch)             │
│  ├─ Recent Errors (last 15m)          │
│  └─ [Click to view in Kibana]         │
└────────────────────────────────────────┘
```

**Action Buttons:**
- "View Sample Dashboard" | URL: `https://observability.temenos.com/grafana`
- "Dashboard Templates" | URL: `https://grafana.com/grafana/dashboards`

---

## ANIMATIONS TIMELINE

**Enable Advanced Animations:** yes

**Timeline:**
1. At 0s: Page title fades in
2. At 0.2s: Architecture overview section fades up
3. At 0.4s: Column 1 (Product Container) slides in from left
4. At 0.6s: Column 2 (Side-car) fades in
5. At 0.8s: Column 3 (Aggregation) slides in from right
6. At 1s: Arrows animate between columns (flow animation)
7. At 1.2s: Key features cards stagger in
8. At 1.4s: Architecture flow steps stagger in
9. At 1.6s: CTA buttons bounce in

**Continuous Animations:**
- Data flow dots continuously moving along arrows (loop)
- Progress bars in Column 1 animate on first view

---

## ACCESSIBILITY

**Screen Reader Announcements:**
- Page load: "Page 5 of 6: Temenos Telemetry Stack. A modern observability architecture designed for Temenos products."
- Architecture diagram: "Three-column architecture diagram. Column 1: Temenos Product Container. Column 2: Side-car Container with OTEL Collector. Column 3: Aggregation and Visualization layer."

**Keyboard Navigation:**
- Tab order: Overview → Column 1 → Column 2 → Column 3 → Feature cards → Flow steps → CTA buttons
- Enter/Space: Open detailed popups
- Escape: Close popups
- Arrow keys: Navigate between columns (left/right) and between tools in Column 3 (up/down)

**Focus Indicators:**
- Style: `3px solid` matching column color
- Visible on all interactive elements
- High contrast mode support

---

## CUSTOM STYLES

```css
/* Temenos Stack page specific styles */
.obs-temenos-stack {
  max-width: 1400px;
  margin: 0 auto;
}

.obs-temenos-stack .architecture-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin: 48px 0;
  position: relative;
}

@media (max-width: 1024px) {
  .obs-temenos-stack .architecture-columns {
    grid-template-columns: 1fr;
    gap: 48px;
  }
}

.obs-temenos-stack .architecture-column {
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.obs-temenos-stack .architecture-column:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.obs-temenos-stack .architecture-column.blue {
  background: #eff6ff;
  border: 2px solid #3b82f6;
}

.obs-temenos-stack .architecture-column.purple {
  background: #faf5ff;
  border: 2px solid #9333ea;
}

.obs-temenos-stack .architecture-column.green {
  background: #ecfdf5;
  border: 2px solid #10b981;
}

.obs-temenos-stack .progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
}

.obs-temenos-stack .progress-fill {
  height: 100%;
  transition: width 1s ease-out;
}

.obs-temenos-stack .flow-arrows {
  position: absolute;
  pointer-events: none;
}

.obs-temenos-stack .flow-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: flow 2s linear infinite;
}

@keyframes flow {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}
```

---

## NOTES FOR IMPLEMENTATION

- Three-column layout should be responsive - stack on mobile/tablet
- Arrows between columns should animate with flowing dots
- Progress bars in Column 1 should animate to their percentage on page load
- Each column should be clickable to show detailed popup
- Individual tools in Column 3 can also be clicked for specific details
- Color themes should be consistent throughout (blue, purple, green, orange)
- Ensure sufficient contrast for accessibility
- Consider adding subtle background patterns or icons to each column
- Mobile: Remove arrow animations, stack columns vertically
- Tablet: May keep 2 columns or stack to 1 depending on screen size

---

## CHECKLIST

When implementing this page, ensure:
- [x] Three-column architecture displays correctly on desktop
- [x] Columns stack properly on mobile devices
- [x] Color themes are distinct and consistent
- [x] Progress bars animate to correct percentages
- [x] Arrows flow with animated dots
- [x] All columns are clickable with popups
- [x] Tool cards in Column 3 have hover effects
- [x] Feature cards display in grid
- [x] Architecture flow steps are numbered and colored
- [x] CTA buttons link to live demos
- [x] Responsive design works across screen sizes
- [x] Keyboard navigation works
- [x] Screen reader accessibility implemented

---

## CONTENT SOURCES

**Original Data Source:**
- Database: MongoDB collection `content`
- Document ID: `obs-temenos-stack`
- Script: `/backend/scripts/create_observability_content.py` (lines 187-286)

**Key Message:**
Present the Temenos-specific observability architecture, showing how TEMN Monitor components integrate with OTEL Collector and standard observability backends.

**Tone:**
- Technical but accessible
- Focused on Temenos-specific implementation
- Practical with code examples and configuration
- Emphasizes flexibility and standards compliance
