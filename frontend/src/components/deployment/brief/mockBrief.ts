/**
 * Mock microservice briefs - sample input for BriefPage
 * (Lines containing "not found" are filtered by parser)
 */

export const HOLDINGS_BRIEF_RAW = `Holdings

1) Executive Summary  
Holdings is a NoSQL database microservice designed to store and manage all holdings-related financial data such as balances, transactions, contracts, and payment information. It addresses the need for efficient, flexible, and scalable storage optimized for financial holdings queries. Key consumers include Temenos Transact core banking services and other banking modules requiring fast access to holdings data for retail, corporate, and wealth management products.

2) Core Capabilities  
- Storage and retrieval of holdings data including balances, transactions, contracts, and payments.  
- Optimized query performance for holdings-related operations.  
- Support for complex financial data structures and relationships.  
- Enables downstream reporting and regulatory data extraction through synchronized event data.  
- Serves as a foundational data source for banking operations requiring holdings information.

3) Data Boundaries  
- Owns all holdings-related data: balances, transactions, contracts, payment details.  
- Manages the full lifecycle of holdings data from creation, updates, to archival.  
- Does NOT own party (customer) data, which is managed by PartyDB and Party microservices.  
- Does NOT embed business logic; acts as a pure data repository optimized for holdings.

4) Interfaces  
4.1 Northbound APIs  
- Exposes RESTful APIs using JSON payloads for synchronous data access.  
- Authentication typically via OAuth2 or OIDC standards (specifics not found).  
- Versioning is supported to ensure backward compatibility (exact versioning scheme not found).  
- Example endpoint patterns: /holdings/v1/balances/{accountId}, /holdings/v1/transactions/{transactionId}.  
- Error model follows standard HTTP status codes with structured JSON error responses (details not found).

4.2 Dependencies  
- Database: NoSQL database optimized for holdings data storage (specific NoSQL technology not specified).  
- Message broker: Integrates with PubSubBroker for event publishing and consumption.  
- Cache: Not explicitly documented; likely uses internal caching for performance.  
- Configuration: Uses GenericConfiguration microservice and GenericConfigurationDB for system-wide parameters.  
- Secrets: Managed via platform secrets management (specifics not found).  
- Mandatory: NoSQL DB, PubSubBroker, GenericConfiguration.  
- Optional: Cache or additional storage layers not explicitly documented.

5) Integration with Temenos Transact  
- Primarily asynchronous integration via event-driven architecture. HoldingsDB synchronizes data from Transact core through events published on the streaming platform.  
- Events produced include holdings updates, transaction postings, and contract changes.  
- Consistency model is eventual consistency with small delays acceptable for read-only query purposes.  
- Idempotency is managed via event processing mechanisms to avoid duplicate data writes.  
- Synchronous API calls are available for real-time queries but not for transactional updates.

6) Deployment  
6.1 Runtime Packaging  
- Packaged as a containerized microservice deployed on Kubernetes.  
- Runs on JVM runtime environment.  
- Environment variables configure database connections, messaging endpoints, and security settings.  
- Health checks implemented for readiness and liveness probes.  
- Supports horizontal scaling based on load.

6.2 Azure Reference (AKS/ACA)  
- Requires Azure Container Registry (ACR) for container images.  
- Uses Azure Key Vault for secrets management.  
- Event Hubs for streaming event integration.  
- Application Insights for monitoring and telemetry.  
- Deployed within a Virtual Network (VNET) with ingress controllers managing external access.  
- Key steps: container build and push to ACR, deploy to AKS with Helm charts, configure Key Vault and Event Hubs, set up ingress and monitoring.

6.3 AWS Reference (EKS/ECS)  
- Uses Elastic Container Registry (ECR) for container images.  
- Integrates with MSK (Managed Streaming for Kafka) or Kinesis for event streaming.  
- AWS Secrets Manager for secrets.  
- Application Load Balancer (ALB) for ingress.  
- Deployed within a Virtual Private Cloud (VPC) for network isolation.  
- Key steps: container build and push to ECR, deploy to EKS/ECS with Helm or CloudFormation, configure MSK/Kinesis, Secrets Manager, ALB, and monitoring.

7) Security  
- Integrates with identity providers supporting OAuth2/OIDC for user and service authentication.  
- Service-to-service authentication secured via mutual TLS (mTLS) or token-based mechanisms (specifics not found).  
- All data in transit is encrypted using TLS.  
- Secrets and credentials stored securely in platform-managed vaults (Azure Key Vault, AWS Secrets Manager).  
- Role-based access control (RBAC) applied at API and infrastructure levels.

8) Observability Ops  
- Logs structured and aggregated via centralized logging platforms (specific tools not found).  
- Metrics collected for performance, throughput, error rates, and resource utilization.  
- Distributed tracing supported to track requests across microservices (specific tracing tools not found).  
- Common failure scenarios include event processing delays, database connectivity issues, and API timeouts, all monitored with alerting mechanisms.

9) Demo Blueprint  
- Scenario: Query holdings balance for a customer account via TransactAPI.  
- Step 1: Transact core processes a transaction updating holdings data.  
- Step 2: HoldingsDB receives event asynchronously and updates its NoSQL store.  
- Step 3: Demo client calls Holdings REST API to retrieve updated balance.  
- Step 4: Show event flow via PubSubBroker and monitoring dashboards.  
- Step 5: Demonstrate scaling by simulating multiple concurrent queries.  
- Step 6: Highlight security by showing authenticated API access and audit logs.

10) References  
- Not found in sources (per instructions, no external citations provided).`

