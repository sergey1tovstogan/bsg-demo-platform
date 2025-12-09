import React from 'react';
import {
    Layers,
    Cloud,
    Network,
    Database,
    ShieldCheck,
    Server,
    Globe
} from 'lucide-react';

export const ModernSegregation: React.FC = () => {
    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-700/50 dark:bg-slate-900 rounded-xl relative overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 p-8">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Header */}
            <div className="relative z-10 mb-8 text-center">
                <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 mb-4">
                    <Layers className="w-6 h-6 text-amber-500" />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 dark:text-white">Temenos SaaS Cloud Segregation</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 dark:text-slate-400 max-w-2xl mx-auto">
                    Multi-level segregation ensures data isolation and security across cloud, network, and database layers.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-120px)] relative z-10">
                {/* Column 1: Cloud Subscription */}
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 dark:border-slate-700 h-full relative group hover:border-amber-500/50 transition-all duration-300 flex flex-col">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-1 rounded-full text-sm font-bold border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                        Cloud Subscription
                    </div>

                    <div className="flex justify-center mt-6 mb-6">
                        <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full group-hover:scale-110 transition-transform duration-300">
                            <Cloud className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>

                    <p className="text-center text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-6 text-sm">
                        Different cloud subscriptions within the Temenos Cloud EA are used to segregate data effectively.
                    </p>

                    <div className="space-y-3 mt-auto" style={{ transform: 'translateY(-200px)' }}>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 dark:text-slate-200">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <span>Internal Temenos activities separated from Client services</span>
                            </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 dark:text-slate-200">
                            <div className="flex items-start gap-3">
                                <Server className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <span>Separation of client services for granular access control</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Network */}
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 dark:border-slate-700 h-full relative group hover:border-cyan-500/50 transition-all duration-300 flex flex-col">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-100 dark:bg-cyan-800 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-4 py-1 rounded-full text-sm font-bold border border-cyan-200 dark:border-cyan-800">
                        Network
                    </div>

                    <div className="flex justify-center mt-6 mb-6">
                        <div className="p-4 bg-cyan-100 dark:bg-cyan-800 dark:bg-cyan-900/30 rounded-full group-hover:scale-110 transition-transform duration-300">
                            <Network className="w-12 h-12 text-cyan-600 dark:text-cyan-400" />
                        </div>
                    </div>

                    <p className="text-center text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-6 text-sm">
                        Virtual networks and subnets segregate data with NSG defining access controls between subnets.
                    </p>

                    <div className="space-y-3 mt-auto" style={{ transform: 'translateY(-200px)' }}>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 dark:text-slate-200">
                            <div className="flex items-start gap-3">
                                <Globe className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                                <span>Production vs Non-production services isolation</span>
                            </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 dark:text-slate-200">
                            <div className="flex items-start gap-3">
                                <Layers className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                                <span>Network tiers: DMZ, Application, and Data tiers</span>
                            </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 dark:text-slate-200">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                                <span>Public and Private channel separation</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: Database */}
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 dark:border-slate-700 h-full relative group hover:border-emerald-500/50 transition-all duration-300 flex flex-col">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1 rounded-full text-sm font-bold border border-emerald-200 dark:border-emerald-800">
                        Database
                    </div>

                    <div className="flex justify-center mt-6 mb-6">
                        <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full group-hover:scale-110 transition-transform duration-300">
                            <Database className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>

                    <p className="text-center text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-6 text-sm">
                        Database segregation ensures data is stored in isolated environments based on requirements.
                    </p>

                    <div className="space-y-3 mt-auto" style={{ transform: 'translateY(-200px)' }}>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 dark:text-slate-200">
                            <div className="flex items-start gap-3">
                                <Database className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>Dedicated data stores for different environments</span>
                            </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 dark:text-slate-200">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>Encryption at rest with unique keys per store</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


