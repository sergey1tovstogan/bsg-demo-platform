import React from 'react';
import { PageDefinition } from '@/lib/template-types';
import { SectionRenderer } from './SectionRenderer';
import { Breadcrumbs } from '@/components/template-navigation/Breadcrumbs';
import { NavigationButtons } from '@/components/template-navigation/NavigationButtons';

interface PageRendererProps {
    page: PageDefinition;
}

export function PageRenderer({ page }: PageRendererProps) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <Breadcrumbs />

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {page.title}
                </h1>

                {page.description && (
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                        {page.description}
                    </p>
                )}
            </div>

            {/* Sections */}
            <div className="space-y-12">
                {page.sections.map((section, index) => (
                    <SectionRenderer
                        key={`${section.type}-${index}`}
                        section={section}
                    />
                ))}
            </div>

            {/* Footer Navigation */}
            <NavigationButtons />
        </div>
    );
}
