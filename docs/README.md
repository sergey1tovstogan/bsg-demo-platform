# BSG Demo Platform — Documentation Index (Authoritative)

This directory is the **single source of truth** for architecture, UX, APIs, configuration,
and operational behavior of the BSG Demo Platform.

All contributors — including Claude and Cursor — MUST reference the files in this directory
instead of restating, guessing, or inventing system behavior.

_Last updated: 2026-01-16_

---

## How to Use This Documentation (IMPORTANT)

Before implementing or changing anything, identify **what kind of change** you are making
and consult the corresponding documentation domain.

### Quick routing guide

- **System design, patterns, or boundaries** → `ARCHITECTURE.md`
- **Repository layout & ownership** → `PROJECT_STRUCTURE.md`
- **UX, layout, content, or templates** → `UX/README.md`
- **User flows, demos, or feature usage** → `USER_GUIDE.md`, `USAGE.md`
- **Cloud providers & managed services** → `providers/README.md`
- **Configuration & environment variables** → `CONFIGURATION.md`
- **Security, auth, secrets** → `SECURITY.md`
- **Logs, health, monitoring** → `OBSERVABILITY.md`
- **Errors or runtime failures** → `TROUBLESHOOTING.md`

If a topic is not covered, **propose a documentation update before implementing changes**.

---

## 📚 Documentation Domains

### 🧱 Core Platform Documentation
Authoritative technical and operational rules.

- **ARCHITECTURE.md**  
  System architecture, component boundaries, adapter patterns, and core principles.

- **COMPONENTS.md**  
  Domain components, ownership rules, and responsibilities.

- **CONNECTIVITY.md**  
  Adapter-only access rules for external systems.

- **DATABASE.md**  
  Data ownership, collections, and persistence expectations.

- **API_CONVENTIONS.md**  
  API structure, error envelopes, and authentication conventions.

---

### 🎨 UX & Design
Authoritative rules and references for layout, content, and presentation.

- **UX/README.md**  
  Entry point for all UX-related documentation.

- **UX/LAYOUT_SPECIFICATION.md**  
  Non-negotiable layout, spacing, typography, and accessibility rules.

- **UX/DESIGN_SYSTEM.md**  
  Design language, component intent, and interaction philosophy.

- **UX/CONTENT_MODEL.md**  
  Content hierarchy, metadata, and navigation model.

- **UX/TEMPLATE_LIBRARY.md**  
  Canonical page templates and authoring patterns.

- **UX/SHOWCASE.md**  
  Reference implementation and visual examples (non-authoritative).

---

### ☁️ Providers & Infrastructure
Documentation for external platforms and managed services.

- **providers/README.md**  
  Entry point for provider-specific documentation.

- **providers/AZURE_CONFIGURATION.md**  
  Operational Azure setup, identity, permissions, and verification.

- **providers/AZURE_SERVICES_EXPLAINED.md**  
  Conceptual explanation of why Azure services are used.

- **providers/EVENTHUB.md**  
  Event Hub as a core platform capability.

---

### ▶️ Usage & Demos
How the platform is used and demonstrated.

- **USER_GUIDE.md**  
  Conceptual and functional overview for demos and onboarding.

- **USAGE.md**  
  Quick, task-oriented usage reference.

---

### ⚙️ Local Development & Operations
Running and operating the platform.

- **LOCAL_DEV.md**  
  Canonical local development workflow.

- **DEPLOYMENT.md**  
  Deployment architecture, procedures, and verification.

- **DEBUGGING.md**  
  Comprehensive guide to accessing and analyzing logs in production.

- **CONFIGURATION.md**  
  Environment variable contract and configuration sources.

- **SECURITY.md**  
  Authentication, authorization, and secret handling rules.

- **OBSERVABILITY.md**  
  Logging, health checks, and monitoring expectations.

- **TROUBLESHOOTING.md**  
  Incident-driven diagnosis and recovery guidance.

---

## Documentation Rules (Non‑Negotiable)

- Each document has **one clear responsibility**
- **No overlap** between documents
- **Rules live once**, examples never redefine rules
- Documentation must be updated whenever:
  - behavior changes
  - configuration changes
  - setup changes

If documentation and code disagree, documentation must be updated
or the deviation must be explicitly documented.

---

## 🧹 Documentation Hygiene

This documentation set is intentionally lean and curated.

Practices enforced:
- No placeholder or empty files
- No secrets or credentials in docs
- Archived material lives in `docs/archive/` and is non-authoritative
- Historical files must never be referenced as a source of truth

---

## 📝 Contributing to Documentation

When adding or updating documentation:

1. Choose the correct domain (Core, UX, Providers, Operations)
2. Use clear, descriptive filenames
3. Add the file to this index with a short description
4. Update docs whenever behavior, configuration, or setup changes
5. Remove outdated or duplicate documentation

See:
- **CONTRIBUTING.md**

---
Last updated: 2026-01-16
Maintained by the BSG Team