BSG Demo Platform — USER GUIDE

Purpose
-------
This guide provides a **conceptual and functional overview** of the BSG Demo Platform
for users, demo presenters, and solution engineers.

It explains:
- What the platform is
- What each component does
- How the platform is typically used in demos

It does NOT:
- Document architecture rules (see ARCHITECTURE.md)
- Explain local setup steps (see LOCAL_DEV.md)
- Define configuration contracts (see CONFIGURATION.md)

_Last updated: 2025-12-18_

---

Overview
--------
The BSG Demo Platform is a unified environment for showcasing Temenos products,
architectures, and deployment patterns.

It consolidates:
- technical documentation
- demos and visualizations
- architecture explanations
- AI-assisted knowledge access

The platform is designed for **demo stability**, **reusability**, and **clarity**.

---

Platform Components
-------------------
Each platform area is modeled as a component.

Current components include:
- Integration
- Data Architecture
- Deployment
- Security
- Observability
- Design Time

Each component provides:
- curated content
- optional interactive demos
- a dedicated BSG‑Guru chatbot

Component rules and ownership:
- COMPONENTS.md

---

Typical Demo Flow
-----------------
A common demo sequence:
1. Start with Integration or Data Architecture
2. Explore documentation and diagrams
3. Run interactive demos (where available)
4. Use BSG‑Guru to answer deep-dive questions
5. Switch to Deployment for Azure analysis

This flow is flexible and adapts to audience needs.

---

BSG‑Guru Chatbot
----------------
BSG‑Guru is an AI-powered assistant scoped to the active component.

Capabilities:
- answers component-specific questions
- uses curated Temenos knowledge
- avoids cross-component confusion

If responses appear incorrect:
- verify configuration
- consult TROUBLESHOOTING.md

---

Azure Deployment Analyzer
-------------------------
The Deployment component can analyze Azure subscriptions to identify Temenos-related resources.

Key concepts:
- read-only analysis
- Managed Identity authentication
- no resource modification

Azure setup details:
- AZURE_CONFIGURATION.md

Known runtime differences:
- Some discovery features behave differently in cloud vs local

---

Security & Data Handling
-----------------------
The platform:
- uses JWT-based authentication
- does not expose secrets to the frontend
- follows least-privilege access principles

Authoritative security rules:
- SECURITY.md

---

Getting More Detail
------------------
For deeper or technical information:
- Architecture: ARCHITECTURE.md
- APIs: API_CONVENTIONS.md
- Data model: DATABASE.md
- Troubleshooting: TROUBLESHOOTING.md

---
Last updated: 2025-12-18
Maintained by the BSG Team