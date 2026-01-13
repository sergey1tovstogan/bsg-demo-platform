import { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import { AlertCircle, Eye, Code } from 'lucide-react';
import { PageRenderer } from '../template-renderer/PageRenderer';
import { CardRenderer } from '../template-renderer/CardRenderer';
import { PageDefinition, CardDefinition } from '@/lib/template-types';
import { NavigationContext } from '../template-navigation/NavigationProvider';

interface VisualEditorProps {
    initialValue?: string;
    mode?: 'page' | 'card';
}

export function VisualEditor({ initialValue = '', mode = 'page' }: VisualEditorProps) {
    const [code, setCode] = useState(initialValue);
    const [parsedData, setParsedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Initial load
    useEffect(() => {
        if (initialValue) {
            handleCodeChange(initialValue);
        }
    }, [initialValue]);

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        try {
            const parsed = yaml.load(newCode);

            // Validate basic structure based on mode
            if (mode === 'page') {
                const data = parsed as any;
                if (data.page) {
                    setParsedData(data.page);
                } else {
                    setParsedData(data); // Assume direct object
                }
            } else {
                const data = parsed as any;
                if (data.card) {
                    setParsedData(data.card);
                } else {
                    setParsedData(data);
                }
            }
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid YAML');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[600px] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <Code className="w-4 h-4" />
                    <span>YAML Editor</span>
                    <span className="text-slate-400">|</span>
                    <Eye className="w-4 h-4" />
                    <span>Live Preview</span>
                </div>
                {error && (
                    <div className="flex items-center space-x-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Pane */}
                <div className="w-1/2 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                    <textarea
                        value={code}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        className="flex-1 w-full h-full p-4 font-mono text-sm resize-none bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-colors"
                        placeholder="# Paste your YAML here..."
                        spellCheck={false}
                    />
                </div>

                {/* Preview Pane */}
                <div className="w-1/2 overflow-y-auto bg-slate-100 dark:bg-slate-950/50 p-8">
                    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm min-h-[500px] border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {!error && parsedData ? (
                            mode === 'page' ? (
                                <MockNavigationProvider page={parsedData as PageDefinition}>
                                    <PageRenderer page={parsedData as PageDefinition} />
                                </MockNavigationProvider>
                            ) : (
                                <CardRenderer cardData={parsedData as CardDefinition} />
                            )
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                {error ? 'Fix errors to see preview' : 'Enter valid YAML to see preview'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Mock Provider for Visual Editor
function MockNavigationProvider({ children, page }: { children: React.ReactNode, page: PageDefinition }) {
    // Basic mock hierarchy
    const mockHierarchy = {
        id: 'root',
        pageId: 'root',
        title: 'Preview',
        children: []
    };

    const mockCard = {
        id: 'preview',
        title: 'Preview',
        description: 'Preview Mode',
        pages: []
    } as unknown as CardDefinition;

    const value = {
        card: mockCard,
        agendaData: null,
        currentPage: page.id,
        hierarchy: mockHierarchy,
        breadcrumbs: [{ id: 'root', label: 'Preview', path: 'root' }, { id: page.id, label: page.titles?.breadcrumb || (page as any).title || 'Page', path: page.id }],
        popupStack: [],
        navigateToPage: () => console.log('Navigation disabled in preview'),
        navigateBack: () => console.log('Navigation disabled in preview'),
        backToAgenda: () => console.log('Navigation disabled in preview'),
        showPopup: () => console.log('Popups disabled in preview'),
        closePopup: () => console.log('Popups disabled in preview'),
        getPage: () => page,
        refreshContent: () => console.log('Refresh disabled in preview')
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}

// Default template for new pages
export const DEFAULT_PAGE_TEMPLATE = `# New Page Definition
page:
  id: "new-page"
  titles:
    page_header: "New Page Title"
    menu_title: "Menu Title"
    agenda_title: "Agenda Title"
    breadcrumb: "Breadcrumb"
  
  description: "Description of your new page"

  sections:
    - type: "hero"
      heading: "Hello World"
      subtitle: "Welcome to your new page"
      
    - type: "text"
      content: |
        Start editing the YAML on the left to see your changes immediately.
`;
