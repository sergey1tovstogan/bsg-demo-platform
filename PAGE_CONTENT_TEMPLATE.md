# Page Content Template

**Purpose:** This template defines the structure for creating content pages within component cards, aligned with the BSG Unified Layout Specification.

**Version:** 1.0
**Date:** December 16, 2024

---

## Template Structure

```yaml
# =============================================================================
# CARD METADATA
# =============================================================================
card_id: "your-component-id"           # Must match ComponentId type
card_name: "Your Component Name"        # Display name for the card
card_description: "Brief description"   # Shown on homepage card
icon: "IconName"                        # Lucide icon name (e.g., "Activity", "Shield")
category_color: "#3B82F6"              # Hex color for category identity

# =============================================================================
# PAGES CONFIGURATION
# =============================================================================
pages:
  # ---------------------------------------------------------------------------
  # PAGE 1: INTRODUCTION / OVERVIEW
  # ---------------------------------------------------------------------------
  - page_id: "intro"
    page_title: "Introduction"
    page_icon: "Lightbulb"              # Lucide icon for tab
    page_order: 1

    content_type: "hero"                # Options: hero, standard, grid, flow

    sections:
      # Hero Section (Large centered content)
      - section_type: "hero"
        heading:
          text: "Understanding [Topic Name]"
          size: "text-5xl"              # text-3xl, text-4xl, text-5xl
          weight: "font-bold"
          gradient: true                # Apply gradient to text
          gradient_from: "teal-600"
          gradient_to: "cyan-600"

        subtitle:
          text: "A comprehensive introduction to..."
          size: "text-xl"
          color: "text-slate-600 dark:text-slate-300"

      # Story/Analogy Card (Visual comparison)
      - section_type: "story_card"
        background: "bg-white dark:bg-slate-800"
        border: "border-gray-200 dark:border-slate-700"

        scenario:
          text: "Imagine you're driving a car..."
          size: "text-3xl"
          weight: "font-bold"
          color: "text-slate-900 dark:text-slate-100"
          highlight_text: "Imagine:"
          highlight_color: "text-teal-600 dark:text-teal-400"

        comparisons:
          - type: "negative"              # negative, positive, neutral
            icon: "AlertCircle"
            icon_color: "text-red-500"
            border_color: "border-red-500"
            background: "bg-red-50 dark:bg-red-900/20"
            label: "Traditional Approach"
            text: "You only know the engine light is on..."
            text_color: "text-red-700 dark:text-red-300"
            hover_effect: true

          - type: "positive"
            icon: "CheckCircle"
            icon_color: "text-teal-600"
            border_color: "border-teal-600"
            background: "bg-teal-50 dark:bg-teal-900/20"
            label: "Modern Approach"
            text: "You know exactly which component is failing..."
            text_color: "text-teal-700 dark:text-teal-300"
            hover_effect: true

        analogy:
          text: "The difference is like having a mechanic in your car"
          style: "italic"
          size: "text-xl"
          color: "text-slate-500 dark:text-slate-400"

      # Call-to-Action Button
      - section_type: "cta_button"
        button_type: "primary"            # primary, secondary
        text: "Start Exploring"
        icon: "ArrowRight"
        icon_position: "right"            # left, right
        action: "next_page"               # next_page, external_link, custom
        next_page_id: "big-picture"

  # ---------------------------------------------------------------------------
  # PAGE 2: CONCEPT COMPARISON
  # ---------------------------------------------------------------------------
  - page_id: "big-picture"
    page_title: "Big Picture"
    page_icon: "Lightbulb"
    page_order: 2

    content_type: "comparison_grid"

    sections:
      # Two-Column Comparison Cards
      - section_type: "comparison_grid"
        layout: "grid-cols-2"             # grid-cols-2, grid-cols-3
        gap: "gap-8"

        cards:
          - title: "Traditional Approach"
            icon: "AlertCircle"
            icon_size: "w-12 h-12"
            icon_color: "text-red-600"
            gradient_from: "red-50"
            gradient_to: "orange-50"
            gradient_from_dark: "red-900/20"
            gradient_to_dark: "orange-900/20"
            border_color: "border-red-200 dark:border-red-800"

            question:
              text: "Is something wrong?"
              style: "italic"
              size: "text-xl"
              color: "text-slate-600 dark:text-slate-300"

            points:
              - "Reactive monitoring dashboards"
              - "Alert fatigue from too many notifications"
              - "Limited context about issues"
              - "Difficult to trace root causes"

          - title: "Modern Approach"
            icon: "Wrench"
            icon_size: "w-12 h-12"
            icon_color: "text-teal-600"
            gradient_from: "teal-50"
            gradient_to: "cyan-50"
            gradient_from_dark: "teal-900/20"
            gradient_to_dark: "cyan-900/20"
            border_color: "border-teal-200 dark:border-teal-800"

            question:
              text: "Why is it happening?"
              style: "italic"
              size: "text-xl"
              color: "text-slate-600 dark:text-slate-300"

            points:
              - "Deep system visibility"
              - "Contextual insights with traces"
              - "Proactive issue detection"
              - "Fast root cause analysis"

      # Analogy Section
      - section_type: "info_card"
        background: "bg-white dark:bg-slate-800"
        border: "border-gray-200 dark:border-slate-700"

        heading:
          text: "Real-World Analogy"
          size: "text-2xl"
          weight: "font-bold"
          color: "text-slate-900 dark:text-white"

        grid_layout: "grid-cols-2"
        gap: "gap-6"

        items:
          - icon: "AlertCircle"
            icon_color: "text-red-500"
            text: "Dashboard light = You know there's a problem"

          - icon: "Wrench"
            icon_color: "text-teal-500"
            text: "Diagnostic tool = You know exactly what and why"

      # Navigation
      - section_type: "cta_button"
        button_type: "primary"
        text: "Explore the Core Pillars"
        icon: "ArrowRight"
        action: "next_page"
        next_page_id: "pillars"

  # ---------------------------------------------------------------------------
  # PAGE 3: MULTI-CARD GRID (Features/Pillars)
  # ---------------------------------------------------------------------------
  - page_id: "pillars"
    page_title: "Core Pillars"
    page_icon: "Layers"
    page_order: 3

    content_type: "feature_grid"

    sections:
      # Page Header
      - section_type: "page_header"
        align: "center"

        heading:
          text: "Three Core Pillars"
          size: "text-4xl"
          weight: "font-bold"
          color: "text-slate-900 dark:text-white"

        description:
          text: "Understanding the fundamental building blocks"
          size: "text-lg"
          max_width: "max-w-3xl"
          color: "text-slate-600 dark:text-slate-200"

      # Three-Column Feature Grid
      - section_type: "feature_grid"
        layout: "grid-cols-3"
        gap: "gap-8"
        responsive: "md:grid-cols-3"

        features:
          - name: "Metrics"
            icon: "Activity"
            icon_color: "red"              # red, blue, green (uses color system)
            gradient_from: "red-50"
            gradient_to: "orange-50"
            gradient_from_dark: "red-900/20"
            gradient_to_dark: "orange-900/20"
            border_color: "border-red-200 dark:border-red-800"

            icon_container_bg: "bg-red-500"
            icon_container_size: "w-16 h-16"
            icon_container_radius: "rounded-lg"

            description: "Numeric measurements collected over time"

            examples:
              - "CPU usage percentage"
              - "Request count per minute"
              - "Memory consumption"

            summary: "What: Numbers that tell you system state"

          - name: "Logs"
            icon: "FileText"
            icon_color: "blue"
            gradient_from: "blue-50"
            gradient_to: "indigo-50"
            gradient_from_dark: "blue-900/20"
            gradient_to_dark: "indigo-900/20"
            border_color: "border-blue-200 dark:border-blue-800"

            icon_container_bg: "bg-blue-500"
            icon_container_size: "w-16 h-16"
            icon_container_radius: "rounded-lg"

            description: "Text records of events and messages"

            examples:
              - "Error messages"
              - "User actions"
              - "System events"

            summary: "When: Timestamped events for context"

          - name: "Traces"
            icon: "GitBranch"
            icon_color: "green"
            gradient_from: "teal-50"
            gradient_to: "cyan-50"
            gradient_from_dark: "teal-900/20"
            gradient_to_dark: "cyan-900/20"
            border_color: "border-teal-200 dark:border-teal-800"

            icon_container_bg: "bg-teal-500"
            icon_container_size: "w-16 h-16"
            icon_container_radius: "rounded-lg"

            description: "Request journey through your system"

            examples:
              - "API call path"
              - "Service dependencies"
              - "Performance bottlenecks"

            summary: "Where: Track requests across services"

      # How They Work Together
      - section_type: "info_card"
        background: "bg-white dark:bg-slate-800"
        border: "border-gray-200 dark:border-slate-700"

        heading:
          text: "How They Work Together"
          size: "text-2xl"
          weight: "font-bold"
          color: "text-slate-900 dark:text-white"

        steps:
          - emoji: "1️⃣"
            text: "Metrics show you high-level trends and anomalies"
          - emoji: "2️⃣"
            text: "Logs provide detailed context about specific events"
          - emoji: "3️⃣"
            text: "Traces reveal the complete request journey"

      # Navigation
      - section_type: "cta_button"
        button_type: "primary"
        text: "See the Complete Stack"
        icon: "ArrowRight"
        action: "next_page"
        next_page_id: "stack"

  # ---------------------------------------------------------------------------
  # PAGE 4: VERTICAL FLOW (Architecture/Stack)
  # ---------------------------------------------------------------------------
  - page_id: "stack"
    page_title: "The Stack"
    page_icon: "Server"
    page_order: 4

    content_type: "vertical_flow"

    sections:
      # Page Header
      - section_type: "page_header"
        align: "center"

        heading:
          text: "Technology Stack"
          size: "text-4xl"
          weight: "font-bold"
          color: "text-slate-900 dark:text-white"

        description:
          text: "Three-tier architecture for complete visibility"
          size: "text-lg"
          color: "text-slate-600 dark:text-slate-200"

      # Vertical Tier Cards with Arrows
      - section_type: "vertical_flow"
        show_arrows: true
        arrow_icon: "ArrowDown"
        arrow_color: "text-teal-500"
        arrow_size: "w-8 h-8"

        tiers:
          - name: "Collection Layer"
            icon: "Server"
            icon_color: "purple"
            subheading: "Gather data from sources"

            gradient_from: "purple-50"
            gradient_to: "indigo-50"
            gradient_from_dark: "purple-900/20"
            gradient_to_dark: "indigo-900/20"
            border_color: "border-purple-200 dark:border-purple-800"

            icon_container_bg: "bg-purple-500"

            items:
              - "Agents & Collectors"
              - "Instrumentation Libraries"
              - "Log Shippers"

            badge_color: "bg-purple-100 text-purple-700"

            examples:
              - "Prometheus"
              - "FluentBit"
              - "OpenTelemetry"

          - name: "Storage Layer"
            icon: "Database"
            icon_color: "blue"
            subheading: "Store and index data"

            gradient_from: "blue-50"
            gradient_to: "sky-50"
            gradient_from_dark: "blue-900/20"
            gradient_to_dark: "sky-900/20"
            border_color: "border-blue-200 dark:border-blue-800"

            icon_container_bg: "bg-blue-500"

            items:
              - "Time-series Databases"
              - "Log Aggregators"
              - "Trace Backends"

            badge_color: "bg-blue-100 text-blue-700"

            examples:
              - "Prometheus TSDB"
              - "Elasticsearch"
              - "Jaeger"

          - name: "Visualization Layer"
            icon: "BarChart3"
            icon_color: "pink"
            subheading: "Display and analyze"

            gradient_from: "rose-50"
            gradient_to: "pink-50"
            gradient_from_dark: "rose-900/20"
            gradient_to_dark: "pink-900/20"
            border_color: "border-rose-200 dark:border-rose-800"

            icon_container_bg: "bg-rose-500"

            items:
              - "Dashboards"
              - "Query Interfaces"
              - "Alerting Systems"

            badge_color: "bg-rose-100 text-rose-700"

            examples:
              - "Grafana"
              - "Kibana"
              - "Jaeger UI"

      # Data Flow Steps
      - section_type: "flow_steps"
        background: "bg-white dark:bg-slate-800"
        border: "border-gray-200 dark:border-slate-700"

        heading:
          text: "Data Flow Journey"
          size: "text-2xl"
          weight: "font-bold"
          color: "text-slate-900 dark:text-white"

        steps:
          - badge_color: "bg-teal-100 text-teal-700"
            badge_text: "1"
            text: "Application emits telemetry data (metrics, logs, traces)"

          - badge_color: "bg-teal-100 text-teal-700"
            badge_text: "2"
            text: "Collectors gather and process data from multiple sources"

          - badge_color: "bg-teal-100 text-teal-700"
            badge_text: "3"
            text: "Storage backends persist and index the data"

          - badge_color: "bg-teal-100 text-teal-700"
            badge_text: "4"
            text: "Visualization tools query and display insights"

      # Success Card (Course Complete)
      - section_type: "success_card"
        background: "bg-[#003366]"
        text_color: "text-white"

        heading:
          text: "You've Mastered the Basics!"
          size: "text-3xl"
          weight: "font-bold"

        description:
          text: "You now understand the fundamentals and how everything works together."
          color: "text-slate-100"

        button:
          type: "secondary"
          text: "Back to Introduction"
          background: "bg-white"
          text_color: "text-[#003366]"
          hover_background: "hover:bg-slate-100"
          action: "first_page"
          page_id: "intro"

  # ---------------------------------------------------------------------------
  # PAGE 5: CUSTOM ARCHITECTURE (3-Column Technical)
  # ---------------------------------------------------------------------------
  - page_id: "architecture"
    page_title: "Architecture"
    page_icon: "Box"
    page_order: 5

    content_type: "architecture_diagram"

    sections:
      # Page Header
      - section_type: "page_header"
        align: "center"

        heading:
          text: "System Architecture"
          size: "text-4xl"
          weight: "font-bold"
          color: "text-slate-900 dark:text-white"

        description:
          text: "Three-container architecture pattern"
          size: "text-lg"
          max_width: "max-w-4xl"
          color: "text-slate-600 dark:text-slate-200"

      # Three-Column Architecture
      - section_type: "architecture_columns"
        layout: "grid-cols-3"
        gap: "gap-6"
        responsive: "lg:grid-cols-3"

        containers:
          - name: "Application Container"
            icon: "Box"
            icon_color: "text-blue-600"

            gradient_from: "blue-50"
            gradient_to: "indigo-50"
            gradient_from_dark: "blue-900/20"
            gradient_to_dark: "indigo-900/20"
            border_color: "border-blue-200 dark:border-blue-800"

            components:
              - name: "API Service"
                library: "OpenTelemetry SDK"
                progress: 85
                progress_color: "bg-blue-500"

              - name: "Business Logic"
                library: "Custom Instrumentation"
                progress: 70
                progress_color: "bg-blue-500"

              - name: "Data Access"
                library: "ORM Tracing"
                progress: 90
                progress_color: "bg-blue-500"

            info_items:
              - "Automatic trace generation"
              - "Context propagation"
              - "Performance metrics"

          - name: "Sidecar Container"
            icon: "Activity"
            icon_color: "text-teal-600"

            gradient_from: "teal-50"
            gradient_to: "cyan-50"
            gradient_from_dark: "teal-900/20"
            gradient_to_dark: "cyan-900/20"
            border_color: "border-teal-200 dark:border-teal-800"

            central_component:
              icon: "Database"
              icon_size: "w-16 h-16"
              icon_color: "text-teal-600"
              name: "OTEL Collector"
              description: "Receives, processes, and exports telemetry"
              arrow_icon: "ArrowRight"

            info_items:
              - "Decouples concerns"
              - "Centralized config"
              - "Protocol translation"

          - name: "Backend Services"
            icon: "BarChart3"
            icon_color: "text-emerald-600"

            gradient_from: "emerald-50"
            gradient_to: "green-50"
            gradient_from_dark: "emerald-900/20"
            gradient_to_dark: "green-900/20"
            border_color: "border-emerald-200 dark:border-emerald-800"

            tools:
              - name: "Prometheus"
                type: "Metrics"
                color: "orange"

              - name: "Jaeger"
                type: "Traces"
                color: "blue"

              - name: "Loki"
                type: "Logs"
                color: "yellow"

              - name: "Grafana"
                type: "Visualization"
                color: "orange-600"

            info_items:
              - "Specialized storage"
              - "Query capabilities"
              - "Unified dashboards"

      # Key Features Grid
      - section_type: "feature_cards"
        layout: "grid-cols-3"
        gap: "gap-6"

        features:
          - title: "Separation of Concerns"
            description: "Application focuses on business logic, telemetry handled separately"

          - title: "Flexibility"
            description: "Change backends without modifying application code"

          - title: "Scalability"
            description: "Collector can be scaled independently"

      # Architecture Flow
      - section_type: "flow_steps"
        background: "bg-white dark:bg-slate-800"
        border: "border-gray-200 dark:border-slate-700"

        heading:
          text: "Data Flow Architecture"
          size: "text-2xl"
          weight: "font-bold"

        steps:
          - badge_color: "bg-blue-100 text-blue-700 border-blue-200"
            badge_text: "Step 1"
            text: "Application instruments code with OpenTelemetry SDK"

          - badge_color: "bg-purple-100 text-purple-700 border-purple-200"
            badge_text: "Step 2"
            text: "Telemetry sent to sidecar OTEL Collector"

          - badge_color: "bg-emerald-100 text-emerald-700 border-emerald-200"
            badge_text: "Step 3"
            text: "Collector exports to appropriate backends"

          - badge_color: "bg-orange-100 text-orange-700 border-orange-200"
            badge_text: "Step 4"
            text: "Grafana visualizes unified observability data"

  # ---------------------------------------------------------------------------
  # PAGE 6: LIST WITH DETAILS
  # ---------------------------------------------------------------------------
  - page_id: "best-practices"
    page_title: "Best Practices"
    page_icon: "CheckCircle"
    page_order: 6

    content_type: "list_details"

    sections:
      # Page Header
      - section_type: "page_header"
        align: "left"

        heading:
          text: "Implementation Best Practices"
          size: "text-4xl"
          weight: "font-bold"
          color: "text-slate-900 dark:text-white"

        description:
          text: "Follow these guidelines for successful implementation"
          size: "text-lg"
          color: "text-slate-600 dark:text-slate-200"

      # Alert Box (Information)
      - section_type: "alert"
        alert_type: "info"                # success, warning, error, info
        icon: "Info"

        title: "Important Guidelines"
        message: "These practices are based on industry standards and proven patterns."

      # Expandable/Detailed List
      - section_type: "detail_cards"

        items:
          - number: "01"
            title: "Start with Metrics"
            category: "Foundation"
            category_color: "bg-blue-100 text-blue-700"

            description: "Begin your observability journey with basic metrics collection"

            details:
              - "Choose key performance indicators (KPIs)"
              - "Instrument critical paths"
              - "Set up dashboards"
              - "Configure alerts"

            tip: "Don't try to instrument everything at once"

          - number: "02"
            title: "Add Structured Logging"
            category: "Enhancement"
            category_color: "bg-green-100 text-green-700"

            description: "Implement structured logging for better searchability"

            details:
              - "Use JSON format"
              - "Include correlation IDs"
              - "Add contextual fields"
              - "Set appropriate log levels"

            tip: "Consistent field names across services help correlation"

          - number: "03"
            title: "Implement Distributed Tracing"
            category: "Advanced"
            category_color: "bg-purple-100 text-purple-700"

            description: "Add tracing to understand request flows"

            details:
              - "Use OpenTelemetry for standardization"
              - "Propagate context across services"
              - "Sample strategically"
              - "Integrate with existing metrics"

            tip: "Start with high-value user journeys"

# =============================================================================
# COMPONENT TYPE DEFINITIONS
# =============================================================================

# SECTION TYPES:
# - hero: Large centered heading with subtitle
# - story_card: Narrative comparison card
# - comparison_grid: Side-by-side feature comparison
# - feature_grid: Multi-column feature showcase
# - info_card: Informational card with structured content
# - vertical_flow: Stacked items with connecting arrows
# - architecture_columns: Technical architecture diagram
# - flow_steps: Numbered sequential steps
# - success_card: Completion/achievement card
# - cta_button: Call-to-action navigation button
# - page_header: Page title and description
# - alert: Information/warning/error/success alert
# - detail_cards: Expandable items with details

# LAYOUT OPTIONS:
# - grid-cols-1: Single column
# - grid-cols-2: Two columns
# - grid-cols-3: Three columns
# - grid-cols-4: Four columns
# - responsive: Add md:grid-cols-X lg:grid-cols-X for breakpoints

# COLOR SYSTEM (from unified layout):
# Brand Colors:
#   - Temenos Navy: #003366
#   - Temenos Blue: #0066CC
#   - Temenos Cyan: #00A3E0
#
# Functional Colors:
#   - Success: #10B981 (green)
#   - Warning: #F59E0B (amber)
#   - Error: #EF4444 (red)
#   - Info: #60A5FA (blue)
#
# Category Colors:
#   - Integration: #3B82F6 (blue)
#   - Data Architecture: #10B981 (emerald)
#   - Deployment: #8B5CF6 (violet)
#   - Security: #EF4444 (red)
#   - Observability: #F59E0B (amber)
#   - Design Time: #6366F1 (indigo)

# TYPOGRAPHY (from unified layout):
# Headings:
#   - H1: text-3xl font-bold tracking-tight
#   - H2: text-2xl font-semibold
#   - H3: text-xl font-semibold
#   - H4: text-lg font-semibold
#   - H5: text-base font-semibold
#
# Body:
#   - Large: text-lg leading-relaxed
#   - Regular: text-base leading-normal
#   - Small: text-sm
#   - Extra Small: text-xs

# ICONS (Lucide React):
# Common icons: Activity, AlertCircle, ArrowDown, ArrowRight, BarChart3,
# Box, CheckCircle, Database, FileText, GitBranch, Info, Layers,
# Lightbulb, Server, Shield, Wrench, XCircle, etc.

# =============================================================================
# USAGE INSTRUCTIONS
# =============================================================================

# 1. Copy this template
# 2. Fill in your content following the structure
# 3. Use the component types and options defined above
# 4. Reference the unified layout specification for styling details
# 5. Provide the completed file for rendering into React components

# =============================================================================
# END OF TEMPLATE
# =============================================================================
```

