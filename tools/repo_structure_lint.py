#!/usr/bin/env python3
"""
Repo Structure Lint — BSG Demo Platform

Fails if files are placed in forbidden locations.
Intended to be run via pre-commit or CI.

Rules enforced:
- No images/media at frontend root
- No loose Python files under backend/ (must be under app/, scripts/, tests/ confirming exceptions)
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

errors = []

# ---- Frontend rules ----
frontend = ROOT / "frontend"
if frontend.exists():
    for p in frontend.iterdir():
        if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".svg"}:
            errors.append(f"❌ Frontend root asset not allowed: {p}")

# ---- Backend rules ----
backend = ROOT / "backend"
if backend.exists():
    for p in backend.iterdir():
        if p.is_file() and p.suffix == ".py":
            if p.name not in {"__init__.py"}:
                errors.append(f"❌ Loose Python file under backend/: {p}")

# ---- Result ----
if errors:
    print("Repository structure violations found:\n")
    for e in errors:
        print(e)
    print("\nSee docs/PROJECT_STRUCTURE.md for placement rules.")
    sys.exit(1)

print("✅ Repo structure check passed.")
