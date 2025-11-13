# BSG Demo Platform

## Overview

The **BSG Demo Platform** serves as the central hub for demonstrating Temenos products and capabilities.  
It provides a unified environment where architecture, deployments, presentations, videos, and technical documentation are consolidated and maintained in one place.  

This repository is designed to support the **Banking Software Group (BSG)** in preparing and delivering high-quality demonstrations and proof-of-concepts that highlight the full range of Temenos technologies, from **Transact** and **Infinity** to supporting microservices and integration layers.

---

## Objectives

- Consolidate all demo artifacts and reference environments into a single, structured repository.  
- Streamline deployment and configuration processes across multiple environments and cloud platforms.  
- Provide reusable materials such as architecture diagrams, technical presentations, and recorded sessions.  
- Document best practices, reference architectures, and integration patterns.  
- Facilitate collaboration among BSG members through shared and versioned resources.

---

## Repository Structure

| Directory | Description |
|------------|--------------|
| `architecture/` | Reference diagrams and solution overviews. |
| `deployments/` | Scripts, manifests, and templates for automated setup (Azure, Kubernetes, and Container Apps). |
| `presentations/` | Official slide decks, customer-facing materials, and demo documentation. |
| `videos/` | Recorded sessions, technical walk-throughs, and demo introductions. |
| `integrations/` | API references, event flows, and product interconnection guides. |
| `security/` | Vulnerability reports, compliance documents, and DevSecOps best practices. |

---

## Architecture

### Current Deployment

**LOCAL (Windows Machine):**

- **Frontend (React/Vite)**
  - Port: 3000
  - Process: Node.js
  - Type: Development server running directly on your machine
  - URL: http://localhost:3000

- **Backend (FastAPI)**
  - Port: 8000
  - Process: Python
  - Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
  - Type: Python process running directly (not in container)
  - URL: http://localhost:8000
  - API Docs: http://localhost:8000/docs

**CLOUD (Azure):**

- **MongoDB Database (Azure Cosmos DB)**
  - Account: bsg-demo-platform-mongodb
  - Host: bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255
  - Database: bsg_demo
  - Resource Group: bsg-demo-platform
  - Status: Cloud-hosted, accessible via connection string
  - Type: Fully managed MongoDB service in Azure

**MongoDB Collections:**
- `users` - User accounts and authentication
- `user_sessions` - Active user sessions
- `components` - Component definitions
- `content` - Component content
- `videos` - Video metadata and references
- `security_docs` - Security documentation
- `presentations` - Presentation materials

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Getting Started

```bash
git clone https://github.com/georgasa/bsg-demo-platform.git
cd bsg-demo-platform
