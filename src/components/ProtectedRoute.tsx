"use client";
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useNotification } from "../context/NotificationContext";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "ADMIN" | "CLIENT" | "CHEF" | "DRIVER" | "DISTRIBUTOR";
}

// User role-based homepage routes
const roleHomepages: Record<string, string> = {
    ADMIN: '/admin/dashboard',
    CLIENT: '/client/new-order',
    CHEF: '/chef/dashboard',
    DRIVER: '/driver/dashboard',
    DISTRIBUTOR: '/distributor/summary',
};

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, loading, isIntentionalLogout } = useAuth();
    const router = useRouter();
    const { showNotification } = useNotification();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            // Don't show notification if logout was intentional
            if (!isIntentionalLogout) {
                router.replace("/login?reason=auth_required");
            } else {
                router.replace("/login");
            }
        } else if (requiredRole && user.role !== requiredRole) {
            // Show warning notification about insufficient permissions
            showNotification(`You don't have permission to access this page. Redirecting to your dashboard.`, 'warning');
            // Redirect user to their role-appropriate homepage
            const homePage = roleHomepages[user.role] || '/';

            // Use setTimeout to ensure notification is shown before redirect
            setTimeout(() => {
                router.replace(homePage);
            }, 100);
        }
    }, [user, requiredRole, router, loading, showNotification, isIntentionalLogout]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // Don't render anything if user is not authenticated or doesn't have required role
    if (!user || (requiredRole && user.role !== requiredRole)) {
        return null;
    }

    return <>{children}</>;
} 
