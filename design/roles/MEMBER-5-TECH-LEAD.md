# Member 5: Tech Lead / DevOps Engineer

**Branch Prefix:** `feature/devops-*`

---

## Your Mission

Lead the team, coordinate integration, set up infrastructure (Docker, CI/CD), handle deployment, and ensure code quality across all team members.

---

## Your Territory (Files You Own)

```
Root Level:
├── docker-compose.yml       ← YOU OWN
├── README.md                ← YOU OWN
├── .env.example             ← YOU OWN (coordinate updates)
├── .github/
│   └── workflows/           ← YOU OWN
│       └── ci.yml

deployments/                 ← YOU OWN ALL
├── docker/
│   ├── frontend.Dockerfile
│   └── backend.Dockerfile
├── nginx/
│   └── nginx.conf
└── scripts/
    ├── setup.sh
    └── deploy.sh

backend/
├── Dockerfile               ← YOU OWN
└── requirements.txt         ← YOU COORDINATE (others add via PR)

frontend/
├── Dockerfile               ← YOU OWN
├── vite.config.ts           ← YOU OWN
└── package.json             ← YOU COORDINATE (others add via PR)

design/                      ← YOU OWN
└── (all documentation)
```

---

## Week 1 Tasks (Days 1-7)

### Day 1-2: Project Initialization & Documentation
- [ ] Update root `README.md` with comprehensive documentation
  - Project overview
  - Tech stack
  - Team structure
  - Setup instructions (placeholder for now)
  - Development workflow
- [ ] Create `.env.example` for backend
  ```bash
  # Database
  DATABASE_URL=sqlite:///./bsg-demo.db

  # JWT Authentication
  JWT_SECRET_KEY=change-this-to-random-secret-key
  JWT_ALGORITHM=HS256
  JWT_EXPIRATION=3600

  # Admin Authentication
  ADMIN_PASSWORD_HASH=$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5oe2kBZOX7e

  # Cloud Storage (AWS S3)
  AWS_ACCESS_KEY_ID=your_access_key_id
  AWS_SECRET_ACCESS_KEY=your_secret_access_key
  AWS_REGION=us-east-1
  S3_BUCKET_NAME=bsg-demo-videos

  # CORS
  ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
  ```
- [ ] Create `.env.example` for frontend
  ```bash
  VITE_API_URL=http://localhost:8000/api/v1
  VITE_APP_NAME=BSG Demo Platform
  ```
- [ ] Create setup script `deployments/scripts/setup.sh`
- [ ] Create Git branch: `feature/devops-documentation`

### Day 3-4: Docker Configuration
- [ ] Create `backend/Dockerfile`
  ```dockerfile
  FROM python:3.11-slim

  WORKDIR /app

  # Install dependencies
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt

  # Copy application
  COPY . .

  # Expose port
  EXPOSE 8000

  # Run application
  CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
  ```
- [ ] Create `frontend/Dockerfile`
  ```dockerfile
  # Build stage
  FROM node:18-alpine AS build

  WORKDIR /app

  COPY package*.json ./
  RUN npm ci

  COPY . .
  RUN npm run build

  # Production stage
  FROM nginx:alpine

  COPY --from=build /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/conf.d/default.conf

  EXPOSE 80

  CMD ["nginx", "-g", "daemon off;"]
  ```
- [ ] Create `docker-compose.yml`
  ```yaml
  version: '3.8'

  services:
    backend:
      build:
        context: ./backend
        dockerfile: Dockerfile
      ports:
        - "8000:8000"
      environment:
        - DATABASE_URL=sqlite:///./data/bsg-demo.db
        - JWT_SECRET_KEY=${JWT_SECRET_KEY}
        - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
        - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
        - S3_BUCKET_NAME=${S3_BUCKET_NAME}
      volumes:
        - ./backend:/app
        - backend_data:/app/data
      command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

    frontend:
      build:
        context: ./frontend
        dockerfile: Dockerfile
      ports:
        - "5173:5173"
      environment:
        - VITE_API_URL=http://localhost:8000/api/v1
      volumes:
        - ./frontend:/app
        - /app/node_modules
      command: npm run dev -- --host 0.0.0.0

    db:
      image: postgres:15-alpine
      environment:
        - POSTGRES_USER=bsg_user
        - POSTGRES_PASSWORD=${DB_PASSWORD}
        - POSTGRES_DB=bsg_demo
      volumes:
        - postgres_data:/var/lib/postgresql/data
      ports:
        - "5432:5432"

  volumes:
    backend_data:
    postgres_data:
  ```