export const EVENT_STORE_BRIEF_RAW = `Event Store

1) Executive Summary
The Event Store microservice in Temenos architecture serves as a centralized repository for capturing, storing, and managing events generated by the core banking system and related microservices. It addresses the need for reliable event persistence, auditing, replay, and reconciliation, ensuring data integrity and traceability across the platform. Key consumers include downstream microservices, integration layers, and external systems that rely on event-driven data for processing, analytics, or synchronization.

2) Core Capabilities
- Persistent storage of Business Events and Data Events emitted by Temenos Transact.
- Support for event auditing and replay to enable recovery and consistency checks.
- Acts as a durable event store supporting the Transactional Outbox pattern, ensuring reliable event delivery.
- Facilitates event reconciliation to detect and resolve discrepancies in event streams.
- Enables downstream consumers to subscribe and process events asynchronously for decoupled integration.

3) Data Boundaries
- Owns the lifecycle of events generated within Temenos Transact, including their storage, indexing, and retrieval.
- Manages metadata associated with events, such as CloudEvents headers for routing and processing.
- Does NOT own the transactional data or business entities themselves; these remain within the core database and microservices.
- Does NOT perform business logic processing on events; it is focused on event persistence and delivery.

4) Interfaces
4.1 Northbound APIs
- Primarily exposes RESTful APIs for event querying, replay, and management.
- Authentication typically integrates with OAuth2/OIDC for secure access control.
- APIs follow semantic versioning to maintain backward compatibility.
- Example endpoint patterns:
- GET /events/{eventId} — Retrieve a specific event by ID
- POST /events/replay — Trigger replay of events within a time range
- Error model includes standard HTTP status codes with structured JSON error payloads for diagnostics.

4.2 Dependencies
- Database: Requires a persistent, scalable database to store event data (specific DB technology not detailed).
- Message Broker: Integrates with Apache Kafka or compatible pub/sub systems for event streaming.
- Configuration and Secrets: Uses centralized config and secrets management (e.g., Key Vault or Secrets Manager) for secure operation.
- Cache or storage layers are optional depending on deployment specifics.
- All dependencies are mandatory for core functionality except caching, which may be optional.

5) Integration with Temenos Transact
- Operates asynchronously by consuming Business and Data Events emitted by Transact via Kafka or similar streaming platforms.
- Supports the Transactional Outbox pattern to guarantee event order and delivery reliability.
- Produces event data for downstream microservices and external consumers.
- Ensures eventual consistency with idempotent event processing to handle retries and avoid duplication.

6) Deployment
6.1 Runtime Packaging
- Packaged as a containerized Java microservice running on JVM.
- Supports environment variable configuration for flexible deployment.
- Includes health check endpoints for readiness and liveness probes.
- Designed for horizontal scaling to handle varying event loads.

6.2 Azure Reference (AKS/ACA)
- Requires Azure Container Registry (ACR) for container images.
- Uses Azure Key Vault for secrets management.
- Integrates with Azure Event Hubs or Apache Kafka for event streaming.
- Employs Azure Application Insights for observability.
- Deployed within a Virtual Network (VNET) with ingress controllers managing traffic.
- Key steps include provisioning resources, configuring network policies, and deploying containers with appropriate access rights.

6.3 AWS Reference (EKS/ECS)
- Uses Amazon Elastic Container Registry (ECR) for container storage.
- Integrates with Amazon MSK (Managed Streaming for Kafka) or Kinesis for event streaming.
- Employs AWS Secrets Manager for secure secret storage.
- Uses Application Load Balancer (ALB) for ingress traffic management.
- Deployed within a Virtual Private Cloud (VPC) with defined network segmentation.
- Deployment involves setting up container orchestration, configuring event streaming endpoints, and securing network access.

7) Security
- Integrates with identity providers supporting OAuth2/OIDC for authentication and authorization.
- Employs mutual TLS (mTLS) for secure service-to-service communication.
- Encrypts data at rest and in transit using platform-native encryption capabilities.
- Manages secrets securely via cloud-native secret management services.

8) Observability Ops
- Emits structured logs compatible with centralized logging systems.
- Exposes metrics for monitoring via Prometheus or equivalent.
- Supports distributed tracing to diagnose event flow and latency issues.
- Common failure scenarios include event processing delays, message broker unavailability, and data store connectivity issues, all mitigated by retry and alerting mechanisms.

9) Demo Blueprint
- Scenario: Demonstrate event capture and replay for a funds transfer transaction in Temenos Transact.
- Steps:
1. Initiate a funds transfer via Transact UI or API, generating Business and Data Events.
2. Show Event Store capturing these events asynchronously from Kafka topics.
3. Query the Event Store API to retrieve stored events related to the transaction.
4. Trigger an event replay for the transaction timeframe to simulate recovery.
5. Display downstream microservice consuming replayed events and updating its state.
- This demo highlights event persistence, retrieval, and replay capabilities integrated with Transact.

10) References
Not found in sources.`

