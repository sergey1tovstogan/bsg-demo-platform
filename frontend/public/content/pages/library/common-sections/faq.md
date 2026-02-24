# Library Page: Frequently Asked Questions

**Library Category:** Common Sections
**Audience:** All levels
**Reusable:** Yes

---

```yaml
page:
  id: "faq"

  titles:
    page_header: "Frequently Asked Questions"
    menu_title: "FAQ"
    agenda_title: "FAQ"
    breadcrumb: "FAQ"

  description:
    short: "Common questions"
    long: "Answers to frequently asked questions"

  metadata:
    author: "Support Team"
    version: "1.0"
    last_updated: "2024-12-17"
    tags: ["faq", "support", "library"]
    difficulty: "beginner"

  parent: null
  icon: "HelpCircle"

sections:
  - type: "hero"
    heading: "Frequently Asked Questions"
    subtitle: "Find answers to common questions"

  - type: "accordion"
    allow_multiple: false
    items:
      - title: "How do I get started?"
        content: |
          Getting started is easy:
          1. Sign up for an account
          2. Follow the quick start guide
          3. Create your first project
          4. Explore the features

      - title: "What payment methods do you accept?"
        content: |
          We accept:
          - Credit cards (Visa, Mastercard, Amex)
          - PayPal
          - Bank transfers (for enterprise plans)

      - title: "Can I try before buying?"
        content: |
          Yes! We offer a 14-day free trial with full access to all features.
          No credit card required.

      - title: "How do I contact support?"
        content: |
          You can reach our support team:
          - Email: support@example.com
          - Live chat (available in the dashboard)
          - Phone: 1-800-SUPPORT

      - title: "Is my data secure?"
        content: |
          Absolutely. We use:
          - End-to-end encryption
          - SOC 2 Type II compliance
          - Regular security audits
          - Automatic backups

      - title: "Can I cancel anytime?"
        content: |
          Yes, you can cancel your subscription at any time.
          No cancellation fees. Pro-rated refunds available.

  - type: "text_with_links"
    content: |
      Still have questions? [[Contact Support|https://support.example.com]]

navigation:
  show_breadcrumbs: true
  show_page_tree: true
  back_to_agenda_button: true
```
