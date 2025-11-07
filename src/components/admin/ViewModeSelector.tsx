// src/components/admin/ViewModeSelector.tsx
import React from "react";
import { ToggleButtonGroup, ToggleButton, Box, Tooltip } from "@mui/material";
import {
    ViewModule as ViewModuleIcon,
    ViewList as ViewListIcon,
} from "@mui/icons-material";

export type ViewMode = "card" | "table";

interface ViewModeSelectorProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
    viewMode,
    onViewModeChange,
}) => {
    const handleChange = (
        _event: React.MouseEvent<HTMLElement>,
        newValue: ViewMode | null
    ) => {
        if (newValue !== null) {
            onViewModeChange(newValue);
        }
    };

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleChange}
                aria-label="View mode selector"
                size="small"
                sx={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    "& .MuiToggleButton-root": {
                        border: "none",
                        borderRadius: "6px !important",
                        mx: 0.5,
                        py: 1,
                        px: 1.5,
                        color: "#6B7280",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                            backgroundColor: "#F3F4F6",
                            color: "#374151",
                        },
                        "&.Mui-selected": {
                            backgroundColor: "#000000",
                            color: "white",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                            "&:hover": {
                                backgroundColor: "#1E1E1E",
                            },
                        },
                    },
                }}>
                <ToggleButton value="card" aria-label="Card view">
                    <Tooltip title="Card View" arrow>
                        <ViewModuleIcon sx={{ fontSize: 20 }} />
                    </Tooltip>
                </ToggleButton>
                <ToggleButton value="table" aria-label="Table view">
                    <Tooltip title="Table View" arrow>
                        <ViewListIcon sx={{ fontSize: 20 }} />
                    </Tooltip>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};
