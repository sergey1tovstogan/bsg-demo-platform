# BSG Demo Platform — How to Use

This guide explains how to use the BSG Demo Platform: navigation, components, and common tasks.

For deployment and infrastructure details, see **[PLATFORM_DEPLOYMENT.md](./PLATFORM_DEPLOYMENT.md)**.

---

## 1. Accessing the Platform

**Production (cloud):**

- **URL**: `https://demo-platform.bsg.temenos.com`
- Open in a browser. No login required for basic use.

**Local development:**

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API docs**: `http://localhost:8000/docs`

Start locally with:

- Windows: `scripts\start-all.bat`
- Or run frontend (`npm run dev` in `frontend/`) and backend (`uvicorn app.main:app --host 0.0.0.0 --port 8000` in `backend/`) separately.

---

## 2. Navigation

- **Left sidebar**: Collapsible. Switch between **components** (Architecture, Integration, Data Architecture, Security, Observability, DevOps, etc.).
- **Top bar**: **Home**, **Technology Pillars** (dropdown), **API Developer portal**, **Temenos Components**, **BIAN Landscape**, **Settings**, theme toggle (light/dark), **version label**, **Feedback** button.
- **Main area**: Content, demos, or tools for the selected component.

---

## 3. Components and How to Use Them

Each component groups **content**, **demos**, and **BSG Guru** (chatbot).

### 3.1 Content

- **Content** tabs/pages: Documentation, architecture, slides.
- Use the **table of contents** or **breadcrumbs** to move between sections.
- Content can include markdown, code blocks, images, and links.

### 3.2 Demos

- **Demos** are interactive flows (e.g. Transaction Simulator, Deployment Analyzer).
- Open the **Demo** tab or section for the component.
- Follow the on-screen steps (e.g. “Create Customer”, “Open Account”, “Send Payment”).
- Use **Reset Demo** (top bar) to clear state and start over.

### 3.3 BSG Guru (Chatbot)

- **BSG Guru** is an AI assistant backed by the Temenos RAG API.
- It is **component-aware**: answers depend on the component you’re in.
- **How to use:**
  1. Open the **BSG Guru** / chat panel for the component.
  2. Type your question and send.
  3. You get an answer plus optional source references.

**RAG JWT token (required for BSG Guru):**

- Go to **Settings** (gear) → **RAG API JWT Token**.
- Paste your token and click **Update RAG Token**.
- Without a valid token, BSG Guru will report that the RAG API is not configured.

---

## 4. Data Architecture — Event‑Driven Data Flow

This component demonstrates **event‑driven data flow** with a transaction simulator and live event stream.

### 4.1 User Journey (Transaction Simulator)

1. **Create Customer** — Click **Execute Action**. The app calls the Temenos Party API, creates a customer, and shows the response (e.g. `customerId`).
2. **Open Account** — Click **Execute Action** for “Open Account”. Uses the customer from step 1 to open an account. Response includes e.g. `accountId`.
3. **Send Instant Payment** — Click **Execute Action** for “Send Instant Payment”. Uses the account to send a payment. You’ll need a valid **credit account** configured; otherwise you may see “CREDIT ACCOUNT IS MANDATORY”.

### 4.2 Kafka Event Stream

- **Kafka Event Stream** shows events produced by your transactions (e.g. from Azure EventHub).
- **Status**: “Connected” / “Live” when the event source is healthy.
- **Controls**: **Grouped**, **Pause**, **Clear** to organise or pause updates.
- Only **events for the current transaction** are shown (historical events are filtered out).
- If you see “No events emitted yet”, run a transaction (Create Customer, Open Account, etc.) and wait a few seconds.

### 4.3 API Inspector

- Lists **API calls** made by the simulator (method, URL, status, duration).
- Expand a request to see **request** and **response** bodies.
- Use **Clear** to reset the log.

---

## 5. Deployment Analyzer

- **Architecture** → **Demo** tab or direct link.
- Connect to **Azure** (choose subscription), select **resource groups**, and analyze Temenos components.
- **Export ARM**: Export selected resource groups as ARM template JSON for Infrastructure as Code.
- **Azure permissions** (e.g. Reader) are required.

---

## 6. Temenos Components

- **Top bar** → **Temenos Components**.
- Browse active and future Temenos components (e.g. TAFJ, TOCF, Event Framework).
- Search, filter by Active/Future, and view component details.

---

## 7. BIAN Landscape

- **Top bar** → **BIAN Landscape**.
- Interactive BIAN Service Landscape V14.0: 8 Business Areas, 325+ Service Domains.
- Tabs: Landscape, Scenarios, Legend.

---

## 8. Settings

Open **Settings** (gear icon) to:

- **RAG API JWT Token**: Set or update the token for BSG Guru.
- **EventHub** (if available): Configuration for the event stream; usually managed by admins.
- **Technology Pillars**: Enable or disable categories for the Home page.

---

## 9. Feedback

- Click the **Feedback** (red) button in the top bar to report a bug or suggest an improvement.
- Opens a GitHub issue with pre-filled context (URL, browser).

---

## 10. Common Tasks

| Task | How |
|------|-----|
| Switch component | Use the left sidebar and select a component. |
| Use BSG Guru | Open the chatbot for the component, enter a question, send. |
| Run Data Architecture demo | Go to Data Architecture → Demo → execute each step (Create Customer, Open Account, Send Payment). |
| View events | Use the **Kafka Event Stream** panel; ensure you’re “Connected” and have run at least one transaction. |
| Clear demo state | Click **Reset Demo** in the top bar. |
| Configure RAG token | **Settings** → RAG API JWT Token → paste token → **Update RAG Token**. |
| Toggle light/dark theme | Use the theme control in the top bar. |

---

## 11. Troubleshooting

- **“No events emitted yet”** — Run a transaction (Create Customer, etc.), wait a few seconds, and check that the stream shows “Connected” / “Live”.
- **“RAG API token not configured” / “expired”** — Update the token under **Settings** → RAG API JWT Token.
- **“CREDIT ACCOUNT IS MANDATORY”** (Send Payment) — The payment step requires a valid credit account in the Temenos setup; this is an API/configuration constraint.
- **API or event stream errors** — Check that the backend and EventHub are running and reachable. For deployment details and health checks, see **PLATFORM_DEPLOYMENT.md**.

---

*For deployment, Azure services, and infrastructure, see **[PLATFORM_DEPLOYMENT.md](./PLATFORM_DEPLOYMENT.md)**.*
