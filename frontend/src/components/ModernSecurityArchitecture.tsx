import { useState } from 'react'
import {
    Shield,
    Lock,
    Key,
    FileKey,
    Server,
    Database,
    Globe,
    UserCheck,
    FileText,
    Activity,
    ArrowRight,
    Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipConfig {
    id: string
    title: string
    description: string
}

export function ModernSecurityArchitecture() {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
    const [showAuthDetails, setShowAuthDetails] = useState(false)

    const tooltips: Record<string, TooltipConfig> = {
        'key-management': {
            id: 'key-management',
            title: 'Key Management',
            description: 'The system checks for file integrity upon upload and download using checksums and cryptographic hashing methods. SSH keys and certificates are stored in Azure Key Vault to ensure secure key management practices.'
        },
        'secrets-management': {
            id: 'secrets-management',
            title: 'Secrets Management',
            description: 'Secrets management depends on stack deployment and requirements. Runtime secrets can be held within Hashicorp Vault, and minimum privilege should be used around key issuance, with audit logging of issued secrets. Good practice dictates that all runtime secrets are rotated at each deploy, and Cryptographic keys are rotated every 3 months, or whenever required by the organization. For Azure deployment, Temenos recommend using Azure Key Vault.'
        },
        'temenos-vault': {
            id: 'temenos-vault',
            title: 'Temenos Vault',
            description: 'Users should be able to create and store the application Certificates into the Vault (Azure Key vault). Applications should be able to retrieve the Certificates from the vault and use it on the fly without any storing mechanism. Temenos Vault provides a facade that can be used by products and can be configured to point to the relevant Vault implementation based on the deployment environment.'
        },
        'externalized-auth': {
            id: 'externalized-auth',
            title: 'Externalized Authorization',
            description: 'Temenos solution supports the externalized mechanism based on SAML 2.0, OIDC/ JSON Web Token (JWT) for authentication. OAuth is an open standard authorization protocol. It enables your account information to be obtained by third-party services without exposing user credentials.'
        },
        'data-encryption': {
            id: 'data-encryption',
            title: 'Data Encryption',
            description: 'Temenos uses a range of security controls to protect data at rest, at use and in transit. One of these mechanisms is Transparent Data Encryption (TDE) which provides real-time encryption and decryption of the database, associated backups, and transaction log files at rest using AES 256-bit encryption.'
        },
        'certificate-management': {
            id: 'certificate-management',
            title: 'Certificate Management',
            description: 'Certificates management (DigiCert used) procedures for Temenos SaaS. Temenos renews the certificates annually for the Temenos cloud hosted environments for clients. During deployment of application, we leverage Temenos managed domain for App deployment and secure it with our SSL certificates.'
        },
        'bank-iam': {
            id: 'bank-iam',
            title: "Bank's Identity Access Management",
            description: "For authentication, Temenos solution makes use of Bank's Identity and Access Management (IaM) solution like Active Directory. The bank's individual employees are authenticated at Active Directory. Temenos comes pre-integrated with KeyCloak which acts as the identity broker."
        },
        'authentication-box': {
            id: 'authentication-box',
            title: 'Authentication',
            description: "The external authentication mechanism for Temenos solution leverages Keycloak solution. Temenos SaaS leverages Keycloak as authentication and authorization. Keycloak can be federated to another Bank's identity management system."
        },
        'authorization-box': {
            id: 'authorization-box',
            title: 'Authorization',
            description: 'Temenos has embedded internal mechanism, native to the solution. The internal mechanism provides sufficient and granular access management to all applications as well as role/group facilities. The Temenos Security Management System (SMS) provides role-based access limits and full transaction and user activity audit.'
        },
        'audit-box': {
            id: 'audit-box',
            title: 'Audit',
            description: 'Temenos provides a full audit and logging across the entire business and technical landscape which can be utilized to track important security related events. The audit trails are stored as part of each data record and include details of the change made, by whom and when.'
        },
        'tls-entry': {
            id: 'tls-entry',
            title: 'TLS 1.2 Entry Points',
            description: 'All access to web applications and API endpoints is over HTTPS, using modern TLS ciphers (TLS 1.2).'
        }
    }

    return (
        <div className="w-full h-[800px] bg-slate-50 dark:bg-slate-900 rounded-xl relative overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Header */}
            <div className="absolute top-6 right-6 z-20 flex gap-4">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        Hover elements for details
                    </p>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="relative w-full h-full p-8">

                {/* Layout Grid - Original 3-column structure */}
                <div className="w-full h-full grid grid-cols-12 gap-4 relative z-10">

                    {/* Column 1: TLS Entry Points (Left) */}
                    <div className="col-span-2 flex items-center">
                        <div
                            className="w-full h-[70%] bg-gradient-to-br from-blue-900 to-blue-950 dark:from-blue-950 dark:to-slate-950 rounded-2xl p-4 flex flex-col items-center justify-between border-2 border-blue-700/50 shadow-xl cursor-help transition-all duration-300 hover:border-blue-500"
                            onMouseEnter={() => setActiveTooltip('tls-entry')}
                            onMouseLeave={() => setActiveTooltip(null)}
                        >
                            <div className="text-white font-bold text-center py-2">TLS 1.2<br />Entry<br />Points</div>

                            <div className="flex flex-col gap-4 w-full flex-1 justify-center">
                                {['User Interface', 'APIs', 'Events'].map((item) => (
                                    <div key={item} className="bg-blue-600/80 px-3 py-2 rounded-lg text-center text-white text-sm font-medium shadow-md hover:bg-blue-500 transition-colors">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Temenos Software (Center) */}
                    <div className="col-span-6 flex flex-col">
                        <div className="bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-slate-300 dark:border-slate-600 relative h-full">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-6 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                                <h3 className="font-bold text-slate-800 dark:text-white whitespace-nowrap">Temenos Software</h3>
                            </div>

                            <div className="h-full flex flex-col gap-4 pt-8">
                                {/* Row 1: Authentication and Authorization */}
                                <div className="grid grid-cols-2 gap-4 h-[110px]">
                                    {/* Authentication */}
                                    <div
                                        className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 rounded-xl border-2 border-blue-500/30 p-4 hover:border-blue-500/50 transition-all duration-300 cursor-help group h-full flex flex-col"
                                        onMouseEnter={() => setActiveTooltip('authentication-box')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Authentication</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded">OAuth 2.0</span>
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded">OIDC</span>
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded">SAML</span>
                                        </div>
                                    </div>

                                    {/* Authorization */}
                                    <div
                                        className="bg-gradient-to-br from-teal-500/10 to-teal-600/20 dark:from-teal-500/20 dark:to-teal-600/30 rounded-xl border-2 border-teal-500/30 p-4 hover:border-teal-500/50 transition-all duration-300 cursor-help group h-full flex flex-col"
                                        onMouseEnter={() => setActiveTooltip('authorization-box')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <UserCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Authorization</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs rounded">RBAC</span>
                                            <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs rounded">ABAC</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Audit and Externalized Auth */}
                                <div className="grid grid-cols-2 gap-4 h-[110px]">
                                    {/* Audit */}
                                    <div
                                        className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 dark:from-indigo-500/20 dark:to-indigo-600/30 rounded-xl border-2 border-indigo-500/30 p-4 hover:border-indigo-500/50 transition-all duration-300 cursor-help group h-full flex flex-col"
                                        onMouseEnter={() => setActiveTooltip('audit-box')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Audit</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">Full transaction and user activity logging</p>
                                    </div>

                                    {/* Externalized Auth */}
                                    <div
                                        className="bg-gradient-to-br from-sky-500/10 to-sky-600/20 dark:from-sky-500/20 dark:to-sky-600/30 rounded-xl border-2 border-sky-500/30 p-4 hover:border-sky-500/50 transition-all duration-300 cursor-help group h-full flex flex-col"
                                        onMouseEnter={() => setActiveTooltip('externalized-auth')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Globe className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Ext. Auth</h4>
                                        </div>
                                        <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs rounded">XACML</span>
                                    </div>
                                </div>

                                {/* Row 3: Database */}
                                <div className="grid grid-cols-1 gap-4 h-[110px]">
                                    {/* Database */}
                                    <div
                                        className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-emerald-500/20 dark:to-emerald-600/30 rounded-xl border-2 border-emerald-500/30 p-4 hover:border-emerald-500/50 transition-all duration-300 cursor-help group h-full flex items-center justify-between"
                                        onMouseEnter={() => setActiveTooltip('data-encryption')}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                                                <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Database</h4>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">TDE Encrypted</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs rounded">AES-256</span>
                                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs rounded">At Rest</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: External Services (Right) */}
                <div className="col-span-4 flex flex-col gap-3" style={{ paddingTop: '3.5rem' }}>
                    {/* Bank IAM */}
                    <div
                        className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-4 rounded-xl shadow-lg cursor-help hover:from-purple-700 hover:to-purple-800 transition-all duration-300 border-2 border-purple-500/30"
                        onMouseEnter={() => setActiveTooltip('bank-iam')}
                        onMouseLeave={() => setActiveTooltip(null)}
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <Server className="w-5 h-5" />
                            <h4 className="font-bold text-sm">Bank's IAM</h4>
                        </div>
                        <p className="text-purple-100 text-xs">Identity Access Management</p>
                    </div>

                    {/* Secrets Management */}
                    <div
                        className="bg-gradient-to-br from-violet-500 to-violet-600 text-white p-4 rounded-xl shadow-lg cursor-help hover:from-violet-600 hover:to-violet-700 transition-all duration-300 border-2 border-violet-400/30"
                        onMouseEnter={() => setActiveTooltip('secrets-management')}
                        onMouseLeave={() => setActiveTooltip(null)}
                    >
                        <div className="flex items-center gap-3">
                            <Key className="w-5 h-5" />
                            <h4 className="font-bold text-sm">Secrets Mgmt</h4>
                        </div>
                    </div>

                    {/* Key Management */}
                    <div
                        className="bg-gradient-to-br from-violet-500 to-violet-600 text-white p-4 rounded-xl shadow-lg cursor-help hover:from-violet-600 hover:to-violet-700 transition-all duration-300 border-2 border-violet-400/30"
                        onMouseEnter={() => setActiveTooltip('key-management')}
                        onMouseLeave={() => setActiveTooltip(null)}
                    >
                        <div className="flex items-center gap-3">
                            <FileKey className="w-5 h-5" />
                            <h4 className="font-bold text-sm">Key Mgmt</h4>
                        </div>
                    </div>

                    {/* Certificate Management */}
                    <div
                        className="bg-gradient-to-br from-violet-500 to-violet-600 text-white p-4 rounded-xl shadow-lg cursor-help hover:from-violet-600 hover:to-violet-700 transition-all duration-300 border-2 border-violet-400/30"
                        onMouseEnter={() => setActiveTooltip('certificate-management')}
                        onMouseLeave={() => setActiveTooltip(null)}
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5" />
                            <h4 className="font-bold text-sm">Cert Mgmt</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tooltip Popup */}
            <AnimatePresence>
                {activeTooltip && tooltips[activeTooltip] && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-8 left-8 right-8 z-50 pointer-events-none"
                    >
                        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-3xl mx-auto">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        {tooltips[activeTooltip].title}
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {tooltips[activeTooltip].description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Details Button */}
            <div className="absolute bottom-6 right-6 z-20">
                <button
                    onClick={() => setShowAuthDetails(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all font-semibold shadow-blue-500/20"
                >
                    <span>View Authentication Details</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
