# Member 1: Frontend Developer (UI/UX Focus)

**Branch Prefix:** `feature/ui-*`

---

## Your Mission

Build the React application foundation, layout structure, and common UI components that the rest of the team will use.

---

## Your Territory (Files You Own)

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/          ← YOU OWN THIS
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navigation.tsx
│   │   └── Common/          ← YOU OWN THIS
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Loader.tsx
│   │       └── ErrorBoundary.tsx
│   ├── pages/               ← YOU OWN THIS
│   ├── styles/              ← YOU OWN THIS
│   ├── utils/               ← YOU OWN THIS
│   └── services/api.ts      ← YOU CREATE BASE, OTHERS ADD
```

---

## Week 1 Tasks (Days 1-7)

### Day 1-2: Project Setup
- [ ] Initialize React project with Vite + TypeScript
  ```bash
  npm create vite@latest frontend -- --template react-ts
  cd frontend
  npm install
  ```
- [ ] Install and configure Tailwind CSS
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [ ] Install dependencies
  ```bash
  npm install react-router-dom axios react-query
  npm install -D @types/react-router-dom
  ```
- [ ] Create folder structure (components, pages, services, styles, utils)
- [ ] Set up base CSS with Tailwind imports
- [ ] Create Git branch: `feature/ui-project-setup`

### Day 3-4: Layout Components
- [ ] Create `Header.tsx` with logo and navigation
- [ ] Create `Footer.tsx` with copyright and links
- [ ] Create `Navigation.tsx` with route links (Home, Content, Demos, Videos, Admin)
- [ ] Create `Sidebar.tsx` for filters (optional, can be placeholder)
- [ ] Make layout responsive (mobile, tablet, desktop)
- [ ] Create Git branch: `feature/ui-layout-components`

### Day 5-6: Common Components
- [ ] Create `Button.tsx` (primary, secondary, variants)
- [ ] Create `Card.tsx` (reusable card component with title, description, footer)
- [ ] Create `Modal.tsx` (popup modal with close button)
- [ ] Create `Loader.tsx` (loading spinner)
- [ ] Create `ErrorBoundary.tsx` (error handling wrapper)
- [ ] Create Git branch: `feature/ui-common-components`

### Day 7: Pages & Routing
- [ ] Set up React Router with routes
- [ ] Create `HomePage.tsx` (landing page)
- [ ] Create `ContentPage.tsx` (placeholder for Member 3)
- [ ] Create `DemoPage.tsx` (placeholder for Member 3)
- [ ] Create `VideoPage.tsx` (placeholder for Member 4)
- [ ] Create `AdminPage.tsx` (placeholder for Member 3)
- [ ] Create `NotFoundPage.tsx` (404 page)
- [ ] Create Git branch: `feature/ui-pages`

---

## Week 2 Tasks (Days 8-14)

### Day 8-9: API Integration
- [ ] Create `services/api.ts` with axios configuration
  ```typescript
  import axios from 'axios';

  export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  });
  ```
- [ ] Add interceptors for auth token (coordinate with Member 2)
- [ ] Test API connection with Member 2's endpoints
- [ ] Create Git branch: `feature/ui-api-integration`

### Day 10-11: Page Implementation
- [ ] Implement HomePage with sections (Content, Demos, Videos previews)
- [ ] Connect pages to actual components from Members 3 & 4
- [ ] Add loading states using `Loader` component
- [ ] Add error states using `ErrorBoundary`
- [ ] Create Git branch: `feature/ui-page-implementation`

### Day 12-13: Polish & Refinement
- [ ] Add responsive design improvements
- [ ] Implement dark mode toggle (optional)
- [ ] Add animations and transitions
- [ ] Optimize performance (lazy loading, code splitting)
- [ ] Write component documentation (JSDoc comments)
- [ ] Create Git branch: `feature/ui-polish`

### Day 14: Testing & Integration
- [ ] Test all routes
- [ ] Test responsive design on mobile, tablet, desktop
- [ ] Fix any integration bugs with Member 3 & 4 components
- [ ] Update README with frontend setup instructions
- [ ] Final PR review and merge

---

## Dependencies & Coordination

### You Depend On:
- **Member 2** (Backend): API endpoints for data fetching
- **Member 5** (DevOps): Docker setup, environment configuration

### Others Depend On You:
- **Member 3** (Demo/Content): Needs your Layout and Common components
- **Member 4** (Video): Needs your Layout and Common components
- **Everyone**: Needs your base React setup and routing

### Coordination Points:
- **Day 3**: Share Common component props with Members 3 & 4
- **Day 5**: Coordinate `api.ts` structure with Members 2, 3, 4
- **Day 7**: Ensure routing structure works for all page types
- **Day 10**: Integration testing with Members 3 & 4

---

## Git Workflow

### Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/ui-your-feature-name
```

