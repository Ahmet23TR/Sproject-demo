import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ViewModule, ViewList } from "@mui/icons-material";
import React from "react";

interface ViewToggleProps {
    view: "catalog" | "list";
    onViewChange: (view: "catalog" | "list") => void;
}

export const ViewToggle = React.memo(
    ({ view, onViewChange }: ViewToggleProps) => {
        const handleChange = (
            _: React.MouseEvent<HTMLElement>,
            newView: "catalog" | "list" | null
        ) => {
            if (newView !== null) {
                onViewChange(newView);
            }
        };

        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 3,
                }}>
                <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={handleChange}
                    aria-label="product view mode"
                    sx={{
                        "& .MuiToggleButton-root": {
                            px: 2,
                            py: 1,
                            border: "1px solid",
                            borderColor: "grey.300",
                            borderRadius: 2,
                            backgroundColor: "background.paper",
                            color: "text.secondary",
                            "&:hover": {
                                backgroundColor: "grey.50",
                                borderColor: "primary.main",
                            },
                            "&.Mui-selected": {
                                backgroundColor: "primary.main",
                                color: "white",
                                borderColor: "primary.main",
                                "&:hover": {
                                    backgroundColor: "primary.dark",
                                },
                            },
                        },
                    }}>
                    <ToggleButton
                        value="catalog"
                        aria-label="catalog view"
                        sx={{ mr: 2 }}>
                        <ViewModule sx={{ mr: 1, fontSize: "1.2rem" }} />
                        Catalog
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="list view">
                        <ViewList sx={{ mr: 1, fontSize: "1.2rem" }} />
                        List
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
        );
    }
);

ViewToggle.displayName = "ViewToggle";
