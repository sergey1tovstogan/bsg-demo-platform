# Core Pillars of Observability

```yaml
page:
  id: "obs-pillars"
  titles:
    page_header: "The Three Pillars"
    menu_title: "Core Pillars"
    agenda_title: "Core Pillars"
    breadcrumb: "Pillars"

  description: "Metrics, Logs, and Traces - the foundation of visibility"

  sections:
    - type: "hero"
      heading: "Metrics, Logs, and Traces"
      subtitle: "The three types of telemetry data that power observability"
      align: "center"

    - type: "image"
      src: "/images/observability/3Piliar.png"
      alt: "The Three Pillars of Observability"
      caption: "Observation starts with these three data streams"
      width: "full"

    - type: "feature_grid"
      columns: 3
      features:
        - title: "Metrics"
          description: "Numerical data points over time. Perfect for showing trends, rates, and health at a glance."
          icon: "Activity"
          click_action:
            type: "show_popup"
            popup_id: "metrics-detail"
        - title: "Logs"
          description: "Discrete events recorded as text. Essential for seeing exactly what happened at a specific point in time."
          icon: "FileText"
          click_action:
            type: "show_popup"
            popup_id: "logs-detail"
        - title: "Traces"
          description: "The journey of a request through the system. Critical for finding bottlenecks in complex microservices."
          icon: "GitBranch"
          click_action:
            type: "show_popup"
            popup_id: "traces-detail"

    - type: "text"
      content: |
        ### How They Work Together
        Observability isn't just about having these three types of data; it's about how they are **correlated**.

    - type: "steps"
      steps:
        - title: "Alert"
          description: "A metric threshold is crossed (e.g. error rate > 5%). You are notified."
        - title: "Investigate"
          description: "You look at traces to see which specific requests are failing and where."
        - title: "Diagnose"
          description: "You drill down into the logs for those failing traces to find the stack trace and root cause."

    - type: "clickable_cards"
      columns: 1
      cards:
        - title: "See the Observability Stack"
          description: "Learn how these data types are collected and stored"
          icon: "ArrowRight"
          click_action:
            type: "navigate_to_subpage"
            target: "obs-stack"

  popups:
    - id: "metrics-detail"
      title: "About Metrics"
      sections:
        - type: "text"
          content: |
            Metrics are the most cost-effective way to monitor high-volume systems. 
            
            **Examples:**
            - CPU/Memory usage
            - Request count
            - Latency (ms)
            - Error count
    - id: "logs-detail"
      title: "About Logs"
      sections:
        - type: "text"
          content: |
            Logs provide the 'ground truth' of what happened. They are rich in detail but expensive to store at high volumes.
            
            **Common Fields:**
            - Timestamp
            - Log level (INFO, WARN, ERROR)
            - Message
            - Trace ID (for correlation)
    - id: "traces-detail"
      title: "About Traces"
      sections:
        - type: "text"
          content: |
            Distributed tracing allows you to follow a single user request as it bounces through dozens of microservices.
            
            **Key Concepts:**
            - **Span:** A single unit of work within a trace.
            - **Trace ID:** A unique ID that travels with the request through the entire system.
```
