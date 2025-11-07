// src/components/DemoRoleSwitcher.tsx
"use client";
import {
    Box,
    FormControl,
    MenuItem,
    Select,
    Typography,
    Chip,
    CircularProgress,
    SelectChangeEvent,
} from "@mui/material";
import { useDemoRoleSwitcher } from "@/hooks/useDemoRoleSwitcher";
import { useState, useRef, useEffect } from "react";

const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Admin",
    CLIENT: "Client",
    CHEF: "Chef",
    DRIVER: "Driver",
    DISTRIBUTOR: "Distributor",
};

const ROLE_COLORS: Record<
    string,
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
> = {
    ADMIN: "error",
    CLIENT: "primary",
    CHEF: "warning",
    DRIVER: "info",
    DISTRIBUTOR: "secondary",
};

export default function DemoRoleSwitcher() {
    const { isDemoMode, demoUsers, currentUserEmail, switchRole, isSwitching } =
        useDemoRoleSwitcher();

    const [position, setPosition] = useState({ x: 16, y: 16 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [dragStartTime, setDragStartTime] = useState<number>(0);
    const boxRef = useRef<HTMLDivElement>(null);

    // Load saved state (position + collapsed) from localStorage on mount
    useEffect(() => {
        const savedPosition = localStorage.getItem("demoRoleSwitcherPosition");
        if (savedPosition) {
            try {
                const parsed = JSON.parse(savedPosition);
                setPosition(parsed);
            } catch {
                // Ignore parse errors
            }
        }

        const savedCollapsed = localStorage.getItem(
            "demoRoleSwitcherCollapsed"
        );
        if (savedCollapsed) {
            setCollapsed(savedCollapsed === "true");
        }
    }, []);

    // Save position to localStorage when dragging ends
    useEffect(() => {
        if (!isDragging) {
            localStorage.setItem(
                "demoRoleSwitcherPosition",
                JSON.stringify(position)
            );
        }
    }, [isDragging, position]);

    // Save collapsed state
    useEffect(() => {
        localStorage.setItem("demoRoleSwitcherCollapsed", String(collapsed));
    }, [collapsed]);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;

            // Get viewport dimensions
            const maxX =
                window.innerWidth - (boxRef.current?.offsetWidth || 280);
            const maxY =
                window.innerHeight - (boxRef.current?.offsetHeight || 200);

            // Constrain position within viewport
            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY)),
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // Store start time to distinguish click from drag
        setDragStartTime(Date.now());
        
        // Don't start dragging if clicking on interactive elements (except in collapsed mode)
        const target = e.target as HTMLElement;
        if (
            !collapsed && (
                target.closest(".MuiSelect-root") ||
                target.closest(".MuiMenuItem-root") ||
                target.closest("button")
            )
        ) {
            return;
        }

        if (boxRef.current) {
            const rect = boxRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
            setIsDragging(true);
        }
    };

    const toggleCollapsed = (e?: React.MouseEvent) => {
        // Only toggle if it was a quick click (< 200ms) and not a drag
        const clickDuration = Date.now() - dragStartTime;
        if (clickDuration < 200 && !isDragging) {
            e?.stopPropagation();
            setCollapsed((c) => !c);
        }
    };

    if (!isDemoMode) {
        return null;
    }

    const handleChange = (event: SelectChangeEvent<string>) => {
        const email = event.target.value;
        if (email && email !== currentUserEmail) {
            switchRole(email);
        }
    };

    const currentUser = demoUsers.find((u) => u.email === currentUserEmail);

    return (
        <>
            {collapsed ? (
                <Box
                    ref={boxRef}
                    onMouseDown={handleMouseDown}
                    onClick={toggleCollapsed}
                    title="Demo role switcher - click to open, drag to move"
                    sx={{
                        position: "fixed",
                        top: position.y,
                        left: position.x,
                        zIndex: 9999,
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: "background.paper",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isDragging ? 6 : 3,
                        border: "2px solid",
                        borderColor: "secondary.main",
                        cursor: isDragging ? "grabbing" : "grab",
                        userSelect: "none",
                        transition: isDragging ? "none" : "box-shadow 0.2s",
                        "&:hover": {
                            boxShadow: 4,
                        },
                    }}>
                    <Typography
                        variant="button"
                        sx={{ fontSize: "0.8rem", pointerEvents: "none" }}>
                        DM
                    </Typography>
                </Box>
            ) : (
                <Box
                    ref={boxRef}
                    onMouseDown={handleMouseDown}
                    sx={{
                        position: "fixed",
                        top: position.y,
                        left: position.x,
                        zIndex: 9999,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: isDragging ? 6 : 3,
                        p: 2,
                        minWidth: 280,
                        border: "2px solid",
                        borderColor: "secondary.main",
                        cursor: isDragging ? "grabbing" : "grab",
                        userSelect: "none",
                        transition: isDragging ? "none" : "box-shadow 0.2s",
                        "&:hover": {
                            boxShadow: 4,
                        },
                    }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 1.5,
                        }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                                label="DEMO MODE"
                                color="secondary"
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                            {isSwitching && <CircularProgress size={16} />}
                        </Box>
                        <Box
                            component="button"
                            onClick={toggleCollapsed}
                            title="Minimize"
                            sx={{
                                all: "unset",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 20,
                                height: 20,
                                borderRadius: 1,
                                transition: "background-color 0.2s",
                                "&:hover": {
                                    bgcolor: "action.hover",
                                },
                            }}
                            aria-label="Collapse demo role switcher">
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1 }}>
                                −
                            </Typography>
                        </Box>
                    </Box>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mb={1}>
                        Switch User Role
                    </Typography>

                    <FormControl fullWidth size="small">
                        <Select
                            value={currentUserEmail || ""}
                            onChange={handleChange}
                            disabled={isSwitching}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        maxHeight: 400,
                                        mt: 0.5,
                                        zIndex: 10001,
                                    },
                                },
                                sx: {
                                    zIndex: 10001,
                                },
                            }}
                            sx={{
                                cursor: "default",
                                "& .MuiSelect-select": {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                },
                            }}>
                            {demoUsers.map((user) => (
                                <MenuItem key={user.email} value={user.email}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            width: "100%",
                                        }}>
                                        <Chip
                                            label={ROLE_LABELS[user.role]}
                                            color={ROLE_COLORS[user.role]}
                                            size="small"
                                            sx={{
                                                minWidth: 85,
                                                fontWeight: 500,
                                            }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography
                                                variant="body2"
                                                fontWeight={500}>
                                                {user.name} {user.surname}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                display="block">
                                                {user.companyName}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {currentUser && (
                        <Box
                            sx={{
                                mt: 1.5,
                                pt: 1.5,
                                borderTop: "1px solid #e0e0e0",
                            }}>
                            <Typography
                                variant="caption"
                                color="text.secondary">
                                Current User
                            </Typography>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                mt={0.5}>
                                {currentUser.name} {currentUser.surname}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary">
                                {currentUser.email}
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </>
    );
}
