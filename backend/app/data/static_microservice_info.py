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

# Statement Generation Microservice - curated content
STMT_GEN_ARCH_OVERVIEW = """# Statement Generation Microservice

## 1. Purpose & Scope

- Microservice name: Statement Generation Microservice
- Responsibility: Generates account statements, reports, and document outputs (e.g. XML, PDF) for end customers. Transforms transactional data into presentable statement formats.

## 2. Architectural Role

- Position in Temenos Transact ecosystem: Downstream reporting and document generation service. Consumes events or data from core and Event Store; produces statement artifacts.
- Relationship to core transactional services: Read-only consumer of transaction data. Outputs are generated on-demand or scheduled; does not write back to core.

## 3. Design Patterns & Guarantees

- CQRS role: Query-side document generation. Reads from read models or event streams.
- Consistency model: Eventual consistency. Statements reflect data as of generation time.
- Availability and latency guarantees: Batch-friendly; can tolerate higher latency for non-real-time statement generation.

## 4. Core Components

- Core service components: Statement engine, template processor, output formatter (XML/PDF), scheduler, storage for generated artifacts.
- External dependencies: Event Store or data source for transactions; optionally blob storage for generated files.

## 5. Data Model & Consistency

- Types of data managed: Statement metadata, templates, generated documents. Ephemeral or persisted per retention policy.
- Update propagation model: On-demand or scheduled triggers; reads from source of truth.
- Consistency implications: Statements are point-in-time snapshots; may not reflect latest transactions until next run.

## 6. APIs & Access Patterns

- API style: REST for triggering generation, retrieving statements. May support webhooks for async completion.
- Supported operations: Generate statement, retrieve statement by ID, list statements for account/customer.
- Consumer expectations: Async generation for large statements; sync for small/simple statements.

## 7. Deployment Architecture

- Cloud-native model: Containerized, Kubernetes deployment. Azure Container Apps / AKS typical.
- Kubernetes usage: Deployment, ConfigMap for templates, PersistentVolume for output storage.
- Helm-based lifecycle management: Managed via Helm charts.

## 8. Scalability & Performance

- Horizontal scaling model: Stateless; scale out for concurrent generation jobs.
- Read optimization techniques: Template caching, batch processing for multiple accounts.
- Performance assumptions: CPU-bound for PDF generation; I/O-bound for data fetch.

## 9. Security Model

- Authentication boundary: API gateway or service mesh; no direct user auth.
- Authorization model: RBAC; consumers need statement generation permission.
- Data-in-transit and data-at-rest protections: TLS; encryption at rest for stored statements.

## 10. Observability & Operations

- Logging: Structured logs for generation jobs, errors, throughput.
- Monitoring: Job duration, success/failure rates, queue depth.
- Health checks: /health, /ready; dependency checks for data source.

## 11. Functional Capabilities

- Business-facing capabilities: Account statements, regulatory reports, custom document templates, multi-format output (XML, PDF).

## 12. Explicit Non-Goals / Out-of-Scope

- Write operations: Does not modify transactional data.
- Real-time streaming: Batch/scheduled generation; not sub-second document delivery.
- Workflow orchestration: Focused on document generation; orchestration handled elsewhere.
"""

