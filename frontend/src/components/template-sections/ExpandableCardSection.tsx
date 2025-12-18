import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { SectionRenderer } from '../template-renderer/SectionRenderer';

interface ExpandableCardSectionProps {
    section: {
        type: 'expandable_card';
        trigger?: string;
        collapsed_title: string;
        expanded_content: any[];
        icon?: string;
        animation?: string;
    };
}

export function ExpandableCardSection({ section }: ExpandableCardSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Icon handling
    const IconComponent = section.icon && (Icons as any)[section.icon]
        ? (Icons as any)[section.icon]
        : Icons.Box; // Default icon

    return (
        <div className={`
      border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden my-6 
      bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200
      ${section.animation ? `animate-${section.animation}` : ''}
    `}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left"
            >
                <div className="p-6 flex items-start space-x-4">
                    <div className={`
            p-3 rounded-lg flex-shrink-0 transition-colors
            ${isExpanded
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}
          `}>
                        <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Trigger / Title */}
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            {section.trigger || section.collapsed_title}
                        </h3>

                        {/* Collapsed Description (Summary) - Only show if provided? Or implies title IS the summary? */}
                        {/* Spec mentions "collapsed_title". Maybe "trigger" is the main label? */}
                        {/* Use collapsed_title as subtitle if trigger exists? */}
                        {/* Let's mimic spec: trigger is optional. collapsed_title is required. */}

                        {!isExpanded && (
                            <p className="text-slate-500 dark:text-slate-400">
                                {section.collapsed_title !== section.trigger ? section.collapsed_title : 'Click to expand'}
                            </p>
                        )}
                    </div>

                    <div className="flex-shrink-0 ml-4 pt-1">
                        {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="space-y-6">
                            {section.expanded_content.map((item, index) => (
                                <SectionRenderer key={`expanded-${index}`} section={item} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
