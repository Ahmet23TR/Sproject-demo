// src/components/DemoWelcomeGuide.tsx
"use client";
import { useWelcomeModal } from "@/hooks/useWelcomeModal";
import WelcomeModal from "./WelcomeModal";
import DemoInfoButton from "./DemoInfoButton";

export default function DemoWelcomeGuide() {
    const { isOpen, openModal, closeModal, isDemoMode } = useWelcomeModal();

    if (!isDemoMode) {
        return null;
    }

    return (
        <>
            <WelcomeModal open={isOpen} onClose={closeModal} />
            <DemoInfoButton onClick={openModal} />
        </>
    );
}