# Event Store Microservice - curated content
EVENT_STORE_ARCH_OVERVIEW = """# Event Store Microservice

## 1. Purpose & Scope

- Microservice name: Event Store Microservice
- Responsibility: Central event sourcing backbone. Persists and distributes domain events from Temenos Transact to downstream consumers. Typically implemented via Azure Event Hubs or Kafka.

## 2. Architectural Role

- Position in Temenos Transact ecosystem: Event backbone connecting core transactional systems to read models, projections, and integrations.
- Relationship to core transactional services: Core publishes events; Event Store persists and streams to subscribers. Downstream services consume for CQRS projections.

## 3. Design Patterns & Guarantees

- CQRS role: Event source for all read models. Single source of truth for event stream.
- Consistency model: At-least-once delivery with consumer checkpointing. Ordered within partition.
- Availability and latency guarantees: High throughput; sub-second to low-second latency for event propagation.

## 4. Core Components

- Core service components: Event Hub/Kafka cluster, producer/consumer clients, schema registry (if used), retention and compaction policies.
- External dependencies: Core Transact (event producer); downstream consumers (Holdings, Party, etc.).

## 5. Data Model & Consistency

- Types of data managed: Domain events (immutable). Partitioned by key for ordering.
- Update propagation model: Append-only; no updates. Consumers read from offset.
- Consistency implications: Eventual consistency for consumers; strong ordering within partition.

## 6. APIs & Access Patterns

- API style: Event Hub REST/Kafka protocol. Send events; consume via consumer groups.
- Supported operations: Produce events, consume from partition, commit checkpoint.
- Consumer expectations: At-least-once; idempotent handling required.

## 7. Deployment Architecture

- Cloud-native model: Azure Event Hubs or managed Kafka. Fully managed; no Kubernetes for Event Hubs.
- Kubernetes usage: N/A for Event Hubs; Kafka may run on K8s.
- Helm-based lifecycle management: Managed service; configuration via ARM/Bicep or Terraform.

## 8. Scalability & Performance

- Horizontal scaling model: Partition-based; add partitions for throughput.
- Read optimization techniques: Consumer groups for parallel consumption; batching.
- Performance assumptions: High throughput; millions of events per day.

## 9. Security Model

- Authentication boundary: SAS tokens or managed identity for producer/consumer.
- Authorization model: Per-namespace/topic access policies.
- Data-in-transit and data-at-rest protections: TLS; encryption at rest (Azure default).

## 10. Observability & Operations

- Logging: Event Hub metrics (incoming/outgoing messages, throttling).
- Monitoring: Consumer lag, throughput, error rates.
- Health checks: Namespace availability; consumer connectivity.

## 11. Functional Capabilities

- Business-facing capabilities: Reliable event distribution for CQRS, integrations, audit trails.

## 12. Explicit Non-Goals / Out-of-Scope

- Write operations: Events are append-only; no updates/deletes.
- Business logic: Pure transport; no transformation.
- Query API: Not a database; consume via stream.
"""

# Adapter Microservice - curated content
ADAPTER_ARCH_OVERVIEW = """# Adapter Microservice

## 1. Purpose & Scope

- Microservice name: Adapter Microservice
- Responsibility: Integration adapter for external systems. Translates between Temenos internal formats and external protocols (SWIFT, ISO 20022, proprietary APIs). Handles connectivity, mapping, and error handling.

## 2. Architectural Role

- Position in Temenos Transact ecosystem: Edge integration layer. Sits between Transact core and external world (payment networks, core banking, reporting).
- Relationship to core transactional services: Bidirectional; receives from and sends to core. Transforms and routes messages.

## 3. Design Patterns & Guarantees

- CQRS role: Can be command (outbound) and query (inbound) side. Depends on adapter type.
- Consistency model: Synchronous for request-response; async for fire-and-forget with retries.
- Availability and latency guarantees: SLA for external connectivity; retries for transient failures.

## 4. Core Components

- Core service components: Protocol handlers, message mappers, connection pools, retry/backoff logic, dead-letter handling.
- External dependencies: External APIs, messaging systems (e.g. Event Hubs for async), core Transact.

## 5. Data Model & Consistency

- Types of data managed: Message mappings, connection configs, audit logs of sent/received messages.
- Update propagation model: Real-time for sync; event-driven for async.
- Consistency implications: Outbound: at-least-once with idempotency; inbound: once per message.

## 6. APIs & Access Patterns

- API style: Protocol-specific (REST, SWIFT, ISO 20022, proprietary). Adapter exposes or consumes as per integration type.
- Supported operations: Send message, receive message, status check, retry failed.
- Consumer expectations: Timeouts, retries, idempotency keys for critical flows.

## 7. Deployment Architecture

- Cloud-native model: Containerized; often colocated with Event Hubs for async patterns.
- Kubernetes usage: Deployment, ConfigMap for mappings, Secret for credentials.
- Helm-based lifecycle management: Helm charts for adapter deployment.

## 8. Scalability & Performance

- Horizontal scaling model: Stateless; scale out for throughput. Partition by correlation ID for ordering.
- Read optimization techniques: Connection pooling, async I/O, batching.
- Performance assumptions: I/O-bound; latency depends on external system.

## 9. Security Model

- Authentication boundary: Mutual TLS, API keys, or OAuth for external systems.
- Authorization model: Credential-based per connection; RBAC for admin.
- Data-in-transit and data-at-rest protections: TLS; encryption for sensitive config.

## 10. Observability & Operations

- Logging: Message audit, mapping errors, connection failures.
- Monitoring: Message throughput, error rate, latency to external systems.
- Health checks: Connectivity to external endpoints; queue depth.

## 11. Functional Capabilities

- Business-facing capabilities: Payment connectivity (SWIFT, SEPA), core banking integration, regulatory reporting feeds.

## 12. Explicit Non-Goals / Out-of-Scope

- Core banking logic: Adapter only; business rules in core.
- Long-running workflows: Request-response or event-driven; no multi-step orchestration in adapter.
- Data storage: Ephemeral or audit-only; no primary data store.
"""

