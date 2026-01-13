BSG Demo Platform — CONTRIBUTING (Authoritative)

Purpose
-------
This document defines how to contribute to the BSG Demo Platform.
It aligns human workflows with the project’s architectural rules and the Claude/Cursor working rules.

All contributors (human or tool-assisted) MUST follow this document.

_Last updated: 2025-12-18_

---

Guiding Principles
------------------
- Prefer clarity over cleverness
- Reuse existing functionality before creating new
- Keep documentation in sync with behavior
- Optimize for demo stability and predictability

---

Branching & Workflow
--------------------
Recommended workflow:
- `main` — stable, demo-ready
- `develop` — active development and integration
- feature branches — short-lived, focused changes

Branch naming (examples):
- `feat/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `chore/<short-description>`

Rules:
- Keep changes small and focused
- Avoid long-lived feature branches
- Rebase or merge frequently to reduce drift

---

Commits
-------
Commit messages should be clear and scoped.

Recommended format:
- `feat: add event hub consumer adapter`
- `fix: correct component_id mapping`
- `docs: update LOCAL_DEV instructions`
- `chore: clean up unused scripts`

Rules:
- One logical change per commit where possible
- Do not mix refactors with functional changes unless necessary

---

Pull Requests
-------------
Before opening a PR:
- Ensure the code builds and runs locally
- Ensure existing demos still function
- Ensure documentation is updated if behavior/config/setup changed

PR description should include:
- What changed
- Why it changed
- Which components/adapters are affected
- Any assumptions that need confirmation

---

Definition of Done (Mandatory)
------------------------------
A change is only considered complete when ALL are true:

- Builds and runs locally using documented steps
- External connectivity uses adapters (no direct clients in business logic)
- Documentation is updated if behavior, configuration, or setup changed
- Naming, folders, and API patterns are consistent with existing components

If any item cannot be satisfied, state why explicitly.

---

File & Folder Hygiene (Mandatory)
---------------------------------
The repository structure is part of the product.
New files MUST be placed in the correct location, and contributors should reduce structural drift over time.

Authoritative file placement rules:
- `docs/PROJECT_STRUCTURE.md`

Rules:
- Do not introduce new “floating” scripts or assets in package roots.
- If you touch a misplaced file as part of a change, **move it to the correct location** in the same PR (or add a follow-up PR immediately).
- Keep moves mechanical: move + update imports/paths + verify tests/start scripts.

Backend expectations:
- One-off runnable scripts belong in `backend/scripts/`
- Functional backend code belongs under `backend/app/<subpackage>/` (api, services, adapters, etc.)
- Avoid placing modules directly under `backend/app/` unless they are package bootstrap files

Frontend expectations:
- UI-used images/icons/fonts belong in `frontend/src/assets/`
- Publicly served static files belong in `frontend/public/` (or subfolders)
- No images or media at `frontend/` root

---

UX & Design Changes (Mandatory)
-------------------------------
Any change affecting **layout, UI components, content structure, or page composition** MUST:

- Follow **UX/LAYOUT_SPECIFICATION.md** for all layout and visual rules
- Adhere to **UX/DESIGN_SYSTEM.md** for component intent and interaction patterns
- Respect **UX/CONTENT_MODEL.md** for content hierarchy and metadata
- Use templates from **UX/TEMPLATE_LIBRARY.md** for page authoring
- Update UX documentation if behavior, structure, or presentation changes

Rules:
- Content authors must not introduce layout or styling rules
- Examples and showcases do not redefine UX rules
- UX rule changes must be explicit and documented

---

Architecture & Code Rules (Summary)
-----------------------------------
These are enforced by documentation and tooling:

- Follow `ARCHITECTURE.md` for system structure
- Follow `COMPONENTS.md` for component boundaries and naming
- Follow `CONNECTIVITY.md` for adapters and external access
- Follow `API_CONVENTIONS.md` for endpoint structure
- Follow `DATABASE.md` for data ownership and queries
- Follow `SECURITY.md` for auth, secrets, and safe handling
- Follow `OBSERVABILITY.md` for logging and health checks
- Follow `LOCAL_DEV.md` for local workflows

Do not invent patterns that contradict these documents.

---

Documentation Expectations
--------------------------
Documentation is a first-class artifact.

Rules:
- If code behavior changes, update docs in the same PR
- Do not leave TODO or placeholder documentation
- Avoid duplicating rules across documents
- Prefer linking to authoritative docs instead of restating content

---

Adapter & Reuse Expectations
----------------------------
Before adding new functionality:
1) Search for existing adapters, services, or utilities
2) Reuse or extend where appropriate
3) Avoid parallel implementations

If new adapters are required:
- Propose the adapter first
- Follow patterns defined in CONNECTIVITY.md
- Update documentation if rules change

---

Testing Expectations
--------------------
Minimum expectations:
- Unit tests for non-trivial logic
- Mock adapters for service-level tests
- No tests against production systems

Rules:
- Tests must be deterministic
- Do not rely on manual test steps alone for critical paths

---

What Not to Do
--------------
- Do not hardcode credentials, URLs, or tokens
- Do not bypass adapters “just to get it working”
- Do not couple components directly
- Do not change architecture silently
- Do not merge broken demos

---

Tooling & AI Usage
------------------
This repository uses Claude and Cursor as development tools.

Rules:
- Claude/Cursor must follow `claude.md` rules
- Generated code is subject to the same standards as human-written code
- Do not accept generated output blindly—review and validate

---

Getting Help
------------
If unsure:
- Check the relevant document under `/docs`
- Search existing code for patterns
- Ask for clarification before guessing

---
Last updated: 2025-12-18
Maintained by the BSG Team
