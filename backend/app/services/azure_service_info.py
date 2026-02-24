"""
Azure Service Information Service

Provides short descriptions for Azure services from Microsoft documentation.
Caches descriptions in MongoDB for performance.
"""

from typing import Dict, Optional
from app.core.logging import get_logger
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = get_logger(__name__)

# Azure service descriptions (from Microsoft documentation)
# This is a curated list of common Azure services with short descriptions
AZURE_SERVICE_DESCRIPTIONS: Dict[str, str] = {
    "Microsoft.Storage/storageAccounts": "Azure Storage Account - Scalable cloud storage for blobs, files, queues, and tables.",
    "Microsoft.Compute/virtualMachines": "Azure Virtual Machine - On-demand scalable compute resources.",
    "Microsoft.Network/virtualNetworks": "Azure Virtual Network - Isolated network environment in the cloud.",
    "Microsoft.Network/networkSecurityGroups": "Azure Network Security Group - Controls network traffic flow.",
    "Microsoft.Network/publicIPAddresses": "Azure Public IP Address - Static or dynamic public IP addresses.",
    "Microsoft.Network/loadBalancers": "Azure Load Balancer - Distributes incoming traffic across multiple resources.",
    "Microsoft.Network/applicationGateways": "Azure Application Gateway - Web traffic load balancer with WAF capabilities.",
    "Microsoft.ContainerService/managedClusters": "Azure Kubernetes Service (AKS) - Managed Kubernetes container orchestration.",
    "Microsoft.ContainerService/managedClusters/pods": "AKS Pod - Container instance running in Kubernetes cluster.",
    "Microsoft.App/containerApps": "Azure Container Apps - Serverless container platform for microservices.",
    "Microsoft.App/managedEnvironments": "Azure Container Apps Environment - Managed environment for container apps.",
    "Microsoft.EventHub/namespaces": "Azure Event Hubs - Big data streaming platform and event ingestion service.",
    "Microsoft.ServiceBus/namespaces": "Azure Service Bus - Cloud messaging service for connecting applications.",
    "Microsoft.Sql/servers": "Azure SQL Server - Managed SQL database server.",
    "Microsoft.Sql/servers/databases": "Azure SQL Database - Managed relational database service.",
    "Microsoft.DocumentDB/databaseAccounts": "Azure Cosmos DB - Globally distributed multi-model database.",
    "Microsoft.DBforPostgreSQL/servers": "Azure Database for PostgreSQL - Managed PostgreSQL database service.",
    "Microsoft.DBforMySQL/servers": "Azure Database for MySQL - Managed MySQL database service.",
    "Microsoft.KeyVault/vaults": "Azure Key Vault - Secure storage for secrets, keys, and certificates.",
    "Microsoft.OperationalInsights/workspaces": "Azure Log Analytics Workspace - Centralized log collection and analysis.",
    "Microsoft.Insights/components": "Azure Application Insights - Application performance monitoring and diagnostics.",
    "Microsoft.Web/sites": "Azure App Service - Platform for hosting web apps, APIs, and mobile backends.",
    "Microsoft.Web/serverfarms": "Azure App Service Plan - Defines compute resources for App Service apps.",
    "Microsoft.ApiManagement/service": "Azure API Management - API gateway for publishing, securing, and managing APIs.",
    "Microsoft.CognitiveServices/accounts": "Azure Cognitive Services - AI and machine learning APIs.",
    "Microsoft.Storage/storageAccounts/blobServices": "Azure Blob Storage - Object storage for unstructured data.",
    "Microsoft.Storage/storageAccounts/fileServices": "Azure File Storage - Managed file shares in the cloud.",
    "Microsoft.Network/privateEndpoints": "Azure Private Endpoint - Private connectivity to Azure services.",
    "Microsoft.Network/routeTables": "Azure Route Table - Controls routing of network traffic.",
    "Microsoft.Network/networkInterfaces": "Azure Network Interface - Network connection for virtual machines.",
    "Microsoft.Compute/disks": "Azure Managed Disk - Persistent storage for virtual machines.",
    "Microsoft.Compute/availabilitySets": "Azure Availability Set - Ensures VM redundancy and availability.",
    "Microsoft.Compute/virtualMachineScaleSets": "Azure Virtual Machine Scale Set - Auto-scaling group of VMs.",
    "Microsoft.ContainerRegistry/registries": "Azure Container Registry - Private Docker registry for container images.",
    "Microsoft.Redis/redis": "Azure Cache for Redis - In-memory data store and cache.",
    "Microsoft.ServiceFabric/clusters": "Azure Service Fabric - Distributed systems platform for microservices.",
    "Microsoft.Batch/batchAccounts": "Azure Batch - Cloud-scale job scheduling and compute management.",
    "Microsoft.DataFactory/factories": "Azure Data Factory - Cloud ETL service for data integration.",
    "Microsoft.StreamAnalytics/streamingjobs": "Azure Stream Analytics - Real-time stream processing service.",
    "Microsoft.EventGrid/topics": "Azure Event Grid - Event routing service for serverless applications.",
    "Microsoft.NotificationHubs/namespaces": "Azure Notification Hubs - Push notification service for mobile apps.",
    "Microsoft.Cdn/profiles": "Azure CDN - Content delivery network for global content distribution.",
    "Microsoft.Network/dnsZones": "Azure DNS - Hosting service for DNS domains.",
    "Microsoft.Network/trafficManagerProfiles": "Azure Traffic Manager - DNS-based traffic load balancer.",
    "Microsoft.Network/virtualNetworkGateways": "Azure VPN Gateway - Secure site-to-site connectivity.",
    "Microsoft.Network/expressRouteCircuits": "Azure ExpressRoute - Private connection to Azure datacenters.",
    "Microsoft.Authorization/roleAssignments": "Azure Role Assignment - Access control for Azure resources.",
    "Microsoft.Authorization/policyAssignments": "Azure Policy Assignment - Governance and compliance enforcement.",
    "Microsoft.Resources/resourceGroups": "Azure Resource Group - Container for organizing Azure resources.",
    "Microsoft.Resources/deployments": "Azure Resource Manager Deployment - Template-based resource deployment.",
    "Microsoft.ManagedIdentity/userAssignedIdentities": "Azure Managed Identity - Identity for Azure resources.",
    "Microsoft.Automation/automationAccounts": "Azure Automation - Automation and configuration management service.",
    "Microsoft.Logic/workflows": "Azure Logic Apps - Serverless workflow automation platform.",
    "Microsoft.Functions": "Azure Functions - Serverless compute for event-driven applications.",
    "Microsoft.Web/staticSites": "Azure Static Web Apps - Hosting for static web applications.",
    "Microsoft.SignalRService/SignalR": "Azure SignalR Service - Real-time messaging service for web applications.",
    "Microsoft.Search/searchServices": "Azure Cognitive Search - AI-powered search service.",
    "Microsoft.MachineLearningServices/workspaces": "Azure Machine Learning - Cloud-based ML development platform.",
    "Microsoft.Synapse/workspaces": "Azure Synapse Analytics - Analytics service for big data and data warehousing.",
    "Microsoft.DataLakeStore/accounts": "Azure Data Lake Store - Scalable data lake storage.",
    "Microsoft.DataLakeAnalytics/accounts": "Azure Data Lake Analytics - Big data analytics service.",
    "Microsoft.PowerBIDedicated/capacities": "Azure Power BI Embedded - Embedded analytics platform.",
    "Microsoft.DevTestLab/labs": "Azure DevTest Labs - Development and testing environments.",
    "Microsoft.BotService/botServices": "Azure Bot Service - Platform for building conversational AI.",
    "Microsoft.Communication/CommunicationServices": "Azure Communication Services - Cloud-based communication platform.",
    "Microsoft.TimeSeriesInsights/environments": "Azure Time Series Insights - IoT time series data analytics.",
    "Microsoft.IoTCentral/IoTApps": "Azure IoT Central - Managed IoT application platform.",
    "Microsoft.Devices/IotHubs": "Azure IoT Hub - Managed IoT messaging and device management.",
    "Microsoft.Devices/ProvisioningServices": "Azure IoT Device Provisioning Service - Zero-touch device provisioning.",
    "Microsoft.DeviceUpdate/accounts": "Azure Device Update for IoT Hub - Device update management service.",
    "Microsoft.VideoAnalyzer/accounts": "Azure Video Analyzer - Video analytics and AI insights.",
    "Microsoft.Media/mediaservices": "Azure Media Services - Cloud-based media processing and streaming.",
    "Microsoft.StorageCache/caches": "Azure HPC Cache - High-performance caching for compute workloads.",
    "Microsoft.StorageSync/storageSyncServices": "Azure File Sync - Cloud file synchronization service.",
    "Microsoft.NetApp/netAppAccounts": "Azure NetApp Files - Enterprise-grade file storage service.",
    "Microsoft.DataShare/accounts": "Azure Data Share - Secure data sharing service.",
    "Microsoft.DataBox/jobs": "Azure Data Box - Physical data transfer service.",
    "Microsoft.DataBoxEdge/dataBoxEdgeDevices": "Azure Data Box Edge - Edge computing device.",
    "Microsoft.DataProtection/backupVaults": "Azure Backup - Cloud backup and recovery service.",
    "Microsoft.RecoveryServices/vaults": "Azure Recovery Services Vault - Backup and disaster recovery management.",
    "Microsoft.OperationalInsights/clusters": "Azure Log Analytics Cluster - Dedicated cluster for log analytics.",
    "Microsoft.Purview/accounts": "Azure Purview - Data governance and catalog service.",
    "Microsoft.Databricks/workspaces": "Azure Databricks - Apache Spark-based analytics platform.",
    "Microsoft.HDInsight/clusters": "Azure HDInsight - Managed Hadoop, Spark, and Kafka clusters.",
    "Microsoft.Kusto/clusters": "Azure Data Explorer - Fast and highly scalable data analytics service.",
    "Microsoft.AnalysisServices/servers": "Azure Analysis Services - Enterprise-grade analytics engine.",
    "Microsoft.PowerPlatform/powerApps": "Azure Power Apps - Low-code application development platform.",
    "Microsoft.PowerPlatform/powerAutomate": "Azure Power Automate - Workflow automation platform.",
    "Microsoft.PowerPlatform/powerVirtualAgents": "Azure Power Virtual Agents - No-code chatbot platform.",
    "Microsoft.ProjectBabylon/accounts": "Azure Project Babylon - Data catalog and discovery service.",
    "Microsoft.OpenEnergyPlatform/energyServices": "Azure Energy Services - Energy data platform.",
    "Microsoft.Quantum/workspaces": "Azure Quantum - Quantum computing development platform.",
    "Microsoft.ConfidentialLedger/ledgers": "Azure Confidential Ledger - Tamper-proof record keeping.",
    "Microsoft.ConfidentialCompute/locations": "Azure Confidential Computing - Secure enclave computing.",
    "Microsoft.TrustedLaunch": "Azure Trusted Launch - Enhanced security for VMs.",
    "Microsoft.Security/securityContacts": "Azure Security Center - Unified security management.",
    "Microsoft.Security/assessments": "Azure Security Assessment - Security posture evaluation.",
    "Microsoft.Security/iotSecuritySolutions": "Azure IoT Security - Security monitoring for IoT devices.",
    "Microsoft.Security/automations": "Azure Security Automation - Automated security response.",
    "Microsoft.SecurityInsights/onboardingStates": "Azure Sentinel - Cloud-native SIEM and SOAR.",
    "Microsoft.SecurityInsights/alertRules": "Azure Sentinel Alert Rule - Security alert detection.",
    "Microsoft.SecurityInsights/bookmarks": "Azure Sentinel Bookmark - Security investigation markers.",
    "Microsoft.SecurityInsights/cases": "Azure Sentinel Case - Security incident management.",
    "Microsoft.SecurityInsights/dataConnectors": "Azure Sentinel Data Connector - Security data ingestion.",
    "Microsoft.SecurityInsights/incidents": "Azure Sentinel Incident - Security incident tracking.",
    "Microsoft.SecurityInsights/watchlists": "Azure Sentinel Watchlist - Custom threat intelligence.",
    "Microsoft.SecurityInsights/threatIntelligence": "Azure Sentinel Threat Intelligence - Threat intelligence platform.",
    "Microsoft.OperationalInsights/queryPacks": "Azure Log Analytics Query Pack - Pre-built log queries.",
    "Microsoft.OperationalInsights/dataSources": "Azure Log Analytics Data Source - Log data collection configuration.",
    "Microsoft.OperationalInsights/savedSearches": "Azure Log Analytics Saved Search - Reusable log queries.",
    "Microsoft.OperationalInsights/storageInsightsConfigs": "Azure Log Analytics Storage Insight - Storage account monitoring.",
    "Microsoft.OperationalInsights/linkedServices": "Azure Log Analytics Linked Service - Connected data sources.",
    "Microsoft.OperationalInsights/linkedStorageAccounts": "Azure Log Analytics Linked Storage - Custom log storage.",
    "Microsoft.OperationalInsights/dataExports": "Azure Log Analytics Data Export - Export log data.",
    "Microsoft.OperationalInsights/tables": "Azure Log Analytics Table - Custom log table schema.",
    "Microsoft.OperationalInsights/workspaces/dataSources": "Azure Log Analytics Data Source - Log collection configuration.",
    "Microsoft.OperationalInsights/workspaces/savedSearches": "Azure Log Analytics Saved Search - Saved log queries.",
    "Microsoft.OperationalInsights/workspaces/storageInsightsConfigs": "Azure Log Analytics Storage Insight - Storage monitoring.",
    "Microsoft.OperationalInsights/workspaces/linkedServices": "Azure Log Analytics Linked Service - External connections.",
    "Microsoft.OperationalInsights/workspaces/linkedStorageAccounts": "Azure Log Analytics Linked Storage - Custom storage.",
    "Microsoft.OperationalInsights/workspaces/dataExports": "Azure Log Analytics Data Export - Data export configuration.",
    "Microsoft.OperationalInsights/workspaces/tables": "Azure Log Analytics Table - Custom table definitions.",
    "Microsoft.OperationalInsights/workspaces/queryPacks": "Azure Log Analytics Query Pack - Query collections.",
    "Microsoft.OperationalInsights/workspaces/dataSources/linuxSyslog": "Azure Log Analytics Linux Syslog - Linux system logs.",
    "Microsoft.OperationalInsights/workspaces/dataSources/linuxPerformanceObject": "Azure Log Analytics Linux Performance - Performance counters.",
    "Microsoft.OperationalInsights/workspaces/dataSources/windowsPerformanceCounter": "Azure Log Analytics Windows Performance - Windows performance counters.",
    "Microsoft.OperationalInsights/workspaces/dataSources/windowsEvent": "Azure Log Analytics Windows Event - Windows event logs.",
    "Microsoft.OperationalInsights/workspaces/dataSources/customLogs": "Azure Log Analytics Custom Log - Custom log collection.",
    "Microsoft.OperationalInsights/workspaces/dataSources/windowsTelemetry": "Azure Log Analytics Windows Telemetry - Windows telemetry data.",
    "Microsoft.OperationalInsights/workspaces/dataSources/applicationInsights": "Azure Log Analytics Application Insights - Application telemetry.",
    "Microsoft.OperationalInsights/workspaces/dataSources/azureActivityLog": "Azure Log Analytics Activity Log - Azure activity logs.",
    "Microsoft.OperationalInsights/workspaces/dataSources/changeTracking": "Azure Log Analytics Change Tracking - Configuration change tracking.",
    "Microsoft.OperationalInsights/workspaces/dataSources/updates": "Azure Log Analytics Updates - System update tracking.",
    "Microsoft.OperationalInsights/workspaces/dataSources/serviceMap": "Azure Log Analytics Service Map - Application dependency mapping.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkSecurityGroups": "Azure Log Analytics NSG Flow - Network flow logs.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkSecurityGroupsFlowLogs": "Azure Log Analytics NSG Flow Logs - Network security group flow logs.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchers": "Azure Log Analytics Network Watcher - Network diagnostics.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersFlowLogs": "Azure Log Analytics Network Watcher Flow Logs - Network flow logs.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersConnectionMonitors": "Azure Log Analytics Connection Monitor - Network connectivity monitoring.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersPacketCaptures": "Azure Log Analytics Packet Capture - Network packet capture.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersTopology": "Azure Log Analytics Network Topology - Network topology visualization.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersSecurityGroupView": "Azure Log Analytics Security Group View - NSG rule evaluation.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersNextHop": "Azure Log Analytics Next Hop - Network routing analysis.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersIPFlowVerify": "Azure Log Analytics IP Flow Verify - Network connectivity verification.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersTroubleshoot": "Azure Log Analytics Network Troubleshoot - Network diagnostics.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersFlowLogStatus": "Azure Log Analytics Flow Log Status - Flow log status monitoring.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersConnectionMonitorStatus": "Azure Log Analytics Connection Monitor Status - Connection monitor status.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersPacketCaptureStatus": "Azure Log Analytics Packet Capture Status - Packet capture status.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersTopologyStatus": "Azure Log Analytics Topology Status - Topology status monitoring.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersSecurityGroupViewStatus": "Azure Log Analytics Security Group View Status - NSG view status.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersNextHopStatus": "Azure Log Analytics Next Hop Status - Next hop status.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersIPFlowVerifyStatus": "Azure Log Analytics IP Flow Verify Status - IP flow status.",
    "Microsoft.OperationalInsights/workspaces/dataSources/networkWatchersTroubleshootStatus": "Azure Log Analytics Troubleshoot Status - Troubleshoot status.",
}


