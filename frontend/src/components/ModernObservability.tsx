import { useState } from 'react';
import {
    FileText,
    AlertTriangle,
    Database,
    History,
    Search,
    Shield,
    Clock,
    Activity,
    CheckCircle,
    AlertCircle,
    Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ModernObservability = () => {
    const [activeTab, setActiveTab] = useState('logs');

    const tabs = [
        { id: 'logs', label: 'Logs', icon: FileText },
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
        { id: 'backup', label: 'Backup & Restore', icon: Database },
        { id: 'audit', label: 'Audit Trail', icon: History },
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
                                ? 'bg-blue-600 text-white shadow-md transform scale-105'
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
                        {activeTab === 'logs' && <LogsView />}
                        {activeTab === 'incidents' && <IncidentsView />}
                        {activeTab === 'backup' && <BackupView />}
                        {activeTab === 'audit' && <AuditView />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Sub-components ---

const LogsView = () => {
    const logSources = [
        { source: 'Azure Activity Logs', desc: 'Azure resource activity logs relating to modification of Azure resources.' },
        { source: 'Azure Bastion Logs', desc: 'Azure Bastion is used to provide Temenos with remote access to servers.' },
        { source: 'Operating System Logs', desc: 'Security Audit logs relating to authentication, process creation and exit, and firewall connection events.' },
        { source: 'Azure SQL Security Logs', desc: 'Database authentication events.' },
        { source: 'Azure Defender Alerts', desc: 'Security Alerts from Azure Defender.' },
        { source: 'Azure Key Vault Events', desc: 'Key Vault events relating to access to key material.' },
        { source: 'Azure Dedicated HSM Logs', desc: 'Azure Dedicated HSM logs relating to access to key material.' },
        { source: 'Application Logs', desc: 'User related activities in the application.' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Column: Info & Sources */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Logging Overview
                    </h3>
                    <ul className="space-y-3">
                        {[
                            'All activities are logged at a Temenos solution on application and system levels.',
                            'Clients have access to application-level audit logs as provided by the application.',
                            'System level audit logs are not provided to clients.',
                            'Optional service: Security event feed from Azure Security Centre for SOC integration.'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                <span className="text-sm leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Log Sources</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Source</th>
                                    <th className="px-6 py-3 font-semibold">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {logSources.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-red-600 dark:text-red-500">{log.source}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{log.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Column: Azure Monitor Visualization */}
            <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden flex flex-col text-slate-300 font-mono text-xs">
                <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Cloud className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-white">Azure Monitor</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-48 border-r border-slate-700 bg-[#1e293b] p-2 hidden md:block">
                        <div className="space-y-1">
                            {['Overview', 'Activity log', 'Alerts', 'Metrics', 'Logs'].map((item, i) => (
                                <div key={item} className={`px-3 py-2 rounded cursor-pointer ${i === 1 ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-700'}`}>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Monitor Content */}
                    <div className="flex-1 p-4 overflow-y-auto bg-[#0f172a]">
                        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                            {['Timespan: Last 6 hours', 'Severity: All', 'Add Filter'].map(filter => (
                                <span key={filter} className="px-2 py-1 bg-slate-800 border border-slate-600 rounded whitespace-nowrap">
                                    {filter}
                                </span>
                            ))}
                        </div>

                        <table className="w-full">
                            <thead className="text-slate-500 border-b border-slate-700">
                                <tr>
                                    <th className="text-left py-2">Operation Name</th>
                                    <th className="text-left py-2">Status</th>
                                    <th className="text-left py-2">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {[
                                    { op: 'List clusterAdmin credential', status: 'Succeeded', time: '1 min ago' },
                                    { op: 'Write deployments', status: 'Succeeded', time: '2 mins ago' },
                                    { op: 'Delete storage account', status: 'Failed', time: '15 mins ago' },
                                    { op: 'List keys', status: 'Succeeded', time: '23 mins ago' },
                                    { op: 'Update network security group', status: 'Succeeded', time: '45 mins ago' },
                                    { op: 'List clusterUser credential', status: 'Succeeded', time: '1 hour ago' },
                                ].map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/50">
                                        <td className="py-3 text-blue-400">{row.op}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${row.status === 'Succeeded' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-slate-500">{row.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const IncidentsView = () => {
    return (
        <div className="space-y-8">
            {/* Top Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Security Teams
                    </h3>
                    <ul className="space-y-3">
                        {['Security Operations Centre (SOC)', 'Security Incident Response Team (SIRT)', 'Security Event Monitoring and Logging (SIEM)'].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        All support incidents logged on the Temenos Customer Support Portal (TCSP) or Jira by the client will have a priority assigned by Temenos support during analysis of the incident.
                    </p>
                </div>
            </div>

            {/* SLA Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Incident Fix Time SLA</h3>
                    <span className="font-bold text-slate-800 dark:text-slate-100">Support Hours: 24 x 7 x 365</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 w-1/4">Severity</th>
                                <th className="px-4 py-4 font-bold text-red-600 text-center bg-red-50">1<br /><span className="text-xs font-normal text-red-500">Critical</span></th>
                                <th className="px-4 py-4 font-bold text-orange-600 text-center bg-orange-50">2<br /><span className="text-xs font-normal text-orange-500">Urgent</span></th>
                                <th className="px-4 py-4 font-bold text-yellow-600 text-center bg-yellow-50">3<br /><span className="text-xs font-normal text-yellow-500">High</span></th>
                                <th className="px-4 py-4 font-bold text-blue-600 text-center bg-blue-50">4<br /><span className="text-xs font-normal text-blue-500">Medium</span></th>
                                <th className="px-4 py-4 font-bold text-slate-600 dark:text-slate-300 text-center bg-slate-100">5<br /><span className="text-xs font-normal text-slate-500">Low</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {[
                                { label: 'Initial Response', v1: '15 mins', v2: '1 hour', v3: '1 day', v4: '2 days', v5: '5 days' },
                                { label: 'Update Frequency', v1: '30 mins', v2: '2 hours', v3: 'On progress', v4: 'On progress', v5: 'On progress' },
                                { label: 'Restoration', v1: '< 4 hours', v2: '< 8 hours', v3: '< 5 days', v4: '< 20 days', v5: 'On progress' },
                                { label: 'Target Resolution', v1: 'Problem Mgmt', v2: '7 days', v3: '14 days', v4: 'Next Release', v5: 'Next Release' },
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium text-red-600 dark:text-red-500">{row.label}</td>
                                    <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-300 bg-red-50/30 dark:bg-red-900/20">{row.v1}</td>
                                    <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-300 bg-orange-50/30 dark:bg-orange-900/20">{row.v2}</td>
                                    <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-300 bg-yellow-50/30 dark:bg-yellow-900/20">{row.v3}</td>
                                    <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-300 bg-blue-50/30 dark:bg-blue-900/20">{row.v4}</td>
                                    <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-700/30">{row.v5}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const BackupView = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {/* Column 1: Backup Policies */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                    <Database className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Backup Policies</h3>
                <div className="space-y-6 flex-1">
                    <div>
                        <h4 className="font-semibold text-purple-700 mb-2">Database Backup</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300">After Go-live, DB backups of Class A & Class B Environments only. Other environments on ad-hoc basis.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-teal-700 mb-2">System Backups</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300">After Go-live, system backups of Class A & Class B Environments at the end of every calendar month and year.</p>
                    </div>
                </div>
            </div>

            {/* Column 2: Restoration */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                    <History className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Restoration Policies</h3>
                <div className="space-y-4 flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Class A Environment only:</p>
                    <ul className="space-y-3">
                        {[
                            'Point-In-Time-Restore (PITR): any 5-minute point within retention period',
                            'Transact, TPH: rolling 14-day retention',
                            'All other products: rolling 7-day retention'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <div className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Column 3: Retention */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4 text-sky-600">
                    <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Long Term Retention</h3>
                <div className="space-y-4 flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Class A Environment only:</p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="font-bold text-sky-700 text-lg">24</span>
                            <span className="text-sm text-slate-600 dark:text-slate-300">Months retention for EOM backups</span>
                        </li>
                        <li className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="font-bold text-sky-700 text-lg">7</span>
                            <span className="text-sm text-slate-600 dark:text-slate-300">Years retention for EOY backups</span>
                        </li>
                    </ul>
                    <p className="text-xs text-slate-500 mt-4 italic">Extended retention periods are subject to additional fees.</p>
                </div>
            </div>
        </div>
    );
};

const AuditView = () => {
    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-100">Full History Audit Trail</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                        Core System stores ALL record updates. The History Function allows comparisons between updates (what changed, who changed it, and when).
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Audit Log of record changes</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Search className="w-4 h-4" />
                        <span>Record ID: 100336</span>
                    </div>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Change #</th>
                                <th className="px-6 py-3">Inputter</th>
                                <th className="px-6 py-3">Date & Time</th>
                                <th className="px-6 py-3">Field Name</th>
                                <th className="px-6 py-3">Old Value</th>
                                <th className="px-6 py-3">New Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {/* Change 3 */}
                            <tr className="bg-slate-50/50 dark:bg-slate-700/30">
                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">3</td>
                                <td className="px-6 py-4">OFFICER</td>
                                <td className="px-6 py-4">23 MAY 23 09:35</td>
                                <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">RELATION.CODE</td>
                                <td className="px-6 py-4 text-slate-400 italic">null</td>
                                <td className="px-6 py-4 font-medium text-blue-600">14</td>
                            </tr>
                            <tr>
                                <td colSpan={3}></td>
                                <td className="px-6 py-2 font-mono text-slate-600 dark:text-slate-300">REL.CUSTOMER</td>
                                <td className="px-6 py-2 text-slate-400 italic">null</td>
                                <td className="px-6 py-2 font-medium text-blue-600">100802</td>
                            </tr>
                            <tr>
                                <td colSpan={3}></td>
                                <td className="px-6 py-2 font-mono text-slate-600 dark:text-slate-300">ISSUE.CHEQUES</td>
                                <td className="px-6 py-2 text-slate-400 italic">null</td>
                                <td className="px-6 py-2 font-medium text-blue-600">YES</td>
                            </tr>

                            {/* Change 2 */}
                            <tr className="bg-slate-50/50 dark:bg-slate-700/30 border-t-2 border-slate-100 dark:border-slate-700">
                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">2</td>
                                <td className="px-6 py-4">OFFICER</td>
                                <td className="px-6 py-4">23 MAY 23 08:57</td>
                                <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">CR.PROFILE.TYPE</td>
                                <td className="px-6 py-4 text-slate-500 line-through">NA.CUST.VALUE</td>
                                <td className="px-6 py-4 font-medium text-blue-600">VALUED.CUSTOMER</td>
                            </tr>
                            <tr>
                                <td colSpan={3}></td>
                                <td className="px-6 py-2 font-mono text-slate-600 dark:text-slate-300">NET.MONTHLY.IN</td>
                                <td className="px-6 py-2 text-slate-500 line-through">10000.00</td>
                                <td className="px-6 py-2 font-medium text-blue-600">5000.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ModernObservability;


