// src/components/DemoInfoButton.tsx
"use client";
import { Box, Tooltip, Zoom } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface DemoInfoButtonProps {
    onClick: () => void;
}

export default function DemoInfoButton({ onClick }: DemoInfoButtonProps) {
    return (
        <Tooltip
            title="View Demo Guide"
            placement="right"
            TransitionComponent={Zoom}
            arrow>
            <Box
                onClick={onClick}
                sx={{
                    position: "fixed",
                    bottom: 16,
                    left: 16,
                    zIndex: 9998,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                        boxShadow: 6,
                        transform: "scale(1.05)",
                        bgcolor: "primary.dark",
                    },
                    "&:active": {
                        transform: "scale(0.95)",
                    },
                }}>
                <InfoIcon sx={{ fontSize: 28 }} />
            </Box>
        </Tooltip>
    );
}