# Generic Config Microservice - curated content
GENERIC_CONFIG_ARCH_OVERVIEW = """# Generic Config Microservice

## 1. Purpose & Scope

- Microservice name: Generic Config Microservice
- Responsibility: Centralized configuration store for Temenos microservices. Provides shared config (feature flags, parameters, connection strings) to runtime components.

## 2. Architectural Role

- Position in Temenos Transact ecosystem: Configuration backbone. All microservices may depend on it for runtime config.
- Relationship to core transactional services: Read by many; written by admin/tooling. No dependency from core Transact.

## 3. Design Patterns & Guarantees

- CQRS role: Read-heavy; occasional writes for config updates.
- Consistency model: Eventual consistency for propagation; strong consistency for single read.
- Availability and latency guarantees: High availability; low latency for config reads.

## 4. Core Components

- Core service components: Config store (e.g. Cosmos DB, Redis), REST API, cache layer, admin UI/API.
- External dependencies: Database or key-value store; optionally Azure App Configuration.

## 5. Data Model & Consistency

- Types of data managed: Key-value config, hierarchical config (e.g. by service, environment).
- Update propagation model: Push or pull; cache invalidation on update.
- Consistency implications: Cached reads may be stale for short window.

## 6. APIs & Access Patterns

- API style: REST. GET config by key/scope; PUT for admin updates.
- Supported operations: Get config, list configs, update config (admin), invalidate cache.
- Consumer expectations: Fast reads; optional watch/poll for changes.

## 7. Deployment Architecture

- Cloud-native model: Containerized; often backed by Azure Cosmos DB or Redis.
- Kubernetes usage: Deployment, ConfigMap for bootstrap; Secret for DB connection.
- Helm-based lifecycle management: Helm charts.

## 8. Scalability & Performance

- Horizontal scaling model: Stateless; scale out. Cache reduces DB load.
- Read optimization techniques: In-memory cache, CDN for static config.
- Performance assumptions: Sub-100ms for cached reads.

## 9. Security Model

- Authentication boundary: Service identity for read; admin identity for write.
- Authorization model: Read for all services; write for config admin only.
- Data-in-transit and data-at-rest protections: TLS; encryption at rest.

## 10. Observability & Operations

- Logging: Config access, update audit.
- Monitoring: Read latency, cache hit rate, update frequency.
- Health checks: DB connectivity; cache health.

## 11. Functional Capabilities

- Business-facing capabilities: Feature toggles, environment-specific params, connection discovery.

## 12. Explicit Non-Goals / Out-of-Scope

- Secrets: Use Azure Key Vault for high-sensitivity secrets.
- Transactional data: Config only; no business data.
- Real-time event streaming: Config is pull/watch; not event-driven.
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
        "architectural_overview": GENERIC_CONFIG_ARCH_OVERVIEW,
        "functional_overview": "Centralized configuration store for Temenos applications.",
        "capabilities": ["Feature toggles", "Environment params", "Connection discovery"],
    },
    "Event Store Microservice": {
        "architectural_overview": EVENT_STORE_ARCH_OVERVIEW,
        "functional_overview": "Event sourcing backbone. Persists and distributes domain events.",
        "capabilities": ["Event persistence", "Stream distribution", "Consumer groups"],
    },
    "Event Store": {
        "architectural_overview": EVENT_STORE_ARCH_OVERVIEW,
        "functional_overview": "Event sourcing backbone for Temenos microservices.",
        "capabilities": ["Event persistence", "Stream distribution"],
    },
    "Statement Generation Microservice": {
        "architectural_overview": STMT_GEN_ARCH_OVERVIEW,
        "functional_overview": "Generates account statements and reports.",
        "capabilities": ["Account statements", "Regulatory reports", "XML/PDF output"],
    },
    "Adapter Microservice": {
        "architectural_overview": ADAPTER_ARCH_OVERVIEW,
        "functional_overview": "Adapter layer for external system integration.",
        "capabilities": ["SWIFT/SEPA connectivity", "Core banking integration", "Message mapping"],
    },
    "Adapter": {
        "architectural_overview": ADAPTER_ARCH_OVERVIEW,
        "functional_overview": "Adapter for external integrations.",
        "capabilities": ["External connectivity", "Message mapping"],
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
