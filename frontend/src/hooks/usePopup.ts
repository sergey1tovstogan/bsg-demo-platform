import { useNavigation } from '@/components/template-navigation/NavigationProvider';
import { useCallback } from 'react';

/**
 * usePopup hook
 * 
 * Provides a simplified interface for interacting with the popup system.
 * Wraps functionality from NavigationProvider.
 */
export function usePopup() {
    const { showPopup, closePopup, popupStack } = useNavigation();

    const open = useCallback((popupId: string) => {
        showPopup(popupId);
    }, [showPopup]);

    const close = useCallback(() => {
        closePopup();
    }, [closePopup]);

    const isOpen = useCallback((popupId: string) => {
        return popupStack.includes(popupId);
    }, [popupStack]);

    const toggle = useCallback((popupId: string) => {
        if (isOpen(popupId)) {
            close();
        } else {
            open(popupId);
        }
    }, [isOpen, open, close]);

    return {
        open,
        close,
        isOpen,
        toggle,
        activePopupId: popupStack.length > 0 ? popupStack[popupStack.length - 1] : null,
        stackSize: popupStack.length
    };
}
