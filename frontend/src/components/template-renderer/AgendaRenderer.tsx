import React from 'react';
import { AgendaDefinition } from '@/lib/template-types';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';
import * as Icons from 'lucide-react';

interface AgendaRendererProps {
    agenda: AgendaDefinition;
}

/**
 * Renders the Card's landing page (Agenda)
 * Displays a grid of navigable content items
 */
export function AgendaRenderer({ agenda }: AgendaRendererProps) {
    const { navigateToPage } = useNavigation();

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                    {agenda.title}
                </h1>
                {agenda.subtitle && (
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        {agenda.subtitle}
                    </p>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agenda.items.map((item) => {
                    const IconComponent = item.icon && (Icons as any)[item.icon]
                        ? (Icons as any)[item.icon]
                        : Icons.FileText;

                    const isLocked = item.status === 'locked';

                    return (
                        <button
                            key={item.id}
                            onClick={() => !isLocked && navigateToPage(item.page_id)}
                            disabled={isLocked}
                            className={`
                group relative flex flex-col items-start p-6 text-left
                bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700
                transition-all duration-200
                ${isLocked
                                    ? 'opacity-60 cursor-not-allowed'
                                    : 'hover:shadow-md hover:border-blue-500/50 hover:scale-[1.02] cursor-pointer'
                                }
              `}
                        >
                            {/* Icon */}
                            <div className={`
                p-3 rounded-xl mb-4
                ${isLocked
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50'
                                }
              `}>
                                <IconComponent className="w-6 h-6" />
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                {item.title}
                            </h3>

                            {item.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                                    {item.description}
                                </p>
                            )}

                            {/* Status Indicator (if locked) */}
                            {isLocked && (
                                <div className="absolute top-6 right-6">
                                    <Icons.Lock className="w-5 h-5 text-slate-400" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
