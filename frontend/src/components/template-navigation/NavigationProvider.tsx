import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { AgendaDefinition, CardDefinition, PageDefinition } from '@/lib/template-types';
import { NavigationBuilder } from '@/lib/template-parser/navigation-builder';
import { useTemplateParser } from '@/hooks/useTemplateParser';

interface NavigationContextValue {
  card: CardDefinition;
  agendaData: AgendaDefinition | null;
  currentPage: string | null;
  hierarchy: any;
  breadcrumbs: any[];
  popupStack: string[];
  navigateToPage: (pageId: string) => void;
  navigateBack: () => void;
  backToAgenda: () => void;
  showPopup: (popupId: string) => void;
  closePopup: () => void;
  getPage: (pageId: string) => PageDefinition | undefined;
  refreshContent: () => void;
}

export const NavigationContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps {
  card: CardDefinition;
  children: ReactNode;
}

export function NavigationProvider({ card, children }: NavigationProviderProps) {
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [hierarchy, setHierarchy] = useState<any>(null);
  const [popupStack, setPopupStack] = useState<string[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [pagesMap, setPagesMap] = useState<Map<string, PageDefinition>>(new Map());
  const [agendaData, setAgendaData] = useState<AgendaDefinition | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const { parsePage, parseAgenda } = useTemplateParser();

  const refreshContent = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Load content (pages and agenda)
  useEffect(() => {
    let mounted = true;

    async function loadContent() {
      // 1. Load Agenda
      if (card.agenda && card.agenda.file) {
        try {
          const agenda = await parseAgenda(card.agenda.file, refreshKey);
          if (mounted) setAgendaData(agenda);
        } catch (e) {
          // console.error('Failed to load agenda', e);
        }
      }

      // 2. Load Pages recursively
      if (card.pages && card.pages.length > 0) {
        const map = new Map<string, PageDefinition>();
        const builder = new NavigationBuilder();
        const loadedFiles = new Set<string>(); // Track loaded files to avoid duplicates

        try {
          // Recursive function to load a page and all its sub_pages
          const loadPageRecursively = async (fileRef: { file: string }): Promise<void> => {
            // Normalize path - ensure it has a leading slash
            const normalizedPath = fileRef.file.startsWith('/') ? fileRef.file : `/${fileRef.file}`;

            // Avoid loading the same file twice
            if (loadedFiles.has(normalizedPath)) {
              return;
            }
            loadedFiles.add(normalizedPath);

            const page = await parsePage(normalizedPath, refreshKey);
            if (!page) return;

            map.set(page.id, page);

            // Recursively load sub_pages if they exist
            if (page.sub_pages && page.sub_pages.length > 0) {
              await Promise.all(
                page.sub_pages.map(subPageRef => loadPageRecursively(subPageRef))
              );
            }
          };

          // Load all top-level pages and their descendants
          await Promise.all(
            card.pages.map(ref => loadPageRecursively(ref))
          );

          if (!mounted) return;

          console.log(`✅ Loaded ${map.size} pages total:`, Array.from(map.keys()));
          setPagesMap(map);
          const nav = builder.buildHierarchy(card, map);
          console.log('📊 Navigation hierarchy built:', nav);
          setHierarchy(nav);
        } catch (err) {
          console.error('Failed to load pages:', err);
        }
      }
    }

    loadContent();

    return () => { mounted = false; };
  }, [card, parsePage, parseAgenda, refreshKey]);


  const navigateToPage = (pageId: string) => {
    if (currentPage) {
      setNavigationHistory(prev => [...prev, currentPage]);
    }
    setCurrentPage(pageId);
    if (typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }
  };

  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const prev = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(h => h.slice(0, -1));
      setCurrentPage(prev);
    }
  };

  const backToAgenda = () => {
    setCurrentPage(null);
    setNavigationHistory([]);
    window.scrollTo(0, 0);
  };

  const showPopup = (popupId: string) => {
    setPopupStack(prev => [...prev, popupId]);
  };

  const closePopup = () => {
    setPopupStack(prev => prev.slice(0, -1));
  };

  const getPage = (pageId: string) => {
    return pagesMap.get(pageId);
  };

  const breadcrumbs = useMemo(() => {
    if (!currentPage || !hierarchy) return [];
    try {
      const builder = new NavigationBuilder();
      return builder.buildBreadcrumbs(currentPage, hierarchy);
    } catch (e) {
      console.warn('Breadcrumb generation failed', e);
      return [];
    }
  }, [currentPage, hierarchy]);

  const value: NavigationContextValue = {
    card,
    agendaData,
    currentPage,
    hierarchy,
    breadcrumbs,
    popupStack,
    navigateToPage,
    navigateBack,
    backToAgenda,
    showPopup,
    closePopup,
    getPage,
    refreshContent,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
