import { useState } from 'react'
import {
    User,
    Calendar,
    Clock,
    Shield,
    Settings,
    Check,
    Plus,
    Info
} from 'lucide-react'
import { motion } from 'framer-motion'

export function UserManagement() {
    const [activeTab, setActiveTab] = useState<'USER' | 'INPUTTER'>('USER')

    return (
        <div className="w-full h-[800px] bg-slate-50 dark:bg-slate-700/50 dark:bg-slate-900 rounded-xl relative overflow-visible shadow-2xl border border-slate-200 dark:border-slate-700 dark:border-slate-800">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Header */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 dark:text-white">
                        User Management main points
                    </h2>
                </div>
            </div>

            {/* Info Badge */}
            <div className="absolute top-6 right-6 z-20">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        User configuration form
                    </p>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="relative w-full h-full p-8 pt-20">
                <div className="flex gap-6 h-full">
                    {/* Left Section: Explanatory Text Boxes */}
                    <div className="flex-[0_0_35%] flex flex-col gap-5 relative">
                        {/* Explanation Box 1: User Identification */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-blue-400 dark:bg-blue-600 border-2 border-slate-800 dark:border-slate-600 rounded-lg p-4 text-sm text-slate-900 dark:text-white relative mt-16"
                        >
                            <div className="space-y-1">
                                <div className="font-semibold">Sign-on name</div>
                                <div>Is the user a bank employee (e.g., internal)</div>
                                <div>Language</div>
                                <div>Company the user can access</div>
                            </div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full flex items-center">
                                <div className="w-8 h-0.5 bg-slate-800 dark:bg-slate-200"></div>
                                <div className="w-0 h-0 border-l-[8px] border-l-slate-800 dark:border-l-slate-200 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                            </div>
                        </motion.div>

                        {/* Explanation Box 2: User Validity Period */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-blue-200 dark:bg-blue-800/50 border-2 border-slate-800 dark:border-slate-600 rounded-lg p-4 text-sm text-slate-900 dark:text-white relative"
                        >
                            <div className="font-semibold">Validity of the User</div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full flex items-center">
                                <div className="w-8 h-0.5 bg-slate-800 dark:bg-slate-200"></div>
                                <div className="w-0 h-0 border-l-[8px] border-l-slate-800 dark:border-l-slate-200 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                            </div>
                        </motion.div>

                        {/* Explanation Box 3: Daily Work Duration */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-yellow-300 dark:bg-yellow-600/50 border-2 border-slate-800 dark:border-slate-600 rounded-lg p-4 text-sm text-slate-900 dark:text-white relative"
                        >
                            <div>Duration for which the user can work in CBS (e.g., or all 7 days)</div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full flex items-center">
                                <div className="w-8 h-0.5 bg-slate-800 dark:bg-slate-200"></div>
                                <div className="w-0 h-0 border-l-[8px] border-l-slate-800 dark:border-l-slate-200 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                            </div>
                        </motion.div>

                        {/* Explanation Box 4: Application and Function Access */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-yellow-400 dark:bg-yellow-600/50 border-2 border-slate-800 dark:border-slate-600 rounded-lg p-4 text-sm text-slate-900 dark:text-white relative"
                        >
                            <div className="space-y-1">
                                <div>Give access to applications, company wise</div>
                                <div>and operations allowed (e.g., authorize)</div>
                            </div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full flex items-center">
                                <div className="w-8 h-0.5 bg-slate-800 dark:bg-slate-200"></div>
                                <div className="w-0 h-0 border-l-[8px] border-l-slate-800 dark:border-l-slate-200 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                            </div>
                        </motion.div>

                        {/* Explanation Box 5: Specific Day and Time Access */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-blue-100 dark:bg-blue-900/30 border-2 border-slate-800 dark:border-slate-600 rounded-lg p-4 text-sm text-slate-900 dark:text-white relative"
                        >
                            <div className="space-y-1">
                                <div>Specific time of access for certain days</div>
                                <div>1 – Mon , 2 – Tue and so on</div>
                            </div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full flex items-center">
                                <div className="w-8 h-0.5 bg-slate-800 dark:bg-slate-200"></div>
                                <div className="w-0 h-0 border-l-[8px] border-l-slate-800 dark:border-l-slate-200 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Section: Form */}
                    <div className="flex-1 flex flex-col">
                        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-6 h-full overflow-y-auto">
                            {/* Tabs */}
                            <div className="flex gap-0 mb-6 border-b-2 border-slate-800 dark:border-slate-600">
                                <button
                                    onClick={() => setActiveTab('USER')}
                                    className={`px-5 py-3 font-bold text-sm border border-slate-300 dark:border-slate-600 border-b-0 rounded-t-lg transition-all ${
                                        activeTab === 'USER'
                                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-b-2 border-b-white dark:border-b-slate-800 -mb-[2px]'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    USER
                                </button>
                                <button
                                    onClick={() => setActiveTab('INPUTTER')}
                                    className={`px-5 py-3 font-bold text-sm border border-slate-300 dark:border-slate-600 border-b-0 rounded-t-lg transition-all ${
                                        activeTab === 'INPUTTER'
                                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-b-2 border-b-white dark:border-b-slate-800 -mb-[2px]'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    INPUTTER
                                </button>
                            </div>

                            {/* Tab Header with Check Icon */}
                            <div className="flex justify-end mb-6">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    <Check className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Form Fields */}
                            {/* User Identification Section */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        User Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="INPUTTER"
                                        className="flex-1 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Sign On Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="INPUTT"
                                        className="flex-1 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Classification
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="classification"
                                                value="Ext"
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm text-slate-800 dark:text-slate-200">Ext</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="classification"
                                                value="Int"
                                                defaultChecked
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm text-slate-800 dark:text-slate-200">Int</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Language
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="1"
                                        className="w-24 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                    <select className="px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                                        <option>English</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Company.1
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="GB0010001"
                                        className="flex-1 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">Model Bank</span>
                                    <button className="w-6 h-6 border border-slate-400 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* User Validity Period Section */}
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 mt-6">
                                User Validity Period
                            </div>
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Start Date
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="09 OCT 2018"
                                        className="flex-1 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                    <button className="w-6 h-6 border border-slate-400 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        End Date
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="31 DEC 2099"
                                        className="flex-1 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                    <button className="w-6 h-6 border border-slate-400 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Daily Work Duration Section */}
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 mt-6">
                                Daily Work Duration
                            </div>
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Start Time.1
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="0"
                                        className="w-24 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        End Time.1
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="2400"
                                        className="w-24 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            {/* Application and Function Access Section */}
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 mt-6">
                                Application and Function Access
                            </div>
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Company Restr.1
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="ALL"
                                        className="flex-1 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        User Group.1
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="ALL.PG"
                                        className="flex-1 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Version.1
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue=""
                                        className="flex-1 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Function Allowed.1
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="A2BCDEFHILPRSV"
                                        className="flex-1 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                            </div>

                            {/* Specific Day and Time Access Section */}
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 mt-6">
                                Specific Day and Time Access
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Allowed Days.1
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="1"
                                        className="w-24 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Day St Time.1
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="1000"
                                        className="w-24 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="min-w-[140px] text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Day End Time.1
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="2000"
                                        className="w-24 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

