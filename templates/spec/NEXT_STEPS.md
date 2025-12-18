# Roadmap: Next Steps

Building upon the successful completion of Phase 2B, the following phases delineate the remaining work to reach full production maturity.

## 🚀 Phase 2C: Advanced Rendering & polish
**Focus**: Completing the remaining section types and enhancing the visual feedback.

1.  **Remaining Section Types (4/31)**:
    - Implement `LoadingSection`.
    - Implement `AccordionSection` variants.
    - Implement `StatItem` and `ProgressSection` refinements.
2.  **Animation Hooks**:
    - Create a dedicated `useTemplateAnimation` hook to handle the `settings.default_animation` from the card definition.
    - Synchronize transitions between Page changes.
3.  **Search & Filtering**:
    - Implement the optional `enable_search` logic in `NavigationProvider` to allow users to search through the `pagesMap`.

## 📦 Phase 3: Migration & Content Production
**Focus**: Validating the system with real-world complex cards.

1.  **Observability Card Migration**:
    - Convert existing hard-coded observability components into the new MD/YAML template format.
    - Verify that all complex interactions (Diagrams, Code Blocks) are preserved.
2.  **Library Expansion**:
    - Build out the `/content/pages/library/` with at least 5 variants for each category (Intro, Architecture, Best Practices).

## 🎨 Phase 4: Visual Gallery & Creator Tools
**Focus**: Empowering non-technical content creators.

1.  **Template Gallery**:
    - Build the `TemplateGallery.tsx` component as defined in the plan.
    - Include a "Live Preview" feature where authors can paste YAML and see the rendered section immediately.
2.  **Hot-Reload for Content**:
    - Implement a WebSocket listener or polling mechanism for the development server to refresh the `CardRenderer` when `.md` files in the `templates/` folder change.

---

## ✅ Immediate Action Items
- [ ] User Review of Phase 2B Foundations.
- [ ] Approval of `IMPLEMENTATION_STATUS_PHASE_2B.md`.
- [ ] Kickoff for Phase 2C (Advanced Rendering).
