/**
 * Agenda types definitions
 * Represents the structure of the landing page (Agenda)
 */

/**
 * Single item in the agenda grid
 */
export interface AgendaItem {
    id: string;
    title?: string;
    description?: string;
    icon?: string;
    page_id: string;
    order?: number;
    status?: 'locked' | 'active' | 'completed';
    color_theme?: string;
    titles?: {
        agenda_title?: string;
    };
    target?: {
        type: 'page' | 'url' | 'popup';
        page_id?: string;
        url?: string;
        popup_id?: string;
    };
}

/**
 * Helper to match the parser output which might have loose types
 */
export interface AgendaDefinition {
    title: string;
    subtitle?: string;
    items: AgendaItem[];
    layout?: {
        type: 'grid' | 'list';
        columns?: number;
        gap?: string;
    };
    animation?: {
        type: string;
        delay_between_items?: string;
    };
}
