"""
Static Microservice Info for Deployment Demo

Loaded at backend startup. Provides immediate component info without RAG API calls.
Maps Azure deployment names (e.g. ms-genericconfig) to microservice documentation.

To add content: Update STATIC_MICROSERVICE_INFO with architectural_overview
(full 12-section format). Add more aliases to DEPLOYMENT_NAME_ALIASES.
Curated content takes priority over RAG - use this when RAG returns empty placeholders.
"""

from typing import Dict, List, Optional, Any

# Aliases: Azure deployment names/short names -> canonical display name
DEPLOYMENT_NAME_ALIASES: Dict[str, str] = {
    "ms-genericconfig": "Generic Config Microservice",
    "genericconfig": "Generic Config Microservice",
    "generic-config": "Generic Config Microservice",
    "genericconfigmicroservice": "Generic Config Microservice",
    "eventstore": "Event Store Microservice",
    "event-store": "Event Store Microservice",
    "eventstoremicroservice": "Event Store Microservice",
    "ms-eventstore": "Event Store Microservice",
    "holdings": "Holdings Microservice",
    "holdingsmicroservice": "Holdings Microservice",
    "ms-holdings": "Holdings Microservice",
    "party": "Party Microservice",
    "partymicroservice": "Party Microservice",
    "ms-party": "Party Microservice",
    "adapter": "Adapter Microservice",
    "adaptermicroservice": "Adapter Microservice",
    "ms-adapter": "Adapter Microservice",
    "stmtgen": "Statement Generation Microservice",
    "statementgeneration": "Statement Generation Microservice",
    "camt": "CAMT Microservice",
    "camtmicroservice": "CAMT Microservice",
    "ms-camt": "CAMT Microservice",
    "virtualtable": "Virtual Table Microservice",
    "virtual-table": "Virtual Table Microservice",
    "virtualtablemicroservice": "Virtual Table Microservice",
    "ms-virtualtable": "Virtual Table Microservice",
}

# Base content for Holdings Microservice - curated to avoid RAG "Not part of the documented scope"
# Edit this when you have authoritative documentation for each section.
HOLDINGS_ARCH_OVERVIEW = """# Holdings Microservice

## 1. Purpose & Scope

- Microservice name: Holdings Microservice
- Responsibility: Aggregates and exposes customer portfolio holdings data for read-only consumption. Provides a denormalized view of positions derived from core transactional systems.
- Out of scope: Does not perform trades, settlement, or write operations. Not responsible for real-time order execution.

## 2. Architectural Role

- Position in Temenos Transact ecosystem: Read-model microservice in the CQRS architecture. Sits downstream of Event Store and serves query workloads.
- Relationship to core transactional services: Consumes events from Event Store; provides data to presentation layers and reporting. Does not call back into core Transact for writes.

## 3. Design Patterns & Guarantees

- CQRS role: Query-side (read) model. Holdings are projected from events into an optimized read store.
- Consistency model: Eventual consistency. Read model is updated asynchronously from event stream.
- Availability and latency guarantees: Optimized for read latency. Write path does not block reads. Typically sub-second read response for cached holdings.

## 4. Core Components

- Core service components: Holdings projection engine, read-model store, REST/gRPC API layer, health and readiness endpoints.
- External dependencies: Event Store (event source), optionally ODS/cache for aggregated views. No direct dependency on Transact core for reads.

## 5. Data Model & Consistency

- Types of data managed: Holdings, positions, valuations. Denormalized for fast query.
- Update propagation model: Event-driven. Events from Event Store trigger projection updates. At-least-once delivery with idempotent handlers.
- Consistency implications: Read-your-writes not guaranteed across sessions. Eventual consistency window depends on projection lag.

## 6. APIs & Access Patterns

- API style: REST (and optionally gRPC). Query-by-account, query-by-customer, batch requests.
- Supported operations: GET holdings by account/customer, filtered queries, pagination. No POST/PUT/DELETE.
- Consumer expectations: Consumers receive eventually consistent data. Suitable for dashboards, reports, reconciliation.

## 7. Deployment Architecture

- Cloud-native model: Containerized (Docker), orchestrated via Kubernetes. Runs as deployment with replicas.
- Kubernetes usage: Deployment, ConfigMap, Secret. Horizontal Pod Autoscaler for read scaling.
- Helm-based lifecycle management: Managed via Helm charts. Azure Container Apps / AKS typical deployment targets.

## 8. Scalability & Performance

- Horizontal scaling model: Stateless; scale out by adding pod replicas. Read traffic distributed via load balancer.
- Read optimization techniques: In-memory caching, read replicas, indexed queries. Projection optimized for common access patterns.
- Performance assumptions: Read-heavy workload. Write load limited to event consumption and projection updates.

## 9. Security Model

- Authentication boundary: Authenticates via API gateway or service mesh (e.g. OAuth2, mTLS). No direct user auth.
- Authorization model: RBAC. Consumers must have read permission for holdings data. PII/sensitive data masked as per policy.
- Data-in-transit and data-at-rest protections: TLS for all external traffic. Encryption at rest for persisted data.

## 10. Observability & Operations

- Logging: Structured JSON logs. Correlation IDs for request tracing. Log levels configurable.
- Monitoring: Metrics for latency, throughput, error rate. Dashboards for projection lag and consumer health.
- Health checks: /health (liveness), /ready (readiness). Readiness checks DB and Event Store connectivity.

## 11. Functional Capabilities

- Business-facing capabilities: Portfolio summary, holdings by account/customer, position valuations, historical snapshots for reporting.

## 12. Explicit Non-Goals / Out-of-Scope

- Write operations: Does not accept order/trade writes. All writes originate from core systems and flow via events.
- Real-time consistency: Does not guarantee immediately consistent reads after writes. Use core Transact APIs for that.
- Workflow orchestration: Does not orchestrate multi-step workflows. Read-only service.
"""

