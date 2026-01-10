import { CardDefinition } from '@/lib/template-types';
import { NavigationProvider, useNavigation } from '@/components/template-navigation/NavigationProvider';
import { AgendaRenderer } from './AgendaRenderer';
import { PageRenderer } from './PageRenderer';
import { PopupRenderer } from './PopupRenderer';
import { Loader2 } from 'lucide-react';

interface CardRendererProps {
    cardData: CardDefinition;
}

/**
 * Top-level Orchestrator for Content Template System
 * Manages the transition between Agenda and Page views
 */
export function CardRenderer({ cardData }: CardRendererProps) {
    return (
        <NavigationProvider card={cardData}>
            <CardContent />
            <PopupRenderer />
        </NavigationProvider>
    );
}

function CardContent() {
    const { currentPage, getPage, agendaData } = useNavigation();

    // 1. Loading state (if agenda or page needed but not ready)
    if (!currentPage && !agendaData) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    // 2. Render Agenda (if no page is selected)
    if (!currentPage) {
        return <AgendaRenderer agenda={agendaData!} />;
    }

    // 3. Render Page
    const page = getPage(currentPage);
    if (!page) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return <PageRenderer page={page} />;
}
