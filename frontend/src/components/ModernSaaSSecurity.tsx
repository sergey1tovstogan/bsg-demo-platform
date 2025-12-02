import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudCog,
    Shield,
    Lock,
    Server,
    Activity,
    CheckCircle2,
    Layers,
    Key
} from 'lucide-react';

const ModernSaaSSecurity = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: CloudCog },
        { id: 'architecture', label: 'Architecture', icon: Layers },
        { id: 'services', label: 'Security Services', icon: Shield },
        { id: 'integration', label: 'Integration', icon: Server },
    ];

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-700/50 dark:bg-slate-900 overflow-hidden">
            {/* Header Tabs */}
            <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 dark:border-slate-700 px-6 py-4 shadow-sm z-10">
                <div className="flex space-x-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white'
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
                        {activeTab === 'overview' && <OverviewView />}
                        {activeTab === 'architecture' && <ArchitectureView />}
                        {activeTab === 'services' && <SecurityServicesView />}
                        {activeTab === 'integration' && <IntegrationView />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Sub-components ---

const OverviewView = () => {
    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
                        <CloudCog className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-3">SaaS Security Services</h2>
                        <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed">
                            Cloud-native security services providing comprehensive protection across all layers of the SaaS platform.
                        </p>
                    </div>
                </div>
            </div>

            {/* Security Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Defense in Depth</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Multiple layers of security controls protecting data, applications, and infrastructure from threats.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Zero Trust</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Never trust, always verify. Every access request is authenticated, authorized, and encrypted.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Continuous Monitoring</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        24/7 security monitoring and threat detection with automated response capabilities.
                    </p>
                </div>
            </div>

            {/* Key Features */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Cloud-Native Security Features</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            'Identity and access management (IAM)',
                            'Data encryption at rest and in transit',
                            'Web application firewall (WAF)',
                            'DDoS protection and mitigation',
                            'Threat intelligence and detection',
                            'Security information and event management (SIEM)',
                            'Vulnerability management and patching',
                            'Compliance monitoring and reporting'
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Shared Responsibility Model */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Shared Responsibility Model</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Temenos Responsibility</h4>
                        <ul className="space-y-2">
                            {['Infrastructure security', 'Platform security', 'Network security', 'Physical security'].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Customer Responsibility</h4>
                        <ul className="space-y-2">
                            {['User access management', 'Data classification', 'Application configuration', 'Security awareness training'].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ArchitectureView = () => {
    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    Security Architecture
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Multi-layered security architecture built on cloud-native principles with defense in depth strategy.
                </p>
            </div>

            {/* Architecture Layers */}
            <div className="space-y-4">
                {[
                    {
                        layer: 'Edge Security',
                        color: 'blue',
                        components: [
                            'DDoS protection (Azure DDoS Protection)',
                            'Web Application Firewall (WAF)',
                            'Content Delivery Network (CDN)',
                            'API Gateway and rate limiting',
                            'TLS 1.2+ encryption'
                        ]
                    },
                    {
                        layer: 'Network Security',
                        color: 'purple',
                        components: [
                            'Virtual network isolation',
                            'Network security groups (NSGs)',
                            'Private endpoints and service endpoints',
                            'Network traffic filtering',
                            'Intrusion detection/prevention (IDS/IPS)'
                        ]
                    },
                    {
                        layer: 'Application Security',
                        color: 'green',
                        components: [
                            'Authentication and authorization',
                            'Input validation and sanitization',
                            'Secure coding practices',
                            'Dependency scanning',
                            'Runtime application self-protection (RASP)'
                        ]
                    },
                    {
                        layer: 'Data Security',
                        color: 'orange',
                        components: [
                            'Encryption at rest (AES-256)',
                            'Transparent data encryption (TDE)',
                            'Key management (Azure Key Vault)',
                            'Data classification and labeling',
                            'Data loss prevention (DLP)'
                        ]
                    }
                ].map((layer, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className={`px-6 py-3 bg-${layer.color}-50 border-b border-${layer.color}-100`}>
                            <h4 className={`font-bold text-${layer.color}-900`}>{layer.layer}</h4>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {layer.components.map((component, compIdx) => (
                                    <div key={compIdx} className="flex items-start gap-3">
                                        <CheckCircle2 className={`w-4 h-4 text-${layer.color}-500 mt-0.5 flex-shrink-0`} />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{component}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SecurityServicesView = () => {
    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">Managed Security Services</h3>
                        <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                            Comprehensive suite of managed security services protecting your SaaS environment 24/7.
                        </p>
                    </div>
                </div>
            </div>

            {/* Service Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    {
                        title: 'Threat Detection & Response',
                        icon: Shield,
                        color: 'red',
                        services: [
                            'Security Operations Center (SOC)',
                            'Threat intelligence feeds',
                            'Behavioral analytics',
                            'Automated incident response',
                            'Forensics and investigation'
                        ]
                    },
                    {
                        title: 'Vulnerability Management',
                        icon: Activity,
                        color: 'orange',
                        services: [
                            'Continuous vulnerability scanning',
                            'Penetration testing (annual)',
                            'Security patch management',
                            'Configuration compliance',
                            'Remediation tracking'
                        ]
                    },
                    {
                        title: 'Identity & Access',
                        icon: Key,
                        color: 'purple',
                        services: [
                            'Identity and access management',
                            'Multi-factor authentication (MFA)',
                            'Privileged access management',
                            'Single sign-on (SSO)',
                            'Access governance'
                        ]
                    },
                    {
                        title: 'Data Protection',
                        icon: Lock,
                        color: 'green',
                        services: [
                            'Encryption key management',
                            'Data loss prevention (DLP)',
                            'Backup and recovery',
                            'Data residency controls',
                            'Privacy compliance'
                        ]
                    }
                ].map((category, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 bg-${category.color}-100 rounded-lg`}>
                                <category.icon className={`w-6 h-6 text-${category.color}-600`} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{category.title}</h3>
                        </div>
                        <ul className="space-y-2">
                            {category.services.map((service, serviceIdx) => (
                                <li key={serviceIdx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                    <CheckCircle2 className={`w-4 h-4 text-${category.color}-500 mt-0.5 flex-shrink-0`} />
                                    <span className="text-sm leading-relaxed">{service}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Service Level Agreements */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Service Level Agreements (SLAs)</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { metric: 'Platform Availability', target: '99.9%' },
                            { metric: 'Incident Response Time', target: '< 15 minutes' },
                            { metric: 'Security Patch Deployment', target: '< 30 days' }
                        ].map((sla, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                                <div className="text-2xl font-bold text-indigo-600 mb-1">{sla.target}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-300">{sla.metric}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const IntegrationView = () => {
    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    Security Integration Points
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Seamless integration with enterprise security tools and services for unified security management.
                </p>
            </div>

            {/* Integration Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">Identity Provider Integration</h3>
                    <ul className="space-y-3">
                        {[
                            'Azure Active Directory (Entra ID)',
                            'Okta',
                            'Ping Identity',
                            'SAML 2.0 / OIDC support',
                            'LDAP / Active Directory'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-blue-800 dark:text-blue-200">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
                    <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-4">SIEM Integration</h3>
                    <ul className="space-y-3">
                        {[
                            'Splunk',
                            'Azure Sentinel',
                            'IBM QRadar',
                            'LogRhythm',
                            'Syslog / CEF format support'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-purple-800 dark:text-purple-200">
                                <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 shadow-sm">
                    <h3 className="text-lg font-bold text-green-900 mb-4">Ticketing & ITSM</h3>
                    <ul className="space-y-3">
                        {[
                            'ServiceNow',
                            'Jira Service Management',
                            'BMC Remedy',
                            'REST API integration',
                            'Webhook notifications'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-green-800">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800 shadow-sm">
                    <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-4">Monitoring & Alerting</h3>
                    <ul className="space-y-3">
                        {[
                            'PagerDuty',
                            'Datadog',
                            'New Relic',
                            'Prometheus / Grafana',
                            'Email / SMS / Slack'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-orange-800 dark:text-orange-200">
                                <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* API Security */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">API Security</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            'OAuth 2.0 / OpenID Connect',
                            'API key management',
                            'Rate limiting and throttling',
                            'API gateway security',
                            'Request/response validation',
                            'API versioning and deprecation',
                            'Comprehensive API documentation',
                            'Developer portal and sandbox'
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernSaaSSecurity;




