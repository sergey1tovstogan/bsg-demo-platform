import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SectionRenderer } from '../template-renderer/SectionRenderer';

interface ExpandableSectionProps {
    section: {
        type: 'expandable_section';
        trigger: string;
        collapsed: any[];
        expanded: any[];
        max_height?: number;
    };
}

export function ExpandableSection({ section }: ExpandableSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden my-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <span className="font-medium text-slate-900 dark:text-slate-100">
                    {section.trigger}
                </span>
                {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                )}
            </button>

            <div className="p-4 bg-white dark:bg-slate-900">
                <div className="space-y-6">
                    {isExpanded ? (
                        // Expanded Content
                        section.expanded.map((item, index) => (
                            <SectionRenderer key={`expanded-${index}`} section={item} />
                        ))
                    ) : (
                        // Collapsed Content
                        section.collapsed.map((item, index) => (
                            <SectionRenderer key={`collapsed-${index}`} section={item} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
