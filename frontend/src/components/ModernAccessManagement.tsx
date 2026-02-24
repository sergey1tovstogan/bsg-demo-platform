import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ScanEye,
    UserCheck,
    Key,
    Shield,
    Activity,
    FileText,
    Lock,
    AlertCircle,
    CheckCircle2,
    Info,
    X
} from 'lucide-react';

const ModernAccessManagement = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: ScanEye },
        { id: 'privileged', label: 'Privileged Access', icon: Key },
        { id: 'policies', label: 'Access Policies', icon: Shield },
        { id: 'monitoring', label: 'Monitoring & Audit', icon: Activity },
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
                                    ? 'bg-red-600 text-white shadow-md transform scale-105'
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
                        {activeTab === 'privileged' && <PrivilegedAccessView />}
                        {activeTab === 'policies' && <AccessPoliciesView />}
                        {activeTab === 'monitoring' && <MonitoringView />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Sub-components ---

const heroTooltip = {
    title: 'Secure Interfaces',
    description: 'Interfaces used to integrate with third party services are provided in a secure manner using network controls, encrypted protocols, and modern authentication mechanisms, such as mTLS, SFTP, FTPS, IP whitelisting, VPN and similar. Administrative interfaces used for Temenos\' management of the service are protected by appropriate controls such as encrypted protocols, VPN, multi-factor authentication, source IP restriction, Temenos managed identities, and Privileged Access Management (PAM) systems as appropriate.\nTemenos utilises the principles of \'least privilege\', \'business justified requirement\' and \'segregation of duties\' when granting access to resources.'
};

const OverviewView = () => {
    const [activeTooltip, setActiveTooltip] = useState(false);

    return (
        <div className="space-y-6 relative">
            {/* Hero Section */}
            <div
                className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-8 rounded-xl border border-red-100 dark:border-red-800 shadow-sm cursor-pointer transition-all duration-300 hover:border-red-400 dark:hover:border-red-600"
                onClick={() => setActiveTooltip(prev => !prev)}
                title="Click for additional information"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-800 rounded-lg">
                        <ScanEye className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-3">Access Management</h2>
                        <p className="text-red-800 dark:text-red-200 leading-relaxed">
                            Comprehensive privileged access monitoring and control ensuring secure access to critical systems and data.
                        </p>
                    </div>
                    <Info className="w-5 h-5 text-red-500 opacity-70 flex-shrink-0" />
                </div>
            </div>

            {/* Key Principles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Least Privilege</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Users are granted the minimum level of access required to perform their job functions, reducing the attack surface.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mb-4">
                        <UserCheck className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Separation of Duties</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Critical operations require multiple approvals, preventing any single user from having complete control over sensitive processes.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Continuous Monitoring</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        All privileged access is logged and monitored in real-time, with automated alerts for suspicious activities.
                    </p>
                </div>
            </div>

            {/* Access Control Features */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Access Control Features</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            'Multi-factor authentication (MFA) for all users',
                            'Role-based access control (RBAC)',
                            'Just-in-time (JIT) access provisioning',
                            'Automated access reviews and certifications',
                            'Session recording and playback',
                            'Password vaulting and rotation',
                            'Emergency access procedures',
                            'Access request and approval workflows'
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Backdrop to close tooltip when clicking outside */}
            {activeTooltip && (
                <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setActiveTooltip(false)}
                    aria-hidden
                />
            )}

            {/* Tooltip Popup */}
            <AnimatePresence>
                {activeTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-0 left-0 right-0 px-6 pb-4 z-50 pointer-events-auto"
                    >
                        <div className="w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-800 dark:bg-blue-900/30 rounded-xl">
                                    <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white text-left">
                                            {heroTooltip.title}
                                        </h4>
                                        <button
                                            onClick={() => setActiveTooltip(false)}
                                            className="ml-4 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors shrink-0"
                                            aria-label="Close"
                                        >
                                            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 leading-tight text-left whitespace-pre-line">
                                        {heroTooltip.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const PrivilegedAccessView = () => {
    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-600" />
                    Privileged Access Management (PAM)
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Privileged accounts have elevated permissions and require additional security controls to prevent unauthorized access and misuse.
                </p>
            </div>

            {/* PAM Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
                    <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-4">Credential Vaulting</h3>
                    <ul className="space-y-3">
                        {[
                            'Centralized storage of privileged credentials',
                            'Automatic password rotation',
                            'Encrypted credential storage',
                            'Check-out/check-in workflows',
                            'Emergency break-glass access'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-purple-800 dark:text-purple-200">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">Session Management</h3>
                    <ul className="space-y-3">
                        {[
                            'Session recording and monitoring',
                            'Real-time session alerts',
                            'Session isolation and sandboxing',
                            'Concurrent session limits',
                            'Session timeout policies'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-blue-800 dark:text-blue-200">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Access Workflow */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Privileged Access Workflow</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { step: '1. Request', desc: 'User submits access request', color: 'blue' },
                            { step: '2. Approve', desc: 'Manager/security approves', color: 'purple' },
                            { step: '3. Access', desc: 'Time-limited access granted', color: 'green' },
                            { step: '4. Audit', desc: 'All actions logged and reviewed', color: 'orange' }
                        ].map((phase, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                                <div className="text-lg font-bold text-red-600 dark:text-red-500 mb-2">{phase.step}</div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{phase.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Best Practices */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Best Practices</h3>
                <div className="space-y-3">
                    {[
                        'Use service accounts instead of personal accounts for system access',
                        'Implement just-in-time access for temporary elevated permissions',
                        'Regularly review and certify privileged access',
                        'Enforce MFA for all privileged accounts',
                        'Monitor and alert on privileged account usage',
                        'Maintain detailed audit logs for compliance'
                    ].map((practice, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{practice}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AccessPoliciesView = () => {
    return (
        <div className="space-y-6">
            {/* Policy Overview */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">Access Control Policies</h3>
                        <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                            Comprehensive policies governing user access, authentication, and authorization across all systems.
                        </p>
                    </div>
                </div>
            </div>

            {/* Policy Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    {
                        title: 'User Access Policy',
                        items: [
                            'User provisioning and de-provisioning procedures',
                            'Access request and approval process',
                            'Regular access reviews (quarterly)',
                            'Termination and transfer procedures',
                            'Guest and contractor access controls'
                        ]
                    },
                    {
                        title: 'Authentication Policy',
                        items: [
                            'Multi-factor authentication required',
                            'Password complexity requirements',
                            'Password rotation (90 days)',
                            'Account lockout after failed attempts',
                            'Single sign-on (SSO) integration'
                        ]
                    },
                    {
                        title: 'Authorization Policy',
                        items: [
                            'Role-based access control (RBAC)',
                            'Least privilege principle',
                            'Separation of duties enforcement',
                            'Privileged access management',
                            'Emergency access procedures'
                        ]
                    },
                    {
                        title: 'Remote Access Policy',
                        items: [
                            'VPN required for remote access',
                            'Device compliance checks',
                            'Encrypted connections only',
                            'Session timeout after inactivity',
                            'Geographic access restrictions'
                        ]
                    }
                ].map((policy, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{policy.title}</h3>
                        <ul className="space-y-2">
                            {policy.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Compliance Requirements */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Regulatory Compliance</h3>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                        Access policies are designed to meet requirements from multiple regulatory frameworks:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['SOC 1 & SOC 2 & SOC 3', 'ISO 27001 27017 27018', 'GDPR', 'CSA', 'HIPAA', 'NIST', 'DORA', 'SOX'].map((framework, idx) => (
                            <div key={idx} className="px-4 py-2 bg-blue-50 border border-blue-100 dark:border-blue-800 rounded-lg text-center">
                                <span className="font-bold text-red-600 dark:text-red-500 text-sm">{framework}</span>
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
                    <Activity className="w-5 h-5 text-green-600" />
                    Access Monitoring & Auditing
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Comprehensive monitoring and logging of all access activities to detect and respond to security incidents.
                </p>
            </div>

            {/* Monitoring Capabilities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Real-Time Monitoring</h3>
                    <ul className="space-y-2">
                        {[
                            'Live session monitoring',
                            'Anomaly detection',
                            'Failed login attempts',
                            'Privilege escalation',
                            'After-hours access'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Audit Logging</h3>
                    <ul className="space-y-2">
                        {[
                            'Comprehensive audit trails',
                            'Tamper-proof logs',
                            'Long-term retention',
                            'Searchable log data',
                            'Compliance reporting'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Alerting</h3>
                    <ul className="space-y-2">
                        {[
                            'Automated alerts',
                            'Customizable rules',
                            'Multi-channel notifications',
                            'Escalation procedures',
                            'Incident response'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Logged Events */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Logged Events</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            'User login and logout events',
                            'Access request and approval',
                            'Permission changes',
                            'Failed authentication attempts',
                            'Privileged command execution',
                            'Data access and modifications',
                            'Configuration changes',
                            'Security policy violations'
                        ].map((event, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">{event}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reporting */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Compliance Reporting</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: 'Access Reviews', desc: 'Quarterly user access certification reports' },
                        { title: 'Audit Reports', desc: 'Detailed audit trail reports for compliance' },
                        { title: 'Security Metrics', desc: 'KPIs and security posture dashboards' }
                    ].map((report, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{report.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{report.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModernAccessManagement;




