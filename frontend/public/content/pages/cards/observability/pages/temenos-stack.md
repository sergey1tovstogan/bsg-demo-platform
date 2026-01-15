# Temenos Observability Stack

```yaml
page:
  id: "obs-temenos-stack"
  titles:
    page_header: "Temenos Implementation"
    menu_title: "Temenos Stack"
    agenda_title: "Temenos Stack"
    breadcrumb: "Temenos Stack"

  description: "How OpenTelemetry and Temenos work together"

  sections:
    - type: "hero"
      heading: "Temenos & OpenTelemetry"
      subtitle: "Standardized, vendor-neutral visibility across the entire platform"

    - type: "feature_grid"
      columns: 3
      features:
        - title: "Product Container"
          description: "The core Temenos solution using OTEL libraries to emit standard telemetry."
          icon: "Box"
        - title: "Side-car Container"
          description: "A local OTEL collector that handles offloading and initial processing."
          icon: "Activity"
        - title: "Aggregation Layer"
          description: "Centralized storage and visualization using Prometheus, Tempo, and Grafana."
          icon: "BarChart3"

    - type: "text"
      content: |
        ### Key Features
        Our implementation focuses on three primary goals:

    - type: "card_list"
      items:
        - title: "Unified Standards"
          description: "All components use the same semantic conventions for metadata."
          icon: "CheckCircle"
        - title: "Vendor Neutral"
          description: "Using OpenTelemetry means you can switch storage backends without changing code."
          icon: "Shield"
        - title: "High Context"
          description: "Every metric and log is tagged with business context (e.g. Company ID)."
          icon: "Layers"

    - type: "text"
      content: |
        ### Architecture Flow
        The lifecycle of a Temenos monitoring event:

    - type: "steps"
      steps:
        - title: "Step 1"
          description: "Temenos application generates a Span/Trace."
        - title: "Step 2"
          description: "The Side-car collector receives the trace via OTLP."
        - title: "Step 3"
          description: "Collector enriches the trace with infrastructure metadata."
        - title: "Step 4"
          description: "Trace is exported to the central aggregation pool."

    - type: "clickable_cards"
      columns: 1
      cards:
        - title: "View the Monitoring Flow"
          description: "See the interactive data flow diagram"
          icon: "ArrowRight"
          click_action:
            type: "navigate_to_subpage"
            target: "obs-monitoring-flow"
```
