import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { CardDefinition } from '@/lib/template-types';

interface NavigationContextValue {
  card: CardDefinition;
  currentPage: string | null;
  hierarchy: any;
  breadcrumbs: any[];
  popupStack: string[];
  navigateToPage: (pageId: string) => void;
  navigateBack: () => void;
  backToAgenda: () => void;
  showPopup: (popupId: string) => void;
  closePopup: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps {
  card: CardDefinition;
  children: ReactNode;
}

export function NavigationProvider({ card, children }: NavigationProviderProps) {
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [hierarchy] = useState<any>(null);
  const [popupStack, setPopupStack] = useState<string[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  const navigateToPage = (pageId: string) => {
    if (currentPage) {
      setNavigationHistory(prev => [...prev, currentPage]);
    }
    setCurrentPage(pageId);
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
  };

  const showPopup = (popupId: string) => {
    setPopupStack(prev => [...prev, popupId]);
  };

  const closePopup = () => {
    setPopupStack(prev => prev.slice(0, -1));
  };

  const breadcrumbs = useMemo(() => {
    if (!currentPage || !hierarchy) return [];
    // Simplified breadcrumb logic - will be enhanced later with NavigationBuilder
    return [];
  }, [currentPage, hierarchy]);

  const value: NavigationContextValue = {
    card,
    currentPage,
    hierarchy,
    breadcrumbs,
    popupStack,
    navigateToPage,
    navigateBack,
    backToAgenda,
    showPopup,
    closePopup,
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
