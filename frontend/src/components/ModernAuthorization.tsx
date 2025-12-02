import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Shield,
    Building2,
    Users,
    Lock,
    ArrowRight,
    CheckCircle2,
    Briefcase,
    UserCog
} from 'lucide-react';

export const ModernAuthorization: React.FC = () => {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    const tooltips = {
        'user-role': {
            title: 'User & Role Management',
            description: 'Users are assigned specific roles that define their access levels. This Role-Based Access Control (RBAC) ensures users only access what is necessary for their job function.'
        },
        'hierarchy': {
            title: 'Organizational Hierarchy',
            description: 'Access rights can be inherited based on the organizational structure (Company > Department > Group), simplifying permission management for large teams.'
        }
    };

    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-xl relative overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-8">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Header */}
            <div className="relative z-10 mb-8 text-center">
                <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 mb-4">
                    <Shield className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Temenos Authorization</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Role-Based Access Control (RBAC) and Organizational Hierarchy for granular permission management.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100%-100px)] relative z-10">
                {/* Left Column: User -> Role Flow */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 h-full relative group">
                        <div className="absolute -top-3 left-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1 rounded-full text-sm font-bold border border-emerald-200 dark:border-emerald-800">
                            Access Flow
                        </div>

                        <div className="flex flex-col justify-center h-full gap-8">
                            {/* User Step */}
                            <div
                                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all duration-300 cursor-help"
                                onMouseEnter={() => setActiveTooltip('user-role')}
                                onMouseLeave={() => setActiveTooltip(null)}
                            >
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">User Identity</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Authenticated Entity</p>
                                </div>
                                <ArrowRight className="ml-auto text-slate-300" />
                            </div>

                            {/* Arrow Down */}
                            <div className="flex justify-center">
                                <ArrowRight className="w-6 h-6 text-slate-300 rotate-90" />
                            </div>

                            {/* Role Step */}
                            <div
                                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all duration-300 cursor-help"
                                onMouseEnter={() => setActiveTooltip('user-role')}
                                onMouseLeave={() => setActiveTooltip(null)}
                            >
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <UserCog className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">Assigned Roles</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Defined Permissions</p>
                                </div>
                                <ArrowRight className="ml-auto text-slate-300" />
                            </div>

                            {/* Arrow Down */}
                            <div className="flex justify-center">
                                <ArrowRight className="w-6 h-6 text-slate-300 rotate-90" />
                            </div>

                            {/* Access Step */}
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl shadow-md border border-emerald-200 dark:border-emerald-800">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-emerald-800 dark:text-emerald-300">Authorized Access</h3>
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Resource Granted</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Hierarchy */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 h-full relative group">
                        <div className="absolute -top-3 left-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-1 rounded-full text-sm font-bold border border-blue-200 dark:border-blue-800">
                            Hierarchy Inheritance
                        </div>

                        <div className="flex flex-col justify-center h-full gap-4 pl-8 border-l-2 border-slate-200 dark:border-slate-700 ml-4">
                            {/* Company Level */}
                            <div
                                className="relative flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all duration-300 cursor-help ml-0"
                                onMouseEnter={() => setActiveTooltip('hierarchy')}
                                onMouseLeave={() => setActiveTooltip(null)}
                            >
                                <div className="absolute -left-[34px] top-1/2 -translate-y-1/2 w-8 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                    <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">Company</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Global Policies</p>
                                </div>
                                <Lock className="w-4 h-4 text-slate-400 ml-auto" />
                            </div>

                            {/* Department Level */}
                            <div
                                className="relative flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all duration-300 cursor-help ml-8"
                                onMouseEnter={() => setActiveTooltip('hierarchy')}
                                onMouseLeave={() => setActiveTooltip(null)}
                            >
                                <div className="absolute -left-[34px] top-1/2 -translate-y-1/2 w-8 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="absolute -left-[34px] -top-[4.5rem] bottom-1/2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                                    <Briefcase className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">Department</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Dept. Specifics</p>
                                </div>
                                <Lock className="w-4 h-4 text-slate-400 ml-auto" />
                            </div>

                            {/* Group Level */}
                            <div
                                className="relative flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all duration-300 cursor-help ml-16"
                                onMouseEnter={() => setActiveTooltip('hierarchy')}
                                onMouseLeave={() => setActiveTooltip(null)}
                            >
                                <div className="absolute -left-[34px] top-1/2 -translate-y-1/2 w-8 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="absolute -left-[34px] -top-[4.5rem] bottom-1/2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                                    <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">Group</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Team Access</p>
                                </div>
                                <Lock className="w-4 h-4 text-slate-400 ml-auto" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tooltip Popup */}
            <AnimatePresence>
                {activeTooltip && tooltips[activeTooltip as keyof typeof tooltips] && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-6 left-6 right-6 z-50 pointer-events-none"
                    >
                        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                                {tooltips[activeTooltip as keyof typeof tooltips].title}
                            </h4>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {tooltips[activeTooltip as keyof typeof tooltips].description}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
