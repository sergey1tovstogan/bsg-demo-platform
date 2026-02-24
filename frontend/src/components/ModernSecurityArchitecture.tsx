import { useState } from 'react'
import {
    Shield,
    Key,
    FileKey,
    Server,
    Database,
    Globe,
    UserCheck,
    FileText,
    Activity,
    ArrowRight,
    ArrowLeft,
    Info,
    X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ModernAuthentication } from './ModernAuthentication'

interface TooltipConfig {
    id: string
    title: string
    description: string
}

export function ModernSecurityArchitecture() {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
    const [showAuthentication, setShowAuthentication] = useState(false)

    const tooltips: Record<string, TooltipConfig> = {
        'key-management': {
            id: 'key-management',
            title: 'Key Management',
            description: 'The system checks for file integrity upon upload and download using checksums and cryptographic hashing methods. SSH keys and certificates are stored in Azure Key Vault to ensure secure key management practices.'
        },
        'secrets-management': {
            id: 'secrets-management',
            title: 'Secrets Management',
            description: 'Secrets management depends on stack deployment and requirements. Runtime secrets can be held within Hashicorp Vault, and minimum privilege should be used around key issuance, with audit logging of issued secrets. Good practice dictates that all runtime secrets are rotated at each deploy, and Cryptographic keys are rotated every 3 months, or whenever required by the organization. For Azure deployment, Temenos recommend using Azure Key Vault - Azure Key Vault: Azure Key Vault is a secure and centralized key management service that helps you safeguard cryptographic keys, certificates, and secrets used by cloud applications and services. Azure Key Vault is a cloud service that provides secure storage of keys for encrypting data. Multiple keys, and multiple versions of the same key, can be kept in the Azure Key Vault. Cryptographic keys in Azure Key Vault are represented as JSON Web Key [JWK] objects.'
        },
        'temenos-vault': {
            id: 'temenos-vault',
            title: 'Temenos Vault',
            description: 'Users should be able to create and store the application Certificates into the Vault (Azure Key vault). Applications should be able to retrieve the Certificates from the vault (Azure Key vault) and use it on the fly without any storing mechanism. Temenos Vault APIs should be created to support the above requirements to interact with the Vault (Azure Key vault). Temenos Vault – provides common framework for our products to integrate with underlaying platform Secrets services. Temenos Vault provides a facade that can be used by products and can be configured to point to the relevant Vault implementation based on the deployment environment. As well as this it can be used by the SaaS platform for provisioning the secrets, keys, and certificates for product or for the platform. We will support Azure Key Vault, AWS Secret, Key and Certificate Manager as well as Hashicorp Vault for On Premise solutions.'
        },
        'externalized-auth': {
            id: 'externalized-auth',
            title: 'Externalized Authorization',
            description: 'Temenos solution supports the externalized mechanism based on SAML 2.0, OIDC/ JSON Web Token (JWT) for authentication.  OAuth is an open standard authorization protocol. It enables your account information to be obtained by third-party services. Without exposing user credentials, OAuth provides an access token and a refresh token for third-party services.'
        },
        'data-encryption': {
            id: 'data-encryption',
            title: 'Data Encryption',
            description: 'Temenos uses a range of security controls to protect data at rest, at use and in transit.  One of these mechanisms is Transparent Data Encryption (TDE) which provides real-time encryption and decryption of the database, associated backups, and transaction log files at rest. TDE protects data and log files, using AES (256-bit encryption) encryption algorithms. Temenos can offer encryption today via eXate as part of the Temenos Exchange ecosystem.  (requiring a dedicated discussion and license with eXate company).'
        },
        'certificate-management': {
            id: 'certificate-management',
            title: 'Certificate Management',
            description: 'Certificates management (DigiCert used) procedures for Temenos SaaS\nTemenos renews the certificates annually for the Temenos cloud hosted environments for clients. During deployment of application, we leverage Temenos managed domain for App deployment and secure it with our SSL certificates for Application endpoint. These certificates are renewed every year.'
        },
        'bank-iam': {
            id: 'bank-iam',
            title: "Bank's Identity Access Management",
            description: "For authentication, Temenos solution makes use of Bank's Identity and Access Management (IaM) solution like Active Directory. The bank's individual employees are authenticated at Active Directory. Temenos comes pre-integrated with KeyCloak. KeyCloak will become the defacto IaM system for Temenos applications. It acts as the identity broker for redirecting authentication requests to the Bank managed IaM solution."
        },
        'authentication-box': {
            id: 'authentication-box',
            title: 'Authentication',
            description: 'In Temenos solution, authentication is primarily managed through Keycloak, an open-source identity and access management system. The process involves several key steps:\n1. Integration with Identity Management: Temenos applications are integrated with the bank\'s Identity and Access Management (IAM) solutions, such as Active Directory. Keycloak acts as an identity broker, redirecting authentication requests to the bank\'s IAM system.\n2. User Authentication: When a user attempts to log in, they are authenticated via the bank\'s IAM. Upon successful authentication, the IAM generates a JSON Web Token (JWT) for authorization.\n3. Token Exchange: The application exchanges the authorization code for an ID Token and a refresh token. The ID Token contains user information, while the access token allows access to resources.'
        },
        'authorization-box': {
            id: 'authorization-box',
            title: 'Authorization',
            description: 'Temenos has embedded internal mechanism, native to the solution. The internal mechanism provides sufficient and granular access management to all applications as well as role/group facilities. The Temenos Security Management System (SMS) provides role-based access limits and full transaction and user activity audit. Each user has their own profile within the SMS which contains full user details and security settings to control the user\'s access within the system. SMS managing the access control, executing the following steps: Checks each user activity against the profile to determine validity; unacceptable actions are prevented and recorded (User Profile), Validates each contract against conditions, such as limits and exchange rate tolerance bands, before it is accepted (User Authority), Make specific data inaccessible to specified users or user groups based on conditions (Data Security).'
        },
        'audit-box': {
            id: 'audit-box',
            title: 'Audit',
            description: 'Temenos provides a full audit and logging across the entire business and technical landscape which can be utilized to track important security related events. The audit trails are stored as part of each data record and include details of the change made, by whom and when. Optionally it can include a delivery reference and IP address. Auditing is done both for users who use the solution directly or via APIs.\nAuditing includes: User activity auditing includes details of; Applications accessed, ID of transactions executed, Time connected, No. of operations executed etc. Application activity auditing includes details of; ID of new transactions, Inputter and Authorizer,  Security violation reports store details of unauthorised access attempts including who accessed the system, when and the target application'
        },
        'tls-entry': {
            id: 'tls-entry',
            title: 'TLS 1.2 Entry Points',
            description: 'Within Temenos solution, data in transit security is implemented through a structured approach that includes the following steps:\n1. Encryption Protocols: All data transmitted over networks is secured using TLS 1.2, ensuring that data is encrypted during transmission to protect against interception.\n2. Secure File Transfers: For file transfers, protocols such as SFTP and FTPS are utilized, ensuring that files are encrypted during transit. Additionally, SSH encryption standards are applied for secure connections.\n3. Logging and Monitoring: All data transfers and user actions are logged for auditing purposes. This includes monitoring for unauthorized access attempts and ensuring compliance with security policies.'
        }
    }

    // If showing authentication view, render ModernAuthentication component
    if (showAuthentication) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowAuthentication(false)}
                    className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all font-semibold text-slate-700 dark:text-slate-300"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Security Architecture</span>
                </button>
                <ModernAuthentication />
            </div>
        )
    }

    return (
        <div className="w-full h-[800px] bg-slate-50 dark:bg-slate-700/50 dark:bg-slate-900 rounded-xl relative overflow-visible shadow-2xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 pb-32">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Header */}
            <div className="absolute top-6 right-6 z-20 flex gap-4">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        Click elements for details
                    </p>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="relative w-full h-full p-8 pt-[100px]">
                {/* Backdrop to close tooltip when clicking outside (only when tooltip is open) */}
                {activeTooltip && (
                    <div
                        className="absolute inset-0 z-40 cursor-default"
                        onClick={() => setActiveTooltip(null)}
                        aria-hidden
                    />
                )}

                {/* Layout Grid - Original 3-column structure */}
                <div className="w-full h-full grid grid-cols-12 gap-4 relative z-50 items-start">

                    {/* Column 1: TLS Entry Points (Left) */}
                    <div className="col-span-4 flex items-start">
                        <div
                            className="relative z-50 w-full h-[70%] bg-gradient-to-br from-blue-900 to-blue-950 dark:from-blue-950 dark:to-slate-950 rounded-2xl p-4 flex flex-col items-center justify-between border-2 border-blue-700/50 shadow-xl cursor-pointer transition-all duration-300 hover:border-blue-500"
                            onClick={(e) => { e.stopPropagation(); setActiveTooltip(prev => prev === 'tls-entry' ? null : 'tls-entry') }}
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
                    <div className="col-span-4 flex flex-col">
                        <div className="bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-slate-300 dark:border-slate-600 relative h-full">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-6 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 z-10">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 dark:text-white whitespace-nowrap">Temenos Software</h3>
                            </div>

                            <div className="h-full flex flex-col gap-4 pt-8">
                                {/* Row 1: Authentication and Authorization */}
                                <div className="grid grid-cols-2 gap-4 h-[110px]">
                                    {/* Authentication */}
                                    <div
                                        className="relative z-50 bg-gradient-to-br from-blue-500/10 to-blue-600/20 dark:from-blue-500/20 dark:to-blue-600/30 rounded-xl border-2 border-blue-500/30 p-4 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group h-full flex flex-col"
                                        onClick={(e) => { e.stopPropagation(); setActiveTooltip(prev => prev === 'authentication-box' ? null : 'authentication-box') }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 dark:text-white">Authentication</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-800 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded">OAuth 2.0</span>
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-800 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded">OIDC</span>
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-800 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded">SAML 2.0</span>
                                        </div>
                                    </div>

                                    {/* Authorization */}
                                    <div
                                        className="relative z-50 bg-gradient-to-br from-teal-500/10 to-teal-600/20 dark:from-teal-500/20 dark:to-teal-600/30 rounded-xl border-2 border-teal-500/30 p-4 hover:border-teal-500/50 transition-all duration-300 cursor-pointer group h-full flex flex-col"
                                        onClick={(e) => { e.stopPropagation(); setActiveTooltip(prev => prev === 'authorization-box' ? null : 'authorization-box') }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <UserCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 dark:text-white">Authorization</h4>
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
                                        className="relative z-50 bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 dark:from-indigo-500/20 dark:to-indigo-600/30 rounded-xl border-2 border-indigo-500/30 p-4 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group h-full flex flex-col"
                                        onClick={(e) => { e.stopPropagation(); setActiveTooltip(prev => prev === 'audit-box' ? null : 'audit-box') }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 dark:text-white">Audit</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 dark:text-slate-400">Full transaction and user activity logging</p>
                                    </div>

                                    {/* Externalized Auth */}
                                    <div
                                        className="relative z-50 bg-gradient-to-br from-sky-500/10 to-sky-600/20 dark:from-sky-500/20 dark:to-sky-600/30 rounded-xl border-2 border-sky-500/30 p-4 hover:border-sky-500/50 transition-all duration-300 cursor-pointer group h-full flex flex-col"
                                        onClick={(e) => { e.stopPropagation(); setActiveTooltip(prev => prev === 'externalized-auth' ? null : 'externalized-auth') }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Globe className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 dark:text-white">Ext. Auth</h4>
                                        </div>
                                        <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs rounded">XACML</span>
                                    </div>
                                </div>

                                {/* Row 3: Database */}
                                <div className="grid grid-cols-1 gap-4 h-[110px]">
                                    {/* Database */}
                                    <div
                                        className="relative z-50 bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-emerald-500/20 dark:to-emerald-600/30 rounded-xl border-2 border-emerald-500/30 p-4 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group h-full flex items-center justify-between"
                                        onClick={(e) => { e.stopPropagation(); setActiveTooltip(prev => prev === 'data-encryption' ? null : 'data-encryption') }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                                                <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 dark:text-white">Database</h4>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 dark:text-slate-400">TDE Encrypted</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs rounded">AES-256</span>
                                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs rounded">At Rest</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4: Temenos Vault */}
                                <div className="grid grid-cols-1 gap-4 h-[110px]">
                                    <div
                                        className="relative z-50 bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 dark:from-emerald-500/20 dark:to-emerald-600/30 rounded-xl border-2 border-emerald-500/30 p-4 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group h-full flex items-center justify-between"
                                        onClick={(e) => { e.stopPropagation(); setActiveTooltip(prev => prev === 'temenos-vault' ? null : 'temenos-vault') }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                                                <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 dark:text-white">Temenos Vault</h4>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 dark:text-slate-400">Azure, Hashi Corp Key Vault and AWS Secrets Manager</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs rounded">Secrets</span>
                                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs rounded">Keys</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    {/* Column 3: External Services (Right) */}
                    <div className="col-span-4 flex flex-col gap-3">
                        {/* Bank IAM */}
                        <div
                            className="relative z-50 bg-gradient-to-br from-purple-600 to-purple-700 text-white p-4 rounded-xl shadow-lg cursor-pointer hover:from-purple-700 hover:to-purple-800 transition-all duration-300 border-2 border-purple-500/30"
                            onClick={(e) => { e.stopPropagation(); setActiveTooltip(prev => prev === 'bank-iam' ? null : 'bank-iam') }}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <Server className="w-5 h-5" />
                                <h4 className="font-bold text-sm">Bank's IAM</h4>
                            </div>
                            <p className="text-purple-100 text-xs">Identity Access Management</p>
                        </div>

                        {/* Secrets Management */}
                        <div
                            className="relative z-50 bg-gradient-to-br from-violet-500 to-violet-600 text-white p-4 rounded-xl shadow-lg cursor-pointer hover:from-violet-600 hover:to-violet-700 transition-all duration-300 border-2 border-violet-400/30"
                            onClick={(e) => { e.stopPropagation(); setActiveTooltip(prev => prev === 'secrets-management' ? null : 'secrets-management') }}
                        >
                            <div className="flex items-center gap-3">
                                <Key className="w-5 h-5" />
                                <h4 className="font-bold text-sm">Secrets Mgmt</h4>
                            </div>
                        </div>

                        {/* Key Management */}
                        <div
                            className="relative z-50 bg-gradient-to-br from-violet-500 to-violet-600 text-white p-4 rounded-xl shadow-lg cursor-pointer hover:from-violet-600 hover:to-violet-700 transition-all duration-300 border-2 border-violet-400/30"
                            onClick={(e) => { e.stopPropagation(); setActiveTooltip(prev => prev === 'key-management' ? null : 'key-management') }}
                        >
                            <div className="flex items-center gap-3">
                                <FileKey className="w-5 h-5" />
                                <h4 className="font-bold text-sm">Key Mgmt</h4>
                            </div>
                        </div>

                        {/* Certificate Management */}
                        <div
                            className="relative z-50 bg-gradient-to-br from-violet-500 to-violet-600 text-white p-4 rounded-xl shadow-lg cursor-pointer hover:from-violet-600 hover:to-violet-700 transition-all duration-300 border-2 border-violet-400/30"
                            onClick={(e) => { e.stopPropagation(); setActiveTooltip(prev => prev === 'certificate-management' ? null : 'certificate-management') }}
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5" />
                                <h4 className="font-bold text-sm">Cert Mgmt</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tooltip Popup */}
            <AnimatePresence>
                {activeTooltip && tooltips[activeTooltip] && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-0 left-0 right-0 px-6 pb-4 z-50 pointer-events-auto"
                    >
                        <div className="w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-800 dark:bg-blue-900/30 rounded-xl">
                                    <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white text-left">
                                            {tooltips[activeTooltip].title}
                                        </h4>
                                        <button
                                            onClick={() => setActiveTooltip(null)}
                                            className="ml-4 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors shrink-0"
                                            aria-label="Close"
                                        >
                                            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 dark:text-slate-300 leading-tight text-left whitespace-pre-line">
                                        {tooltips[activeTooltip].description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Details Button */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={() => setShowAuthentication(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:shadow-lg hover:scale-105 transition-all font-semibold shadow-black/30"
                >
                    <span>View Authentication Details</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}


