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
    Key,
    Network
} from 'lucide-react';

const ModernSaaSSecurity = () => {
    const [activeTab, setActiveTab] = useState('api');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: CloudCog },
        { id: 'architecture', label: 'Architecture', icon: Layers },
        { id: 'services', label: 'Security Services', icon: Shield },
        { id: 'api', label: 'API Security', icon: Lock },
        { id: 'network', label: 'Network Security', icon: Network },
        { id: 'integration', label: 'Integration', icon: Server },
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
                                    ? 'bg-indigo-600 text-white shadow-md transform scale-105'
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
                        {activeTab === 'overview' && <OverviewView />}
                        {activeTab === 'architecture' && <ArchitectureView />}
                        {activeTab === 'services' && <SecurityServicesView />}
                        {activeTab === 'api' && <ApiSecurityView />}
                        {activeTab === 'network' && <NetworkSecurityView />}
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
                        24/7 security monitoring & observability and threat detection with automated response capabilities.
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
                            'RBAC, zero-trust and threat detection',
                            'Penetration Testing & Vulnarability Management',
                            'TLS 1.2 encryption'
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
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
                        <Shield className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-3">Managed Security Services</h3>
                        <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed">
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
                                <div className="text-2xl font-bold text-red-600 dark:text-red-500 mb-1">{sla.target}</div>
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
                            'IBM QRadar'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-purple-800 dark:text-purple-200">
                                <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
                    <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-4">Ticketing & ITSM</h3>
                    <ul className="space-y-3">
                        {[
                            'ServiceNow',
                            'Jira Service Management',
                            'BMC Remedy',
                            'REST API integration',
                            'Notifications'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-purple-800 dark:text-purple-200">
                                <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
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

        </div>
    );
};