export const PARTY_BRIEF_RAW = `Party

1) Executive Summary
The Party microservice is a core component designed to manage party-related data within the Temenos ecosystem. It solves the problem of centralized, consistent, and versioned management of party entities such as customers, organizations, and related roles. Key consumers include Temenos Transact modules, external banking applications, and integration layers that require authoritative party information for transactions, compliance, and customer management.

2) Core Capabilities
- Centralized storage and management of party entities and their attributes.
- Support for grouping and versioning of party data to maintain historical and current views.
- Retrieval of party information for use in transaction processing, regulatory reporting, and customer-facing applications.
- Management of relationships between parties and roles within the banking domain.
- Support for extensibility and customization through configuration and APIs.

3) Data Boundaries
- Owns party entities including individuals, organizations, and associated roles.
- Maintains lifecycle of party data versions, supporting retrieval by version ID and group ID.
- Does NOT own transactional data or product-specific data; these remain within core banking or other domain-specific microservices.
- Does NOT manage business logic beyond party data management and retrieval.

4) Interfaces
4.1 Northbound APIs
- Exposes RESTful APIs using JSON payloads for synchronous access.
- Authentication and authorization typically via OAuth2 or OIDC standards.
- APIs follow semantic versioning (major.minor.patch) to ensure backward compatibility.
- Example endpoint patterns:
- GET /party/{partyId} — Retrieve party details by ID
- POST /party — Create new party entity
- PUT /party/{partyId} — Update existing party data
- Error model follows standard HTTP status codes with detailed JSON error payloads for diagnostics.

4.2 Dependencies
- Database: Relational or NoSQL DB optimized for party data storage; mandatory.
- Message Broker: Integration with event streaming platforms (e.g., Kafka, Kinesis) for event-based updates; mandatory for async integration.
- Cache: Optional caching layer to improve read performance.
- Configuration: Uses Generic Configuration microservice for centralized config management; mandatory.
- Secrets: Integrates with secrets management services for secure storage of credentials; mandatory.

5) Integration with Temenos Transact
- Supports synchronous REST API calls for real-time party data retrieval and updates.
- Produces business and data events upon party data changes, following the Transactional Outbox pattern to ensure reliable event delivery.
- Events are published to supported pub/sub systems (Kafka, Azure Event Hubs, AWS Kinesis) adhering to CloudEvents standard.
- Consistency model is eventually consistent for event consumers, with strong consistency maintained within the service's own database.
- Implements idempotency in event processing to avoid duplication and ensure data integrity.

6) Deployment
6.1 Runtime Packaging
- Packaged as containerized Java microservice running on JVM.
- Supports environment variable configuration for deployment parameters.
- Includes health checks for readiness and liveness probes.
- Designed for horizontal scaling within Kubernetes or container orchestration platforms.

6.2 Azure Reference (AKS/ACA)
- Requires Azure Container Registry (ACR) for container images.
- Uses Azure Key Vault for secrets management.
- Integrates with Azure Event Hubs for event streaming.
- Application Insights for telemetry and monitoring.
- Deployed within a Virtual Network (VNET) with ingress controllers managing external access.
- Key steps: container image build and push to ACR, configure AKS cluster with access to Key Vault and Event Hubs, deploy with Helm charts.

6.3 AWS Reference (EKS/ECS)
- Uses Amazon Elastic Container Registry (ECR) for container images.
- Integrates with Amazon MSK (Kafka) or Kinesis for event streaming.
- Secrets Manager for secure credential storage.
- Application Load Balancer (ALB) for ingress traffic management.
- Deployed within a Virtual Private Cloud (VPC) for network isolation.
- Key steps: build and push container images to ECR, configure EKS or ECS cluster with access to MSK/Kinesis and Secrets Manager, deploy using Helm or CloudFormation templates.

7) Security
- Integrates with identity providers supporting OAuth2/OIDC for user and service authentication.
- Service-to-service authentication via mutual TLS (mTLS) or token-based mechanisms.
- All data in transit encrypted using TLS.
- Secrets and sensitive configuration stored securely using platform-native secrets management.
- Role-based access control enforced at API gateway and microservice levels.

8) Observability Ops
- Emits structured logs compatible with centralized logging platforms.
- Exposes metrics for health, performance, and usage, compatible with Prometheus.
- Supports distributed tracing to track requests across microservices.
- Common failure scenarios include event delivery failures, database connectivity issues, and authentication errors, all monitored with alerting.

9) Demo Blueprint
- Scenario: Create a new party entity via REST API, update party details, and trigger an event consumed by Transact for transaction processing.
- Steps:
1. Use POST /party to create a new customer profile.
2. Update customer address with PUT /party/{partyId}.
3. Observe event published to Kafka topic.
4. Transact subscribes to party update events and refreshes its local cache.
5. Execute a transaction in Transact referencing the updated party data, verifying data consistency.
- Duration: 5–10 minutes, showcasing synchronous API usage, event-driven integration, and cross-service data consistency.

10) References
Not found in sources (specific documentation references not available).`

