// src/hooks/useNavbar.ts
"use client";
import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export const useNavbar = () => {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const logoHref = useMemo(() => {
        if (!user) return "/";
        switch (user.role) {
            case "CHEF":
                return "/chef/dashboard";
            case "DRIVER":
                return "/driver/dashboard";
            case "DISTRIBUTOR":
                return "/distributor/summary";
            case "ADMIN":
                return "/";
            case "CLIENT":
                return "/";
            default:
                return "/";
        }
    }, [user]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
        setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        logout();
        handleMenuClose();
        router.push("/login");
    };

    const handleProfileClick = () => {
        handleMenuClose();
        router.push("/profile");
    };

    return {
        user,
        loading,
        logoHref,
        isMenuOpen: Boolean(anchorEl),
        anchorEl,
        handleMenuOpen,
        handleMenuClose,
        handleLogout,
        handleProfileClick,
    };
};
