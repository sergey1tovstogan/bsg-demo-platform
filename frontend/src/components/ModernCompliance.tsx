import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scale,
    Shield,
    FileCheck,
    Building2,
    Lock,
    CheckCircle2,
    AlertTriangle,
    FileText,
    Database
} from 'lucide-react';

const ModernCompliance = () => {
    const [activeTab, setActiveTab] = useState('design');

    const tabs = [
        { id: 'design', label: 'Compliance by Design', icon: Scale },
        { id: 'regulatory', label: 'Regulatory Alignment', icon: FileCheck },
        { id: 'risk', label: 'Risk Management', icon: AlertTriangle },
        { id: 'trust', label: 'Trust Center', icon: Shield },
        { id: 'policies', label: 'Security Policies', icon: FileText },
        { id: 'protection', label: 'Data Protection', icon: Lock },
    ];

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-700/50 dark:bg-slate-900 overflow-hidden">
            {/* Header Tabs */}
            <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 dark:border-slate-700 px-6 py-4 shadow-sm z-10">
                <div className="flex space-x-4 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-orange-600 text-white shadow-md transform scale-105'
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
                        {activeTab === 'design' && <ComplianceByDesignView />}
                        {activeTab === 'regulatory' && <RegulatoryAlignmentView />}
                        {activeTab === 'risk' && <RiskManagementView />}
                        {activeTab === 'trust' && <TrustCenterView />}
                        {activeTab === 'policies' && <SecurityPoliciesView />}
                        {activeTab === 'protection' && <DataProtectionView />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Sub-components ---

const ComplianceByDesignView = () => {
    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-8 rounded-xl border border-orange-100 dark:border-orange-800 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-lg">
                        <Scale className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-3">Temenos SaaS Compliance by Design and Temenos Security and Privacy Committee</h2>
                        <p className="text-orange-800 dark:text-orange-200 leading-relaxed mb-4">
                            Continuous regulatory updates built into the platform. Certified to industry standards and aligned with global compliance frameworks.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-8 rounded-xl border border-orange-100 dark:border-orange-800 shadow-sm">
                <div className="space-y-4">
                    {[
                        {
                            title: 'Security and Privacy Committee',
                            desc: 'Comprises of executive members representing risk, security, privacy, information technology, governance, operation function'
                        },
                        {
                            title: 'Primarily role',
                            desc: 'Committee oversees management effort in implementing and maintaining effective global information security and privacy compliance programs within the Group'
                        },
                        {
                            title: 'Further responsibility',
                            desc: 'An assessment of all security risks including status of remedial plans, incidents including those that may result in the breach of personal data contain them and take immediate actions to address reoccurrence.'
                        },
                        {
                            title: 'Temenos Information Security',
                            desc: 'InfoSec Team works along side the Security and Privacy Committee to develop and oversee the implementation of information security controls'
                        },
                        {
                            title: 'Security and Privacy',
                            desc: 'Quarterly Committee meetings'
                        }
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-6 bg-white/80 dark:bg-slate-900/60 border border-orange-100 dark:border-orange-700 rounded-xl overflow-hidden shadow-sm"
                        >
                            <div className="md:w-72 bg-violet-500 text-white font-bold text-lg leading-snug px-4 py-4 flex items-center justify-center text-center">
                                {item.title}
                            </div>
                            <div className="flex-1 px-5 py-4 flex items-center">
                                <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* The Compliance Challenge */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">The Compliance Challenge</h3>
                    </div>
                    <ul className="space-y-3">
                        {[
                            'Rising regulatory pressure: DORA, ISO, GDPR, local mandates',
                            'Manual compliance = high risk & cost',
                            'Data protection, audit readiness, and operational resilience are mission-critical'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Compliance by Design */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Compliance by Design</h3>
                    </div>
                    <ul className="space-y-3">
                        {[
                            'Continuous regulatory updates built into the platform',
                            'Certified to ISO 27001, 22301, 20000, SOC 1 & 2 & 3',
                            'DORA-aligned resilience: BC/DR, incident tracking, and monitoring'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Data Protection & Residency */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <Lock className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Data Protection & Residency</h3>
                    </div>
                    <ul className="space-y-3">
                        {[
                            'End-to-end encryption, RBAC, zero trust & threat detection',
                            'Data residency controls by region',
                            'Regular penetration testing and hyperscaler security'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Key Benefits */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Key Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: 'Reduced Compliance Burden', desc: 'Automated compliance monitoring and reporting' },
                        { title: 'Lower Risk', desc: 'Built-in controls and continuous updates' },
                        { title: 'Faster Time to Market', desc: 'Pre-certified platform accelerates deployment' },
                        { title: 'Cost Efficiency', desc: 'Shared compliance infrastructure reduces overhead' }
                    ].map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{benefit.title}</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RegulatoryAlignmentView = () => {
    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    Regulatory Compliance Overview
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    Temenos SaaS is designed to meet the most stringent regulatory requirements across multiple jurisdictions and frameworks.
                </p>
            </div>

            {/* Certifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* ISO 27001 */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-6 rounded-xl border border-red-100 dark:border-red-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                            <Shield className="w-6 h-6 text-red-600" />
                        </div>
                        <h4 className="font-bold text-red-900 dark:text-red-100">ISO 27001</h4>
                    </div>
                    <p className="text-sm text-red-800 dark:text-red-200">Information Security Management System certification ensuring comprehensive security controls.</p>
                </div>

                {/* ISO 22301 */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                            <Database className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-purple-900 dark:text-purple-100">ISO 22301</h4>
                    </div>
                    <p className="text-sm text-purple-800 dark:text-purple-200">Business Continuity Management certification for operational resilience.</p>
                </div>

                {/* ISO 20000 */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-purple-900 dark:text-purple-100">ISO 20000</h4>
                    </div>
                    <p className="text-sm text-purple-800 dark:text-purple-200">IT Service Management certification for quality service delivery.</p>
                </div>

                {/* SOC 1 & 2 & 3 */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                            <FileCheck className="w-6 h-6 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-orange-900 dark:text-orange-100">SOC 1, 2 & 3</h4>
                    </div>
                    <p className="text-sm text-orange-800 dark:text-orange-200">Service Organization Control reports for financial and security controls.</p>
                </div>

                {/* DORA */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-6 rounded-xl border border-red-100 dark:border-red-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h4 className="font-bold text-red-900 dark:text-red-100">DORA</h4>
                    </div>
                    <p className="text-sm text-red-800 dark:text-red-200">
                        DORA alignment is supported through BC/DR features, incident response tracking, and operational risk monitoring tools integrated into the Temenos SaaS Ops Center. BC/DR designed with active-active and active-passive options, with configurable RTO/RPO parameters based on SLA tier.
                    </p>
                </div>

                {/* GDPR */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                            <Lock className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-purple-900 dark:text-purple-100">GDPR</h4>
                    </div>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                        General Data Protection Regulation compliance for data privacy and protection. Temenos supports regional deployments to maintain data residency in compliance with GDPR, MAS TRM, PRA, and other local frameworks.
                    </p>
                </div>
            </div>

            {/* Compliance Features */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Continuous Compliance Features</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            'Automated compliance monitoring and reporting',
                            'Regular third-party audits and assessments',
                            'Continuous control testing and validation',
                            'Policy and procedure documentation',
                            'Incident response and breach notification',
                            'Data protection impact assessments (DPIA)',
                            'Vendor risk management program',
                            'Compliance training and awareness'
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
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

const RiskManagementView = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Framework Overview */}
                    <div className="flex-1 space-y-4">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Framework Overview</h3>
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
                            <div className="bg-slate-800 text-white text-center py-2 rounded font-semibold">Board of Directors / Audit Committee</div>
                            <div className="bg-slate-700 text-white text-center py-2 rounded font-semibold">CEO / Executive Management</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { title: '1st Line of Defense', body: 'Operational Management Functions' },
                                    { title: '2nd Line of Defense', body: 'Risk Management Functions' },
                                    { title: '3rd Line of Defense', body: 'Internal Audit' },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center space-y-2">
                                        <div className="text-emerald-800 dark:text-emerald-100 font-bold text-sm">{item.title}</div>
                                        <div className="bg-slate-100 dark:bg-slate-800 rounded p-4 text-slate-700 dark:text-slate-200 text-sm font-semibold">
                                            {item.body}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 rounded p-3 text-sm text-slate-700 dark:text-slate-200">
                                Internal Audit provides assurance to the Board of Directors and Senior Management on how effectively the organization assesses and manages its risks, including how the 1st and 2nd lines of defense operate.
                            </div>
                        </div>
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-center text-emerald-900 dark:text-emerald-100 font-bold">
                            Temenos adheres to the ISO 31000 Risk management principle and guidelines
                        </div>
                    </div>

                    {/* Roles and Responsibilities */}
                    <div className="flex-1 space-y-3">
                        <h3 className="text-xl font-bold text-violet-600 dark:text-violet-300">Roles and Responsibilities</h3>
                        <div className="space-y-4 text-violet-700 dark:text-violet-200 text-sm">
                            <div>
                                <div className="font-bold text-violet-600 dark:text-violet-300">Board of Directors / Audit Committee</div>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Direction on risk appetite in cooperation with Senior Management.</li>
                                    <li>Appraised of significant risks and whether Senior Management is responding appropriately.</li>
                                </ul>
                            </div>
                            <div>
                                <div className="font-bold text-violet-600 dark:text-violet-300">CEO and Senior Management</div>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Ultimate ownership of the risk management and control framework.</li>
                                    <li>Assigns responsibilities for risk management procedures to managers in specific processes, functions, or departments.</li>
                                </ul>
                            </div>
                            <div>
                                <div className="font-bold text-violet-600 dark:text-violet-300">Operational Management</div>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Ownership, responsibility, and accountability for managing risks; develop and self-assess controls to address risk.</li>
                                </ul>
                            </div>
                            <div>
                                <div className="font-bold text-violet-600 dark:text-violet-300">Risk Management function</div>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Maintains an effective risk management framework and integrated view of risk exposure across the enterprise.</li>
                                    <li>Reports to stakeholders; conducts independent review and challenges the 1LoD.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TrustCenterView = () => {
    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">Temenos Trust Center</h2>
                        <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                            Transparency and trust through comprehensive security documentation, certifications, and compliance reports.
                        </p>
                    </div>
                </div>
            </div>

            {/* Trust Center Link */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <FileCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Trust Center Link</h3>
                </div>
                <a
                    href="https://tcsp.temenos.com/trustcenter"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-300 font-semibold hover:underline"
                >
                    Link to trust center
                </a>
            </div>

            {/* Trust Pillars / Collateral */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Trust Centre Collateral</h3>
                    <a
                        href="https://tcsp.temenos.com/trustcenter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 dark:text-blue-300 font-semibold hover:underline"
                    >
                        tcsp.temenos.com/trustcenter
                    </a>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">Available Collateral</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 dark:text-slate-200 text-sm">
                        <ul className="space-y-2">
                            {[
                                'Incident Management Framework',
                                'Product Security Standard',
                                'Procurement and Vendor Management',
                                'GRM Framework',
                                'Responsible Risk Management',
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-slate-500 flex-shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <ul className="space-y-2">
                            {[
                                'Business Continuity Management Framework',
                                'Ethical Conduct',
                                'People & Development Standard',
                                'Client Audit Request',
                                'Cloud and Physical security framework',
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-slate-500 flex-shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Available Resources */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Available Resources</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Security Whitepaper', desc: 'Comprehensive overview of security architecture and controls' },
                            { title: 'Compliance Documentation', desc: 'Detailed compliance reports and certifications' },
                            { title: 'Data Processing Agreement', desc: 'GDPR-compliant data processing terms' },
                            { title: 'Penetration Test Results', desc: 'Summary of third-party security assessments' },
                            { title: 'Business Continuity Plan', desc: 'Disaster recovery and resilience documentation' },
                            { title: 'Incident Response Plan', desc: 'Security incident handling procedures' }
                        ].map((resource, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{resource.title}</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300">{resource.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SecurityPoliciesView = () => {
    return (
        <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Security Policy Framework
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Comprehensive security policies governing all aspects of information security, access control, and operational procedures.
                </p>
            </div>

            {/* Policy Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    {
                        title: 'Information Security Policy',
                        icon: Shield,
                        color: 'blue',
                        items: [
                            'Information classification and handling',
                            'Data protection and privacy requirements',
                            'Security awareness and training',
                            'Acceptable use policy',
                            'Mobile device and BYOD policy'
                        ]
                    },
                    {
                        title: 'Access Control Policy',
                        icon: Lock,
                        color: 'purple',
                        items: [
                            'User access management procedures',
                            'Privileged access controls',
                            'Authentication and authorization',
                            'Password and credential management',
                            'Access review and certification'
                        ]
                    },
                    {
                        title: 'Change Management Policy',
                        icon: FileCheck,
                        color: 'green',
                        items: [
                            'Change approval and authorization',
                            'Testing and validation requirements',
                            'Deployment and rollback procedures',
                            'Emergency change process',
                            'Change documentation and tracking'
                        ]
                    },
                    {
                        title: 'Incident Response Policy',
                        icon: AlertTriangle,
                        color: 'red',
                        items: [
                            'Incident detection and reporting',
                            'Incident classification and prioritization',
                            'Response and containment procedures',
                            'Communication and escalation',
                            'Post-incident review and lessons learned'
                        ]
                    }
                ].map((policy, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 bg-${policy.color}-100 rounded-lg`}>
                                <policy.icon className={`w-6 h-6 text-${policy.color}-600`} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{policy.title}</h3>
                        </div>
                        <ul className="space-y-2">
                            {policy.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                    <CheckCircle2 className={`w-4 h-4 text-${policy.color}-500 mt-0.5 flex-shrink-0`} />
                                    <span className="text-sm leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Policy Governance */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Policy Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: 'Annual Review', desc: 'All policies reviewed and updated annually' },
                        { title: 'Board Approval', desc: 'Executive oversight and approval process' },
                        { title: 'Employee Training', desc: 'Mandatory security awareness training' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{item.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DataProtectionView = () => {
    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-8 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg">
                        <Lock className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-2">Data Protection & Privacy</h2>
                        <p className="text-purple-800 dark:text-purple-200 leading-relaxed">
                            Comprehensive data protection controls ensuring confidentiality, integrity, and availability of customer data.
                        </p>
                    </div>
                </div>
            </div>

            {/* Protection Layers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-600" />
                        Encryption
                    </h3>
                    <ul className="space-y-3">
                        {[
                            'AES-256 encryption at rest',
                            'TLS 1.2+ for data in transit',
                            'Key management with Azure Key Vault',
                            'Database transparent data encryption (TDE)',
                            'Application-level encryption'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        Access Controls
                    </h3>
                    <ul className="space-y-3">
                        {[
                            'Role-based access control (RBAC)',
                            'Attribute-based access control (ABAC)',
                            'Multi-factor authentication (MFA)',
                            'Least privilege principle',
                            'Regular access reviews'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        Data Residency
                    </h3>
                    <ul className="space-y-3">
                        {[
                            'Regional data center options',
                            'Data sovereignty compliance',
                            'Cross-border transfer controls',
                            'Data localization requirements',
                            'Customer-controlled data location'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* GDPR Compliance */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">GDPR Compliance Features</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Data Subject Rights', desc: 'Right to access, rectification, erasure, and portability' },
                            { title: 'Privacy by Design', desc: 'Privacy controls built into system architecture' },
                            { title: 'Data Processing Agreement', desc: 'GDPR-compliant DPA with all customers' },
                            { title: 'Breach Notification', desc: '72-hour breach notification procedures' },
                            { title: 'Data Protection Impact Assessment', desc: 'Regular DPIA for high-risk processing' },
                            { title: 'Data Minimization', desc: 'Collect and retain only necessary data' }
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{feature.title}</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Security Testing */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Regular Security Testing</h3>
                <div className="space-y-3">
                    {[
                        'Annual third-party penetration testing',
                        'Quarterly vulnerability assessments',
                        'Continuous security monitoring',
                        'Automated security scanning',
                        'Red team exercises'
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModernCompliance;




