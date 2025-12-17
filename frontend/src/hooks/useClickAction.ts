import { useCallback } from 'react';
import { ClickAction } from '@/lib/template-types';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';

export function useClickAction(action?: ClickAction) {
  const { navigateToPage, showPopup } = useNavigation();

  return useCallback(() => {
    if (!action) return;

    switch (action.type) {
      case 'navigate_to_subpage':
        if (action.target) {
          navigateToPage(action.target);
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
