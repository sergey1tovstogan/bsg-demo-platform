import { useEffect, useState } from 'react';
import { AgendaDefinition } from '@/lib/template-types';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';
import { useTemplateAnimation } from '@/hooks/useTemplateAnimation';
import * as Icons from 'lucide-react';

interface AgendaRendererProps {
    agenda: AgendaDefinition;
}

/**
 * Renders the Card's landing page (Agenda)
 * Displays a grid of navigable content items
 */
export function AgendaRenderer({ agenda }: AgendaRendererProps) {
    const { navigateToPage, refreshContent } = useNavigation();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Parse animation settings from agenda definition
    const animationType = agenda.animation?.type || 'stagger-fade-in';
    const validAnimationTypes: ('fade-in' | 'slide-in-left' | 'slide-in-right' | 'stagger-fade-in' | 'scale-in')[] =
        ['fade-in', 'slide-in-left', 'slide-in-right', 'stagger-fade-in', 'scale-in'];
    const finalAnimationType = validAnimationTypes.includes(animationType as any)
        ? animationType as 'fade-in' | 'slide-in-left' | 'slide-in-right' | 'stagger-fade-in' | 'scale-in'
        : 'stagger-fade-in';

    // Parse delay_between_items from string like "10s" or "0.1s" to milliseconds
    const parseTimeToMs = (timeString?: string): number => {
        if (!timeString) return 100; // default 100ms
        const match = timeString.match(/^([\d.]+)(s|ms)$/);
        if (!match) return 100;
        const value = parseFloat(match[1]);
        const unit = match[2];
        return unit === 's' ? value * 1000 : value;
    };

    const staggerDelay = parseTimeToMs(agenda.animation?.delay_between_items);

    // Setup animation for grid items
    const { ref, trigger } = useTemplateAnimation({
        type: finalAnimationType,
        duration: 400,
        easing: 'ease-out',
        staggerDelay,
    });

    // Trigger animation on mount or when animation settings change
    useEffect(() => {
        trigger();
    }, [trigger, finalAnimationType, staggerDelay]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        refreshContent();
        // Wait a bit for the content to reload
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
            {/* Refresh Button */}
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh content"
            >
                <Icons.RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

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
            <div ref={ref as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agenda.items.map((item) => {
                    const IconComponent = item.icon && (Icons as any)[item.icon]
                        ? (Icons as any)[item.icon]
                        : Icons.FileText;

                    const isLocked = item.status === 'locked';

                    return (
                        <button
                            key={item.id}
                            onClick={() => !isLocked && navigateToPage(item.target?.page_id || item.page_id)}
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
                                {item.titles?.agenda_title || item.title}
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
