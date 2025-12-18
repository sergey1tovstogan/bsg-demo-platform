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
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

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

  const { parsePage, parseAgenda } = useTemplateParser();

  // Load content (pages and agenda)
  useEffect(() => {
    let mounted = true;

    async function loadContent() {
      // 1. Load Agenda
      if (card.agenda && card.agenda.file) {
        try {
          const agenda = await parseAgenda(card.agenda.file);
          if (mounted) setAgendaData(agenda);
        } catch (e) {
          // console.error('Failed to load agenda', e);
        }
      }

      // 2. Load Pages
      if (card.pages && card.pages.length > 0) {
        const map = new Map<string, PageDefinition>();
        const builder = new NavigationBuilder([]);

        try {
          const loadedPages = await Promise.all(
            card.pages.map(ref => parsePage(ref.file))
          );

          if (!mounted) return;

          loadedPages.forEach(page => {
            if (page) map.set(page.id, page);
          });

          setPagesMap(map);
          const nav = builder.buildHierarchy(card, map);
          setHierarchy(nav);
        } catch (err) {
          console.error('Failed to load pages:', err);
        }
      }
    }

    loadContent();

    return () => { mounted = false; };
  }, [card, parsePage, parseAgenda]);


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
      const builder = new NavigationBuilder([]);
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
