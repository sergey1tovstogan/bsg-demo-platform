# Member 3: Demo & Content Specialist

**Branch Prefix:** `feature/content-*` or `feature/demo-*`

---

## Your Mission

Build the interactive demo player, content viewer with markdown support, and admin editors for content and demo management.

---

## Your Territory (Files You Own)

```
frontend/src/components/
├── Demo/                    ← YOU OWN ALL
│   ├── DemoPlayer.tsx
│   ├── DemoCard.tsx
│   ├── DemoIframe.tsx
│   ├── DemoControls.tsx
│   └── CodeEditor.tsx
├── Content/                 ← YOU OWN ALL
│   ├── ContentCard.tsx
│   ├── ContentViewer.tsx
│   ├── ContentList.tsx
│   └── MarkdownRenderer.tsx
└── Admin/                   ← YOU OWN CONTENT & DEMO PARTS
    ├── ContentEditor.tsx
    └── DemoEditor.tsx

backend/app/services/
├── content_service.py       ← YOU OWN
└── demo_service.py          ← YOU OWN

frontend/src/services/
├── contentService.ts        ← YOU OWN
└── demoService.ts           ← YOU OWN
```

---

## Week 1 Tasks (Days 1-7)

### Day 1-2: Research & Dependencies
- [ ] Wait for Member 1 to complete base React setup
- [ ] Research demo player libraries (consider Monaco Editor or CodeMirror for code editing)
- [ ] Install dependencies
  ```bash
  cd frontend
  npm install react-markdown remark-gfm  # For markdown
  npm install @monaco-editor/react       # For code editor (OR CodeMirror)
  npm install react-syntax-highlighter   # For code highlighting
  ```
- [ ] Review API contracts from Member 2
- [ ] Create Git branch: `feature/content-demo-setup`

### Day 3-4: Demo Player Components
- [ ] Create `DemoPlayer.tsx` - Main demo container
  ```typescript
  interface DemoPlayerProps {
    html: string;
    css: string;
    js: string;
  }
  ```
- [ ] Create `DemoIframe.tsx` - Sandboxed iframe for demo rendering
  - Inject HTML/CSS/JS into iframe
  - Add sandbox attributes for security
  - Handle iframe communication
- [ ] Create `DemoControls.tsx` - Controls for demo (reset, fullscreen, toggle view)
- [ ] Create `DemoCard.tsx` - Demo preview card for list view
- [ ] Test demo player with sample HTML/CSS/JS
- [ ] Create Git branch: `feature/demo-player`

### Day 5-6: Content Viewer Components
- [ ] Create `ContentViewer.tsx` - Main content display component
  - Use react-markdown for rendering
  - Add syntax highlighting for code blocks
  - Support for images, tables, lists
- [ ] Create `MarkdownRenderer.tsx` - Reusable markdown component
- [ ] Create `ContentCard.tsx` - Content preview card for list view
  - Title, description, category, tags
  - Use Member 1's Card component as base
- [ ] Create `ContentList.tsx` - Grid/list view of content cards
- [ ] Test with sample markdown content
- [ ] Create Git branch: `feature/content-viewer`

### Day 7: Services Layer
- [ ] Create `frontend/src/services/contentService.ts`
  ```typescript
  import { api } from './api';
  import { Content } from '../types/content';

  export const contentService = {
    getAll: async (page: number = 1, limit: number = 10) => {
      const response = await api.get(`/content?page=${page}&limit=${limit}`);
      return response.data;
    },

    getById: async (id: number) => {
      const response = await api.get(`/content/${id}`);
      return response.data;
    },

    create: async (content: Partial<Content>) => {
      const response = await api.post('/content', content);
      return response.data;
    },

    update: async (id: number, content: Partial<Content>) => {
      const response = await api.put(`/content/${id}`, content);
      return response.data;
    },

    delete: async (id: number) => {
      await api.delete(`/content/${id}`);
    }
  };
  ```
- [ ] Create `frontend/src/services/demoService.ts` (similar structure)
- [ ] Create TypeScript types in `frontend/src/types/content.ts` and `demo.ts`
- [ ] Test API integration with Member 2's endpoints
- [ ] Create Git branch: `feature/content-demo-services`

---

## Week 2 Tasks (Days 8-14)

### Day 8-9: Code Editor Component
- [ ] Create `CodeEditor.tsx` using Monaco Editor or CodeMirror
  - Support HTML, CSS, JavaScript syntax highlighting
  - Tab support for switching between HTML/CSS/JS
  - Real-time preview updates
  - Code formatting button
  - Copy to clipboard functionality
- [ ] Integrate CodeEditor with DemoPlayer
- [ ] Test editor with various code samples
- [ ] Create Git branch: `feature/code-editor`

### Day 10-11: Admin Editors
- [ ] Create `ContentEditor.tsx` for admin panel
  - Markdown editor with live preview
  - Title, description, category inputs
  - Tags input (multi-select or chips)
  - Publish/unpublish toggle
  - Save and delete buttons
  - Connect to contentService
- [ ] Create `DemoEditor.tsx` for admin panel
  - Three-pane editor (HTML, CSS, JS)
  - Live demo preview
  - Title, description inputs
  - Tags input
  - Thumbnail upload (optional)
  - Save and delete buttons
  - Connect to demoService
- [ ] Add authentication check (admin only)
- [ ] Create Git branch: `feature/admin-editors`

### Day 12: Backend Services (Optional)
- [ ] Create `backend/app/services/content_service.py`
  - Add business logic for content operations
  - Markdown validation
  - Search functionality (optional)
