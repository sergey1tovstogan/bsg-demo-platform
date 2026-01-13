# Big Picture: Monitoring vs. Observability

```yaml
page:
  id: "obs-big-picture"
  titles:
    page_header: "The Big Picture"
    menu_title: "Big Picture"
    agenda_title: "Big Picture"
    breadcrumb: "Big Picture"

  description: "Comparing monitoring and observability approaches"

  sections:
    - type: "hero"
      heading: "Monitoring vs. Observability"
      subtitle: "Two sides of the same coin, but with different goals"

    - type: "comparison_grid"
      columns:
        - title: "Monitoring"
          icon: "AlertCircle"
          color: "red"
        - title: "Observability"
          icon: "Wrench"
          color: "blue"
      items:
        - label: "Core Question"
          values:
            - "Is the system healthy?"
            - "Why is the system behaving this way?"
        - label: "Focus"
          values:
            - "Known failures and thresholds"
            - "Unknown failures and internal state"
        - label: "Method"
          values:
            - "Dashboards and Alerts"
            - "Exploration and Diagnostics"
        - label: "Benefit"
          values:
            - "Tells you when something is wrong"
            - "Provides the evidence to fix it quickly"

    - type: "text"
      content: |
        ### The Dashboard vs. the Toolkit

    - type: "alert"
      alert_type: "info"
      title: "Monitoring is your Dashboard"
      content: "A collection of gauges that tell you if you're over the speed limit or low on gas. Essential for daily operation."

    - type: "alert"
      alert_type: "success"
      title: "Observability is your Toolkit"
      content: "The set of diagnostic tools that allow you to open the hood and see exactly which part is failing, even if you've never seen that failure before."

    - type: "clickable_cards"
      columns: 1
      cards:
        - title: "Explore the Core Pillars"
          description: "Learn about Metrics, Logs, and Traces"
          icon: "ArrowRight"
          click_action:
            type: "navigate_to_subpage"
            target: "obs-pillars"
```
