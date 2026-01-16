import { useEffect, useState } from 'react';
import { PageDefinition } from '@/lib/template-types';
import { SectionRenderer } from './SectionRenderer';
import { Breadcrumbs } from '@/components/template-navigation/Breadcrumbs';
import { NavigationButtons } from '@/components/template-navigation/NavigationButtons';
import { PageTree } from '@/components/template-navigation/PageTree';
import { useTemplateAnimation } from '@/hooks/useTemplateAnimation';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';
import { RefreshCw } from 'lucide-react';

interface PageRendererProps {
    page: PageDefinition;
}

export function PageRenderer({ page }: PageRendererProps) {
    const { card, refreshContent } = useNavigation();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Get animation settings from card
    const rawAnimationType = card?.settings?.default_animation || 'fade-in';
    // Map AnimationType to useTemplateAnimation's supported types
    const validAnimationTypes: ('fade-in' | 'slide-in-left' | 'slide-in-right' | 'stagger-fade-in' | 'scale-in')[] =
        ['fade-in', 'slide-in-left', 'slide-in-right', 'stagger-fade-in', 'scale-in'];
    const animationType = validAnimationTypes.includes(rawAnimationType as any)
        ? rawAnimationType as 'fade-in' | 'slide-in-left' | 'slide-in-right' | 'stagger-fade-in' | 'scale-in'
        : 'fade-in';
    const transitionSpeed = card?.settings?.transition_speed || 300;
    const duration = typeof transitionSpeed === 'string' ? parseInt(transitionSpeed, 10) : transitionSpeed;

    // Setup animation
    const { ref, trigger } = useTemplateAnimation({
        type: animationType,
        duration,
        easing: 'ease-out',
    });

    // Trigger animation on page mount or change
    useEffect(() => {
        trigger();
    }, [page.id, trigger]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        refreshContent();
        // Wait a bit for the content to reload
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const description = page.description?.short || page.description?.long;
    const showPageTree = card?.navigation?.show_page_tree;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
                {/* Sidebar - Page Tree */}
                {showPageTree && (
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-8">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4 px-2">
                                Pages
                            </h2>
                            <PageTree />
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <div
                    ref={ref as React.RefObject<HTMLDivElement>}
                    className="flex-1 min-w-0 relative"
                >
                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="absolute top-0 right-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh content"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <Breadcrumbs />

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                            {page.titles.page_header}
                        </h1>

                        {description && (
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Sections */}
                    <div className="space-y-12">
                        {(page.sections || []).map((section, index) => (
                            <SectionRenderer
                                key={`${section.type}-${index}`}
                                section={section}
                            />
                        ))}
                    </div>

                    {/* Footer Navigation */}
                    <NavigationButtons />
                </div>
            </div>
        </div>
    );
}
