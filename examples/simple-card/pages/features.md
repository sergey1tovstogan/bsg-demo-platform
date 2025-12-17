# Simple Card Example - Features Page

**Page Level:** 1 (top-level)
**Demonstrates:** Feature grid and comparison sections

---

```yaml
page:
  id: "features"

  # === TITLES ===
  titles:
    page_header: "Key Features"
    menu_title: "Features"
    agenda_title: "Key Features"
    breadcrumb: "Features"

  # === DESCRIPTIONS ===
  description:
    short: "Product features"
    long: "Explore our powerful features and capabilities"

  # === METADATA ===
  metadata:
    author: "Product Team"
    tags: ["features", "capabilities"]
    difficulty: "beginner"
    estimated_time: "3 minutes"

  # === HIERARCHY ===
  parent: null  # Top-level page
  icon: "Star"

# === SECTIONS ===
sections:
  # Hero
  - type: "hero"
    heading: "Powerful Features"
    subtitle: "Everything you need in one place"

  # Feature grid (non-clickable for simple example)
  - type: "feature_grid"
    columns: 3
    features:
      - name: "Fast Performance"
        icon: "Zap"
        description: "Lightning-fast response times"

      - name: "Secure & Reliable"
        icon: "Shield"
        description: "Enterprise-grade security"

      - name: "Easy Integration"
        icon: "Link"
        description: "Connect with your tools"

      - name: "24/7 Support"
        icon: "HeadphonesIcon"
        description: "We're always here to help"

      - name: "Scalable"
        icon: "TrendingUp"
        description: "Grows with your business"

      - name: "Affordable"
        icon: "DollarSign"
        description: "Great value for money"

  # Comparison section
  - type: "comparison_grid"
    columns: 2
    items:
      - heading: "Free Plan"
        subheading: "$0/month"
        points:
          - text: "Basic features"
            highlight: false
          - text: "1 user"
            highlight: false
          - text: "Community support"
            highlight: false

      - heading: "Pro Plan"
        subheading: "$29/month"
        badge: "Popular"
        points:
          - text: "All features"
            highlight: true
          - text: "Unlimited users"
            highlight: true
          - text: "Priority support"
            highlight: true

  # Success message
  - type: "alert"
    alert_type: "success"
    title: "Ready to Get Started?"
    content: "Sign up today and start using these features immediately!"

# === NAVIGATION ===
navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_next_previous: true
  back_to_agenda_button: true

  siblings:
    previous: "intro"
    next: null  # Last page
```

---

## What This Demonstrates

✅ **Feature grid** with 6 features
✅ **Icons** for visual appeal
✅ **Comparison grid** for pricing
✅ **Badge** highlighting popular option
✅ **Success alert** for call-to-action
