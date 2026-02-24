import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    ArrowUp,
    Database,
    Globe,
    Info,
    Lock,
    Server,
    ShieldCheck,
    X
} from 'lucide-react';

const diagramTooltip = {
    title: 'eXate Solution',
    description: 'Temenos is offering the eXate third-party solution right now as default solution for Client Field Level Encryption, Tokenization and Anonymization. Temenos can offer encryption today via eXate as part of the Temenos Exchange ecosystem (requiring a dedicated discussion and license with eXate company).'
};

type ExateProps = {
    onClose?: () => void;
};

export const Exate: React.FC<ExateProps> = ({ onClose }) => {
    const [activeTooltip, setActiveTooltip] = useState<boolean>(false);
    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl relative overflow-hidden">
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '22px 22px' }}
            />

            <div className="relative z-10 flex flex-col gap-6 h-full p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <ShieldCheck className="w-6 h-6 text-purple-500" />
                        <div>
                            <p className="text-base font-bold text-slate-900 dark:text-white">
                                eXate (Temenos Exchange) solution for field encryption data at rest
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                Protect sensitive fields with JDBC encryption, metadata control, and safeguarded storage.
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-slate-700 hover:bg-slate-800 transition-colors shadow-md"
                        >
                            <span>Close</span>
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-6 h-full overflow-hidden">
                    {/* Diagram & flow */}
                    <div
                        className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-6 shadow-inner cursor-pointer transition-all duration-300 hover:border-purple-500/50"
                        onClick={() => setActiveTooltip(prev => !prev)}
                        title="Click for additional information"
                    >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="basis-1/4 min-w-[140px] max-w-[220px] flex-shrink bg-gradient-to-b from-sky-500 to-sky-600 text-white rounded-xl p-4 shadow-md border border-slate-200/40 dark:border-slate-700/60">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-6 h-6" />
                                    <p className="font-bold">Temenos Banking Core</p>
                                </div>
                                <p className="text-sm mt-2 text-sky-50">Source of customer data</p>
                            </div>

                            <div className="hidden sm:flex items-center justify-center px-2">
                                <ArrowRight className="w-12 h-12 text-red-500" />
                            </div>

                            <div className="basis-1/8 min-w-[120px] max-w-[180px] flex-shrink bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white rounded-xl p-4 shadow-md border border-purple-200/60 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    <p className="font-bold">eXate JDBC Encryption</p>
                                </div>
                                <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">
                                    Inline field encryption before data leaves the core.
                                </p>
                            </div>

                            <div className="hidden sm:flex items-center justify-center px-2">
                                <ArrowRight className="w-12 h-12 text-red-500" />
                            </div>

                            <div className="basis-1/4 min-w-[140px] max-w-[220px] flex-shrink bg-gradient-to-b from-purple-600 to-purple-700 text-white rounded-xl p-4 shadow-md border border-purple-500/60">
                                <div className="flex items-center gap-3">
                                    <Database className="w-6 h-6" />
                                    <p className="font-bold">Protected storage</p>
                                </div>
                                <p className="text-sm mt-2 text-purple-50">Encrypted persistence layer</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-blue-50 dark:bg-slate-900/70 rounded-xl p-4 border border-blue-100 dark:border-slate-700 sm:w-1/2 mx-auto transform translate-x-10">
                                <Info className="w-5 h-5 text-blue-500" />
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">1. John Smith</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">Raw PII enters the flow</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-purple-50 dark:bg-slate-900/70 rounded-xl p-4 border border-purple-100 dark:border-slate-700 sm:w-1/2 mx-auto transform -translate-x-10">
                                <Info className="w-5 h-5 text-purple-500" />
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        2. XYZI <span className="text-purple-600 dark:text-purple-300">%yusHUhndn98</span>
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">Fields encrypted in transit</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-purple-50 dark:bg-slate-900/70 rounded-xl p-4 border border-purple-100 dark:border-slate-700 sm:w-1/2 mx-auto transform translate-x-10">
                                <Info className="w-5 h-5 text-purple-500" />
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        3. XYZI <span className="text-purple-600 dark:text-purple-300">%yusHUhndn98</span>
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">Encrypted at rest in storage</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-blue-50 dark:bg-slate-900/70 rounded-xl p-4 border border-blue-100 dark:border-slate-700 sm:w-1/2 mx-auto transform -translate-x-10">
                                <Info className="w-5 h-5 text-blue-500" />
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">4. John Smith</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">Decrypted only for authorised use</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-3 bg-gradient-to-r from-sky-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <ShieldCheck className="w-5 h-5 text-purple-500" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Metadata Management</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">Policy-driven encryption</p>
                                </div>
                            </div>
                            <ArrowRight className="w-12 h-12 text-red-500 hidden sm:block" />
                            <div className="relative flex items-center gap-3 bg-white dark:bg-slate-900/70 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <Server className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Datagator (an eXate company)</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">Governed access enforcement</p>
                                </div>
                                <ArrowUp className="hidden sm:block w-12 h-12 text-red-500 absolute -top-24 left-1/2 -translate-x-1/2 translate-x-10" />
                            </div>
                        </div>
                    </div>

                    {/* Details & benefits anchored to bottom */}
                    <div className="mt-auto w-full space-y-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-md">
                            <div className="flex items-center gap-3 mb-3">
                                <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <p className="font-semibold text-slate-800 dark:text-white">How the journey works</p>
                            </div>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                                <li>Raw PII (e.g., John Smith) leaves the Temenos core.</li>
                                <li>eXate JDBC driver encrypts sensitive fields inline before persistence.</li>
                                <li>Encrypted values (e.g., XYZI %yusHUhndn98) are written and stored.</li>
                                <li>Authorised retrieval decrypts fields back to clear text when required.</li>
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-md">
                            <div className="flex items-center gap-3 mb-3">
                                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <p className="font-semibold text-slate-800 dark:text-white">Benefits for Banks</p>
                            </div>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                                <li>Additional layer of security for PII and regulated sensitive data.</li>
                                <li>Encryption coverage for data-at-rest with policy-driven controls.</li>
                                <li>Data protection compliance is easier to audit and report.</li>
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-md">
                            <div className="flex items-center gap-3 mb-3">
                                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <p className="font-semibold text-slate-800 dark:text-white">Technology highlights</p>
                            </div>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                                <li>JDBC-based encryption layer integrated with Temenos Banking Core.</li>
                                <li>Metadata management drives policy decisions for protected fields.</li>
                                <li>Datagator enforces governed access and observability.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop to close tooltip when clicking outside */}
            {activeTooltip && (
                <div
                    className="absolute inset-0 z-40 cursor-default"
                    onClick={() => setActiveTooltip(false)}
                    aria-hidden
                />
            )}

            {/* Tooltip Popup */}
            <AnimatePresence>
                {activeTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-0 left-0 right-0 px-6 pb-4 z-50 pointer-events-auto"
                    >
                        <div className="w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-800 dark:bg-blue-900/30 rounded-xl">
                                    <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white text-left">
                                            {diagramTooltip.title}
                                        </h4>
                                        <button
                                            onClick={() => setActiveTooltip(false)}
                                            className="ml-4 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors shrink-0"
                                            aria-label="Close"
                                        >
                                            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 leading-tight text-left whitespace-pre-line">
                                        {diagramTooltip.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

