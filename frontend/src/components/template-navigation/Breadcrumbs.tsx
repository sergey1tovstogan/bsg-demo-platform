import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';

export function Breadcrumbs() {
    const { breadcrumbs, navigateToPage, backToAgenda } = useNavigation();

    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return (
        <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                const isAgenda = crumb.type === 'agenda';

                return (
                    <React.Fragment key={crumb.id}>
                        {index > 0 && (
                            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}

                        <button
                            onClick={() => {
                                if (isLast) return;
                                if (isAgenda) {
                                    backToAgenda();
                                } else {
                                    navigateToPage(crumb.id);
                                }
                            }}
                            disabled={isLast}
                            className={`
                flex items-center transition-colors
                ${isLast
                                    ? 'font-medium text-slate-900 dark:text-white cursor-default'
                                    : 'hover:text-blue-600 dark:hover:text-blue-400'
                                }
              `}
                            aria-current={isLast ? 'page' : undefined}
                        >
                            {isAgenda && (
                                <Home className="w-4 h-4 mr-1" />
                            )}
                            <span>{crumb.label}</span>
                        </button>
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
