"use client";
import React, { useState, useEffect } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Sidebar, TopBar } from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { usePathname } from "next/navigation";
import Footer from "../Footer";

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    const pathname = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Auto-close sidebar on desktop for logged-in users (collapsed by default)
    useEffect(() => {
        if (!isMobile && user) {
            setSidebarOpen(false);
        } else if (isMobile) {
            setSidebarOpen(false);
        }
    }, [isMobile, user]);

    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
    };

    // Don't show sidebar on auth pages
    const isAuthPage = pathname === "/login" || pathname === "/register";
    const isHomePage = pathname === "/";
    const showSidebar = user && !isAuthPage;
    const showTopBar = user || !isHomePage; // restore previous behavior

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            {showSidebar && (
                <Sidebar
                    open={sidebarOpen}
                    onClose={handleCloseSidebar}
                    onToggle={handleToggleSidebar}
                />
            )}

            {/* Main Content */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    marginLeft:
                        showSidebar && !isMobile
                            ? sidebarOpen
                                ? "280px"
                                : "72px"
                            : 0,
                    transition: theme.transitions.create(["margin"], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    width:
                        showSidebar && !isMobile
                            ? sidebarOpen
                                ? "calc(100% - 280px)"
                                : "calc(100% - 72px)"
                            : "100%",
                }}>
                {/* Top Bar */}
                {showTopBar && (
                    <TopBar
                        onToggleSidebar={
                            showSidebar ? handleToggleSidebar : undefined
                        }
                        showSidebar={showSidebar}
                    />
                )}

                {/* Page Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        bgcolor: isHomePage && !user ? "#FFFFFF" : "#FAFBFC",
                        minHeight: showTopBar
                            ? "calc(100vh - 72px)"
                            : "100vh",
                        display: "flex",
                        flexDirection: "column",
                    }}>
                    <Box sx={{ flex: 1 }}>{children}</Box>

                    {/* Footer */}
                    {!isAuthPage && <Footer />}
                </Box>
            </Box>
        </Box>
    );
};