- [ ] Create `backend/app/services/demo_service.py`
  - Code validation (check for malicious code)
  - HTML/CSS/JS sanitization
  - Demo preview generation
- [ ] Create Git branch: `feature/backend-services`

### Day 13-14: Polish & Integration
- [ ] Add loading states to all components
- [ ] Add error handling and user feedback
- [ ] Implement content pagination
- [ ] Implement demo pagination
- [ ] Add search/filter functionality
- [ ] Test full workflow (view, create, edit, delete)
- [ ] Fix integration bugs
- [ ] Write component documentation

---

## Dependencies & Coordination

### You Depend On:
- **Member 1** (Frontend): Layout components, Common components (Card, Button, Modal)
- **Member 2** (Backend): Content and Demo API endpoints

### Others Depend On You:
- **Member 1**: Needs your components for ContentPage and DemoPage

### Coordination Points:
- **Day 2**: Wait for Member 1's Common components
- **Day 3**: Coordinate Card component props with Member 1
- **Day 5**: Wait for Member 2's Content API
- **Day 7**: Wait for Member 2's Demo API
- **Day 10**: Integration testing with Members 1 & 2

---

## Git Workflow

### Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/content-your-feature-name
# or
git checkout -b feature/demo-your-feature-name
```

### Daily Work
```bash
# Make changes
git add .
git commit -m "feat: description of what you did"
git push origin feature/content-your-feature-name
```

### Create Pull Request
1. Go to GitHub → Pull Requests → New PR
2. Select: `develop` ← `feature/content-your-feature-name`
3. Title: `[Content] Brief description` or `[Demo] Brief description`
4. Add description of changes
5. Request review from Member 5 + Member 1

---

## Code Style Guidelines

### Demo Player Example
```typescript
import React, { useRef, useEffect } from 'react';

interface DemoIframeProps {
  html: string;
  css: string;
  js: string;
}

export const DemoIframe: React.FC<DemoIframeProps> = ({ html, css, js }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const document = iframeRef.current.contentDocument;
      if (document) {
        const content = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>${css}</style>
            </head>
            <body>
              ${html}
              <script>${js}</script>
            </body>
          </html>
        `;
        document.open();
        document.write(content);
        document.close();
      }
    }
  }, [html, css, js]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts"
      className="w-full h-full border-0"
      title="Demo Preview"
    />
  );
};
```

### Content Viewer Example
```typescript
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface ContentViewerProps {
  content: string;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({ content }) => {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter language={match[1]} {...props}>
                {String(children).replace(/\n$, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
```

---

## Tools & Extensions

### Required VS Code Extensions
- ES7+ React/Redux snippets
- Tailwind CSS IntelliSense
- ESLint
- Markdown Preview Enhanced

### Required Libraries
```bash
npm install react-markdown remark-gfm
npm install @monaco-editor/react
npm install react-syntax-highlighter
npm install @types/react-syntax-highlighter
```

---

## Security Considerations

### Demo Player Security
- **Sandbox iframe**: Always use `sandbox` attribute
- **Content Security Policy**: Restrict what demos can do
- **XSS Prevention**: Sanitize user input
- **No eval()**: Avoid using eval() for JS execution

```typescript
<iframe
  sandbox="allow-scripts allow-same-origin"
  sandbox="allow-scripts"  // More secure - no same-origin
  title="Demo Preview"
/>
```

### Content Security
- **Markdown sanitization**: Use safe markdown rendering
- **No inline scripts**: Don't allow `<script>` tags in markdown
- **Image sources**: Validate image URLs

---

## Communication

### Daily Standup Template
```
Member 3 (Demo/Content):
✅ Yesterday: [what you completed]
🔨 Today: [what you're working on]
⚠️  Blockers: [any issues or dependencies]
```

### When to Ask for Help
- **Member 1**: Questions about Common components, layout
- **Member 2**: Questions about API endpoints, data structure
- **#frontend channel**: General frontend questions
- **#blockers**: If you're stuck and can't proceed

---

## Success Checklist

### Week 1 Done When:
- [ ] Demo player working with sample HTML/CSS/JS
- [ ] Content viewer rendering markdown correctly
- [ ] DemoCard and ContentCard components complete
- [ ] Services layer connected to backend APIs
- [ ] All components using Member 1's Common components

### Week 2 Done When:
- [ ] Code editor fully functional
- [ ] Admin editors (Content & Demo) complete
- [ ] Full CRUD workflow working for both content and demos
- [ ] Integration with backend successful
- [ ] Security measures in place (iframe sandbox)

---

## Quick Reference

### Component Structure You Create

**Frontend:**
```
frontend/src/
├── components/
│   ├── Demo/
│   │   ├── DemoPlayer.tsx
│   │   ├── DemoCard.tsx
│   │   ├── DemoIframe.tsx
│   │   ├── DemoControls.tsx
│   │   └── CodeEditor.tsx
│   ├── Content/
│   │   ├── ContentCard.tsx
│   │   ├── ContentViewer.tsx
│   │   ├── ContentList.tsx
│   │   └── MarkdownRenderer.tsx
│   └── Admin/
│       ├── ContentEditor.tsx
│       └── DemoEditor.tsx
├── services/
│   ├── contentService.ts
│   └── demoService.ts
└── types/
    ├── content.ts
    └── demo.ts
```

**Backend:**
```
backend/app/services/
├── content_service.py
└── demo_service.py
```

---

**Remember:** You're creating the core user experience. Make it intuitive and delightful!

**Questions?** Ask in #frontend or ping @Member1 or @Member2

**Good luck! 🚀**
