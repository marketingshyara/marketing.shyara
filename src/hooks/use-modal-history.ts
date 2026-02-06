import { useState, useEffect, useCallback, useRef } from "react";

/**
 * A hook that manages modal state with browser history integration.
 * When a modal opens, it pushes a state to history.
 * When the user presses back (or swipes back), it closes the modal instead of navigating away.
 */
export function useModalWithHistory() {
  const [activeModal, setActiveModalState] = useState<string | null>(null);
  const historyPushedRef = useRef(false);

  // Open a modal and push to history
  const openModal = useCallback((modalId: string) => {
    setActiveModalState(modalId);
    // Push a state to history so back button closes the modal
    window.history.pushState({ modal: modalId }, "", window.location.href);
    historyPushedRef.current = true;
  }, []);

  // Close modal - optionally go back in history if we pushed a state
  const closeModal = useCallback(() => {
    if (historyPushedRef.current) {
      historyPushedRef.current = false;
      // Go back in history, which will trigger popstate and close the modal
      window.history.back();
    } else {
      setActiveModalState(null);
    }
  }, []);

  // Handle the popstate event (back/forward navigation)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If a modal is open and user pressed back, close it
      if (activeModal !== null) {
        historyPushedRef.current = false;
        setActiveModalState(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeModal]);

  // Cleanup: if component unmounts with modal open, clean up history
  useEffect(() => {
    return () => {
      if (historyPushedRef.current) {
        // Don't go back on unmount as it could cause issues during navigation
        historyPushedRef.current = false;
      }
    };
  }, []);

  // Helper function to create onOpenChange handler for Dialog components
  const createOnOpenChange = useCallback(
    (modalId: string) => (open: boolean) => {
      if (!open) {
        closeModal();
      }
    },
    [closeModal]
  );

  return {
    activeModal,
    openModal,
    closeModal,
    createOnOpenChange,
    isModalOpen: (modalId: string) => activeModal === modalId,
  };
}