async def get_azure_service_description(service_type: str, db: Optional[AsyncIOMotorDatabase] = None) -> str:
    """
    Get short description for an Azure service type.
    
    Args:
        service_type: Azure resource type (e.g., "Microsoft.Storage/storageAccounts")
        db: Optional database connection (will be fetched if not provided)
        
    Returns:
        Short description of the Azure service
    """
    # Normalize service type
    service_type = service_type.strip()
    
    # Check cache first
    if db is None:
        try:
            # get_database is an async dependency function (not an async generator)
            db = await get_database()
        except Exception as e:
            logger.debug(f"Could not get database for service description cache: {e}")
            db = None
    
    if db:
        try:
            cached = await db.azure_service_descriptions.find_one({"service_type": service_type})
            if cached and cached.get("description"):
                return cached["description"]
        except Exception as e:
            logger.debug(f"Could not read from cache: {e}")
    
    # Check built-in descriptions
    if service_type in AZURE_SERVICE_DESCRIPTIONS:
        description = AZURE_SERVICE_DESCRIPTIONS[service_type]
        # Cache it
        if db:
            try:
                await db.azure_service_descriptions.update_one(
                    {"service_type": service_type},
                    {"$set": {"description": description, "source": "builtin", "updated_at": "now"}},
                    upsert=True
                )
            except Exception as e:
                logger.debug(f"Could not cache description: {e}")
        return description
    
    # Try partial matches (e.g., "Microsoft.Storage/storageAccounts" matches "Microsoft.Storage/storageAccounts/blobServices")
    for key, desc in AZURE_SERVICE_DESCRIPTIONS.items():
        if service_type.startswith(key + "/") or key.startswith(service_type + "/"):
            if db:
                try:
                    await db.azure_service_descriptions.update_one(
                        {"service_type": service_type},
                        {"$set": {"description": desc, "source": "builtin_partial", "updated_at": "now"}},
                        upsert=True
                    )
                except Exception:
                    pass
            return desc
    
    # Extract provider and resource type for generic description
    parts = service_type.split("/")
    if len(parts) >= 2:
        provider = parts[0].replace("Microsoft.", "")
        resource_type = parts[1]
        generic_desc = f"Azure {resource_type} - {provider} service."
        
        # Cache generic description
        if db:
            try:
                await db.azure_service_descriptions.update_one(
                    {"service_type": service_type},
                    {"$set": {"description": generic_desc, "source": "generic", "updated_at": "now"}},
                    upsert=True
                )
            except Exception:
                pass
        
        return generic_desc
    
    # Fallback
    return f"Azure service: {service_type}"


async def get_azure_service_descriptions_batch(service_types: list[str], db: Optional[AsyncIOMotorDatabase] = None) -> Dict[str, str]:
    """
    Get descriptions for multiple Azure service types in batch.
    
    Args:
        service_types: List of Azure resource types
        db: Optional database connection
        
    Returns:
        Dictionary mapping service_type to description
    """
    results = {}
    for service_type in service_types:
        results[service_type] = await get_azure_service_description(service_type, db)
    return results
