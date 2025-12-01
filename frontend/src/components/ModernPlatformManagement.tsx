import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu,
    Server,
    Database,
    Cloud,
    Activity,
    Settings,
    Shield,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

const ModernPlatformManagement = () => {
    const [activeTab, setActiveTab] = useState('infrastructure');

    const tabs = [
        { id: 'infrastructure', label: 'Infrastructure', icon: Server },
        { id: 'resources', label: 'Resource Management', icon: Cpu },
        { id: 'configuration', label: 'Configuration', icon: Settings },
        { id: 'monitoring', label: 'Monitoring', icon: Activity },
    ];

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Header Tabs */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 shadow-sm z-10">
                <div className="flex space-x-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-cyan-600 text-white shadow-md transform scale-105'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {activeTab === 'infrastructure' && <InfrastructureView />}
                        {activeTab === 'resources' && <ResourceManagementView />}
                        {activeTab === 'configuration' && <ConfigurationView />}
                        {activeTab === 'monitoring' && <MonitoringView />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Sub-components ---

const InfrastructureView = () => {
    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-8 rounded-xl border border-cyan-100 dark:border-cyan-800 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-cyan-100 dark:bg-cyan-800 rounded-lg">
                        <Server className="w-8 h-8 text-cyan-600 dark:text-cyan-300" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-cyan-900 dark:text-cyan-100 mb-3">Infrastructure Controls</h2>
                        <p className="text-cyan-800 dark:text-cyan-200 leading-relaxed">
                            Secure, scalable, and resilient infrastructure built on industry-leading cloud platforms with comprehensive security controls.
                        </p>
                    </div>
                </div>
            </div>

            {/* Cloud Infrastructure */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                        <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Cloud Platform</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                        Built on Microsoft Azure with enterprise-grade security, compliance, and reliability.
                    </p>
                    <ul className="space-y-2">
                        {['Global availability zones', 'Auto-scaling capabilities', '99.9% SLA uptime', 'Disaster recovery'].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                        <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Data Layer</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                        Highly available database infrastructure with automated backups and encryption.
                    </p>
                    <ul className="space-y-2">
                        {['Encrypted at rest (TDE)', 'Automated backups', 'Point-in-time recovery', 'Geo-replication'].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Network Security</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                        Multi-layered network security with firewalls, DDoS protection, and encryption.
                    </p>
                    <ul className="space-y-2">
                        {['Virtual network isolation', 'DDoS protection', 'Web application firewall', 'TLS 1.2+ encryption'].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Infrastructure Security Controls */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Infrastructure Security Controls</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            'Infrastructure as Code (IaC) for consistent deployments',
                            'Automated security patching and updates',
                            'Network segmentation and micro-segmentation',
                            'Intrusion detection and prevention systems (IDS/IPS)',
                            'Security information and event management (SIEM)',
                            'Vulnerability scanning and management',
                            'Container security and image scanning',
                            'API gateway and rate limiting'
                        ].map((control, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{control}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResourceManagementView = () => {
    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Resource Management & Optimization
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Efficient allocation and management of compute, storage, and network resources to ensure optimal performance and cost-effectiveness.
                </p>
            </div>

            {/* Resource Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">Compute Resources</h3>
                    <ul className="space-y-3">
                        {[
                            'Auto-scaling based on demand',
                            'Load balancing across instances',
                            'CPU and memory optimization',
                            'Container orchestration (Kubernetes)',
                            'Serverless function execution'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-blue-800 dark:text-blue-200">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
                    <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-4">Storage Resources</h3>
                    <ul className="space-y-3">
                        {[
                            'Tiered storage (hot, cool, archive)',
                            'Automated data lifecycle management',
                            'Storage encryption and compression',
                            'Backup and snapshot management',
                            'Content delivery network (CDN)'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-purple-800 dark:text-purple-200">
                                <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Capacity Planning */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Capacity Planning & Forecasting</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: 'Usage Monitoring', desc: 'Real-time tracking of resource utilization' },
                            { title: 'Trend Analysis', desc: 'Historical data analysis for forecasting' },
                            { title: 'Proactive Scaling', desc: 'Automated scaling before capacity limits' }
                        ].map((item, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{item.title}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cost Optimization */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Cost Optimization Strategies</h3>
                <div className="space-y-3">
                    {[
                        'Right-sizing instances based on actual usage',
                        'Reserved capacity for predictable workloads',
                        'Spot instances for non-critical workloads',
                        'Automated shutdown of idle resources',
                        'Storage tiering and lifecycle policies',
                        'Network traffic optimization'
                    ].map((strategy, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{strategy}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ConfigurationView = () => {
    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-lg">
                        <Settings className="w-6 h-6 text-orange-600 dark:text-orange-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-2">Configuration Management</h3>
                        <p className="text-orange-800 dark:text-orange-200 leading-relaxed">
                            Automated configuration management ensuring consistency, compliance, and security across all infrastructure components.
                        </p>
                    </div>
                </div>
            </div>

            {/* Configuration Practices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    {
                        title: 'Infrastructure as Code',
                        icon: Server,
                        items: [
                            'Version-controlled infrastructure definitions',
                            'Automated provisioning and deployment',
                            'Consistent environment configuration',
                            'Rollback capabilities',
                            'Audit trail of all changes'
                        ]
                    },
                    {
                        title: 'Configuration Baseline',
                        icon: Shield,
                        items: [
                            'Security hardening standards',
                            'CIS benchmarks compliance',
                            'Automated compliance checking',
                            'Drift detection and remediation',
                            'Regular security assessments'
                        ]
                    },
                    {
                        title: 'Change Management',
                        icon: Settings,
                        items: [
                            'Approval workflows for changes',
                            'Testing in non-production environments',
                            'Scheduled maintenance windows',
                            'Emergency change procedures',
                            'Post-change validation'
                        ]
                    },
                    {
                        title: 'Secrets Management',
                        icon: Shield,
                        items: [
                            'Centralized secrets storage (Azure Key Vault)',
                            'Automated secret rotation',
                            'Access control and auditing',
                            'Encryption at rest and in transit',
                            'Integration with CI/CD pipelines'
                        ]
                    }
                ].map((practice, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <practice.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{practice.title}</h3>
                        </div>
                        <ul className="space-y-2">
                            {practice.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Configuration Tools */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Configuration Management Tools</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Terraform', 'Ansible', 'Azure ARM', 'Kubernetes', 'Helm', 'GitOps', 'Azure DevOps', 'Docker'].map((tool, idx) => (
                            <div key={idx} className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-center">
                                <span className="font-semibold text-blue-900 dark:text-blue-200 text-sm">{tool}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MonitoringView = () => {
    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Platform Monitoring & Alerting
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Comprehensive monitoring and alerting across all infrastructure layers to ensure availability, performance, and security.
                </p>
            </div>

            {/* Monitoring Layers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Infrastructure Monitoring</h3>
                    <ul className="space-y-2">
                        {[
                            'Server health and uptime',
                            'CPU, memory, disk usage',
                            'Network performance',
                            'Service availability',
                            'Resource utilization'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                        <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Application Monitoring</h3>
                    <ul className="space-y-2">
                        {[
                            'Application performance (APM)',
                            'Response times and latency',
                            'Error rates and exceptions',
                            'Transaction tracing',
                            'User experience metrics'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Security Monitoring</h3>
                    <ul className="space-y-2">
                        {[
                            'Security events and alerts',
                            'Intrusion detection',
                            'Vulnerability scanning',
                            'Compliance monitoring',
                            'Threat intelligence'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Alerting & Incident Response */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Alerting & Incident Response</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Real-Time Alerts', desc: 'Immediate notification of critical issues', icon: AlertCircle },
                            { title: 'Alert Routing', desc: 'Intelligent routing to on-call teams', icon: Activity },
                            { title: 'Escalation Policies', desc: 'Automated escalation for unresolved issues', icon: Server },
                            { title: 'Incident Management', desc: 'Structured incident response workflows', icon: Shield }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{item.title}</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monitoring Tools */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Monitoring Stack</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Azure Monitor', 'Application Insights', 'Log Analytics', 'Azure Sentinel', 'Prometheus', 'Grafana', 'ELK Stack', 'PagerDuty'].map((tool, idx) => (
                        <div key={idx} className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center">
                            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{tool}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModernPlatformManagement;
