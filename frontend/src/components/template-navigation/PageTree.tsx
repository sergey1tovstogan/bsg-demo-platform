import { ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';

interface PageTreeProps {
    className?: string;
}

export function PageTree({ className = '' }: PageTreeProps) {
    const { hierarchy, currentPage, navigateToPage, card } = useNavigation();

    if (!card.navigation.show_page_tree || !hierarchy || !hierarchy.pages) {
        return null;
    }

    return (
        <nav className={`space-y-1 ${className}`} aria-label="Page Tree">
            {hierarchy.pages.map((node: any) => (
                <TreeNode
                    key={node.page.id}
                    node={node}
                    currentPage={currentPage}
                    onNavigate={navigateToPage}
                    level={0}
                />
            ))}
        </nav>
    );
}

interface TreeNodeProps {
    node: any; // Type should be PageNode but using any for flexibility with NavigationBuilder output
    currentPage: string | null;
    onNavigate: (id: string) => void;
    level: number;
}

function TreeNode({ node, currentPage, onNavigate, level }: TreeNodeProps) {
    const isActive = node.page.id === currentPage;
    const hasChildren = node.children && node.children.length > 0;
    // TODO: Implement expanded state logic. For now, expanded by default or if active child.
    const isExpanded = true;

    return (
        <div className="select-none">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(node.page.id);
                }}
                className={`w-full flex items-center py-2 px-2 text-sm rounded-md transition-colors
            ${isActive
                        ? 'bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300'
                    }`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                aria-current={isActive ? 'page' : undefined}
            >
                {hasChildren ? (
                    isExpanded ? <ChevronDown className="w-4 h-4 mr-1.5 opacity-50" /> : <ChevronRight className="w-4 h-4 mr-1.5 opacity-50" />
                ) : (
                    <FileText className="w-4 h-4 mr-1.5 opacity-50" />
                )}
                <span className="truncate">{node.page.titles?.menu_title || node.page.titles?.page_header || 'Untitled'}</span>
            </button>

            {hasChildren && isExpanded && (
                <div className="mt-1">
                    {node.children.map((child: any) => (
                        <TreeNode
                            key={child.page.id}
                            node={child}
                            currentPage={currentPage}
                            onNavigate={onNavigate}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
