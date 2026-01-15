import { useState, useCallback } from 'react';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { PageDefinition, AgendaDefinition, CardDefinition } from '@/lib/template-types';

// Helper to parse content that might be in frontmatter OR in a code block
const parseYamlContent = (text: string): any => {
    // 1. Try frontmatter
    const { data } = matter(text);
    if (Object.keys(data).length > 0) {
        return data;
    }

    // 2. Try extracting from ```yaml code block (non-greedy match)
    const yamlBlockRegex = /```yaml\s*([\s\S]*?)\s*```/;
    const match = text.match(yamlBlockRegex);

    if (match && match[1]) {
        try {
            return yaml.load(match[1]);
        } catch (e) {
            console.warn('Failed to parse YAML code block:', e);
        }
    }

    return {};
};

export function useTemplateParser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parsePage = useCallback(async (file: string, cacheBust?: number): Promise<PageDefinition> => {
        setLoading(true);
        setError(null);
        try {
            const url = cacheBust !== undefined ? `${file}?v=${cacheBust}` : file;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch page: ${file}`);
            }

            const text = await response.text();
            const data = parseYamlContent(text);

            // Simple parse to PageDefinition
            // We fill in missing fields if necessary for our renderer
            // Extract from either top-level or nested 'page' object
            const pageData = data.page || data;

            // Merge top-level fields with page block (top-level takes precedence for sections/sub_pages/navigation)
            const sections = data.sections || pageData.sections || [];
            const sub_pages = data.sub_pages || pageData.sub_pages;
            const navigation = data.navigation || pageData.navigation;
            const popups = data.popups || pageData.popups || [];

            return {
                id: pageData.id || file.replace(/\.md$/, '').split('/').pop() || 'unknown',
                titles: pageData.titles || {
                    page_header: data.title || pageData.title || 'Untitled',
                    menu_title: data.title || pageData.title || 'Untitled',
                    agenda_title: data.title || pageData.title || 'Untitled',
                    breadcrumb: data.title || pageData.title || 'Untitled'
                },
                description: pageData.description,
                sections,
                metadata: pageData.metadata,
                parent: pageData.parent || null,
                popups,
                sub_pages,
                navigation,
                icon: pageData.icon
            } as PageDefinition;

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown parsing error';
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const parseAgenda = useCallback(async (file: string, cacheBust?: number): Promise<AgendaDefinition> => {
        setLoading(true);
        setError(null);
        try {
            const url = cacheBust !== undefined ? `${file}?v=${cacheBust}` : file;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch agenda: ${file}`);
            }

            const text = await response.text();
            const data = parseYamlContent(text);

            // Support both direct root keys and 'agenda' wrapper
            const agendaData = data.agenda || data;

            if (!agendaData.title && !data.title) {
                throw new Error('Invalid agenda format: missing title');
            }

            return {
                title: agendaData.title || data.title,
                subtitle: agendaData.subtitle || data.subtitle,
                items: agendaData.items || data.items || [],
                layout: agendaData.layout || data.layout,
                animation: agendaData.animation || data.animation
            } as AgendaDefinition;

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown parsing error';
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const parseCard = useCallback(async (file: string, cacheBust?: number): Promise<CardDefinition> => {
        setLoading(true);
        setError(null);
        try {
            const url = cacheBust !== undefined ? `${file}?v=${cacheBust}` : file;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch card: ${file}`);
            }

            const text = await response.text();
            const data = parseYamlContent(text);

            if (!data.card) {
                throw new Error('Invalid card format: missing card object');
            }

            return data.card as CardDefinition;

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
        parseCard,
        loading,
        error
    };
}
