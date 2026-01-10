import { useCallback } from 'react';
import { ClickAction } from '@/lib/template-types';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';

export function useClickAction(action?: ClickAction) {
  const { navigateToPage, showPopup } = useNavigation();

  return useCallback(() => {
    if (!action) {
      console.warn('No action provided to useClickAction');
      return;
    }

    console.log('🔔 Click action triggered:', action);

    switch (action.type) {
      case 'navigate_to_subpage':
        if (action.target) {
          console.log('📍 Navigating to subpage:', action.target);
          navigateToPage(action.target);
        } else {
          console.warn('navigate_to_subpage action has no target');
        }
        break;

      case 'show_popup':
        if (action.popup_id) {
          showPopup(action.popup_id);
        }
        break;

      case 'external_link':
        if (action.target) {
          if (action.open_in_new_tab) {
            window.open(action.target, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = action.target;
          }
        }
        break;
    }
  }, [action, navigateToPage, showPopup]);
}