### Daily Work
```bash
# Make changes
git add .
git commit -m "feat: description of what you did"
git push origin feature/ui-your-feature-name
```

### Create Pull Request
1. Go to GitHub → Pull Requests → New PR
2. Select: `develop` ← `feature/ui-your-feature-name`
3. Title: `[Frontend] Brief description`
4. Add description of changes
5. Request review from Member 5 + one peer

### After PR Approved
```bash
# Member 5 or you will merge
# Then delete the branch
git branch -d feature/ui-your-feature-name
git push origin --delete feature/ui-your-feature-name
```

---

## Code Style Guidelines

### Component Structure
```typescript
// MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  description?: string;
  onClick?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  description,
  onClick
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="text-gray-600">{description}</p>}
      {onClick && (
        <button onClick={onClick} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Click Me
        </button>
      )}
    </div>
  );
};
```

### Naming Conventions
- Components: PascalCase (e.g., `Button.tsx`)
- Functions: camelCase (e.g., `handleClick`)
- CSS classes: Tailwind utility classes
- Files: PascalCase for components, camelCase for utilities

---

## Tools & Extensions

### Required VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier - Code formatter
- Auto Import

### Useful Commands
```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## Communication

### Daily Standup Template
```
Member 1 (Frontend):
✅ Yesterday: [what you completed]
🔨 Today: [what you're working on]
⚠️  Blockers: [any issues or dependencies]
```

### When to Ask for Help
- **Immediate (Slack #blockers)**: Can't start work, build broken, blocked
- **Within 4 hours (Slack #frontend)**: Questions about architecture, need review
- **Daily standup**: General updates, non-urgent questions

---

## Success Checklist

### Week 1 Done When:
- [ ] React app runs successfully (`npm run dev`)
- [ ] All Layout components complete and responsive
- [ ] All Common components complete with TypeScript types
- [ ] Basic routing works for all pages
- [ ] Merged at least 3 PRs to develop

### Week 2 Done When:
- [ ] All pages connected to Member 3 & 4 components
- [ ] API integration working
- [ ] Responsive on mobile, tablet, desktop
- [ ] No console errors or warnings
- [ ] README updated with setup instructions

---

## Quick Reference

### File Structure You Create
```
frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/
    │   ├── Layout/
    │   │   ├── Header.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── Navigation.tsx
    │   └── Common/
    │       ├── Button.tsx
    │       ├── Card.tsx
    │       ├── Modal.tsx
    │       ├── Loader.tsx
    │       └── ErrorBoundary.tsx
    ├── pages/
    │   ├── HomePage.tsx
    │   ├── ContentPage.tsx
    │   ├── DemoPage.tsx
    │   ├── VideoPage.tsx
    │   ├── AdminPage.tsx
    │   └── NotFoundPage.tsx
    ├── services/
    │   └── api.ts
    ├── types/
    │   └── common.ts
    ├── utils/
    │   └── helpers.ts
    └── styles/
        └── index.css
```

---

**Remember:** You're building the foundation that everyone else will use. Quality and consistency are key!

**Questions?** Ask in #frontend or ping @Member5 (Tech Lead)

**Good luck! 🚀**