# Static content per microservice (canonical names)
# architectural_overview: Full 12-section strict format. When non-empty, used instead of RAG.
STATIC_MICROSERVICE_INFO: Dict[str, Dict[str, Any]] = {
    "Holdings Microservice": {
        "architectural_overview": HOLDINGS_ARCH_OVERVIEW,
        "functional_overview": "Read-model microservice for portfolio holdings. Aggregates positions for dashboards and reporting.",
        "capabilities": ["Holdings by account", "Holdings by customer", "Position valuations", "Historical snapshots"],
    },
    "Holdings": {
        "architectural_overview": HOLDINGS_ARCH_OVERVIEW,
        "functional_overview": "Read-model microservice for portfolio holdings.",
        "capabilities": ["Holdings by account", "Holdings by customer", "Position valuations"],
    },
    "Generic Config Microservice": {
        "architectural_overview": "",
        "functional_overview": "Centralized configuration store for Temenos applications.",
        "capabilities": [],
    },
    "Event Store Microservice": {
        "architectural_overview": "",
        "functional_overview": "Event sourcing backbone. Persists and distributes domain events.",
        "capabilities": [],
    },
    "Event Store": {
        "architectural_overview": "",
        "functional_overview": "Event sourcing backbone for Temenos microservices.",
        "capabilities": [],
    },
    "Statement Generation Microservice": {
        "architectural_overview": "",
        "functional_overview": "Generates account statements and reports.",
        "capabilities": [],
    },
    "Adapter Microservice": {
        "architectural_overview": "",
        "functional_overview": "Adapter layer for external system integration.",
        "capabilities": [],
    },
    "Adapter": {
        "architectural_overview": "",
        "functional_overview": "Adapter for external integrations.",
        "capabilities": [],
    },
    "Party Microservice": {
        "architectural_overview": "",
        "functional_overview": "Party/customer master data service.",
        "capabilities": [],
    },
    "Party": {
        "architectural_overview": "",
        "functional_overview": "Party microservice.",
        "capabilities": [],
    },
    "CAMT Microservice": {
        "architectural_overview": "",
        "functional_overview": "CAMT (Cash Management) message handling.",
        "capabilities": [],
    },
    "CAMT": {
        "architectural_overview": "",
        "functional_overview": "CAMT microservice.",
        "capabilities": [],
    },
    "Virtual Table Microservice": {
        "architectural_overview": "",
        "functional_overview": "Virtual table abstraction for data access.",
        "capabilities": [],
    },
    "Virtual Table": {
        "architectural_overview": "",
        "functional_overview": "Virtual Table microservice.",
        "capabilities": [],
    },
}


def normalize_for_lookup(name: str) -> str:
    """Normalize name for lookup (lowercase, strip, replace separators)."""
    if not name:
        return ""
    n = name.lower().strip().replace("-", "").replace("_", "").replace(" ", "")
    return n


def get_canonical_name(deployment_name: str) -> Optional[str]:
    """Map deployment name (e.g. ms-genericconfig) to canonical microservice name."""
    if not deployment_name:
        return None
    # Direct alias lookup
    low = deployment_name.lower().strip()
    if low in DEPLOYMENT_NAME_ALIASES:
        return DEPLOYMENT_NAME_ALIASES[low]
    # Try without 'ms-' prefix
    if low.startswith("ms-"):
        alt = low[3:]
        if alt in DEPLOYMENT_NAME_ALIASES:
            return DEPLOYMENT_NAME_ALIASES[alt]
    # Try normalized
    norm = normalize_for_lookup(deployment_name)
    for alias, canonical in DEPLOYMENT_NAME_ALIASES.items():
        if normalize_for_lookup(alias) == norm:
            return canonical
    # Check if deployment name contains a known microservice name
    for canonical in STATIC_MICROSERVICE_INFO:
        if normalize_for_lookup(canonical) in norm or norm in normalize_for_lookup(canonical):
            return canonical
    return None


def get_static_info(canonical_name: str) -> Optional[Dict[str, Any]]:
    """Get static info for a canonical microservice name. Tries canonical first, then base name."""
    info = STATIC_MICROSERVICE_INFO.get(canonical_name)
    if info:
        return info
    # Fallback: try without " Microservice" suffix (e.g. "Holdings" for "Holdings Microservice")
    if canonical_name and " Microservice" in canonical_name:
        base = canonical_name.replace(" Microservice", "").strip()
        return STATIC_MICROSERVICE_INFO.get(base)
    return None


def has_static_content(canonical_name: str) -> bool:
    """Check if we have meaningful architectural content (avoids RAG empty placeholders)."""
    info = get_static_info(canonical_name)
    if not info:
        return False
    arch = info.get("architectural_overview", "")
    # Require architectural_overview for Executive Summary - otherwise we'd show empty/placeholder
    return bool(arch and arch.strip() and "## 1. Purpose & Scope" in arch)