const ApiSecurityView = () => {
    const [highlighted, setHighlighted] = useState<string | null>(null);

    const flowNodes = [
        { id: 'users', label: 'Users', x: 30, y: 10, w: 160, h: 50, color: 'bg-teal-400', text: 'text-white' },
        { id: 'frontend', label: 'Bank user Front end channel application', x: 20, y: 90, w: 180, h: 90, color: 'bg-purple-600', text: 'text-white' },
        { id: 'token', label: 'Token validation', x: 20, y: 210, w: 180, h: 40, color: 'bg-indigo-900', text: 'text-white' },
        { id: 'api', label: 'API layer (IRIS app)', x: 20, y: 290, w: 180, h: 50, color: 'bg-indigo-900', text: 'text-white' },
        { id: 'transact', label: 'Transact application', x: 20, y: 380, w: 180, h: 70, color: 'bg-indigo-900', text: 'text-white' },
        { id: 'iam', label: 'Keycloak / IAM Server', x: 310, y: 70, w: 180, h: 90, color: 'bg-purple-600', text: 'text-white' }
    ];

    const flowArrows = [
        { id: '1', from: 'users', to: 'frontend', label: '1', type: 'down' },
        { id: '2', from: 'users', to: 'iam', label: '2', type: 'across' },
        { id: '3', from: 'frontend', to: 'iam', label: '3', type: 'across' },
        { id: '4', from: 'frontend', to: 'token', label: '4', type: 'down' },
        { id: '5', from: 'token', to: 'api', label: '5', type: 'down' },
        { id: '6', from: 'api', to: 'transact', label: '6', type: 'down' },
        { id: '7', from: 'transact', to: 'transact', label: '7', type: 'self' }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">API Security</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            'OAuth 2.0 / OpenID Connect',
                            'API key management',
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

            <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
                    <div className="px-6 py-4 border-b border-indigo-100 dark:border-indigo-800/80">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-100">JWT-based Authorization Flow</h4>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-slate-700 dark:text-slate-200">
                            JSON Web Tokens provide an industry-standard way to carry claims between the front-end, IAM server, IRIS API layer, and Temenos Transact.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                {[
                                    'User requests authorization from the front-end channel app.',
                                    'Authorization is obtained from the Keycloak/IAM server, returning a token.',
                                    'The token is validated with the authorization server.',
                                    'The Temenos Transact business request is submitted with the JWT access token.',
                                    'The JWT token is validated by the API layer.',
                                    'Business request is sent to Temenos Transact with the username present in the web token.',
                                    'The user is validated against user profiles.'
                                ].map((step, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 font-semibold">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{step}</p>
                                    </div>
                                ))}

                                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Interactive Flow</p>
                                            <h6 className="text-sm font-semibold text-slate-800 dark:text-slate-100">JWT Authorization Path</h6>
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">HTML5 + TypeScript</div>
                                    </div>
                                    <div className="relative">
                                        <svg viewBox="0 0 460 430" className="w-full h-[340px] md:h-[380px] bg-slate-50 dark:bg-slate-800">
                                            {/* Arrows */}
                                            {flowArrows.map((arrow) => {
                                                const from = flowNodes.find((n) => n.id === arrow.from);
                                                const to = flowNodes.find((n) => n.id === arrow.to);
                                                if (!from || !to) return null;

                                                const startX = from.x + from.w / 2;
                                                const startY = arrow.type === 'across' ? from.y + from.h / 2 : from.y + from.h;
                                                const endX = arrow.type === 'across' ? to.x : to.x + to.w / 2;
                                                const endY = arrow.type === 'across' ? to.y + to.h / 2 : to.y;
                                                const isAcross = arrow.type === 'across';
                                                const pathD = isAcross
                                                    ? `M ${startX} ${startY} L ${endX} ${endY}`
                                                    : `M ${startX} ${startY} L ${endX} ${endY}`;

                                                return (
                                                    <g key={arrow.id}>
                                                        <path
                                                            d={pathD}
                                                            stroke="#ef4444"
                                                            strokeWidth={2}
                                                            fill="none"
                                                            markerEnd="url(#arrowhead)"
                                                            opacity={highlighted === arrow.id ? 1 : 0.7}
                                                        />
                                                        <text
                                                            x={(startX + endX) / 2}
                                                            y={(startY + endY) / 2 - 6}
                                                            textAnchor="middle"
                                                            className="fill-slate-700 dark:fill-slate-200 text-[12px] font-semibold"
                                                        >
                                                            {arrow.label}
                                                        </text>
                                                    </g>
                                                );
                                            })}

                                            {/* Arrowhead definition */}
                                            <defs>
                                                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
                                                    <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                                                </marker>
                                            </defs>

                                            {/* Nodes */}
                                            {flowNodes.map((node) => (
                                                <g
                                                    key={node.id}
                                                    onMouseEnter={() => setHighlighted(node.id)}
                                                    onMouseLeave={() => setHighlighted(null)}
                                                >
                                                    <rect
                                                        x={node.x}
                                                        y={node.y}
                                                        rx={6}
                                                        ry={6}
                                                        width={node.w}
                                                        height={node.h}
                                                        className={`${node.color} ${highlighted === node.id ? 'opacity-100' : 'opacity-90'} transition-opacity`}
                                                        stroke="#0f172a"
                                                        strokeWidth="0.5"
                                                    />
                                                    <foreignObject x={node.x + 8} y={node.y + 8} width={node.w - 16} height={node.h - 16}>
                                                        <div className={`w-full h-full flex items-center justify-center text-center px-2 text-sm font-semibold ${node.text}`}>
                                                            {node.label}
                                                        </div>
                                                    </foreignObject>
                                                </g>
                                            ))}
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                                <h5 className="font-semibold text-slate-800 dark:text-slate-100">Key Components</h5>
                                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                                    <li className="flex items-start gap-[50px]">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        Bank user front-end channel app (auth request & token receipt)
                                    </li>
                                    <li className="flex items-start gap-[50px]">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        Keycloak / IAM server (token issuance & validation)
                                    </li>
                                    <li className="flex items-start gap-[50px]">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        API layer (IRIS app) for token validation
                                    </li>
                                    <li className="flex items-start gap-[50px]">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        Temenos Transact application for business processing
                                    </li>
                                </ul>
                                <div className="rounded-md bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 px-3 py-2 text-xs text-purple-900 dark:text-purple-100">
                                    Temenos Transact does not perform authentication; it validates tokens to authorize requests.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NetworkSecurityView = () => {
    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Network className="w-5 h-5 text-blue-600" />
                    Network Security
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Comprehensive network security controls protecting infrastructure, data flows, and communication channels.
                </p>
            </div>

            {/* Network Protections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-200 mb-2">Network Firewall</p>
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3 text-center">Azure Firewall</h3>
                    <ul className="space-y-3 text-slate-700 dark:text-slate-200">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">Create firewall rules that provide fine-grained control over network traffic and easily deploy firewall security across multiple VNets.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">Automatically scales to cover cloud infrastructure.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-200 mb-2">WAF</p>
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3 text-center">Azure WAF</h3>
                    <ul className="space-y-3 text-slate-700 dark:text-slate-200">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">Managed WAF solution which protects against common web exploits and bots that can affect availability, compromise security, or consume excessive resources.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">Temenos SaaS production environments are tested with WAF enabled in preventive mode.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">In Temenos SaaS applied to Production environment. Use OWASP Core Rule Set 3.1.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-200 mb-2">Anti DDoS</p>
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3 text-center">Azure Basic Anti DDoS</h3>
                    <ul className="space-y-3 text-slate-700 dark:text-slate-200">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">Provides protection against Distributed Denial of Service (DDoS) attacks on Azure infrastructure.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">Dynamic detection and mitigation based on real-time threat intelligence. Constantly updated DDoS attack patterns and techniques.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">Allows customization of DDoS protection policies. Utilises global network infrastructure to mitigate DDoS attacks.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ModernSaaSSecurity;