export const ADAPTER_BRIEF_RAW = `Adapter

1) Executive Summary
The Adapter microservice is a flexible integration component within the Temenos ecosystem designed to facilitate protocol and data format transformations between Temenos Transact and external systems. It addresses the challenge of connecting diverse systems that use different communication protocols or data representations. Key consumers include system integrators, banks' middleware layers, and Temenos Transact components requiring integration with third-party applications or legacy systems.

2) Core Capabilities
- Transform an Event into a REST API request: Converts events from configured streaming topics (e.g., Kafka, Kinesis) into corresponding REST API calls.
- Simple Bulking: Aggregates incoming event data into batch flat-files for downstream processing.
- Debulking: Processes bulk data files (CSV or JSON) received from external systems, transforming and uploading them as API calls or events.
- API to API: Accepts JSON or XML payloads on API endpoints, transforms them, and delivers messages onto streaming platforms or JMS queues.
- XML Transformation: Performs XSLT transformations on XML files, outputting transformed XML.
- Protocol Transformations: Supports adaptation to different communication protocols to ensure compatibility with various external systems.

3) Data Boundaries
The Adapter microservice owns the transformation logic and temporary staging of data during bulking or debulking processes. It manages configuration data related to integration mappings but does not own persistent business data or core transaction records. It does not handle long-term data storage beyond staging files or configuration artifacts.

4) Interfaces
4.1 Northbound APIs
- API Style: Primarily RESTful APIs supporting JSON and XML payloads.
- Authentication: Supports role-based access control via the MS infrastructure authorization policies; specific auth protocols (OAuth2/OIDC/mTLS) are not detailed in sources.
- Versioning: APIs follow semantic versioning (major.minor.patch).
- Example Endpoint Patterns: Exposes endpoints for event ingestion, file upload (debuking), and API execution; exact URI patterns are not specified.
- Error Model: Returns completion events indicating success or failure of API executions; detailed error schema not found.

4.2 Dependencies
- Message Brokers: Integrates with streaming platforms such as Apache Kafka, AWS Kinesis, or Azure Event Hubs for event consumption and production.
- JMS Queues: Supports message delivery to JMS queues.
- Configuration: Uses Generic Configuration microservice for centralized management of adapter configurations (mandatory).
- Storage: Accesses configured source and target directories for file bulking and debulking operations.
- Database: Not directly owning persistent business data; staging tables may be used during bulking.
- Cache and Secrets: Not explicitly detailed; assumed managed by platform infrastructure.

5) Integration with Temenos Transact
- Patterns: Supports synchronous REST API calls and asynchronous event-based integration via streaming platforms.
- Events: Consumes business and data events from streaming topics; produces command completion events post API execution.
- Consistency: Implements idempotency and transactional outbox patterns indirectly by raising completion events; strong consistency is managed by core systems.
- Event Standards: Adheres to CloudEvents standard for event schema consistency.

6) Deployment
6.1 Runtime Packaging
- Packaged as containerized Java microservice running on JVM.
- Environment variables configure integration endpoints, topics, and file paths.
- Health checks implemented for runtime monitoring.
- Scales horizontally based on load.

6.2 Azure Reference (AKS/ACA)
- Requires Azure Container Registry (ACR), Azure Key Vault for secrets, Azure Event Hubs for streaming, Application Insights for monitoring, Virtual Network (VNET), and ingress controllers.
- Network model includes secure VNET integration and ingress routing.
- Deployment involves Helm charts and Infrastructure as Code automation.

6.3 AWS Reference (EKS/ECS)
- Requires Elastic Container Registry (ECR), Amazon MSK or Kinesis for streaming, AWS Secrets Manager, Application Load Balancer (ALB), and Virtual Private Cloud (VPC).
- Network model ensures secure VPC deployment with ingress control.
- Deployment uses Helm charts and IaC automation.

7) Security
- Integrates with centralized identity and access management for role-based authorization.
- Service-to-service authentication details not explicitly stated but expected to follow platform standards.
- Supports encryption in transit via HTTPS and secure messaging protocols.
- Secrets managed via cloud provider vaults (Key Vault, Secrets Manager).

8) Observability Ops
- Logs: Captures detailed logs for transformation and API execution steps.
- Metrics: Exposes operational metrics for throughput, success/failure rates.
- Tracing: Supports distributed tracing aligned with microservices best practices.
- Common Failures: Include transformation errors, connectivity issues with external APIs or message brokers, and file processing errors.

9) Demo Blueprint
- Scenario: Demonstrate event-driven integration where an event on a Kafka topic triggers the Adapter MS to transform and invoke a REST API on Temenos Transact.
- Steps:
1. Publish a JSON event to the configured Kafka topic.
2. Adapter MS consumes the event, applies JOLT transformation, and calls the Transact API.
3. Transact processes the request and returns a response.
4. Adapter MS publishes a command completion event indicating success.
5. Show logs and metrics reflecting the process.
- Optionally, demonstrate bulking by ingesting multiple events and generating a batch file.

10) References
- Not applicable as per guidelines; information synthesized from verified Temenos knowledge base.`

