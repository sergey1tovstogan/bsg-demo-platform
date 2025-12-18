import { useState, useCallback } from 'react';
import matter from 'gray-matter';
import { PageDefinition, AgendaDefinition } from '@/lib/template-types';

export function useTemplateParser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parsePage = useCallback(async (file: string): Promise<PageDefinition> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error(`Failed to fetch page: ${file}`);
            }

            const text = await response.text();
            const { data } = matter(text);

            // Simple parse to PageDefinition
            // We fill in missing fields if necessary for our renderer
            return {
                id: data.id || data.page?.id || file.replace(/\.md$/, '').split('/').pop() || 'unknown',
                titles: data.titles || data.page?.titles || {
                    page_header: data.title || 'Untitled',
                    menu_title: data.title || 'Untitled',
                    agenda_title: data.title || 'Untitled',
                    breadcrumb: data.title || 'Untitled'
                },
                description: data.description || data.page?.description,
                sections: data.sections || [],
                metadata: data.metadata || data.page?.metadata,
                parent: data.parent || data.page?.parent || null,
                ...data
            } as PageDefinition;

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown parsing error';
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const parseAgenda = useCallback(async (file: string): Promise<AgendaDefinition> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error(`Failed to fetch agenda: ${file}`);
            }

            const text = await response.text();
            const { data } = matter(text);

            if (!data.title || !data.items) {
                throw new Error('Invalid agenda format: missing title or items');
            }

            return {
                title: data.title,
                subtitle: data.subtitle,
                items: data.items
            } as AgendaDefinition;

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown parsing error';
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        parsePage,
        parseAgenda,
        loading,
        error
    };
}
