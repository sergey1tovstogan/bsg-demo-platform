# Provider Documentation — BSG Demo Platform

This folder contains **provider-specific documentation** for external platforms and managed services used by the BSG Demo Platform.

Provider documentation explains:
- how external services are used by the platform
- what responsibilities are delegated to those services
- where configuration and permissions are applied
- provider-specific constraints and expectations

These documents are **authoritative within their scope** and are intended to be referenced by:
- developers
- solution engineers
- operators
- tooling (Claude / Cursor)

_Last updated: 2025-12-18_

---

## How to Use This Folder

Start with the document that matches what you need:

### ☁️ Azure runtime & operations
- **AZURE_CONFIGURATION.md**  
  Operational setup for running the platform in Azure:
  - Managed Identity
  - Role assignments
  - App Service configuration
  - Verification checklist

### 🧠 Azure architecture & rationale
- **AZURE_SERVICES_EXPLAINED.md**  
  Conceptual explanation of why specific Azure services are used:
  - App Service
  - Static hosting
  - Cosmos DB (MongoDB API)
  - Event Hub  
  This file is intended for onboarding and demos, not setup.

### 🔄 Event streaming (core capability)
- **EVENTHUB.md**  
  Authoritative documentation for Azure Event Hub usage:
  - role in the platform
  - configuration variables (names only)
  - adapter expectations
  - runtime behavior and constraints
  - provider-specific troubleshooting

---

## Scope & Boundaries (Important)

Provider documentation:
- describes **external services**
- focuses on **configuration, permissions, and behavior**
- avoids internal business logic and UI concerns

Provider documentation does NOT:
- define internal architecture → see `ARCHITECTURE.md`
- define adapter rules → see `CONNECTIVITY.md`
- define environment variable contracts → see `CONFIGURATION.md`
- duplicate generic troubleshooting → see `TROUBLESHOOTING.md`

If information belongs to one of those areas, it should live there instead.

---

## Security Rules

- Provider docs must **never contain real secrets**
- Connection strings, SAS keys, tokens, and credentials must not appear
- Use placeholders and variable names only
- Secrets belong in:
  - Azure App Service settings
  - GitHub Actions secrets
  - Local `.env` files (git-ignored)

Any provider documentation that leaks secrets is considered invalid.

---

## Adding a New Provider

When introducing a new external service:

1. Create a new provider document in this folder  
   Example:
   ```
   docs/providers/KAFKA.md
   ```

2. Clearly define:
   - the provider’s role in the platform
   - required configuration (names only)
   - authentication model
   - constraints and caveats

3. Ensure references are added (if relevant) to:
   - CONNECTIVITY.md
   - CONFIGURATION.md
   - TROUBLESHOOTING.md

Do not duplicate content from existing provider documents.

---

## Relationship to Other Documentation

- CONNECTIVITY.md  
  Defines adapter-only access to providers

- CONFIGURATION.md  
  Defines environment variable contracts

- SECURITY.md  
  Defines identity and secret handling rules

- OBSERVABILITY.md  
  Defines logging and monitoring expectations

- TROUBLESHOOTING.md  
  Defines incident-driven diagnosis

---
Last updated: 2025-12-18
Maintained by the BSG Team