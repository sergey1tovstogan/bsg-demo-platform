import { useState } from 'react'
import {
    Shield,
    Users,
    Info,
    X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipConfig {
    id: string
    title: string
    description: string
}

export function ModernAuthentication() {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

    const tooltips: Record<string, TooltipConfig> = {
        'ui-configuration': {
            id: 'ui-configuration',
            title: 'UI Configuration of Users, Roles',
            description: 'Temenos UI Explorer application redirects a user\'s browser from the application to the Keycloak authentication server where they enter their credentials. This redirection is important because users are completely isolated from applications and applications never see a user\'s credentials.\n\nIdentity token or assertion (for SAML protocol) is cryptographically signed.\n\nThese tokens can have identity information like username, address, email, and other profile data.\n\nTemenos Security Management System (SMS) based on Role Based Access in which the ability to access or perform action is tied to the permission granted. The internal mechanism provides sufficient and granular access management to all applications as well as role/group facilities. When a user attempts to log in, they are authenticated via the bank\'s IAM. Upon successful authentication, the IAM generates a JSON Web Token (JWT) for authorization. The application exchanges the authorization code for an ID Token and a refresh token. The ID Token contains user information, while the access token allows access to resources.'
        },
        'keycloak': {
            id: 'keycloak',
            title: 'Keycloak',
            description: 'Temenos solutions use Keycloak, an open-source Identity and Access Management (IAM) tool, to manage authentication. Keycloak enables Single Sign-On (SSO) based on federated security, letting users log in once to access multiple applications seamlessly.\n\nKeycloak integrates with the bank\'s existing Identity Provider (IdP), like Entra ID (AD), which manages users and passwords. This integration uses standard protocols such as SAML 2.0 or OpenID Connect. Keycloak acts here as an identity broker, redirecting authentication requests to Banks\' preferred IAM. After successful authentication, Bank\' IAM issues JSON Web Tokens (JWTs) that carry user identity and role information, which the solution uses to enforce authorization based on assigned permissions.'
        },
        'authentication-service': {
            id: 'authentication-service',
            title: 'Authentication Service',
            description: '1. User Identity, authentication externalised and SSO with enterprise IAM e.g.,\n\n2. Entra ID Establish user identity and trust through security token oAuth 2.0 JWT,\n\n3. All products integrate and validate with KeyCloak IaM'
        },
        'temenos-application': {
            id: 'temenos-application',
            title: 'Temenos Application',
            description: 'User activities, including successful and failed login attempts, are logged. Session IDs do not contain sensitive data and are invalidated upon logout.'
        },
        'temenos-security': {
            id: 'temenos-security',
            title: 'Temenos Security',
            description: 'Choosing between OpenID Connect and SAML is not just a matter of using a newer protocol (OIDC) instead of the older more mature protocol (SAML). In most cases Keycloak recommends using OIDC. SAML 2.0 tends to be a bit more verbose than OIDC. Beyond verbosity of exchanged data, OIDC was designed to work with the web while SAML2.0 was retrofitted to work on top of the web.'
        }
    }

    return (
        <div className="w-full min-h-[700px] bg-slate-50 dark:bg-slate-700/50 dark:bg-slate-900 rounded-xl relative overflow-hidden shadow-2xl border-2 border-slate-200 dark:border-slate-700 dark:border-slate-800">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Header */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 dark:text-white">
                        Here is the Temenos Authentication
                    </h2>
                </div>
            </div>

            {/* Info Badge */}
            <div className="absolute top-6 right-6 z-20">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        Click elements for details
                    </p>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="relative w-full h-full p-8 pt-20 pb-24">
                {/* Text Sections */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                    {/* Bank Staff Authentication */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-xl p-6 border-2 border-red-200 dark:border-red-800/30">
                        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Bank Staff Authentication
                        </h3>
                        <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
                            <li>User Identity and authentication are externalized, utilizing Single Sign-On (SSO) with enterprise Identity Management (IdM) systems, specifically mentioning "Azure Entra ID" as an example.</li>
                            <li>User identity and trust are established through a "security token oAuth 2.0 JWT".</li>
                            <li>All product integration and validation are handled with "KeyCloak IdM".</li>
                        </ul>
                    </div>

                    {/* Customer Authentication */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800/30">
                        <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Customer Authentication
                        </h3>
                        <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
                            <li>Based on the open standards "OIDC" (OpenID Connect) and "JWT" (JSON Web Token), integrated with "Temenos Digital".</li>
                            <li>"SCA Authentication partner" is the preferred approach for compliance with "PSD2" (Payment Services Directive 2) and open banking regulatory requirements.</li>
                            <li>"HID, Uniken" are identified as exchange partners for "Temenos Digital SCA integration & certification".</li>
                        </ul>
                    </div>
                </div>

                {/* Diagram Container - diagram fully contained within frame */}
                <div className="relative w-full h-[420px] bg-gradient-to-br from-slate-100 to-slate-200/80 dark:from-slate-800/60 dark:to-slate-900/60 rounded-2xl border-2 border-slate-300 dark:border-slate-600 p-6 overflow-hidden shadow-inner">
                    <svg viewBox="0 0 1280 420" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                        {/* Arrow marker definition */}
                        <defs>
                            <marker id="arrowhead-red" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
                            </marker>
                        </defs>

                        {/* UI Configuration of Users, Roles, SSO etc. (Light Blue Box) */}
                        <rect
                            id="ui-configuration"
                            x="50" y="100" width="200" height="80" rx="5"
                            className="cursor-pointer transition-all duration-300 hover:opacity-80"
                            fill="#9333ea"
                            stroke="#1e293b"
                            strokeWidth="2"
                            onClick={() => setActiveTooltip(activeTooltip === 'ui-configuration' ? null : 'ui-configuration')}
                        />
                        <text x="150" y="130" textAnchor="middle" className="text-sm font-bold fill-white">
                            UI Configuration of
                        </text>
                        <text x="150" y="150" textAnchor="middle" className="text-sm font-bold fill-white">
                            Users, Roles, SSO etc.
                        </text>

                        {/* Keycloak / External IdM (Dark Blue Box) */}
                        <rect
                            id="keycloak"
                            x="50" y="220" width="200" height="100" rx="5"
                            className="cursor-pointer transition-all duration-300 hover:opacity-80"
                            fill="#1E3A8A"
                            stroke="#1e293b"
                            strokeWidth="2"
                            onClick={() => setActiveTooltip(activeTooltip === 'keycloak' ? null : 'keycloak')}
                        />
                        <text x="150" y="250" textAnchor="middle" className="text-sm font-bold fill-white">
                            Keycloak /
                        </text>
                        <text x="150" y="275" textAnchor="middle" className="text-sm font-bold fill-white">
                            External IdM
                        </text>

                        {/* DB Cylinder (Green) */}
                        <ellipse cx="320" cy="340" rx="40" ry="12" fill="#10b981" stroke="#1e293b" strokeWidth="2" />
                        <rect x="280" y="340" width="80" height="60" fill="#10b981" stroke="#1e293b" strokeWidth="2" />
                        <ellipse cx="320" cy="400" rx="40" ry="12" fill="#10b981" stroke="#1e293b" strokeWidth="2" />
                        <text x="320" y="375" textAnchor="middle" className="text-sm font-bold fill-white">DB</text>

                        {/* Authentication Service (Purple Box) */}
                        <rect
                            id="authentication-service"
                            x="350" y="220" width="220" height="100" rx="5"
                            className="cursor-pointer transition-all duration-300 hover:opacity-80"
                            fill="#9333ea"
                            stroke="#1e293b"
                            strokeWidth="2"
                            onClick={() => setActiveTooltip(activeTooltip === 'authentication-service' ? null : 'authentication-service')}
                        />
                        <text x="460" y="250" textAnchor="middle" className="text-sm font-bold fill-white">
                            Authentication Service
                        </text>
                        <text x="460" y="275" textAnchor="middle" className="text-xs fill-white">
                            SAML / OIDC / Federated
                        </text>

                        {/* Temenos Application (Dark Blue Box) */}
                        <rect
                            id="temenos-application"
                            x="650" y="220" width="200" height="100" rx="5"
                            className="cursor-pointer transition-all duration-300 hover:opacity-80"
                            fill="#1E3A8A"
                            stroke="#1e293b"
                            strokeWidth="2"
                            onClick={() => setActiveTooltip(activeTooltip === 'temenos-application' ? null : 'temenos-application')}
                        />
                        <text x="750" y="260" textAnchor="middle" className="text-sm font-bold fill-white">
                            Temenos
                        </text>
                        <text x="750" y="285" textAnchor="middle" className="text-sm font-bold fill-white">
                            Application
                        </text>

                        {/* Temenos Security (Teal Container) */}
                        <rect
                            id="temenos-security"
                            x="950" y="180" width="300" height="180" rx="5"
                            className="cursor-pointer transition-all duration-300 hover:opacity-80"
                            fill="#0D9488"
                            stroke="#1e293b"
                            strokeWidth="2"
                            onClick={() => setActiveTooltip(activeTooltip === 'temenos-security' ? null : 'temenos-security')}
                        />
                        <text x="1100" y="210" textAnchor="middle" className="text-sm font-bold fill-white">
                            Temenos Security
                        </text>

                        {/* Auth Filter (Teal Box inside Temenos Security) */}
                        <rect x="970" y="230" width="260" height="50" rx="5" fill="#14B8A6" stroke="#1e293b" strokeWidth="2" />
                        <text x="1100" y="260" textAnchor="middle" className="text-sm font-bold fill-white">
                            Auth Filter
                        </text>

                        {/* Security Token Validation (Teal Box inside Temenos Security) */}
                        <rect x="970" y="300" width="260" height="50" rx="5" fill="#14B8A6" stroke="#1e293b" strokeWidth="2" />
                        <text x="1100" y="325" textAnchor="middle" className="text-xs fill-white">
                            Security Token Validation
                        </text>
                        <text x="1100" y="340" textAnchor="middle" className="text-xs fill-white">
                            SAML / OIDC / FS
                        </text>

                        {/* Arrows - All Red */}
                        {/* UI Configuration to Keycloak */}
                        <line x1="150" y1="180" x2="150" y2="220" stroke="#ef4444" strokeWidth="2.5" fill="none" markerEnd="url(#arrowhead-red)" />

                        {/* Keycloak to Authentication Service */}
                        <line x1="250" y1="270" x2="350" y2="270" stroke="#ef4444" strokeWidth="2.5" fill="none" markerEnd="url(#arrowhead-red)" />
                        <text x="300" y="265" textAnchor="middle" className="text-xs fill-slate-900 dark:fill-slate-100">Identity & Attributes</text>

                        {/* Authentication Service to Temenos Application */}
                        <line x1="570" y1="270" x2="650" y2="270" stroke="#ef4444" strokeWidth="2.5" fill="none" markerEnd="url(#arrowhead-red)" />
                        <text x="610" y="265" textAnchor="middle" className="text-xs fill-slate-900 dark:fill-slate-100">Security Token</text>

                        {/* Temenos Application to Auth Filter */}
                        <line x1="850" y1="270" x2="950" y2="255" stroke="#ef4444" strokeWidth="2.5" fill="none" markerEnd="url(#arrowhead-red)" />
                        <text x="900" y="240" textAnchor="middle" className="text-xs fill-slate-900 dark:fill-slate-100">Security Token</text>

                        {/* Auth Filter to Security Token Validation */}
                        <line x1="1100" y1="280" x2="1100" y2="300" stroke="#ef4444" strokeWidth="2.5" fill="none" markerEnd="url(#arrowhead-red)" />

                        {/* Security Token Validation back to Temenos Application */}
                        <line x1="950" y1="325" x2="850" y2="270" stroke="#ef4444" strokeWidth="2.5" fill="none" markerEnd="url(#arrowhead-red)" />
                        <text x="900" y="330" textAnchor="middle" className="text-xs fill-slate-900 dark:fill-slate-100">Identity & Attributes</text>
                    </svg>
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
                                            className="ml-4 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                        >
                                            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-left whitespace-pre-line">
                                        {tooltips[activeTooltip].description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

