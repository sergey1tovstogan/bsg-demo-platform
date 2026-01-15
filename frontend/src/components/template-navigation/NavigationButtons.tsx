import { ArrowLeft, ArrowRight, LayoutGrid } from 'lucide-react';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';

export function NavigationButtons() {
    const {
        backToAgenda,
        navigateToPage
    } = useNavigation();

    // Find current position in hierarchy to determine prev/next
    // This logic assumes hierarchy is a simple flat list for now or we traverse it.
    // For Phase 2B simpler implementation: we rely on what NavigationProvider gives us or 
    // we might need more complex logic.
    // For now, we implement "Back to Agenda" which is critical.

    // Placeholder for prev/next logic:
    const prevPageId: string | null = null;
    const nextPageId: string | null = null;
    // TODO: extract prev/next from hierarchy once logic is finalized in NavigationProvider or here.

    // Actually, we can implement basic traversal if hierarchy is available as a map or list
    // But let's stick to spec: "Back to Agenda" is the main requirement for now.

    return (
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-200 dark:border-slate-700">
            {/* Previous (Hidden if none) */}
            <div className="flex-1">
                {prevPageId && (
                    <button
                        onClick={() => navigateToPage(prevPageId)}
                        className="group flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Previous
                    </button>
                )}
            </div>

            {/* Back to Agenda */}
            <button
                onClick={backToAgenda}
                className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Back to Agenda
            </button>

            {/* Next (Hidden if none) */}
            <div className="flex-1 flex justify-end">
                {nextPageId && (
                    <button
                        onClick={() => navigateToPage(nextPageId)}
                        className="group flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </button>
                )}
            </div>
        </div>
    );
}