- [ ] Test Docker setup locally
- [ ] Create Git branch: `feature/devops-docker`

### Day 5-6: CI/CD Pipeline
- [ ] Create `.github/workflows/ci.yml`
  ```yaml
  name: CI/CD Pipeline

  on:
    push:
      branches: [main, develop]
    pull_request:
      branches: [main, develop]

  jobs:
    backend-tests:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3

        - name: Set up Python
          uses: actions/setup-python@v4
          with:
            python-version: '3.11'

        - name: Install dependencies
          run: |
            cd backend
            pip install -r requirements.txt
            pip install pytest pytest-cov

        - name: Run tests
          run: |
            cd backend
            pytest

        - name: Lint with flake8
          run: |
            cd backend
            pip install flake8
            flake8 app/ --count --select=E9,F63,F7,F82 --show-source --statistics

    frontend-tests:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3

        - name: Set up Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'

        - name: Install dependencies
          run: |
            cd frontend
            npm ci

        - name: Lint
          run: |
            cd frontend
            npm run lint

        - name: Build
          run: |
            cd frontend
            npm run build

    docker-build:
      runs-on: ubuntu-latest
      needs: [backend-tests, frontend-tests]
      if: github.ref == 'refs/heads/main'
      steps:
        - uses: actions/checkout@v3

        - name: Build Docker images
          run: |
            docker-compose build

        - name: Test Docker containers
          run: |
            docker-compose up -d
            sleep 10
            docker-compose ps
            docker-compose down
  ```
- [ ] Create Git branch: `feature/devops-ci-cd`

### Day 7: Nginx & Integration Testing
- [ ] Create `deployments/nginx/nginx.conf`
  ```nginx
  server {
      listen 80;
      server_name localhost;

      # Frontend
      location / {
          proxy_pass http://frontend:5173;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
      }

      # Backend API
      location /api {
          proxy_pass http://backend:8000;
          proxy_http_version 1.1;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```
- [ ] Test integration between frontend and backend
- [ ] Document integration issues in Slack
- [ ] Create Git branch: `feature/devops-nginx`

---

## Week 2 Tasks (Days 8-14)

### Day 8-9: Code Quality Tools
- [ ] Set up ESLint for frontend
  ```bash
  cd frontend
  npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
  ```
- [ ] Create `.eslintrc.json`
- [ ] Set up Black and Flake8 for backend
  ```bash
  cd backend
  pip install black flake8 mypy
  ```
- [ ] Create `backend/.flake8` config
- [ ] Create `backend/pyproject.toml` for Black
- [ ] Add pre-commit hooks (optional)
- [ ] Create Git branch: `feature/devops-code-quality`

### Day 10-11: Cloud Deployment Preparation
- [ ] Choose cloud platform (AWS, Azure, or GCP)
- [ ] Create deployment documentation
- [ ] Set up production environment variables
- [ ] Create deployment script `deployments/scripts/deploy.sh`
  ```bash
  #!/bin/bash
  set -e

  echo "🚀 Deploying BSG Demo Platform..."

  # Pull latest changes
  git pull origin main

  # Build Docker images
  docker-compose build

  # Stop existing containers
  docker-compose down

  # Start new containers
  docker-compose up -d

  echo "✅ Deployment complete!"
  ```
- [ ] Test deployment process
- [ ] Create Git branch: `feature/devops-deployment`

