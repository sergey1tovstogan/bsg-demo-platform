# Temenos Monitoring Flow

```yaml
page:
  id: "obs-monitoring-flow"
  titles:
    page_header: "Enterprise Monitoring Flow"
    menu_title: "Monitoring Flow"
    agenda_title: "Monitoring Flow"
    breadcrumb: "Monitoring Flow"

  description: "Interactive visualization of the Temenos observability pipeline"

  sections:
    - type: "hero"
      heading: "Temenos Monitoring Flow"
      subtitle: "Follow the data from the application to the operational dashboards"

    - type: "interactive_diagram"
      image: "/images/observability/TemenosFlows.png"
      hotspots:
        - x: 6
          y: 61.1
          radius: 80
          hover_text: "Temenos Solution"
          click_action:
            type: "show_popup"
            popup_id: "temenos-popup"
        - x: 37.5
          y: 61.1
          radius: 80
          hover_text: "OpenTelemetry Collector"
          click_action:
            type: "show_popup"
            popup_id: "otel-popup"
        - x: 37.5
          y: 20.4
          radius: 80
          hover_text: "Jaeger"
          click_action:
            type: "show_popup"
            popup_id: "jaeger-popup"
        - x: 63.4
          y: 29.6
          radius: 80
          hover_text: "Prometheus"
          click_action:
            type: "show_popup"
            popup_id: "prometheus-popup"
        - x: 63.4
          y: 77.8
          radius: 80
          hover_text: "Elasticsearch"
          click_action:
            type: "show_popup"
            popup_id: "elasticsearch-popup"
        - x: 92
          y: 57.4
          radius: 80
          hover_text: "Grafana"
          click_action:
            type: "show_popup"
            popup_id: "grafana-popup"

    - type: "text"
      content: |
        ### How It Works
        1. **Telemetry Collection:** The Temenos solution emits metrics, logs, and traces to the OpenTelemetry Collector.
        2. **Metrics Path:** Metrics flow from OTEL to Prometheus, then to Grafana for visualization.
        3. **Logs Path:** Logs flow from OTEL to Elasticsearch, then to Grafana for analysis.
        4. **Traces Path:** Distributed traces flow from OTEL to Jaeger for detailed request tracing.


  popups:
    - id: "temenos-popup"
      title: "Temenos Solution"
      sections:
        - type: "text"
          content: "The core banking application instrumented with OpenTelemetry SDKs."
    - id: "otel-popup"
      title: "OpenTelemetry Collector"
      sections:
        - type: "text"
          content: "Receives, processes, and exports telemetry data to multiple backends."
    - id: "jaeger-popup"
      title: "Jaeger"
      sections:
        - type: "text"
          content: "Distributed tracing system for monitoring and troubleshooting microservices."
    - id: "prometheus-popup"
      title: "Prometheus"
      sections:
        - type: "text"
          content: "Time-series database and monitoring system for metrics."
    - id: "elasticsearch-popup"
      title: "Elasticsearch"
      sections:
        - type: "text"
          content: "Search and analytics engine for storing and querying logs."
    - id: "grafana-popup"
      title: "Grafana"
      sections:
        - type: "text"
          content: "The visualization platform for metrics and logs dashboards."
```
