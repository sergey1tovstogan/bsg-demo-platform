# The Observability Stack

```yaml
page:
  id: "obs-stack"
  titles:
    page_header: "The Technology Stack"
    menu_title: "The Stack"
    agenda_title: "The Stack"
    breadcrumb: "Stack"

  description: "The three-tier architecture of an observability system"

  sections:
    - type: "hero"
      heading: "Building the Stack"
      subtitle: "How telemetry data flows from your application to your dashboards"

    - type: "steps"
      steps:
        - title: "1. Collector"
          description: "The ingress point that receives, processes, and exports telemetry data. (e.g. OpenTelemetry Collector)"
        - title: "2. Storage"
          description: "The backend databases where metrics, logs, and traces are stored. (e.g. Prometheus, Elasticsearch, Jaeger)"
        - title: "3. Visualization"
          description: "The frontend platform where data is queried and visualized. (e.g. Grafana)"

    - type: "text"
      content: |
        ### Data Flow Journey
        How data moves through the system:

    - type: "steps"
      steps:
        - title: "Instrumentation"
          description: "Your code is instrumented to emit telemetry."
        - title: "Collection"
          description: "The collector gathers data from multiple sources."
        - title: "Processing"
          description: "Data is cleaned, filtered, and metadata is added."
        - title: "Exporting"
          description: "Data is sent to the appropriate storage backend."
        - title: "Querying"
          description: "Dashboards query the backends to show current status."

    - type: "clickable_cards"
      columns: 1
      cards:
        - title: "Explore the Temenos Stack"
          description: "See how we implement this in reality"
          icon: "ArrowRight"
          click_action:
            type: "navigate_to_subpage"
            target: "obs-temenos-stack"
```