export const VIRTUAL_TABLE_BRIEF_RAW = `Virtual Table

1) Executive Summary
The Virtual Table microservice is a generic, configurable service designed to enable the definition, storage, and access of custom data entities outside the core Temenos Transact database. It addresses challenges related to Local Table usage by physically moving custom tables and associated logic out of Transact, thus preventing database bloat and complexity. Key consumers include Temenos Transact product solutions and developers requiring extensibility for custom data models without impacting core system performance or upgradeability.

2) Core Capabilities
- Supports data schema definition via configuration using a document-based data model controlled by JSON schema.
- Stores data records for each collection type in separate tables external to Transact.
- Enables creation and management of custom data collections (entities) with controlled schema.
- Provides API-based access to these custom data entities for use in business logic, UI, and integration.
- Replaces the legacy Local Table capability (EB.TABLE.DEFINITION) for large or logic-intensive custom data needs.
- Supports extensibility scenarios where custom tables with large data volumes or embedded logic are required outside Transact.
- Allows coexistence with Local Field capability and limited Local Table usage for small, static datasets.

3) Data Boundaries
- Owns custom data collections defined by users, including their schemas and data records.
- Data lifecycle is managed externally from Transact, physically stored in separate database tables.
- Does not own core Transact transactional data or embedded business logic within Transact.
- Does not replace or interfere with Local Field capability, which remains part of Transact.
- Does not handle data that requires strong consistency with core banking transactions; designed for extensibility and flexibility.

4) Interfaces
4.1 Northbound APIs
- Exposes RESTful APIs for CRUD operations on virtual table data entities.
- Supports JSON payloads adhering to defined JSON schemas for data validation.
- Authentication and authorization mechanisms are not explicitly detailed; likely integrated with Temenos standard identity services.
- Versioning and error model specifics are not found in sources.
- Example endpoint patterns: /virtual-table/{collectionType}/records/{recordId} (implied).

4.2 Dependencies
- Database: Uses separate physical tables outside the Transact database to store data collections.
- Message Broker, Cache, Storage: Not explicitly mentioned; presumed optional or handled externally.
- Configuration: Schema and collection definitions managed via configuration.
- Secrets: Not detailed; assumed to follow Temenos standard secret management practices.
- Mandatory dependencies: External database for data storage, configuration management.
- Optional dependencies: Integration with identity and security services.

5) Integration with Temenos Transact
- Primarily synchronous API-based integration for accessing and manipulating virtual table data.
- Events: Not explicitly stated if Virtual Table produces or consumes events; likely minimal or none.
- Consistency Model: Operates independently of Transact's strongly consistent core database; eventual consistency acceptable.
- Idempotency: Not specified; standard RESTful practices assumed.
- Supports extensibility scenarios where Transact business microservices or UI components query or update virtual table data via APIs.

6) Deployment
6.1 Runtime Packaging
- Packaged as a containerized microservice running on JVM.
- Environment variables configure runtime behavior.
- Health checks and scaling model not explicitly detailed but expected to follow Temenos microservice standards supporting container orchestration.

6.2 Azure Reference (AKS/ACA)
- Requires Azure Kubernetes Service (AKS) or Azure Container Apps (ACA) for container orchestration.
- Dependencies include Azure Container Registry (ACR), Key Vault for secrets, Event Hubs (if event integration used), Application Insights for telemetry, Virtual Network (VNET), and ingress controller.
- Network model supports secure, private connectivity with controlled ingress.
- Key deployment steps involve provisioning these resources, deploying container images, configuring secrets and network policies.

6.3 AWS Reference (EKS/ECS)
- Supports deployment on Amazon Elastic Kubernetes Service (EKS) or Elastic Container Service (ECS).
- Requires Amazon Elastic Container Registry (ECR) for container images, MSK or Kinesis if event streaming is used, Secrets Manager for secrets, Application Load Balancer (ALB), and Virtual Private Cloud (VPC).
- Network model ensures secure, scalable deployment with private subnets and ingress control.
- Deployment steps include setting up ECR, configuring secrets, deploying containers, and managing networking.

7) Security
- Identity integration likely leverages Temenos standard identity and access management frameworks.
- Service-to-service authentication expected via mutual TLS or token-based mechanisms but not explicitly detailed.
- Data encryption at rest and in transit assumed as per Temenos security standards.
- Secrets management integrated with cloud provider services (Key Vault, Secrets Manager).

8) Observability Ops
- Logging, metrics, and tracing capabilities are expected to be integrated with Temenos standard observability tools such as Application Insights (Azure) or equivalent on AWS.
- Common failure scenarios not specified; typical microservice issues like connectivity, data validation errors, and schema mismatches are anticipated.
- Health checks and alerting mechanisms presumed standard for microservices.

9) Demo Blueprint
- Scenario: Demonstrate creating a new custom data collection (e.g., Customer Occupations) via Virtual Table API.
- Show defining JSON schema and adding sample records through REST API calls.
- In Transact Explorer or Temenos Explorer, display how UI components or APIs retrieve and use this custom data (e.g., populating a dropdown list).
- Illustrate updating a record and verifying data persistence outside Transact core database.
- Optionally, show integration with a Transact business microservice calling Virtual Table API synchronously to enrich transaction processing.
- Duration: 5–10 minutes, focusing on ease of extensibility and separation from core banking data.

10) References
- Information synthesized from Temenos Transact architecture overview, Extensibility Framework details, and Virtual Table microservice feature descriptions.
- Specific internal references or source titles are not provided here as per guidelines.`

