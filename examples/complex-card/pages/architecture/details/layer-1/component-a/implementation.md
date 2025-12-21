# Complex Card Example - Implementation (Level 5)

```yaml
page:
  id: "implementation"

  titles:
    page_header: "Implementation Details"
    menu_title: "Implementation"
    agenda_title: "Implementation Details"
    breadcrumb: "Implementation"

  description:
    short: "Implementation details"
    long: "Code-level implementation details for authentication"

  metadata:
    author: "Engineering Team"
    tags: ["implementation", "code", "authentication"]
    difficulty: "expert"
    estimated_time: "10 minutes"

  parent: "component-a"  # ← Level 5 (child of component-a)
  icon: "Code"

sections:
  - type: "hero"
    heading: "🎉 Level 5: Implementation Details"
    subtitle: "You've reached the deepest level!"

  - type: "alert"
    alert_type: "success"
    title: "Congratulations!"
    content: |
      **You are at Level 5!**

      **Full Path:**
      Home > Documentation > Architecture > Details > Layer 1 > Component A > Implementation

      **Breadcrumbs show:** Home > Documentation > Architecture > Details > Layer 1 > Component A > Implementation

      **Page tree shows:**
      - Level 1: Architecture
        - Level 2: Details
          - Level 3: Layer 1
            - Level 4: Component A
              - Level 5: Implementation ← YOU ARE HERE

  - type: "text"
    content: |
      This demonstrates that **creating 5-level navigation is easy** - just
      set the `parent` field in each page!

      No coding required. Pure YAML configuration.

  - type: "code_block"
    language: "typescript"
    code: |
      // Example authentication implementation
      async function authenticateUser(credentials: Credentials) {
        // 1. Validate input
        validateCredentials(credentials);

        // 2. Query database
        const user = await db.users.findOne({
          email: credentials.email
        });

        // 3. Verify password
        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        // 4. Generate session token
        if (valid) {
          return jwt.sign({ userId: user.id }, SECRET);
        }

        throw new AuthenticationError();
      }

  - type: "expandable_card"
    trigger: "click_icon"
    icon: "Info"
    collapsed_title: "Technical Specifications"
    collapsed_text: "Click for technical details..."
    expanded_content: |
      **Technology Stack:**
      - JWT for token generation
      - bcrypt for password hashing
      - PostgreSQL for user storage
      - Redis for session caching

      **Performance:**
      - < 50ms authentication time
      - 10,000+ auth/sec capacity
      - 99.99% uptime

  - type: "text_with_links"
    content: |
      **Navigation Options:**
      - Use breadcrumbs to jump to any ancestor level
      - Use back button to go to [[Component A|component-a]]
      - Use page tree to navigate anywhere
      - Use "Back to Agenda" to return to start

sub_pages: []  # No children - deepest level!

navigation:
  show_breadcrumbs: true
  show_back_button: true
  show_page_tree: true
  back_to_agenda_button: true
  show_next_previous: false  # Leaf node
```
