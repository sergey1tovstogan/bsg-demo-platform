# Observability Card - Agenda

```yaml
agenda:
  title: "Observability Explained"
  subtitle: "Visualizing the complete observability pipeline from application to dashboards"

  layout:
    type: "grid"
    columns: 2
    gap: "medium"

  animation:
    type: "stagger-fade-in"
    delay_between_items: "0.1s"

  items:
    - id: "obs-intro-item"
      order: 1
      titles:
        agenda_title: "Introduction"
      description: "Start here to understand the core concept of observability vs. monitoring."
      icon: "Lightbulb"
      target:
        type: "page"
        page_id: "obs-introduction"
      color_theme: "blue"

    - id: "obs-big-picture-item"
      order: 2
      titles:
        agenda_title: "Big Picture"
      description: "A high-level comparison of monitoring and observability approaches."
      icon: "Zap"
      target:
        type: "page"
        page_id: "obs-big-picture"
      color_theme: "orange"

    - id: "obs-pillars-item"
      order: 3
      titles:
        agenda_title: "Core Pillars"
      description: "Explore Metrics, Logs, and Traces - the three pillars of observability."
      icon: "Layers"
      target:
        type: "page"
        page_id: "obs-pillars"
      color_theme: "emerald"

    - id: "obs-stack-item"
      order: 4
      titles:
        agenda_title: "The Stack"
      description: "See the tiers of an observability stack: Collector, Storage, and Visualization."
      icon: "Server"
      target:
        type: "page"
        page_id: "obs-stack"
      color_theme: "purple"

    - id: "obs-temenos-stack-item"
      order: 5
      titles:
        agenda_title: "Temenos Stack"
      description: "How Temenos implements observability using OpenTelemetry."
      icon: "Box"
      target:
        type: "page"
        page_id: "obs-temenos-stack"
      color_theme: "blue"

    - id: "obs-monitoring-flow-item"
      order: 6
      titles:
        agenda_title: "Temenos Monitoring Flow"
      description: "Visual flow of metrics, logs, and traces through the system."
      icon: "Workflow"
      target:
        type: "page"
        page_id: "obs-monitoring-flow"
      color_theme: "teal"
```
