import { useEffect, useState } from 'react';
import { CardRenderer } from './CardRenderer';
import { useTemplateParser } from '@/hooks/useTemplateParser';
import { CardDefinition } from '@/lib/template-types';
import { Loader2 } from 'lucide-react';

interface TemplateCardWrapperProps {
    cardPath: string;
}

export function TemplateCardWrapper({ cardPath }: TemplateCardWrapperProps) {
    const { parseCard } = useTemplateParser();
    const [cardData, setCardData] = useState<CardDefinition | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadCard = async () => {
            setIsLoading(true);
            setLoadError(null);
            setCardData(null);

            try {
                const data = await parseCard(cardPath);
                if (mounted) {
                    setCardData(data);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Failed to load template card:", err);
                if (mounted) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load card');
                    setIsLoading(false);
                }
            }
        };

        loadCard();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardPath]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Error loading content: {loadError}</p>
            </div>
        );
    }

    if (!cardData) {
        return (
            <div className="p-8 text-center text-slate-500">
                <p>No card data available</p>
            </div>
        );
    }

    return <CardRenderer cardData={cardData} />;
}