### Day 12-13: Integration Testing & Bug Fixes
- [ ] Coordinate full-stack integration test
  - Test frontend → backend communication
  - Test authentication flow
  - Test CRUD operations for Content, Demo, Video
  - Test file uploads
- [ ] Create integration test checklist
- [ ] Help team members resolve integration bugs
- [ ] Review all PRs and provide feedback
- [ ] Ensure all team members' code is merged to develop
- [ ] Create Git branch: `feature/devops-integration-testing`

### Day 14: Final Deployment & Documentation
- [ ] Deploy to cloud (staging environment)
- [ ] Verify all features work in production
- [ ] Update README with final setup instructions
- [ ] Create user documentation (how to use the platform)
- [ ] Create admin documentation (how to manage content)
- [ ] Prepare demo for stakeholders
- [ ] Celebrate with the team! 🎉

---

## Leadership Responsibilities

### Daily Standup (Facilitate)
- [ ] Schedule daily standup (15 min)
- [ ] Collect updates from all 5 members
- [ ] Identify blockers
- [ ] Assign help to blocked members
- [ ] Keep team motivated

**Template for facilitating:**
```
Good morning team! Daily standup time 🌅

Member 1 (Frontend - @member1):
Member 2 (Backend - @member2):
Member 3 (Demo/Content - @member3):
Member 4 (Video/Cloud - @member4):
Member 5 (Me):

Blockers to discuss:
[List any blockers that need immediate attention]
```

### Code Review
- [ ] Review ALL pull requests within 4 hours
- [ ] Ensure code quality standards
- [ ] Check for merge conflicts
- [ ] Approve or request changes
- [ ] Merge approved PRs to develop

**Review Checklist:**
- [ ] Code follows project structure
- [ ] No obvious bugs or security issues
- [ ] Tests included (if applicable)
- [ ] Documentation updated
- [ ] No merge conflicts

### Integration Coordination
- [ ] Monitor integration points (Day 3, 5, 7, 10)
- [ ] Facilitate communication between frontend and backend
- [ ] Resolve conflicts in shared files (router.py, package.json, etc.)
- [ ] Ensure API contracts are followed

### Conflict Resolution
- [ ] Mediate merge conflicts
- [ ] Make final decisions on architecture questions
- [ ] Help team members when stuck
- [ ] Escalate to stakeholders if needed

---

## Dependencies & Coordination

### You Depend On:
- **All Members**: Need their code to integrate and deploy

### Others Depend On You:
- **Everyone**: Docker setup, CI/CD, deployment, code reviews, conflict resolution

### Coordination Points:
- **Every Day**: Code reviews, standup facilitation
- **Day 3**: Ensure API contracts are agreed upon
- **Day 7**: First integration checkpoint
- **Day 10**: Full integration testing
- **Day 14**: Final deployment

---

## Git Workflow

### Your Daily Workflow
```bash
# Morning: Pull latest changes
git checkout develop
git pull origin develop

# Review PRs on GitHub
# Merge approved PRs

# Work on your DevOps tasks
git checkout -b feature/devops-your-task
# Make changes
git add .
git commit -m "feat: description"
git push origin feature/devops-your-task

# Create PR, get peer review, merge
```

### Helping with Merge Conflicts
```bash
# When team member has conflict
git checkout their-branch
git pull origin their-branch
git merge develop

# Fix conflicts in VS Code
# Test that everything works
git add .
git commit -m "fix: resolve merge conflicts"
git push origin their-branch

# Notify team member conflict is resolved
```

---

## Communication Guidelines

### Daily Standup Template
```
Member 5 (Tech Lead):
✅ Yesterday: [what you completed]
🔨 Today: [what you're working on]
⚠️  Blockers: [any issues]
📋 Team Status: [overall team progress update]
```

### When to Communicate
- **Immediately**: Deployment issues, critical bugs, build failures
- **Daily**: Standup updates, PR reviews
- **Weekly**: Team sync meeting, retrospective

