# Introduction to Observability

```yaml
page:
  id: "obs-introduction"
  titles:
    page_header: "Understanding Observability"
    menu_title: "Introduction"
    agenda_title: "Introduction"
    breadcrumb: "Intro"

  description: "Introduction and core concepts of observability"

  metadata:
    tags: ["intro", "concepts"]

  sections:
    - type: "hero"
      heading: "Understanding Observability"
      subtitle: "Moving beyond simple monitoring to a truly visible system"
      align: "center"

    - type: "alert"
      alert_type: "info"
      title: "Imagine: A complex microservices environment..."
      content: "A user reports they can't complete an order. You check your 'Success Rate' graph—it's green. But the user is still stuck. Something is wrong, and your dashboard doesn't show it."

    - type: "alert"
      alert_type: "warning"
      title: "Monitoring vs. Observability"
      content: "Monitoring tells you that a system is broken. Observability tells you why it's broken."

    - type: "text"
      content: |
        Imagine you're driving a car. **Monitoring** is the dashboard: it tells you your speed, fuel level, and if the engine light is on.

        **Observability** is having a full diagnostics tool plugged in: it tells you the exact cylinder that's misfiring, the fuel-to-air ratio, and the brake pad wear—allowing you to understand the *internal state* of the car just by looking at its outputs.

    - type: "clickable_cards"
      columns: 1
      cards:
        - title: "Start Exploring"
          description: "Move to the Big Picture comparison"
          icon: "ArrowRight"
          click_action:
            type: "navigate_to_subpage"
            target: "obs-big-picture"
```
