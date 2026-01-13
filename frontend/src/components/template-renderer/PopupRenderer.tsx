import { useEffect } from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';
import { SectionRenderer } from './SectionRenderer';
import { PopupDefinition, Section } from '@/lib/template-types';

export function PopupRenderer() {
    const { popupStack, closePopup, currentPage, getPage } = useNavigation();

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && popupStack.length > 0) {
                closePopup();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [popupStack, closePopup]);

    if (popupStack.length === 0) return null;

    const currentPopupId = popupStack[popupStack.length - 1];

    // Find popup from the current page
    const page = currentPage ? getPage(currentPage) : null;
    const popup = page?.popups?.find((p: PopupDefinition) => p.id === currentPopupId);

    if (!popup) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                onClick={closePopup}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2
                        id="modal-title"
                        className="text-lg font-semibold text-slate-900 dark:text-white"
                    >
                        {popup.title}
                    </h2>
                    <button
                        onClick={closePopup}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        aria-label="Close popup"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {popup.sections ? (
                        <div className="space-y-8">
                            {popup.sections.map((section: Section, index: number) => (
                                <SectionRenderer
                                    key={`${section.type}-${index}`}
                                    section={section}
                                />
                            ))}
                        </div>
                    ) : popup.content ? (
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                {popup.content}
                            </ReactMarkdown>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
