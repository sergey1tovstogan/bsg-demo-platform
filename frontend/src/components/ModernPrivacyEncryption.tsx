import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock,
    ShieldCheck,
    Server,
    Globe,
    FileKey,
    Database,
    HardDrive,
    Network,
    ArrowRight
} from 'lucide-react';

export const ModernPrivacyEncryption: React.FC = () => {
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    const tooltips = {
        'transit': {
            title: 'Data in Transit',
            description: 'All communications are secured using modern Transport Layer Security (TLS) protocols (TLS 1.2+). API communications are encrypted end-to-end. File transfers use SFTP/FTPS with SSH encryption.'
        },
        'rest': {
            title: 'Data at Rest',
            description: 'Databases utilize Transparent Data Encryption (TDE) with AES 256-bit algorithms. This covers the entire database, logs, and backups. Storage devices benefit from full disk and block-level encryption.'
        }
    };

    const handleExateClick = () => {
        window.parent.postMessage({ type: 'showExate' }, '*');
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
                    <Lock className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Privacy & Encryption</h2>
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600 dark:text-slate-400 max-w-4xl mx-auto">
                    <span className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">1. Block-level encryption for all storage</span>
                    <span className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">2. TLS 1.2+ for all transit</span>
                    <span className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">3. Supplementary encryption (AES256, IPSEC)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100%-140px)] relative z-10">
                {/* Left Column: Data in Transit */}
                <div
                    className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 h-full relative group hover:border-purple-500/50 transition-all duration-300 cursor-help"
                    onMouseEnter={() => setActiveTooltip('transit')}
                    onMouseLeave={() => setActiveTooltip(null)}
                >
                    <div className="absolute -top-3 left-6 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-1 rounded-full text-sm font-bold border border-purple-200 dark:border-purple-800">
                        Data in Transit
                    </div>

                    <div className="flex flex-col h-full mt-4">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <Globe className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>

                        <p className="text-center text-slate-600 dark:text-slate-400 mb-8 px-4">
                            Data traversing a network or temporarily residing in memory.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <Network className="w-6 h-6 text-purple-500" />
                                <span className="font-semibold text-slate-700 dark:text-slate-200">HTTPS (TLS 1.2)</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <FileKey className="w-6 h-6 text-purple-500" />
                                <span className="font-semibold text-slate-700 dark:text-slate-200">SMBv3 / SFTP / FTPS</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <ShieldCheck className="w-6 h-6 text-purple-500" />
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Data Loss Prevention</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Data at Rest */}
                <div
                    className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 h-full relative group hover:border-blue-500/50 transition-all duration-300 cursor-help"
                    onMouseEnter={() => setActiveTooltip('rest')}
                    onMouseLeave={() => setActiveTooltip(null)}
                >
                    <div className="absolute -top-3 left-6 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-1 rounded-full text-sm font-bold border border-blue-200 dark:border-blue-800">
                        Data at Rest
                    </div>

                    <div className="flex flex-col h-full mt-4">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Database className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>

                        <p className="text-center text-slate-600 dark:text-slate-400 mb-8 px-4">
                            Inactive data stored physically in databases, archives, and backups.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <Lock className="w-6 h-6 text-blue-500" />
                                <span className="font-semibold text-slate-700 dark:text-slate-200">TDE (Transparent Data Encryption)</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <Server className="w-6 h-6 text-blue-500" />
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Database Audit Monitoring</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <HardDrive className="w-6 h-6 text-blue-500" />
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Block Level Encryption</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* eXate Button */}
            <div className="absolute bottom-8 right-8 z-20">
                <button
                    onClick={handleExateClick}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-red-500/30 transition-all duration-300 font-bold group"
                >
                    <span>eXate Solution</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Tooltip Popup */}
            <AnimatePresence>
                {activeTooltip && tooltips[activeTooltip as keyof typeof tooltips] && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-6 left-6 right-[200px] z-50 pointer-events-none"
                    >
                        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                                {tooltips[activeTooltip as keyof typeof tooltips].title}
                            </h4>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {tooltips[activeTooltip as keyof typeof tooltips].description}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
