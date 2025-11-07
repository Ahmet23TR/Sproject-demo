import { useState, useEffect } from "react";
import { DEMO_MODE } from "@/config/demo";

interface UseWelcomeModalReturn {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    isDemoMode: boolean;
}

const WELCOME_MODAL_KEY = "deras_demo_welcome_shown";

export function useWelcomeModal(): UseWelcomeModalReturn {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!DEMO_MODE) return;

        // Check if this is the first visit
        const hasSeenWelcome = localStorage.getItem(WELCOME_MODAL_KEY);
        
        if (!hasSeenWelcome) {
            // Small delay for better UX - let the page load first
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 500);
            
            return () => clearTimeout(timer);
        }
    }, []);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        // Mark as seen
        localStorage.setItem(WELCOME_MODAL_KEY, "true");
    };

    return {
        isOpen,
        openModal,
        closeModal,
        isDemoMode: DEMO_MODE,
    };
}
