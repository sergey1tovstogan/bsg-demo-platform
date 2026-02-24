import { useState } from 'react'
import {
    Lock,
    Building2,
    Package,
    Layers,
    Activity,
    FileText,
    Info,
    X,
    ArrowDown,
    Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserManagement } from './UserManagement'

interface TooltipConfig {
    id: string
    title: string
    description: string
}

export function ModernAuthorization() {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'authorization' | 'userManagement'>('authorization')

    const tabs = [
        { id: 'authorization' as const, label: 'Authorization Model', icon: Lock },
        { id: 'userManagement' as const, label: 'User Management Details', icon: Shield }
    ]

    const tooltips: Record<string, TooltipConfig> = {
        'right-section': {
            id: 'right-section',
            title: 'Hierarchical System Components',
            description: 'Access rights are defined and managed centrally by Bank\' administrators, allowing precise control over what users can view or do within the system. At the core, user roles determine access permissions, which can be configured to cover multiple levels including:\n1. Organization or business unit level (e.g., company or branch level), enabling Bank to restrict access to data and functions relevant only to specific legal entities or subsidiaries.\n2. Application or module level, controlling which banking products or services a user can access.\n3. Screen and menu levels, allowing fine-grained control over user interface elements and navigation options.\n4. Functional level, specifying allowed actions such as input, authorization, viewing, or deletion.\n5. Data element or field level, enabling restrictions on specific data fields or values, for example limiting transaction amounts or excluding certain account types'
        },
        'user-box': {
            id: 'user-box',
            title: 'User',
            description: 'Each user profile contains a unique user identifier, password, language, and conditions.\nUser roles and permissions are managed within the solution, with role-based access control (RBAC) ensuring that users access only the data and functions authorized for their specific roles. After successful authentication, user identity and permissions are propagated via tokens, enabling consistent enforcement of access rights across all components and services. This identity propagation supports granular authorization at multiple levels, including company, application, API, screen, and field levels.'
        },
        'role-box': {
            id: 'role-box',
            title: 'Role',
            description: 'So, permissions and rights are assigned to roles rather than directly to users.\nThus, a single role for the whole group of users who perform the same task.\nThis is mapped to the organizational structure so that the users can be assigned with a different role if they physically change their roles in the organization.'
        },
        'left-section-sms': {
            id: 'left-section-sms',
            title: 'Temenos SMS Access Control',
            description: 'Temenos SMS managing the access control, executing the following steps:\n1. Checks each user activity against the profile to determine validity; unacceptable actions are prevented and recorded (User Profile)\n2. Validates each contract against conditions, such as limits and exchange rate tolerance bands, before it is accepted (User Authority)\n3. Make specific data inaccessible to specified users or user groups based on conditions (Data Security)'
        }
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Header Tabs */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 shadow-sm z-10">
                <div className="flex space-x-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTooltip(null)
                                setActiveTab(tab.id)
                            }}
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
                        {activeTab === 'authorization' && (
                            <AuthorizationView
                                activeTooltip={activeTooltip}
                                setActiveTooltip={setActiveTooltip}
                                tooltips={tooltips}
                            />
                        )}
                        {activeTab === 'userManagement' && <UserManagement />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

interface AuthorizationViewProps {
    activeTooltip: string | null
    setActiveTooltip: (value: string | null) => void
    tooltips: Record<string, TooltipConfig>
}

function AuthorizationView({
    activeTooltip,
    setActiveTooltip,
    tooltips
}: AuthorizationViewProps) {
    return (
        <div className="w-full h-[800px] bg-slate-50 dark:bg-slate-700/50 dark:bg-slate-900 rounded-xl relative overflow-visible shadow-2xl border border-slate-200 dark:border-slate-700 dark:border-slate-800">
            {/* Background Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            ></div>

            {/* Header */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 dark:text-white">
                        Role Based Access
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
            <div className="relative w-full h-full p-8 pt-20">
                <div className="grid grid-cols-2 gap-8 h-full">
                    {/* Left Section: Role-Based Access Model */}
                    <div className="flex flex-col">
                        <div
                            className="flex items-center gap-2 mb-4 cursor-pointer transition-all duration-300 hover:opacity-80 group"
                            onClick={() => setActiveTooltip(activeTooltip === 'left-section-sms' ? null : 'left-section-sms')}
                        >
                            <Info className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200">
                                Temenos SMS Access Control
                            </span>
                        </div>
                        <div className="flex gap-8 items-start mt-12">
                            {/* Lists Section */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-white mb-2">
                                        User Groups:
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        Back-office Team,<br />
                                        Front office team<br />
                                        Audit Group.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-white mb-2">
                                        Actual users with profiles:
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        John Doe
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-white mb-2">
                                        Role Based Access:
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        Payments Operator,<br />
                                        Check Issuer,<br />
                                        Wire Room Authorizer,<br />
                                        Account Executive
                                    </p>
                                </div>
                            </div>

                            {/* Vertical Purple Line */}
                            <div className="w-1 bg-purple-500 dark:bg-purple-600 h-full min-h-[400px]"></div>

                            {/* Flow Diagram */}
                            <div className="flex-1 space-y-6">
                                {/* User Group Box */}
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center text-2xl">
                                        👥
                                    </div>
                                    <div className="border-2 border-purple-500 dark:border-purple-400 bg-white dark:bg-slate-800 px-6 py-3 rounded-lg font-bold text-purple-600 dark:text-purple-400 min-w-[150px] text-center">
                                        User Group
                                    </div>
                                </div>

                                {/* Arrow to User */}
                                <div className="ml-7 space-y-2">
                                    <ArrowDown className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-white">
                                        Properties
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-300 ml-2">
                                        Start Date/Time<br />
                                        End Date/Time
                                    </div>
                                </div>

                                {/* User Box */}
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center text-2xl">
                                        👤
                                    </div>
                                    <div
                                        id="user-box"
                                        className="border-2 border-red-500 dark:border-red-400 bg-red-500 dark:bg-red-600 text-white px-6 py-3 rounded-lg font-bold min-w-[150px] text-center cursor-pointer transition-all duration-300 hover:bg-red-600 dark:hover:bg-red-700"
                                        onClick={() => setActiveTooltip(activeTooltip === 'user-box' ? null : 'user-box')}
                                    >
                                        User
                                    </div>
                                </div>

                                {/* Arrow to Role */}
                                <div className="ml-7 space-y-2">
                                    <ArrowDown className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-white">
                                        Access
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-300 ml-2">
                                        Belongs to US Entity,<br />
                                        Can process Payments,<br />
                                        Only Checks,<br />
                                        Authorize Checks,<br />
                                        Edit Ben. Account #
                                    </div>
                                </div>

                                {/* Role Box */}
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center text-2xl">
                                        🔒
                                    </div>
                                    <div
                                        id="role-box"
                                        className="border-2 border-purple-500 dark:border-purple-400 bg-white dark:bg-slate-800 px-6 py-3 rounded-lg font-bold text-purple-600 dark:text-purple-400 min-w-[150px] text-center cursor-pointer transition-all duration-300 hover:border-purple-600 dark:hover:border-purple-300"
                                        onClick={() => setActiveTooltip(activeTooltip === 'role-box' ? null : 'role-box')}
                                    >
                                        Role
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Hierarchical System Components */}
                    <div className="flex flex-col mt-12">
                        <div
                            id="right-section"
                            className="space-y-4 cursor-pointer"
                            onClick={() => setActiveTooltip(activeTooltip === 'right-section' ? null : 'right-section')}
                        >
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 dark:text-white mb-6">
                                Example
                            </h3>

                            {/* ENTITY Block */}
                            <div className="bg-blue-900 dark:bg-blue-950 text-white p-4 rounded-lg relative flex items-center gap-4 min-w-[400px]">
                                <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600"></div>
                                <Lock className="w-6 h-6 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-bold text-sm mb-2">ENTITY (Company)</div>
                                    <div className="text-xs flex gap-4 flex-wrap">
                                        <span>Entity A</span>
                                        <span>Entity B</span>
                                    </div>
                                </div>
                                <Building2 className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            </div>

                            {/* PRODUCT Block */}
                            <div className="bg-blue-900 dark:bg-blue-950 text-white p-4 rounded-lg relative flex items-center gap-4 min-w-[400px]">
                                <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600"></div>
                                <div className="absolute -left-6 -bottom-4 w-0.5 h-4 bg-slate-400 dark:bg-slate-600"></div>
                                <Lock className="w-6 h-6 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-bold text-sm mb-2">PRODUCT (Module)</div>
                                    <div className="text-xs flex gap-4 flex-wrap">
                                        <span>Payments</span>
                                        <span>Forex</span>
                                    </div>
                                </div>
                                <Package className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            </div>

                            {/* SUB-PRODUCT Block */}
                            <div className="bg-blue-900 dark:bg-blue-950 text-white p-4 rounded-lg relative flex items-center gap-4 min-w-[400px]">
                                <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600"></div>
                                <div className="absolute -left-6 -bottom-4 w-0.5 h-4 bg-slate-400 dark:bg-slate-600"></div>
                                <Lock className="w-6 h-6 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-bold text-sm mb-2">SUB-PRODUCT (Application)</div>
                                    <div className="text-xs flex gap-4 flex-wrap">
                                        <span>ACH, Wires, Checks, Swift</span>
                                        <span>Forex, Spot</span>
                                    </div>
                                </div>
                                <Layers className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            </div>

                            {/* ACTIVITY Block */}
                            <div className="bg-blue-900 dark:bg-blue-950 text-white p-4 rounded-lg relative flex items-center gap-4 min-w-[400px]">
                                <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600"></div>
                                <div className="absolute -left-6 -bottom-4 w-0.5 h-4 bg-slate-400 dark:bg-slate-600"></div>
                                <Lock className="w-6 h-6 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-bold text-sm mb-2">ACTIVITY (Function)</div>
                                    <div className="text-xs space-y-1">
                                        <div>
                                            Create, Amend, View,<br />
                                            First Level Approval,<br />
                                            Second Level Approval
                                        </div>
                                        <div className="mt-2">
                                            Creator, Authorizer,<br />
                                            Manager, Reviewer
                                        </div>
                                    </div>
                                </div>
                                <Activity className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            </div>

                            {/* DATA Block */}
                            <div className="bg-blue-900 dark:bg-blue-950 text-white p-4 rounded-lg relative flex items-center gap-4 min-w-[400px]">
                                <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600"></div>
                                <div className="absolute -left-6 -bottom-4 w-0.5 h-4 bg-slate-400 dark:bg-slate-600"></div>
                                <Lock className="w-6 h-6 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-bold text-sm mb-2">DATA (Fields)</div>
                                    <div className="text-xs">
                                        Payment Amount, Beneficiary
                                    </div>
                                </div>
                                <FileText className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            </div>
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
                        className="absolute bottom-4 left-4 right-4 z-50 pointer-events-auto"
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
                                    <p className="text-slate-600 dark:text-slate-300 leading-tight text-left whitespace-pre-line">
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
