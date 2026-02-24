import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageDefinition } from '@/lib/template-types';
import { Search, X } from 'lucide-react';

interface PageSearchProps {
  pages: Map<string, PageDefinition>;
  onNavigate: (pageId: string) => void;
  placeholder?: string;
}

export function PageSearch({
  pages,
  onNavigate,
  placeholder = 'Search pages...',
}: PageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query (300ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Filter pages based on search query
  const filteredPages = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return Array.from(pages.values());
    }

    const query = debouncedQuery.toLowerCase();

    return Array.from(pages.values()).filter((page) => {
      // Search in titles
      const titleValues = Object.values(page.titles);
      if (titleValues.some(title => title.toLowerCase().includes(query))) {
        return true;
      }

      // Search in description
      if (page.description?.short?.toLowerCase().includes(query) ||
          page.description?.long?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in tags
      const tags = page.metadata?.tags;
      if (tags && Array.isArray(tags)) {
        if (tags.some((tag: string) => tag.toLowerCase().includes(query))) {
          return true;
        }
      }

      return false;
    });
  }, [debouncedQuery, pages]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleResultClick = useCallback(
    (pageId: string) => {
      onNavigate(pageId);
      setSearchQuery('');
    },
    [onNavigate]
  );

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {filteredPages.length > 0 ? (
            <ul className="py-2">
              {filteredPages.map((page) => {
                const tags = page.metadata?.tags;
                const description = page.description?.short || page.description?.long;

                return (
                  <li key={page.id}>
                    <button
                      onClick={() => handleResultClick(page.id)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {page.titles.page_header}
                      </div>
                      {description && (
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {description}
                        </div>
                      )}
                      {tags && tags.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {tags.slice(0, 3).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              No pages found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