export const GENERIC_CONFIGURATION_BRIEF_RAW = `Generic Configuration

1) Executive Summary
The Generic Configuration microservice centralizes the storage and management of configuration files for Temenos products, enabling applications to fetch the latest configurations dynamically. It solves the problem of decentralized and inconsistent configuration management by providing a single source of truth for configuration artifacts such as .property, .json, and .xml files. Key consumers include Temenos Transact and other Temenos product components that require up-to-date configuration data for runtime behavior and integration.

2) Core Capabilities
- Storage and versioning of configuration files grouped by logical group IDs.
- Retrieval of specific configuration files by group and version IDs.
- Listing available configuration files within a group.
- Support for multiple file formats (.property, .json, .xml).
- Management APIs to add, modify, and retrieve configuration artifacts.
- Cache service enablement to optimize performance and reduce latency.
These capabilities support use cases such as centralized configuration management, dynamic configuration updates, and consistent environment setups across development, testing, and production.

3) Data Boundaries
- Owns configuration files and their version histories grouped logically.
- Manages metadata related to configuration grouping and versioning.
- Does not own business data, transaction data, or runtime state beyond configuration artifacts.
- Lifecycle includes creation, modification, retrieval, and version management of configuration files.
- Does not handle execution or enforcement of configurations; it serves as a repository and retrieval service.

4) Interfaces
4.1 Northbound APIs
- RESTful APIs are exposed for all interactions.
- Authentication details such as OAuth2, OIDC, or mTLS are not explicitly documented; assumed to follow Temenos standard security practices.
- API operations include:
• POST to store a configuration file (base64 encoded).
• PUT to edit an existing configuration file.
• GET to retrieve a configuration file by group ID and version ID.
• GET to list configuration files under a group.
- Versioning of APIs is implied but specific versioning scheme or endpoint patterns are not detailed.
- Error handling follows standard REST error models (e.g., HTTP status codes for success, client errors, server errors), specifics not documented.

4.2 Dependencies
- Persistent storage for configuration files and version metadata (database type not specified).
- Cache service to enhance retrieval performance (cache enablement mentioned).
- No explicit mention of message brokers or secrets management as mandatory dependencies.
- Configuration management APIs integrate with Temenos Packager for deployment automation.
- Adapter microservice configurations are stored and managed via Generic Configuration APIs, indicating integration dependency.
- Mandatory dependencies: persistent storage and cache service. Optional dependencies: integration with DevOps tools and Temenos Packager.

5) Integration with Temenos Transact
- Supports synchronous REST API calls for configuration retrieval.
- No explicit asynchronous event production or consumption documented for this microservice.
- Consistency model ensures retrieval of the latest or specific versioned configuration files; strong consistency implied for configuration data.
- Idempotency is inherent in versioned artifact management, allowing safe repeated retrievals and updates without side effects.

6) Deployment
6.1 Runtime Packaging
- Packaged as a containerized microservice running on a JVM-based runtime.
- Environment variables configure runtime parameters.
- Includes health checks to validate configuration and connectivity to external components.
- Supports scaling via container orchestration platforms, enabling horizontal scaling as needed.

6.2 Azure Reference (AKS/ACA)
- Requires Azure Container Registry (ACR) for container images.
- Uses Azure Key Vault for secrets management.
- Event Hubs may be used for event streaming if integrated with other microservices (not explicitly stated).
- Application Insights for monitoring and diagnostics.
- Deployed within a Virtual Network (VNET) with ingress controllers managing external access.
- Deployment involves container image deployment via Helm charts and Infrastructure as Code automation.

6.3 AWS Reference (EKS/ECS)
- Requires Elastic Container Registry (ECR) for container images.
- Uses Secrets Manager for secure secrets storage.
- Message streaming via MSK (Kafka) or Kinesis if event integration is configured.
- Application Load Balancer (ALB) manages ingress traffic.
- Deployed within a Virtual Private Cloud (VPC) with appropriate network segmentation.
- Deployment follows container orchestration best practices with Helm and IaC automation.

7) Security
- Identity integration details not explicitly documented; likely supports standard Temenos identity providers.
- Service-to-service authentication presumed via mutual TLS or OAuth2 tokens consistent with Temenos microservices architecture.
- Configuration files are stored securely with encryption at rest and in transit (standard cloud security practices implied).
- Secrets management delegated to platform-specific services (Key Vault, Secrets Manager).

8) Observability Ops
- Supports logging of API requests and internal operations for troubleshooting.
- Metrics exposed for health, performance, and usage monitoring.
- Distributed tracing integration is implied to support request flow tracking across microservices.
- Common failure scenarios include configuration retrieval failures due to network issues or version conflicts, mitigated by retries and error handling.

9) Demo Blueprint
A 5–10 minute demo could showcase:
- Using Temenos Packager to deploy a new configuration file to the Generic Configuration microservice via its POST API.
- Retrieving the deployed configuration file by group and version using the GET API from a Temenos Transact component or a test client.
- Demonstrating version management by updating the configuration with PUT and retrieving the updated version.
- Showing how Transact dynamically fetches configuration at runtime to adapt behavior without redeployment.
- Highlighting health check endpoints and monitoring metrics in the deployment environment.

10) References
- Temenos Packager overview and API integration details.
- Generic Configuration microservice API and features description.
- Adapter microservice integration with Generic Configuration.
- Temenos Transact deployment and microservices architecture overview.

If further technical specifics are needed beyond this scope, they are not found in the available sources.`

