/**
 * Temenos Active and Future Components
 * Source: Temenos Active and Future Components.docx (component-list.json)
 */

export interface TemenosComponentItem {
  id: string
  name: string
  description: string
  introduced?: string
  group?: string
  category?: string
}

export interface TemenosComponentsData {
  active: TemenosComponentItem[]
  future: TemenosComponentItem[]
}

export const temenosComponentsData: TemenosComponentsData = {
  active: [
    // Runtime & Core Execution Layer
    {
      id: 'tafj',
      name: 'TAFJ',
      introduced: '2011',
      group: 'Runtime',
      description: 'TAFJ (Temenos Application Framework for Java) is the Java-based runtime environment introduced in 2011, serving as the current standard platform for Transact execution. It compiles InfoBasic code to Java bytecode, enabling platform independence across any JVM-compatible system. TAFJ provides multi-threading support, JDBC database connectivity, and integration with JEE application servers. The runtime includes thread management, memory management, caching services, and session handling for high-performance banking operations. TAFJ supports all major databases through JDBC including Oracle, DB2, SQL Server, PostgreSQL, and cloud databases. Container deployment on Kubernetes became possible with TAFJ, enabling modern cloud-native architectures for Transact deployments.',
    },
    {
      id: 'tocf',
      name: 'TOCF (JEE)',
      introduced: '2009',
      group: 'Runtime',
      description: 'TOCF (Temenos Open Connectivity Framework) is the JEE connectivity layer introduced in 2009 and still active today. It provides integration between JEE application servers and the Transact/T24 core banking engine through EJB (Enterprise JavaBeans) interfaces. TOCF manages connection pooling, transaction coordination, and security integration across WebSphere, WebLogic, and JBoss application servers. The framework handles OFS message processing, session management, and resource allocation for concurrent banking operations. TOCF enables enterprise deployment patterns with load balancing, failover, and clustering capabilities. It works with both TAFC (historical) and TAFJ runtimes, serving as the standard application server integration layer for Temenos deployments.',
    },
    {
      id: 'cob-24x7',
      name: 'COB 24x7',
      introduced: '2003',
      group: 'Core Services',
      description: 'COB 24x7 (Close of Business 24x7) is a continuous operations capability introduced in 2003 that enables banks to maintain online services during end-of-day batch processing. Traditional batch processing required system downtime, but COB 24x7 allows parallel execution of batch jobs while online transactions continue. It uses transaction queuing, parallel processing, and state management to minimize disruption. This capability is essential for global banks operating across time zones and for digital banking channels requiring round-the-clock availability.',
    },
    {
      id: 'tsa-2',
      name: 'TSA 2.0',
      introduced: '2020',
      group: 'Service Architecture',
      description: 'TSA 2.0 (Temenos Service Agent 2.0) is the modernized service agent component introduced in 2020, replacing the original TSA. It enables background services to run concurrently with online processing within Temenos Transact, leveraging enhanced multithreading for parallel task execution. TSA 2.0 maintains high system performance and availability, ensuring batch and maintenance operations do not interfere with customer-facing activities. It supports cloud-native deployment patterns including Kubernetes orchestration, while providing backward compatibility for existing TSA processes migrating from the original implementation.',
    },
    // Core Banking Capabilities
    {
      id: 'arrangement-architecture',
      name: 'Arrangement Architecture',
      introduced: '2009',
      group: 'Core Modules',
      description: 'Arrangement Architecture is Temenos\'s revolutionary product configuration framework introduced in 2009. It transforms banking product management from code-based to configuration-based, enabling banks to create and modify products without development effort. AA uses component-based design with property inheritance, event-driven processing, and lifecycle management. Products are defined as templates with mandatory and optional components, while arrangements represent specific product instances held by customers. The framework supports backward and forward-dated events, reversal and replay processing, and provides comprehensive audit trails. AA Designer provides visual tools for product configuration and simulation.',
    },
    {
      id: 'multi-company',
      name: 'Multi-Company',
      introduced: '2005',
      group: 'Core Services',
      description: 'Multi-Company is a core T24/Transact capability introduced in 2005 that enables a single installation to support multiple legal entities or subsidiaries within one banking group. Each company maintains separate books, accounting records, customer data, and configuration parameters while sharing the same application codebase. The Security Management System controls access based on company assignment, ensuring users only see data for authorized entities. Headquarters can access all company books while subsidiaries see only their own data. Multi-Company supports synchronized Close of Business across entities, inter-company transactions, and consolidated reporting. This capability differs from Multi-Tenant in that it serves multiple entities within ONE bank, rather than multiple separate banks.',
    },
    {
      id: 'global-processing',
      name: 'Global Processing',
      introduced: '2006',
      group: 'Core Services',
      description: 'Global Processing (GP) is a T24/Transact capability introduced in 2006 that enables independent operation of companies within a single Temenos Transact environment. Building on the Multi-Company feature, GP allows Close of Business (COB) processing for specific companies while other companies continue online transaction processing. This capability is essential for implementations spanning multiple geographical locations with different time zones, where each region needs to complete its end-of-day batch processing independently. GP enables a subsidiary in Asia to run COB while European operations remain online, ensuring continuous global operations without forcing system-wide batch windows.',
    },
    {
      id: 'online-upgrades',
      name: 'Online Upgrades',
      introduced: '2018',
      group: 'Core Services',
      description: 'Online Upgrades capability was introduced in 2018 to enable zero-downtime system updates for T24/Transact deployments. This feature allows application updates, patches, and configuration changes while the banking system remains operational, eliminating maintenance windows that disrupt customer services. Online Upgrades utilizes rolling deployment strategies with transaction queuing to ensure no in-flight transactions are lost during updates. The capability became essential for SaaS deployments where maintenance windows are unacceptable and for banks operating globally across time zones. This evolved into the Continuous Updates framework in 2024 with automated testing and rollback capabilities.',
    },
    {
      id: 'alerts',
      name: 'Alerts',
      introduced: '2010',
      group: 'Core Modules',
      description: 'Alerts is an event-based notification system introduced in 2010 for T24/Transact. It enables banks to configure and deliver customer and operational alerts based on predefined trigger conditions. The module supports multiple delivery channels including SMS, email, push notifications, and in-app messages. Alerts can be triggered by balance thresholds, transaction patterns, account status changes, payment deadlines, and custom business rules. Banks can define alert templates, personalization rules, and customer preferences for notification frequency and delivery methods.',
    },
    {
      id: 'dlm',
      name: 'DLM',
      introduced: '2015',
      group: 'Core Modules',
      description: 'DLM (Data Lifecycle Management) is a data governance component introduced in 2015 for managing the complete lifecycle of data within T24/Transact systems. It handles data archival, retention policies, purging, and compliance with regulatory requirements for data storage periods. DLM supports configurable retention rules based on data type, regulatory jurisdiction, and business needs. The module enables banks to optimize storage costs while maintaining audit trails and meeting legal requirements for data preservation and deletion.',
    },
    // Data & Analytics
    {
      id: 'data-source',
      name: 'Data Source',
      introduced: '2012',
      group: 'Data & Analytics',
      description: 'Temenos DataSource (formerly ProDB) is an enterprise data management solution for centralized management of reference and market data related to financial instruments. It manages static data, corporate actions, and pricing information critical for financial institutions. DataSource operates on a meta-model architecture enabling extensive customization without impacting upgrades. Its rules engine validates and consolidates data from international and local providers, producing a consistent "golden copy" for distribution across the organization. DataSource integrates with Temenos Transact, Triple A (TAP), and Multifonds, supporting SaaS, on-premises, and cloud deployments. It provides APIs via the TDS Packager API for configuration and customization.',
    },
    {
      id: 'insight-analytics',
      name: 'Insight and Analytics',
      introduced: '2009',
      group: 'Data & Analytics',
      description: 'Insight and Analytics is Temenos\' business intelligence and analytics platform providing comprehensive reporting, dashboards, and analytical capabilities for banking operations. Originally introduced as Insight (2009), it evolved through Embedded Analytics (2016) to the current Analytics platform (2017). The solution provides pre-built dashboards, custom report builders, predictive analytics, and in-application visualizations. It integrates with DES and Data Hub for real-time and historical data analysis, supporting regulatory reporting, customer insights, risk monitoring, and operational metrics. The platform enables drill-down capabilities for operational and strategic decision-making across Transact and Infinity.',
    },
    {
      id: 'data-lake-hub',
      name: 'Data Lake & Data Hub',
      introduced: '2019',
      group: 'Data & Analytics',
      description: 'Data Lake & Data Hub is Temenos\' enterprise data platform for centralized banking data management. Introduced as Data Lake in 2019 and evolved into the unified Data Hub in 2023, it provides a comprehensive data repository supporting raw, processed, and curated banking data at scale. The platform enables advanced analytics, machine learning, and data science initiatives using cloud-native storage technologies. Data Hub consolidates data ingestion, storage, governance, and consumption layers with built-in data catalog, lineage tracking, and quality monitoring. It supports SQL queries, API access, BI tool integration, and ML/AI workloads, serving as the foundation for Temenos analytics and reporting capabilities.',
    },
    // Payments
    {
      id: 'tph',
      name: 'TPH (Temenos Payments Hub)',
      introduced: '2018',
      group: 'Payments',
      description: 'TPH (Temenos Payments Hub) is the modern payments processing platform introduced in 2018, replacing TPS (Temenos Payment Services). It provides centralized payment processing across multiple payment types, channels, and clearing networks. TPH supports domestic and international transfers, instant payments, batch processing, and regulatory compliance including PSD2 and ISO 20022. The hub offers payment orchestration, routing optimization, exception handling, and comprehensive reporting. It integrates with SWIFT, local clearing systems, and real-time payment networks.',
    },
    {
      id: 'pemint',
      name: 'PEMINT',
      introduced: '2020',
      group: 'Payments',
      description: 'PEMINT (Payment Engine Integration) is a payment integration component introduced in 2020 that facilitates connectivity between Transact and external payment systems. It provides standardized interfaces for integrating with various payment networks, clearing houses, and third-party payment processors. PEMINT supports message transformation, protocol translation, and routing logic for different payment types. The component enables banks to connect to multiple payment infrastructures while maintaining consistent internal processing and reconciliation.',
    },
    {
      id: 'camt',
      name: 'CAMT',
      introduced: '2022',
      group: 'Payments Microservices',
      description: 'CAMT (Cash Management) is an ISO 20022-compliant microservice introduced in 2022 within the Temenos Payments Hub. It provides standardized bank-to-customer cash management messaging including account statements, balance reports, and transaction notifications. CAMT supports key ISO 20022 message types such as CAMT.052 for intraday account reports, CAMT.053 for end-of-day statements, and CAMT.054 for credit/debit notifications. The microservice enables corporate treasury systems and ERP platforms to receive structured transaction data in the universal ISO 20022 format, replacing legacy MT940/MT942 messages. CAMT integrates with Temenos Transact for account data and with the Payments Hub for transaction enrichment, supporting real-time and batch statement generation across multiple currencies and accounts.',
    },
    // Wealth
    {
      id: 'tap',
      name: 'TAP (Triple A Plus)',
      introduced: '2008',
      group: 'Wealth',
      description: 'TAP (Triple A Plus) is a wealth management and private banking platform that came to Temenos through the Odyssey acquisition in 2008. It provides comprehensive wealth management capabilities including portfolio management, investment advisory, client relationship management, and private banking services. TAP integrates with T24/Transact core banking through the TTI (TAP T24 Interface) to access account information, execute transactions, and synchronize client data. The platform supports high-net-worth individual servicing, discretionary and advisory portfolio management, and regulatory compliance for wealth management operations.',
    },
    {
      id: 'tti',
      name: 'TTI',
      introduced: '2014',
      group: 'Wealth',
      description: 'TTI (TAP T24 Interface) is an interface component introduced in 2014 that provides connectivity between TAP (Triple A Plus wealth management platform) and T24/Transact core banking. It serves as the integration bridge enabling the TAP wealth platform to communicate with the core banking system for transaction processing, account access, and data synchronization. TTI handles message translation, transaction routing, and response handling between the wealth management layer and core banking. The interface ensures consistent data exchange and transaction integrity, supporting the channel architecture where TAP manages wealth and private banking interactions while T24/Transact processes the underlying banking transactions.',
    },
    // MSF (Microservices Framework)
    {
      id: 'holdings',
      name: 'Holdings',
      introduced: '2019',
      group: 'Core Microservices',
      description: 'Holdings is a core microservice in the Temenos MSF (Microservices Framework) that provides a unified view of customer financial positions across all banking products. Introduced in 2019, it aggregates account holdings, balances, and positions from Transact core banking through REST APIs. Holdings has evolved significantly through consolidation: the Arrangements microservice was merged into Holdings in 2024, and Balances and Activities was absorbed in 2025. In 2024, Holdings was enhanced to ingest payment transaction data to support the Payments Cockpit dashboard, enabling centralized payment visibility alongside account positions. Holdings implements the CQRS pattern for read-optimized queries and integrates with Data Event Streaming for event-driven updates.',
    },
    {
      id: 'product-manager',
      name: 'Product Manager (TPM)',
      introduced: '2022',
      group: 'Product Management',
      description: 'Product Manager (TPM) is Temenos\' modern microservice for comprehensive product configuration and catalog management. Introduced in 2022 as the successor to Marketing Catalogue, TPM provides advanced capabilities for defining banking products, managing product lifecycles, and configuring product bundles. It supports dynamic product assembly, pricing rules, eligibility criteria, and channel-specific product variants. TPM integrates with Arrangement Architecture for product instantiation and supports the composable banking paradigm where products can be assembled from modular components. The service exposes OpenAPI-compliant REST interfaces for product discovery and configuration.',
    },
    {
      id: 'event-store',
      name: 'Event Store',
      introduced: '2021',
      group: 'Microservices',
      description: 'Event Store is an MSF microservice introduced in 2021 that provides event sourcing and event persistence capabilities for the Temenos architecture. It stores business events as an immutable log, enabling event replay, temporal queries, and audit trails. Event Store integrates with the Event Framework for event ingestion and distribution, supporting both business events and data events. The service enables event-driven microservices to reconstruct state from event history and supports complex event processing. In 2025, Event Store absorbed Service Orchestrator responsibilities, providing event-sourced workflow orchestration.',
    },
    {
      id: 'origination-data',
      name: 'Origination Data',
      introduced: '2021',
      group: 'Microservices',
      description: 'Origination Data is an MSF microservice introduced in 2021 that manages application data throughout the product origination lifecycle. It stores and retrieves application submissions, supporting documents, applicant information, and decision data for lending, account opening, and other origination processes. The service provides APIs for creating applications, updating application state, and retrieving application history. Origination Data integrates with Origination Processing for workflow execution and with Due Diligence for compliance verification. It supports document management, data validation, and maintains audit trails for regulatory compliance.',
    },
    {
      id: 'origination-processing',
      name: 'Origination Processing',
      introduced: '2021',
      group: 'Microservices',
      description: 'Origination Processing is an MSF microservice introduced in 2021 that executes business workflows for product origination journeys. It orchestrates the sequence of activities in lending origination, account opening, and customer onboarding including credit checks, identity verification, document collection, and approval workflows. The service integrates with external decisioning systems, credit bureaus, and fraud detection services. Origination Processing supports configurable workflow definitions, parallel task execution, and handles both straight-through processing for simple applications and complex multi-stage approval processes.',
    },
    {
      id: 'consent',
      name: 'Consent',
      introduced: '2021',
      group: 'Microservices',
      description: 'Consent is an MSF microservice introduced in 2021 that manages customer consent records for data sharing, marketing communications, and regulatory compliance. It provides APIs for recording, retrieving, and revoking customer consents across different consent types and purposes. The service supports Open Banking consent management, GDPR data processing consents, and marketing opt-in/opt-out preferences. Consent maintains consent history with timestamps and audit trails, enabling banks to demonstrate regulatory compliance. It integrates with Party services for customer identification and with digital channels for consent collection workflows.',
    },
    {
      id: 'campaign',
      name: 'Campaign',
      introduced: '2021',
      group: 'Microservices',
      description: 'Campaign is an MSF microservice introduced in 2021 that manages marketing campaigns, offers, and targeted customer communications. It provides APIs for creating campaign definitions, defining target segments, managing offer catalogs, and tracking campaign performance. Campaign supports next-best-action recommendations, personalized offers based on customer profiles, and campaign effectiveness analytics. The service integrates with digital channels for offer presentation, with Party for customer segmentation, and with Analytics for performance measurement. Campaign enables banks to execute omnichannel marketing strategies through centralized campaign management.',
    },
    {
      id: 'savings-pot',
      name: 'Savings Pot',
      introduced: '2021',
      group: 'Microservices',
      description: 'Savings Pot is an MSF microservice introduced in 2021 that enables goal-based savings functionality for retail banking customers. It provides APIs for creating savings goals, setting target amounts and dates, configuring automatic transfers, and tracking progress toward financial objectives. Savings Pot supports multiple concurrent goals, round-up savings from transactions, and milestone notifications. The service integrates with Holdings for balance management and with digital channels for customer-facing savings interfaces. It enables banks to offer modern savings experiences that help customers achieve specific financial goals.',
    },
    {
      id: 'account-aggregation',
      name: 'Account Aggregation',
      introduced: '2021',
      group: 'Microservices',
      description: 'Account Aggregation is an MSF microservice that consolidates financial account information from multiple sources into unified customer views, supporting PSD2 open banking requirements. It enables customers to view external bank accounts alongside their Temenos-held accounts through integration with open banking aggregators like SaltEdge or direct bank connections. The service provides APIs for connecting external accounts, retrieving consolidated balances, and displaying cross-institution transaction history. Temenos expects banks to either manually integrate with third-party financial institutions or use an open banking aggregator service.',
    },
    {
      id: 'due-diligence',
      name: 'Due Diligence',
      introduced: '2021',
      group: 'Microservices',
      description: 'Due Diligence is an MSF microservice introduced in 2021 that orchestrates customer due diligence processes for KYC, AML, and regulatory compliance. It provides APIs for initiating identity verification, screening against sanctions lists, performing risk assessments, and managing periodic reviews. Due Diligence integrates with external verification providers, identity document services, and watchlist screening databases. The service supports risk-based approaches where verification intensity matches customer risk profiles. It maintains compliance documentation, supports ongoing monitoring, and provides audit trails for regulatory examinations.',
    },
    {
      id: 'generic-config',
      name: 'Generic Config',
      introduced: '2021',
      group: 'Microservices',
      description: 'Generic Config is an MSF microservice introduced in 2021 that provides centralized configuration management for microservices and applications. It offers APIs for storing, retrieving, and managing configuration parameters including feature flags, runtime settings, and environment-specific values. Generic Config supports configuration versioning, hierarchical configuration inheritance, and dynamic configuration updates without service restarts. The service enables consistent configuration across distributed microservices and supports multi-tenant configurations. It integrates with deployment pipelines for configuration promotion across environments.',
    },
    {
      id: 'receipts',
      name: 'Receipts',
      introduced: '2021',
      group: 'Microservices',
      description: 'Receipts is an MSF microservice introduced in 2021 that manages transaction receipt generation, storage, and retrieval. It provides APIs for creating digital receipts for banking transactions, storing receipt documents, and enabling customer access to transaction confirmations. Receipts supports multiple receipt formats including PDF, structured data, and email-ready formats. The service integrates with transaction processing to automatically generate receipts and with digital channels for receipt delivery. It maintains receipt archives for regulatory retention requirements and supports receipt regeneration from historical transactions.',
    },
    {
      id: 'service-request',
      name: 'Service Request',
      introduced: '2021',
      group: 'Microservices',
      description: 'Service Request is an MSF microservice introduced in 2021 that manages customer service requests, inquiries, and case management workflows. It provides APIs for creating, tracking, and resolving service tickets including account inquiries, dispute handling, and general banking service requests. The microservice supports request categorization, priority assignment, SLA tracking, and integration with workflow engines for request routing. Service Request enables omnichannel service management where requests from any channel are tracked consistently.',
    },
    {
      id: 'service-request-2',
      name: 'Service Request 2.0',
      introduced: '2023',
      group: 'Microservices',
      description: 'Service Request 2.0 is an enhanced microservice introduced in 2023 that extends the original Service Request capabilities with advanced case management features. It provides improved workflow orchestration, intelligent request routing based on rules and machine learning, and enhanced integration with digital channels. Service Request 2.0 supports complex case hierarchies, multi-party involvement, automated escalation, and comprehensive audit trails. The service integrates with Temenos Journey Manager (TJM) for customer-facing request tracking and with analytics services for service quality insights and operational optimization.',
    },
    {
      id: 'virtual-tables',
      name: 'Virtual Tables',
      introduced: '2022',
      group: 'Microservices',
      description: 'Virtual Tables is an MSF integration service introduced in 2022 that provides data abstraction between microservices and underlying data sources. It creates virtual data views that aggregate data from Transact core banking, microservice databases, and external systems into unified queryable tables. Virtual Tables supports read-through data access without data replication, enabling real-time data consistency. The service integrates with MDAL (Microservices Data Abstraction Layer) and supports the Transact Explorer and Workbench development tools. It simplifies data access patterns for digital banking applications requiring cross-system data.',
    },
    // Modular Core (Composable Banking)
    {
      id: 'enterprise-pricing',
      name: 'Enterprise Pricing',
      introduced: '2022',
      group: 'Modules',
      description: 'Enterprise Pricing is a modular pricing engine introduced in 2022. It provides centralized, configurable pricing capabilities across all banking products, enabling banks to define complex pricing rules, tiered rates, and relationship-based discounts. The module supports real-time pricing calculations for deposits, lending, and fees, integrating with Arrangement Architecture for product-level pricing and with external market data sources. Enterprise Pricing enables dynamic pricing strategies based on customer segments, product bundles, and market conditions. It operates as a standalone module deployable via microservices architecture, supporting API-first integration patterns for omnichannel pricing consistency across digital and branch channels.',
    },
    {
      id: 'market-data',
      name: 'Market Data',
      introduced: '2022',
      group: 'Modules',
      description: 'Market Data is an integration module introduced in 2022 that provides Temenos Transact with real-time and historical financial market information. It serves as the conduit for external market data feeds including exchange rates, interest rate benchmarks, securities prices, and commodity values. The module integrates with major market data providers and internal treasury systems to support trading, treasury operations, and product pricing calculations. Market Data maintains reference rates used across Arrangement Architecture products for interest calculations, FX conversions, and valuations. It supports scheduled batch updates and real-time streaming, ensuring consistent market data across all banking operations and regulatory reporting requirements.',
    },
    {
      id: 'reference-data',
      name: 'Reference Data',
      introduced: '2022',
      group: 'Modules',
      description: 'Reference Data is a foundational integration module introduced in 2022 that manages static and semi-static data entities across the Temenos banking platform. It centralizes management of currencies, countries, bank identifiers (BIC/SWIFT codes), regulatory codes, and industry classifications. The module provides a single source of truth for reference information consumed by core banking, payments, regulatory reporting, and digital channels. Reference Data supports versioning, effective dating, and audit trails for compliance requirements. It integrates with external reference data sources and regulatory bodies for automated updates, reducing manual maintenance and ensuring data consistency across multi-entity and multi-jurisdictional banking operations.',
    },
    {
      id: 'deposits-accounts',
      name: 'Deposits and Accounts',
      introduced: '2022',
      group: 'Modules',
      description: 'Deposits and Accounts is a banking module introduced in 2022 for modular core banking. It provides comprehensive functionality for current accounts, savings accounts, term deposits, and notice accounts, built on Arrangement Architecture foundations. The module handles account opening, balance management, interest accrual and capitalization, statement generation, and account servicing. It supports multi-currency accounts, pooled account structures, and sweep arrangements. Deposits and Accounts integrates with Enterprise Pricing for rate calculations, Party for customer management, and Holdings for consolidated balance views. The module is deployable as a cloud-native component with full API exposure for digital channel integration.',
    },
    {
      id: 'lending',
      name: 'Lending',
      introduced: '2023',
      group: 'Modules',
      description: 'Lending is a comprehensive credit module introduced in 2023 for modular core banking. It manages the complete lending lifecycle including loan origination, disbursement, repayment schedules, interest calculations, and collections. The module supports diverse lending products: mortgages, personal loans, overdrafts, credit cards, and commercial facilities. Built on Arrangement Architecture, Lending provides configurable repayment schedules, flexible interest calculation methods, and automated fee processing. It integrates with Limits and Collateral for credit risk management, Enterprise Pricing for rate determination, and external credit bureaus for decisioning. The module supports Islamic finance structures and regulatory compliance for consumer lending across multiple jurisdictions.',
    },
    // Integration & Event Architecture
    {
      id: 'ofs',
      name: 'OFS',
      introduced: '1996',
      group: 'Integration - Messaging',
      description: 'OFS (Open Financial Service), introduced in 1996, is Temenos\'s foundational messaging protocol for external system integration. This text-based, stateless protocol enables request-response communication between external applications and the core banking system. OFS messages follow a structured format containing version, source, credentials, operation type, and field-value pairs. Supported operations include INPUT (create), AUTHORISE (approve), DELETE (remove), REVERSE (undo), and ENQUIRY (query). The protocol flows through an OFS Gateway to TOCF and into Transact Core, with parsing, validation, and transaction processing handled internally. Despite being nearly three decades old, OFS remains supported for backward compatibility and continues to underpin many integration patterns within the Temenos ecosystem.',
    },
    {
      id: 'jms',
      name: 'JMS',
      introduced: '2009',
      group: 'Integration - Messaging',
      description: 'JMS (Java Message Service) support was added to Temenos in 2009 as part of the enterprise integration expansion, enabling asynchronous messaging between T24/Transact and external systems through Java-based message queuing. JMS provides a standard API for message-oriented middleware, allowing banks to integrate with various JMS-compliant message brokers. This technology facilitates publish-subscribe and point-to-point messaging patterns, improving system decoupling and enabling scalable integration architectures. JMS support remains valuable for enterprise customers invested in Java middleware infrastructure and continues to be supported alongside Kafka and IBM MQ as a messaging transport option within the Temenos integration ecosystem.',
    },
    {
      id: 'ibm-mq',
      name: 'IBM MQ',
      introduced: '2009',
      group: 'Integration - Messaging',
      description: 'IBM MQ integration was introduced in 2009 to support enterprise message queuing between T24/Transact and external systems. As a leading enterprise messaging platform, IBM MQ provides reliable, secure, and transactional message delivery across distributed systems. The Temenos integration enables both inbound and outbound message flows through MQ queues, supporting the Integration Framework and Event Framework architectures. Configuration involves connection factories, queue managers, and channels for establishing communication. IBM MQ remains actively supported in Temenos deployments, particularly in enterprise environments where IBM middleware is standard. It serves as one of the primary transport mechanisms for the Event Framework alongside Apache Kafka, handling Business Events and Data Events.',
    },
    {
      id: 'api-framework',
      name: 'API Framework',
      introduced: '2018',
      group: 'Integration - APIs',
      description: 'The API Framework, introduced in 2018, provides Temenos\'s comprehensive OpenAPI-based API management capability. Built on Apache Camel with REST-first design principles, it exposes Transact functionality through standardized REST APIs documented via Swagger. The framework implements multi-layer security including JWT authentication, OAuth 2.0 flows, and XACML authorization. API versioning follows semantic versioning with URL-based version paths. The architecture includes API specification layer, security layer, processing layer (routing, validation, transformation), and integration layer connecting to IRIS and OFS. Out-of-the-box APIs cover Holdings, Party, Product, Lending, Payments, and Reference data. Banks can create custom APIs using Workbench\'s API Designer. The framework supports rate limiting, pagination, caching, and comprehensive error handling.',
    },
    {
      id: 'iris-r18',
      name: 'IRIS R18',
      introduced: '2018',
      group: 'Integration - APIs',
      description: 'IRIS R18, introduced in 2018, represents the mature evolution of Temenos\'s Interaction Framework with full OpenAPI/Swagger specification support. This version integrates seamlessly with the API Framework, providing standardized REST APIs with semantic versioning and comprehensive documentation. IRIS R18 features enhanced security through JWT token authentication, OAuth 2.0 flows, and XACML-based authorization. The architecture supports API versioning, request validation, response transformation, and advanced error handling with structured error responses. IRIS R18 continues as an active component in the Transact ecosystem, serving as the foundational API layer that connects external consumers to core banking functionality through well-documented, standards-compliant REST endpoints.',
    },
    {
      id: 'swagger-openapi',
      name: 'Swagger / OpenAPI',
      introduced: '2018',
      group: 'Integration - APIs',
      description: 'Swagger/OpenAPI support, formalized in Temenos in 2018, provides standardized API documentation and specification capabilities for Transact APIs. OpenAPI Specification (formerly Swagger) defines REST APIs in a machine-readable format, enabling automatic documentation generation, client SDK creation, and API testing. Temenos APIs are documented through Swagger UI, providing interactive exploration of endpoints, parameters, request/response schemas, and authentication requirements. The specifications support semantic versioning, allowing clear API evolution management. OpenAPI integration enables banks to understand available APIs, generate client code in various languages, and integrate API documentation into their developer portals. This standard remains fundamental to Temenos\'s API-first strategy.',
    },
    {
      id: 'commit-capture',
      name: 'Commit Capture',
      introduced: '2018',
      group: 'Event Framework',
      description: 'Commit Capture, introduced in 2018, provides transaction commit capture capabilities for Temenos data streaming. This component intercepts database commits within Transact, capturing data changes at the moment they are persisted. Commit Capture serves as a foundational technology for real-time data streaming, enabling immediate event generation without polling or batch processing delays. The captured changes feed into Data Event Streaming (DES) and the Data Hub, supporting operational reporting, analytics, and external system synchronization. Commit Capture works at the database level, capturing both field-level changes and complete record states. This technology remains active in Transact deployments, providing the real-time data capture essential for modern event-driven architectures.',
    },
    {
      id: 'kafka',
      name: 'Kafka',
      introduced: '2019',
      group: 'Event Framework',
      description: 'Apache Kafka integration was introduced in 2019 as part of Temenos\'s cloud-native transformation, providing high-throughput event streaming capabilities. Kafka serves as a primary transport mechanism for the Event Framework, enabling real-time event distribution through a publish-subscribe architecture. The integration supports CloudEvents specification for standardized event formatting, Avro serialization through Schema Registry, and structured topic organization. Kafka enables both Business Events and Data Events to flow to subscribers including analytics systems, external platforms, and microservices. This technology replaced older JMS-based messaging for high-scale use cases and provides the scalability and fault tolerance required for modern cloud-native banking architectures.',
    },
    {
      id: 'event-framework',
      name: 'Event Framework',
      introduced: '2021',
      group: 'Event Framework',
      description: 'The Event Framework, introduced in 2021, represents Temenos\'s modern event-driven architecture combining MQ and Kafka transport options. This framework unified integration patterns by introducing structured Business Events (account opened, payment made, customer onboarded) and Data Events (balance changed, status updated, field modified). Events follow the CloudEvents specification and flow from Transact through event brokers (Kafka/Azure Event Hub or MQ) to various subscribers including analytics systems, external platforms, and microservices. The Event Framework replaced the Integration Framework, providing greater flexibility in transport selection and more sophisticated event categorization. It supports both synchronous and asynchronous patterns, enabling loosely-coupled integrations essential for cloud-native banking architectures.',
    },
  ],
  future: [
    {
      id: 'party-master',
      name: 'Party Master',
      introduced: '2026',
      group: 'Microservices',
      description: 'Party Master is the next-generation customer information microservice that serves as the master CIF (Customer Information File) across the entire bank. It provides a single source of truth for customer data spanning both retail and corporate clients, consolidating party information that was previously fragmented across multiple systems. Party Master represents an evolution from the original Party microservice, which functioned primarily as a query-only service or proxy to underlying core banking customer data. With Party Master, banks gain full read-write capabilities for managing customer lifecycles, hierarchical corporate structures, beneficial ownership, and complex multi-entity relationships. The service supports real-time synchronization with downstream systems and provides comprehensive APIs for customer data management across all channels and applications.',
    },
    {
      id: 'limits-collateral',
      name: 'Limits and Collateral',
      introduced: '2027',
      group: 'Modules',
      description: 'Limits and Collateral modules provide comprehensive risk management within Temenos Transact as microservices. The Limits module offers centralized real-time control over credit and market risk exposures, enabling limit definition at multiple hierarchical levels (individual customers, groups, countries, currencies). It performs real-time validation during transaction processing to prevent breaches and supports complex structures like joint limits, temporary limits, and time-banded limits. The Collateral module provides flexible management of internal and external collateral assets, supporting collateral pools, cross-pledging across multiple obligations, and granular asset-level rules for advance ratios and concentration caps. It ensures real-time collateral sufficiency calculations and maintains full auditability of allocations and valuations for regulatory compliance.',
    },
    {
      id: 'unified-ledger',
      name: 'Unified Ledger',
      introduced: '2027',
      group: 'Modules',
      description: 'Unified Ledger is Temenos\'s next-generation enterprise ledger module designed to serve as a single source of truth for all balances, instruments, and movements across the entire bank. It is core and product agnostic, meaning it works across multiple banking systems without dependency on any specific core banking platform. The module enables progressive transformation by allowing banks to modernize incrementally without disrupting existing operations. Key capabilities include back-dated and future-dated cashflow projections, enterprise-level scalability with High Volume Transaction (HVT) support, and compatibility with distributed databases. Unified Ledger supports headless postings through GAI (Generic Accounting Interface), eliminating direct dependency on Transact\'s General Ledger. It is fully integrated with APIs and events for real-time data access and event-driven architectures, positioning it as a foundational component for banks pursuing composable banking strategies.',
    },
  ],
}
