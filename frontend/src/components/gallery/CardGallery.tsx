import { useEffect, useState, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';

interface RegistryCard {
    id: string;
    title: string;
    description: string;
    icon: string;
    path: string;
    category: string;
    tags: string[];
    color_theme: string;
}

interface Registry {
    cards: RegistryCard[];
}

interface CardGalleryProps {
    onSelectCard: (cardPath: string) => void;
}

export function CardGallery({ onSelectCard }: CardGalleryProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [registry, setRegistry] = useState<Registry | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchRegistry() {
            try {
                // Add cache-busting to ensure fresh data
                const response = await fetch(`/content/index.json?t=${Date.now()}`);
                if (!response.ok) {
                    throw new Error('Failed to load card registry');
                }
                const data = await response.json();
                setRegistry(data);
            } catch (err) {
                console.error('Error loading gallery:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }
        fetchRegistry();
    }, []);

    const filteredCards = useMemo(() => {
        if (!registry) return [];
        if (!searchQuery.trim()) return registry.cards;

        const query = searchQuery.toLowerCase();
        return registry.cards.filter(card =>
            card.title.toLowerCase().includes(query) ||
            card.description.toLowerCase().includes(query) ||
            card.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }, [registry, searchQuery]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Failed to load gallery: {error}</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    Card Gallery
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Browse and explore available documentation cards
                </p>

                {/* Search */}
                <div className="max-w-md mx-auto relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search cards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCards.map((card) => {
                    const IconComponent = (Icons as any)[card.icon] || Icons.Box;

                    return (
                        <button
                            key={card.id}
                            onClick={() => onSelectCard(card.path)}
                            className="group flex flex-col items-start p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-500/50 transition-all duration-200 text-left w-full"
                        >
                            <div className={`p-3 rounded-xl mb-4 bg-${card.color_theme}-50 dark:bg-${card.color_theme}-900/30 text-${card.color_theme}-600 dark:text-${card.color_theme}-400`}>
                                <IconComponent className="w-8 h-8" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {card.title}
                            </h3>

                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                                {card.description}
                            </p>

                            <div className="mt-auto flex flex-wrap gap-2">
                                {card.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
