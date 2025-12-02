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
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* Header Tabs */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10">
                <div className="flex space-x-4 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-orange-600 text-white shadow-md transform scale-105'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
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
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-xl border border-orange-100 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                        <Scale className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-orange-900 mb-3">Temenos SaaS Compliance by Design</h2>
                        <p className="text-orange-800 leading-relaxed mb-4">
                            Continuous regulatory updates built into the platform. Certified to industry standards and aligned with global compliance frameworks.
                        </p>
                    </div>
                </div>
            </div>

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* The Compliance Challenge */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-bold text-slate-800">The Compliance Challenge</h3>
                    </div>
                    <ul className="space-y-3">
                        {[
                            'Rising regulatory pressure: DORA, ISO, GDPR, local mandates',
                            'Manual compliance = high risk & cost',
                            'Data protection, audit readiness, and operational resilience are mission-critical'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Compliance by Design */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-slate-800">Compliance by Design</h3>
                    </div>
                    <ul className="space-y-3">
                        {[
                            'Continuous regulatory updates built into the platform',
                            'Certified to ISO 27001, 22301, 20000, SOC 1 & 2 & 3',
                            'DORA-aligned resilience: BC/DR, incident tracking, and monitoring'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Data Protection & Residency */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <Lock className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-bold text-slate-800">Data Protection & Residency</h3>
                    </div>
                    <ul className="space-y-3">
                        {[
                            'End-to-end encryption, RBAC, zero trust & threat detection',
                            'Data residency controls by region',
                            'Regular penetration testing and hyperscaler security'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Key Benefits */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Key Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: 'Reduced Compliance Burden', desc: 'Automated compliance monitoring and reporting' },
                        { title: 'Lower Risk', desc: 'Built-in controls and continuous updates' },
                        { title: 'Faster Time to Market', desc: 'Pre-certified platform accelerates deployment' },
                        { title: 'Cost Efficiency', desc: 'Shared compliance infrastructure reduces overhead' }
                    ].map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-slate-800 text-sm">{benefit.title}</h4>
                                <p className="text-xs text-slate-600 mt-1">{benefit.desc}</p>
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    Regulatory Compliance Overview
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                    Temenos SaaS is designed to meet the most stringent regulatory requirements across multiple jurisdictions and frameworks.
                </p>
            </div>

            {/* Certifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* ISO 27001 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-blue-900">ISO 27001</h4>
                    </div>
                    <p className="text-sm text-blue-800">Information Security Management System certification ensuring comprehensive security controls.</p>
                </div>

                {/* ISO 22301 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Database className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-bold text-green-900">ISO 22301</h4>
                    </div>
                    <p className="text-sm text-green-800">Business Continuity Management certification for operational resilience.</p>
                </div>

                {/* ISO 20000 */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-purple-900">ISO 20000</h4>
                    </div>
                    <p className="text-sm text-purple-800">IT Service Management certification for quality service delivery.</p>
                </div>

                {/* SOC 1 & 2 & 3 */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <FileCheck className="w-6 h-6 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-orange-900">SOC 1, 2 & 3</h4>
                    </div>
                    <p className="text-sm text-orange-800">Service Organization Control reports for financial and security controls.</p>
                </div>

                {/* DORA */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl border border-red-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h4 className="font-bold text-red-900">DORA</h4>
                    </div>
                    <p className="text-sm text-red-800">Digital Operational Resilience Act aligned with BC/DR and incident management.</p>
                </div>

                {/* GDPR */}
                <div className="bg-gradient-to-br from-cyan-50 to-sky-50 p-6 rounded-xl border border-cyan-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                            <Lock className="w-6 h-6 text-cyan-600" />
                        </div>
                        <h4 className="font-bold text-cyan-900">GDPR</h4>
                    </div>
                    <p className="text-sm text-cyan-800">General Data Protection Regulation compliance for data privacy and protection.</p>
                </div>
            </div>

            {/* Compliance Features */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">Continuous Compliance Features</h3>
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
                                <span className="text-sm text-slate-700">{feature}</span>
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
            {/* Overview */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-100 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-red-900 mb-2">Risk Management Framework</h2>
                        <p className="text-red-800 leading-relaxed">
                            Comprehensive risk management approach covering identification, assessment, mitigation, and monitoring of security and operational risks.
                        </p>
                    </div>
                </div>
            </div>

            {/* Risk Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Security Risks */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Security Risk Management
                    </h3>
                    <ul className="space-y-3">
                        {[
                            'Threat modeling and vulnerability assessments',
                            'Regular penetration testing and security audits',
                            'Security incident and event management (SIEM)',
                            'Threat intelligence and monitoring',
                            'Zero-trust architecture implementation'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Operational Risks */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        Operational Risk Management
                    </h3>
                    <ul className="space-y-3">
                        {[
                            'Business continuity and disaster recovery planning',
                            'Change management and release controls',
                            'Capacity planning and performance monitoring',
                            'Incident management and root cause analysis',
                            'Service level agreement (SLA) monitoring'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Risk Assessment Matrix */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">Risk Assessment Process</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { step: '1. Identify', desc: 'Identify potential risks and threats', color: 'blue' },
                            { step: '2. Assess', desc: 'Evaluate likelihood and impact', color: 'purple' },
                            { step: '3. Mitigate', desc: 'Implement controls and safeguards', color: 'green' },
                            { step: '4. Monitor', desc: 'Continuous monitoring and review', color: 'orange' }
                        ].map((phase, idx) => (
                            <div key={idx} className={`p-4 bg-${phase.color}-50 border border-${phase.color}-100 rounded-lg`}>
                                <div className={`text-lg font-bold text-${phase.color}-900 mb-2`}>{phase.step}</div>
                                <p className={`text-sm text-${phase.color}-800`}>{phase.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Third-Party Risk */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Third-Party Risk Management</h3>
                <div className="space-y-3">
                    {[
                        'Vendor due diligence and assessment',
                        'Contractual security requirements',
                        'Ongoing vendor monitoring and audits',
                        'Supply chain security controls',
                        'Exit and transition planning'
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-700">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TrustCenterView = () => {
    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-blue-900 mb-2">Temenos Trust Center</h2>
                        <p className="text-blue-800 leading-relaxed">
                            Transparency and trust through comprehensive security documentation, certifications, and compliance reports.
                        </p>
                    </div>
                </div>
            </div>

            {/* Trust Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <FileCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Certifications</h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Industry-leading certifications and attestations demonstrating our commitment to security and compliance.
                    </p>
                    <ul className="space-y-2">
                        {['ISO 27001', 'ISO 22301', 'ISO 20000', 'SOC 1, 2 & 3'].map((cert, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {cert}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Security Practices</h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Comprehensive security controls and best practices protecting your data and operations.
                    </p>
                    <ul className="space-y-2">
                        {['Encryption at rest & in transit', 'Multi-factor authentication', 'Regular security testing', 'Incident response'].map((practice, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                {practice}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-3">Transparency</h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Open communication about our security posture, incidents, and continuous improvements.
                    </p>
                    <ul className="space-y-2">
                        {['Security documentation', 'Compliance reports', 'Audit results', 'Status updates'].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Available Resources */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">Available Resources</h3>
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
                            <div key={idx} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                                <h4 className="font-semibold text-slate-800 mb-1">{resource.title}</h4>
                                <p className="text-xs text-slate-600">{resource.desc}</p>
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Security Policy Framework
                </h3>
                <p className="text-slate-600 leading-relaxed">
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
                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 bg-${policy.color}-100 rounded-lg`}>
                                <policy.icon className={`w-6 h-6 text-${policy.color}-600`} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">{policy.title}</h3>
                        </div>
                        <ul className="space-y-2">
                            {policy.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-3 text-slate-600">
                                    <CheckCircle2 className={`w-4 h-4 text-${policy.color}-500 mt-0.5 flex-shrink-0`} />
                                    <span className="text-sm leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Policy Governance */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Policy Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: 'Annual Review', desc: 'All policies reviewed and updated annually' },
                        { title: 'Board Approval', desc: 'Executive oversight and approval process' },
                        { title: 'Employee Training', desc: 'Mandatory security awareness training' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg">
                            <h4 className="font-semibold text-slate-800 mb-2">{item.title}</h4>
                            <p className="text-sm text-slate-600">{item.desc}</p>
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
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-xl border border-purple-100 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <Lock className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-purple-900 mb-2">Data Protection & Privacy</h2>
                        <p className="text-purple-800 leading-relaxed">
                            Comprehensive data protection controls ensuring confidentiality, integrity, and availability of customer data.
                        </p>
                    </div>
                </div>
            </div>

            {/* Protection Layers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
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
                            <li key={idx} className="flex items-start gap-3 text-slate-600">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
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
                            <li key={idx} className="flex items-start gap-3 text-slate-600">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
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
                            <li key={idx} className="flex items-start gap-3 text-slate-600">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* GDPR Compliance */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">GDPR Compliance Features</h3>
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
                            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-slate-800 text-sm">{feature.title}</h4>
                                    <p className="text-xs text-slate-600 mt-1">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Security Testing */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Regular Security Testing</h3>
                <div className="space-y-3">
                    {[
                        'Annual third-party penetration testing',
                        'Quarterly vulnerability assessments',
                        'Continuous security monitoring',
                        'Automated security scanning',
                        'Red team exercises'
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-700">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModernCompliance;