export const CAMT_BRIEF_RAW = `CAMT

1) Executive Summary
The CAMT microservice in Temenos solutions is designed to process inward CAMT messages, including statements, balance summaries, and debit/credit notifications received from various carriers through incoming cash management messages. It addresses the need for flexible, standardized handling of CAMT data formats (ISO 20022 XML) to support interoperability with multiple banks and internal systems. Key consumers include Temenos Transact core banking modules, downstream systems requiring cash management data, and external applications needing access to CAMT message details.

2) Core Capabilities
- Processing of inward CAMT messages (e.g., CAMT.052, CAMT.053, CAMT.054) for statements and notifications.
- Storage of CAMT message data in a dedicated microservice repository.
- Emission of events upon processing for consumption by other microservices or external systems.
- Provision of APIs to retrieve CAMT message details.
- Support for flexible integration with listeners configured for dedicated processing.
- Enables banks to maintain a repository of debit and credit notifications in CAMT format.
- Facilitates notification to third-party systems about new credit and debit notifications for further processing.

3) Data & Boundaries
- Owns CAMT message data storage, including statement details, balance summaries, and debit/credit notifications.
- Manages the lifecycle of CAMT messages from receipt through storage and event publication.
- Does NOT own core transactional data or account balances beyond what is contained in CAMT messages; relies on Transact for core banking data.
- Does not handle message origination or outbound CAMT message generation.

4) Interfaces
4.1 Northbound APIs
- Provides RESTful APIs documented via OpenAPI/Swagger standards for querying CAMT message data.
- Authentication mechanisms are not explicitly detailed; likely supports OAuth2 or JWT-based auth consistent with Temenos API standards.
- API versioning follows semantic versioning principles (major.minor.patch).
- Example endpoints include retrieval of CAMT message details and lists of processed messages.
- Error models conform to standard RESTful error responses with HTTP status codes and descriptive messages.

4.2 Dependencies
- Database: Relational database for persistent CAMT message storage (specific DB not detailed).
- Message Broker: Utilizes event streaming platforms (e.g., Kafka) for event emission and consumption.
- Cache: Not explicitly mentioned; likely optional or handled by consuming services.
- Configuration: Managed via Generic Configuration microservice or equivalent.
- Secrets: Managed securely, possibly via Key Vault or Secrets Manager depending on deployment.
- All dependencies except core database and message broker are considered optional or environment-specific.

5) Integration with Temenos Transact
- Primarily asynchronous integration pattern using event-driven architecture.
- CAMT messages are received and processed asynchronously, with events published to Event Store microservice and streaming platforms.
- Supports transactional outbox pattern to ensure ordered and reliable event processing.
- Consistency model is eventual consistency with idempotency mechanisms to handle duplicate messages or retries.
- Events produced include new CAMT message notifications consumed by downstream systems for reconciliation or reporting.

6) Deployment
6.1 Runtime & Packaging
- Deployed as containerized microservice within Kubernetes environments.
- Runs on JVM (Java-based) runtime.
- Environment variables configure connectivity, security, and operational parameters.
- Health checks implemented for readiness and liveness probes.
- Supports horizontal scaling based on workload via Kubernetes autoscaling.

6.2 Azure Reference (AKS/ACA)
- Requires Azure Container Registry (ACR) for container images.
- Uses Azure Key Vault for secrets management.
- Integrates with Azure Event Hubs (Kafka-compatible) for event streaming.
- Application Insights enabled for telemetry and monitoring.
- Deployed within Virtual Network (VNET) with controlled ingress via Application Gateway and AGIC.
- Key deployment steps include container image build and push, Helm chart deployment, configuration of Event Hubs and Key Vault, and network security setup.

6.3 AWS Reference (EKS/ECS)
- Uses Amazon Elastic Container Registry (ECR) for container images.
- Employs AWS Secrets Manager for secrets storage.
- Integrates with Amazon MSK (Kafka) or Kinesis for event streaming.
- Application Load Balancer (ALB) manages ingress traffic.
- Deployed within Virtual Private Cloud (VPC) with subnet and security group configurations.
- Deployment involves container image management, Kubernetes/ECS service setup, event streaming configuration, and network security provisioning.

7) Security
- Integrates with identity providers supporting OAuth2/OpenID Connect for API authentication.
- Service-to-service authentication likely via mutual TLS or token-based mechanisms.
- Data encrypted at rest (database encryption) and in transit (TLS 1.2+).
- Secrets managed securely through cloud-native vaults (Azure Key Vault, AWS Secrets Manager).
- Access controls enforced via Role-Based Access Control (RBAC) consistent with Temenos security framework.

8) Observability & Ops
- Logs captured in structured format, accessible via centralized logging solutions.
- Metrics exposed for health, performance, and throughput monitored via Prometheus/Grafana or cloud-native tools.
- Distributed tracing supported through OpenTelemetry integration for end-to-end request tracking.
- Common failure scenarios include message parsing errors, event publishing failures, and database connectivity issues, all with alerting configured.

9) Demo Blueprint
- Scenario: Simulate receipt of an inward CAMT.053 statement message into Temenos Transact environment.
- The CAMT microservice processes the message asynchronously, stores details, and emits an event.
- Downstream microservices or external systems subscribe to the event and retrieve CAMT message details via REST API.
- Demonstrate querying CAMT message data, viewing balance summaries, and triggering reconciliation workflows.
- Highlight health checks, scaling behavior, and error handling during the demo.

10) References
- Temenos Transact CAMT Inward Processing Microservice Overview
- Temenos Event Store and Event Streaming Architecture
- Temenos API Framework and OpenAPI Specifications
- Azure and AWS Cloud Deployment Guides for Temenos Microservices
- Temenos Security Framework Overview
- Temenos Observability and Monitoring Practices

Not found in sources: Detailed API endpoint examples, explicit authentication protocols, and exact database technology used by CAMT microservice.`
