# BSG Demo Platform — User Guide

This guide explains **how to use** the BSG Demo Platform: navigation, components, and common tasks.

For architecture, Azure services, and technical details, see **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**.

---

## 1. Accessing the Platform

**Cloud (production):**

- **Frontend**: `https://kind-beach-01c0a990f.3.azurestaticapps.net`
- Open the URL in a browser. No login required for basic use.

**Local development:**

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API docs**: `http://localhost:8000/docs`

Start locally with:

- Windows: `scripts\restart-all.bat`
- Or run frontend (`npm run dev` in `frontend/`) and backend (`uvicorn app.main:app --host 0.0.0.0 --port 8000` in `backend/`) separately.

---

## 2. Navigation

- **Left sidebar**: Collapsible. Use it to switch between **components** (Integration, Data Architecture, Deployment, Security, Observability, Design Time, etc.).
- **Top bar**: **Settings** (gear icon), **Reset Demo**, theme toggle (light/dark).
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
- It is **component-aware**: answers depend on the component you’re in (e.g. Data Architecture, Deployment, Security).
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

1. **Create Customer**  
   - Click **Execute Action**.  
   - The app calls the Temenos Party API, creates a customer, and shows the response (e.g. `customerId`).

2. **Open Account**  
   - Click **Execute Action** for “Open Account”.  
   - Uses the customer from step 1 to open an account.  
   - Response includes e.g. `accountId`.

3. **Send Instant Payment**  
   - Click **Execute Action** for “Send Instant Payment”.  
   - Uses the account to send a payment.  
   - You’ll need a valid **credit account** configured; otherwise you may see “CREDIT ACCOUNT IS MANDATORY”.

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

## 5. Deployment Component

- **Deployment Analyzer**: Connect to **Azure** (choose subscription), select **resource groups**, and optionally run **cost analysis**.
- The platform discovers **Temenos-related resources** and can show cost estimates.
- **Azure permissions** (e.g. Reader, Cost Management Reader) are required.

---

## 6. Settings

Open **Settings** (gear icon) to:

- **RAG API JWT Token**: Set or update the token for BSG Guru (see above).
- **EventHub** (if available): Configuration for the event stream; usually managed by admins.

---

## 7. Reset Demo

- **Reset Demo** (top bar) clears **simulation state**, **event stream**, and **API inspector** for the Data Architecture demo.
- Use it to start a new user journey (Create Customer → Open Account → Send Payment) from scratch.

---

## 8. Common Tasks

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

## 9. Troubleshooting

- **“No events emitted yet”**  
  Run a transaction (Create Customer, etc.), wait a few seconds, and check that the stream shows “Connected” / “Live”.

- **“RAG API token not configured” / “expired”**  
  Update the token under **Settings** → RAG API JWT Token.

- **“CREDIT ACCOUNT IS MANDATORY”** (Send Payment)  
  The payment step requires a valid credit account in the Temenos setup; this is an API/configuration constraint.

- **API or event stream errors**  
  Check that the backend and EventHub are running and reachable. For deployment details and health checks, see **PROJECT_DOCUMENTATION.md**.

---

*For technical architecture, Azure services, database, and APIs, see **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**.*