---

## Quick Reference

### Common Section Types

| Section Type | Use Case | Layout |
|--------------|----------|--------|
| `hero` | Page introduction, welcome | Centered, large text |
| `story_card` | Analogies, comparisons | Card with highlights |
| `comparison_grid` | Feature comparison | 2-3 column grid |
| `feature_grid` | Product features, pillars | 2-4 column grid |
| `vertical_flow` | Process, architecture layers | Stacked with arrows |
| `architecture_columns` | Technical diagrams | 3 column layout |
| `flow_steps` | Sequential process | Numbered steps |
| `info_card` | Supporting information | Single card |
| `alert` | Warnings, tips, info | Colored alert box |
| `detail_cards` | Expandable content | Accordion-style |
| `cta_button` | Navigation, actions | Button component |

### Color Usage

- **Brand colors**: Use for primary actions, headers, brand moments
- **Functional colors**: Use for status (success, warning, error, info)
- **Category colors**: Use for component identity, icons, badges
- **Neutral colors**: Use for text, backgrounds, borders

### Best Practices

1. **Consistent Structure**: Follow the page types (intro, comparison, features, flow)
2. **Visual Hierarchy**: Use heading sizes appropriately (H1 → H5)
3. **Color Meaning**: Use colors consistently (red=negative, green=positive)
4. **Spacing**: Let sections breathe with proper gaps
5. **Icons**: Choose meaningful icons that support the content
6. **Navigation**: Always provide clear next steps or navigation
7. **Accessibility**: Ensure proper contrast and semantic structure

---

**Template Version:** 1.0
**Compatible With:** BSG Unified Layout Specification v1.1
**Last Updated:** December 16, 2024
