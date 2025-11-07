// src/hooks/admin/useViewMode.ts
import { useState, useEffect } from "react";

export type ViewMode = "card" | "table";

interface UseViewModeReturn {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

const VIEW_MODE_STORAGE_KEY = "admin-products-view-mode";

export const useViewMode = (
    defaultMode: ViewMode = "card"
): UseViewModeReturn => {
    const [viewMode, setViewModeState] = useState<ViewMode>(defaultMode);

    // Load from localStorage on mount
    useEffect(() => {
        const savedMode = localStorage.getItem(
            VIEW_MODE_STORAGE_KEY
        ) as ViewMode;
        if (savedMode && (savedMode === "card" || savedMode === "table")) {
            setViewModeState(savedMode);
        }
    }, []);

    // Save to localStorage when changed
    const setViewMode = (mode: ViewMode) => {
        setViewModeState(mode);
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    };

    return {
        viewMode,
        setViewMode,
    };
};
