# Temenos Event Store Microservice - Architecture Documentation

## 1. Architecture Overview

The Temenos Event Store microservice is a cloud-native event streaming platform that provides reliable, scalable event persistence and distribution for Temenos banking applications. It implements the **Transactional Outbox** pattern to ensure event delivery consistency, uses **Event Sourcing** principles for immutable event storage, and adheres to **CloudEvents** specification for standardized event representation. The service enables decoupled microservice communication, audit trails, and event replay capabilities critical for financial transaction processing.

**Key Architectural Patterns:**
- **Transactional Outbox**: Ensures events are published only after successful database transactions
- **Event Sourcing**: Events are immutable append-only records serving as the source of truth
- **CloudEvents**: Standardized event envelope format (CNCF CloudEvents v1.0) for interoperability

---

## 2. Core Guarantees & Capabilities

| Capability | Description | Why It Matters (Business Impact) |
|------------|-------------|----------------------------------|
| **Immutability** | Events cannot be modified or deleted once written. Each event has a unique sequence number and timestamp. | Ensures audit compliance, prevents data tampering, and provides legal defensibility for financial transactions. |
| **Event Ordering** | Events within a partition are strictly ordered by sequence number. Global ordering maintained per event stream. | Critical for transaction processing where order matters (e.g., account balance updates must process in correct sequence). |
| **Replay** | Any consumer can replay events from any point in time using sequence numbers or timestamps. | Enables disaster recovery, debugging, analytics on historical data, and rebuilding application state. |
| **At-Least-Once Delivery** | Events are guaranteed to be delivered at least once, with deduplication handled by consumers using event IDs. | Ensures no financial transactions are lost, even during network failures or service restarts. |
| **Auditability** | Complete event history with timestamps, source, and metadata preserved indefinitely. | Meets regulatory requirements (SOX, GDPR, PCI-DSS) for financial institutions and enables forensic analysis. |
| **Partitioning** | Events are partitioned by key (e.g., account ID) to enable parallel processing and horizontal scaling. | Supports high-throughput scenarios (millions of events/second) required for large-scale banking operations. |
| **Retention** | Configurable retention policies (default: 7 days hot, 90 days warm, indefinite cold storage). | Balances performance (hot data) with compliance requirements (long-term archival) while managing storage costs. |

---

## 3. Event Lifecycle (Canonical Flow)

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT LIFECYCLE FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. EVENT CREATION
   ┌─────────────┐
   │ Application │ → Creates domain event (e.g., "AccountDebited")
   │   Service   │   with payload: {accountId, amount, timestamp}
   └──────┬──────┘
          │
          ▼
2. TRANSACTIONAL PERSISTENCE (Transactional Outbox Pattern)
   ┌──────────────────┐
   │  Database Write  │ → Writes event to outbox table within same
   │  (Same TX)       │   database transaction as business logic
   └──────┬───────────┘
          │
          ▼
3. EVENT PUBLICATION
   ┌──────────────────┐
   │  Outbox Poller   │ → Polls outbox table, publishes to Event Hub
   │  (Async)         │   Marks as published after successful delivery
   └──────┬───────────┘
          │
          ▼
4. EVENT ROUTING
   ┌──────────────────┐
   │  Azure Event Hub  │ → Routes event to partition based on partition
   │  (Partition Key) │   key (e.g., accountId % partition_count)
   └──────┬───────────┘
          │
          ▼
5. EVENT CONSUMPTION
   ┌──────────────────┐
   │  Consumer        │ → Reads events from partition, processes in order
   │  (Microservice)  │   Updates local state, handles business logic
   └──────┬───────────┘
          │
          ▼
6. EVENT REPLAY (Optional)
   ┌──────────────────┐
   │  Replay Service  │ → Replays events from sequence number X or
   │  (On-Demand)      │   timestamp Y for recovery/analytics
   └──────────────────┘
```

**Detailed Steps:**

1. **Event Creation**: Application service generates a domain event (e.g., `AccountDebited`) with business payload and metadata.

2. **Transactional Persistence**: Event is written to an outbox table within the same database transaction as the business operation. This ensures atomicity—if the business transaction fails, the event is not persisted.

3. **Event Publication**: An asynchronous outbox poller reads unpublished events and publishes them to Azure Event Hub. After successful publication, the event is marked as published in the outbox table.

4. **Event Routing**: Azure Event Hub routes the event to a partition based on the partition key (typically derived from a business identifier like account ID). This ensures events for the same entity are ordered within a partition.

5. **Event Consumption**: Consumer microservices read events from their assigned partitions, process them in order, and update their local state. Each consumer maintains its own checkpoint (sequence number) to track progress.

6. **Event Replay**: On-demand replay allows consumers to reprocess events from any historical point using sequence numbers or timestamps, enabling recovery, debugging, or analytics.

---

## Technical Implementation Notes

- **Partition Strategy**: Hash-based partitioning using `accountId % partition_count` ensures related events are co-located
- **Checkpointing**: Consumers store checkpoint offsets in Azure Blob Storage for durability
- **Error Handling**: Failed events are sent to a dead-letter queue for manual inspection
- **Monitoring**: Event throughput, latency, and consumer lag are monitored via Azure Monitor metrics