### Communication Channels
- **#general**: Team announcements
- **#code-review**: PR reviews and feedback
- **#blockers**: Urgent issues
- **#devops**: Infrastructure and deployment
- **Direct messages**: One-on-one feedback

---

## Tools & Extensions

### Required Tools
- Docker Desktop
- Git
- VS Code
- GitHub account with admin access
- Cloud provider account (AWS/Azure/GCP)

### VS Code Extensions
- Docker
- GitLens
- GitHub Actions
- Remote - Containers
- All team members' extensions (to understand their code)

### Useful Commands
```bash
# Docker
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
docker-compose ps             # List running containers
docker system prune -a        # Clean up Docker

# Git
git log --graph --oneline     # View commit history
git branch -a                 # List all branches
git remote -v                 # View remote URLs

# GitHub CLI (optional)
gh pr list                    # List PRs
gh pr review                  # Review PR
gh pr merge                   # Merge PR
```

---

## Success Checklist

### Week 1 Done When:
- [ ] README documentation complete
- [ ] Docker setup working for all services
- [ ] CI/CD pipeline passing
- [ ] All team members can run project locally
- [ ] At least 3 PRs reviewed and merged per team member

### Week 2 Done When:
- [ ] Full integration successful
- [ ] Deployed to cloud (staging)
- [ ] All features working in production
- [ ] Documentation complete
- [ ] Team demo ready

---

## Emergency Procedures

### If Build Breaks
1. Identify which commit broke the build (GitHub Actions)
2. Notify responsible team member immediately
3. Option A: Fix forward (preferred)
4. Option B: Revert commit temporarily
5. Ensure fix is tested before merging

### If Team Member is Blocked
1. Respond within 1 hour
2. Pair program to resolve issue
3. If can't resolve in 2 hours, involve another team member
4. Document solution for future reference

### If Behind Schedule
1. Assess critical path items
2. Call emergency team meeting
3. Redistribute tasks
4. Reduce scope if necessary
5. Communicate with stakeholders

---

## Quick Reference

### Project Structure Overview
```
bsg-demo-platform/
├── frontend/              ← Member 1, 3, 4
├── backend/               ← Member 2, 3, 4
├── design/                ← You (Member 5)
├── deployments/           ← You (Member 5)
├── .github/workflows/     ← You (Member 5)
├── docker-compose.yml     ← You (Member 5)
├── README.md              ← You (Member 5)
└── .gitignore             ← Already created
```

### Team Responsibilities Quick View
- **Member 1**: Frontend UI/UX (Layout, Common components, Pages)
- **Member 2**: Backend API (FastAPI, Database, Auth, Content/Demo APIs)
- **Member 3**: Demo Player & Content Viewer (Frontend + Backend services)
- **Member 4**: Video & Cloud Storage (S3/Azure, Video API, Video Player)
- **Member 5**: DevOps & Leadership (Docker, CI/CD, Integration, Code Review)

### Integration Timeline
- **Day 3**: API contracts agreed
- **Day 5**: Common components ready
- **Day 7**: Backend APIs ready
- **Day 10**: Full integration
- **Day 14**: Production deployment

---

## Leadership Tips

### Be Supportive
- Encourage team members
- Celebrate small wins
- Provide constructive feedback
- Be available for questions

### Be Decisive
- Make clear decisions when team is stuck
- Don't let discussions drag on too long
- Document decisions and rationale

### Be Organized
- Keep track of all PRs and issues
- Maintain project board (GitHub Projects)
- Ensure documentation is up to date
- Monitor deadlines

### Be Communicative
- Overcommunicate rather than undercommunicate
- Keep team informed of changes
- Be transparent about challenges
- Listen to team feedback

---

**Remember:** You're not just writing code - you're leading a team. Your success is measured by the team's success!

**Questions?** You're the go-to person, but don't hesitate to ask the team for input!

**Good luck! 🚀**
