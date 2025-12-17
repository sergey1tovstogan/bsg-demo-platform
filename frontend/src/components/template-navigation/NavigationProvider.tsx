import { createContext, useContext, ReactNode } from 'react';

interface NavigationContextType {
  navigateToPage: (pageId: string) => void;
  showPopup: (popupId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const navigateToPage = (pageId: string) => {
    console.log('Navigate to:', pageId);
  };

  const showPopup = (popupId: string) => {
    console.log('Show popup:', popupId);
  };

  return (
    <NavigationContext.Provider value={{ navigateToPage, showPopup }}>
      {children}
    </NavigationContext.Provider>
  );
}
