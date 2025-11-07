"use client";
import React from "react";
import {
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Avatar,
    useMediaQuery,
    useTheme,
    Tooltip,
    Menu,
    MenuItem,
} from "@mui/material";
import Image from "next/image";
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    ShoppingCart as OrdersIcon,
    Person as ProfileIcon,
    ExitToApp as LogoutIcon,
    History as HistoryIcon,
    Add as NewOrderIcon,
    People as PeopleIcon,
    Assessment as ReportsIcon,
    AttachMoney as PricingIcon,
    Business as BusinessIcon,
    Badge as BadgeIcon,
    Widgets as WidgetsIcon,
    ReceiptLong as ReceiptLongIcon,
    Category as CategoryIcon,
    Insights as InsightsIcon,
    BarChart as BarChartIcon,
    ExpandLess,
    ExpandMore,
} from "@mui/icons-material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
    open: boolean;
    onClose: () => void;
    onToggle: () => void;
}

interface NavItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    roles?: string[];
    children?: NavItem[];
}

// interface NavGroup {
//     label: string;
//     icon: React.ReactNode;
//     children: NavItem[];
//     roles?: string[];
// }

export const Sidebar = ({ open, onClose, onToggle }: SidebarProps) => {
    const { user } = useAuth();
    const pathname = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [expandedGroups, setExpandedGroups] = React.useState<
        Record<string, boolean>
    >({});

    const getNavItems = React.useCallback((): NavItem[] => {
        if (!user) return [];

        // Dashboard always first
        const baseItems: NavItem[] = [
            {
                label: "Dashboard",
                href:
                    user.role === "ADMIN"
                        ? "/admin/dashboard"
                        : user.role === "CLIENT"
                            ? "/client/dashboard"
                            : user.role === "CHEF"
                                ? "/chef/dashboard"
                                : user.role === "DRIVER"
                                    ? "/driver/dashboard"
                                    : user.role === "DISTRIBUTOR"
                                        ? "/distributor/summary"
                                        : "/",
                icon: <DashboardIcon />,
            },
        ];

        // Role-specific navigation
        if (user.role === "ADMIN") {
            baseItems.push(
                {
                    label: "User Management",
                    icon: <PeopleIcon />,
                    children: [
                        {
                            label: "Clients",
                            href: "/admin/clients",
                            icon: <BusinessIcon />,
                        },
                        {
                            label: "Staff",
                            href: "/admin/staff",
                            icon: <BadgeIcon />,
                        },
                    ],
                },
                {
                    label: "Orders",
                    href: "/admin/orders",
                    icon: <OrdersIcon />,
                },
                {
                    label: "Products",
                    href: "/admin/products",
                    icon: <WidgetsIcon />,
                },
                {
                    label: "Pricing",
                    href: "/admin/pricing",
                    icon: <PricingIcon />,
                },
                {
                    label: "Reports",
                    icon: <ReportsIcon />,
                    children: [
                        {
                            label: "Orders Report",
                            href: "/admin/reports/orders",
                            icon: <ReceiptLongIcon />,
                        },
                        {
                            label: "Production Report",
                            href: "/admin/reports/production",
                            icon: <CategoryIcon />,
                        },
                        {
                            label: "Customers Report",
                            href: "/admin/reports/customers",
                            icon: <InsightsIcon />,
                        },
                        {
                            label: "Financials Report",
                            href: "/admin/reports/financials",
                            icon: <BarChartIcon />,
                        },
                    ],
                }
            );
        } else if (user.role === "CLIENT") {
            baseItems.push(
                {
                    label: "New Order",
                    href: "/client/new-order",
                    icon: <NewOrderIcon />,
                },
                {
                    label: "Order History",
                    href: "/client/order-history",
                    icon: <HistoryIcon />,
                }
            );
        } else if (user.role === "DISTRIBUTOR") {
            baseItems.push(
                {
                    label: "Daily Products",
                    href: "/distributor/products",
                    icon: <WidgetsIcon />,
                },
                {
                    label: "Daily Orders",
                    href: "/distributor/orders",
                    icon: <OrdersIcon />,
                },
                {
                    label: "Price Lists",
                    href: "/distributor/pricing",
                    icon: <PricingIcon />,
                },
                {
                    label: "Clients",
                    href: "/distributor/clients",
                    icon: <PeopleIcon />,
                }
            );
        }

        return baseItems;
    }, [user]);

    // Auto-expand groups that contain active items
    React.useEffect(() => {
        const navItems = getNavItems();
        const newExpanded: Record<string, boolean> = {};

        navItems.forEach((item) => {
            if (item.children) {
                const hasActiveChild = item.children.some(
                    (child) => pathname === child.href
                );
                if (hasActiveChild) {
                    newExpanded[item.label] = true;
                }
            }
        });

        setExpandedGroups((prev) => ({ ...prev, ...newExpanded }));
    }, [pathname, user?.role, getNavItems]);

    const handleItemClick = () => {
        if (isMobile) {
            onClose();
        }
    };

    const handleGroupToggle = (groupLabel: string) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupLabel]: !prev[groupLabel],
        }));
    };

    const isGroupExpanded = (groupLabel: string) => {
        return expandedGroups[groupLabel] || false;
    };

    const isItemActive = (item: NavItem): boolean => {
        if (item.href) {
            return pathname === item.href;
        }
        if (item.children) {
            return item.children.some((child) => pathname === child.href);
        }
        return false;
    };

    const navItems = getNavItems();

    // Collapsed sidebar content (icons only)
    const collapsedDrawerContent = (
        <Box
            sx={{
                width: 72,
                height: "100%",
                bgcolor: "#1C1C1E",
                borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
            }}>

            {/* User Avatar */}
            {/* {user && (
                <Box
                    sx={{
                        p: 2,
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                    <Tooltip
                        title={`${user.name} (${user.role?.toLowerCase()})`}
                        placement="right">
                        <Avatar
                            sx={{
                                bgcolor: "rgba(255, 255, 255, 0.15)",
                                color: "#FFFFFF",
                                fontWeight: 600,
                                width: 40,
                                height: 40,
                                fontSize: 16,
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            }}>
                            {user.name?.[0]?.toUpperCase()}
                        </Avatar>
                    </Tooltip>
                </Box>
            )} */}
            {/* Navigation Icons */}
            <Box sx={{ flex: 1, py: 2 }}>
                <List sx={{ px: 1 }}>
                    {navItems.map((item) => {
                        const isActive = isItemActive(item);
                        const hasChildren =
                            item.children && item.children.length > 0;

                        return (
                            <React.Fragment key={item.label}>
                                <ListItem disablePadding sx={{ mb: 1 }}>
                                    <Tooltip
                                        title={item.label}
                                        placement="right">
                                        <ListItemButton
                                            component={
                                                hasChildren ? "div" : Link
                                            }
                                            href={
                                                hasChildren
                                                    ? undefined
                                                    : item.href
                                            }
                                            onClick={
                                                hasChildren
                                                    ? onToggle
                                                    : handleItemClick
                                            }
                                            sx={{
                                                borderRadius: 3,
                                                py: 1.5,
                                                px: 1,
                                                minWidth: 48,
                                                height: 48,
                                                bgcolor: isActive
                                                    ? "rgba(203, 161, 53, 0.15)"
                                                    : "transparent",
                                                color: isActive
                                                    ? "#CBA135"
                                                    : "#A0A0A0",
                                                transition:
                                                    "all 0.2s ease-in-out",
                                                display: "flex",
                                                justifyContent: "center",
                                                "&:hover": {
                                                    bgcolor: isActive
                                                        ? "rgba(203, 161, 53, 0.25)"
                                                        : "rgba(203, 161, 53, 0.08)",
                                                    color: "#CBA135",
                                                    transform: "scale(1.05)",
                                                },
                                            }}>
                                            <Box
                                                sx={{
                                                    color: "inherit", // Parent'tan rengi al (hover durumunda altın olacak)
                                                }}>
                                                {item.icon}
                                            </Box>
                                        </ListItemButton>
                                    </Tooltip>
                                </ListItem>

                                {/* Sub-items - show only if parent is active and has children */}
                                {hasChildren && isActive && (
                                    <Box sx={{ mb: 1 }}>
                                        {item.children!.map((child) => {
                                            const isChildActive =
                                                pathname === child.href;
                                            return (
                                                <ListItem
                                                    key={child.href}
                                                    disablePadding
                                                    sx={{ mb: 0.5 }}>
                                                    <Tooltip
                                                        title={child.label}
                                                        placement="right">
                                                        <ListItemButton
                                                            component={Link}
                                                            href={child.href!}
                                                            onClick={
                                                                handleItemClick
                                                            }
                                                            sx={{
                                                                borderRadius: 3,
                                                                py: 1,
                                                                px: 1,
                                                                minWidth: 40,
                                                                height: 40,
                                                                bgcolor:
                                                                    isChildActive
                                                                        ? "rgba(203, 161, 53, 0.15)"
                                                                        : "transparent",
                                                                color: isChildActive
                                                                    ? "#CBA135"
                                                                    : "#A0A0A0",
                                                                transition:
                                                                    "all 0.2s ease-in-out",
                                                                display: "flex",
                                                                justifyContent:
                                                                    "center",
                                                                "&:hover": {
                                                                    bgcolor:
                                                                        isChildActive
                                                                            ? "rgba(203, 161, 53, 0.25)"
                                                                            : "rgba(203, 161, 53, 0.08)",
                                                                    color: "#CBA135",
                                                                    transform:
                                                                        "scale(1.05)",
                                                                },
                                                            }}>
                                                            <Box
                                                                sx={{
                                                                    color: "inherit", // Parent'tan rengi al (hover durumunda altın olacak)
                                                                    fontSize:
                                                                        "18px",
                                                                }}>
                                                                {child.icon}
                                                            </Box>
                                                        </ListItemButton>
                                                    </Tooltip>
                                                </ListItem>
                                            );
                                        })}
                                    </Box>
                                )}
                            </React.Fragment>
                        );
                    })}
                </List>
            </Box>
            {/* Footer - Hamburger Button (moved to bottom) */}
            <Box sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <Tooltip title="Expand Sidebar" placement="right">
                    <IconButton
                        onClick={onToggle}
                        sx={{
                            color: "#FFFFFF",
                            bgcolor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: 2,
                            p: 1,
                            "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 0.2)",
                            },
                        }}>
                        <MenuIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );

    const drawerContent = (
        <Box
            sx={{
                width: 280,
                height: "100%",
                bgcolor: "#1C1C1E",
                borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
            }}>
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 2,
                    height: 100,
                }}>
                {/* Logo Image */}
                <Box sx={{ position: "relative", height: 65, width: 175 }}>
                    <Image
                        src="/Dark_logo.jpeg"
                        alt="Deras Logo"
                        fill
                        sizes="175px"
                        style={{ objectFit: "contain" }}
                        priority
                    />
                </Box>

                {/* Mobile Close Button */}
                {isMobile && (
                    <Box sx={{ marginLeft: "auto" }}>
                        <IconButton
                            onClick={onClose}
                            size="small"
                            sx={{ color: "#FFFFFF" }}>
                            <MenuIcon />
                        </IconButton>
                    </Box>
                )}
            </Box>{" "}
            {/* User Info */}
            {/* {user && (
                <Box
                    sx={{
                        p: 3,
                        borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                    }}>
                    <Avatar
                        sx={{
                            bgcolor: "#C9A227",
                            color: "#000000",
                            fontWeight: 600,
                            width: 48,
                            height: 48,
                            fontSize: 18,
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        }}>
                        {user.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: 600,
                                color: "#111827",
                                fontSize: 16,
                            }}>
                            {user.name}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                color: "#9CA3AF",
                                fontSize: 14,
                                textTransform: "capitalize",
                            }}>
                            {user.role?.toLowerCase()}
                        </Typography>
                    </Box>
                </Box>
            )} */}
            {/* Navigation */}
            <Box sx={{ flex: 1, py: 2 }}>
                <List sx={{ px: 2 }}>
                    {navItems.map((item) => {
                        const isActive = isItemActive(item);
                        const hasChildren =
                            item.children && item.children.length > 0;
                        const isExpanded = isGroupExpanded(item.label);

                        return (
                            <React.Fragment key={item.label}>
                                <ListItem disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton
                                        component={hasChildren ? "div" : Link}
                                        href={
                                            hasChildren ? undefined : item.href
                                        }
                                        onClick={
                                            hasChildren
                                                ? () =>
                                                    handleGroupToggle(
                                                        item.label
                                                    )
                                                : handleItemClick
                                        }
                                        sx={{
                                            borderRadius: 3,
                                            py: 1.5,
                                            px: 2,
                                            bgcolor: isActive
                                                ? "rgba(203, 161, 53, 0.15)"
                                                : "transparent",
                                            color: isActive
                                                ? "#CBA135"
                                                : "#A0A0A0",
                                            transition: "all 0.2s ease-in-out",
                                            "&:hover": {
                                                bgcolor: isActive
                                                    ? "rgba(203, 161, 53, 0.25)"
                                                    : "rgba(203, 161, 53, 0.08)",
                                                color: "#CBA135",
                                                transform: hasChildren
                                                    ? "none"
                                                    : "translateX(4px)",
                                            },
                                        }}>
                                        <ListItemIcon
                                            sx={{
                                                color: "inherit", // Parent'tan rengi al
                                                minWidth: 40,
                                            }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontFamily:
                                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                                fontWeight: isActive
                                                    ? 600
                                                    : 500,
                                                fontSize: 16,
                                                color: "inherit", // Parent'tan rengi al
                                            }}
                                        />
                                        {hasChildren && (
                                            <Box
                                                sx={{
                                                    color: "inherit", // Parent'tan rengi al
                                                }}>
                                                {isExpanded ? (
                                                    <ExpandLess />
                                                ) : (
                                                    <ExpandMore />
                                                )}
                                            </Box>
                                        )}
                                    </ListItemButton>
                                </ListItem>

                                {/* Sub-items */}
                                {hasChildren && isExpanded && (
                                    <Box sx={{ pl: 2, mb: 1 }}>
                                        {item.children!.map((child) => {
                                            const isChildActive =
                                                pathname === child.href;
                                            return (
                                                <ListItem
                                                    key={child.href}
                                                    disablePadding
                                                    sx={{ mb: 0.5 }}>
                                                    <ListItemButton
                                                        component={Link}
                                                        href={child.href!}
                                                        onClick={
                                                            handleItemClick
                                                        }
                                                        sx={{
                                                            borderRadius: 3,
                                                            py: 1.2,
                                                            px: 2,
                                                            bgcolor:
                                                                isChildActive
                                                                    ? "rgba(203, 161, 53, 0.12)"
                                                                    : "transparent",
                                                            color: isChildActive
                                                                ? "#CBA135"
                                                                : "rgba(160, 160, 160, 0.8)",
                                                            transition:
                                                                "all 0.2s ease-in-out",
                                                            "&:hover": {
                                                                bgcolor:
                                                                    isChildActive
                                                                        ? "rgba(203, 161, 53, 0.2)"
                                                                        : "rgba(203, 161, 53, 0.08)",
                                                                color: isChildActive
                                                                    ? "#CBA135"
                                                                    : "#CBA135",
                                                                transform:
                                                                    "translateX(8px)",
                                                            },
                                                        }}>
                                                        <ListItemIcon
                                                            sx={{
                                                                color: isChildActive
                                                                    ? "#CBA135"
                                                                    : "rgba(160, 160, 160, 0.8)",
                                                                minWidth: 36,
                                                            }}>
                                                            {child.icon}
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={
                                                                child.label
                                                            }
                                                            primaryTypographyProps={{
                                                                fontFamily:
                                                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                                                fontWeight:
                                                                    isChildActive
                                                                        ? 600
                                                                        : 500,
                                                                fontSize: 15,
                                                                color: isChildActive
                                                                    ? "#CBA135"
                                                                    : "rgba(160, 160, 160, 0.8)",
                                                            }}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            );
                                        })}
                                    </Box>
                                )}
                            </React.Fragment>
                        );
                    })}
                </List>
            </Box>
            {/* Footer - Hamburger Button (desktop only) */}
            {!isMobile && (
                <Box sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip title="Collapse Sidebar">
                        <IconButton
                            onClick={onToggle}
                            sx={{
                                color: "#FFFFFF",
                                bgcolor: "rgba(255, 255, 255, 0.1)",
                                borderRadius: 2,
                                p: 1,
                                "&:hover": {
                                    bgcolor: "rgba(255, 255, 255, 0.2)",
                                },
                            }}>
                            <MenuIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Box>
    );

    return (
        <>
            {/* Mobile Drawer */}
            <Drawer
                anchor="left"
                open={open && isMobile}
                onClose={onClose}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: 280,
                    },
                }}>
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer - Expanded */}
            <Drawer
                variant="persistent"
                open={open && !isMobile}
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: 280,
                        position: "fixed",
                        height: "100vh",
                        top: 0,
                        left: 0,
                        zIndex: 1200,
                    },
                }}>
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer - Collapsed (always visible on desktop when not expanded) */}
            <Drawer
                variant="persistent"
                open={!open && !isMobile}
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: 72,
                        position: "fixed",
                        height: "100vh",
                        top: 0,
                        left: 0,
                        zIndex: 1200,
                    },
                }}>
                {collapsedDrawerContent}
            </Drawer>
        </>
    );
};

// Top Bar Component (replaces Navbar)
interface TopBarProps {
    onToggleSidebar?: () => void;
    showSidebar?: boolean | null;
}

export const TopBar = ({ onToggleSidebar, showSidebar }: TopBarProps) => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileClick = () => {
        handleProfileMenuClose();
        router.push("/profile");
    };

    const handleLogoutClick = () => {
        handleProfileMenuClose();
        logout();
        router.push("/login");
    };

    // Get page title based on current route
    const getPageTitle = () => {
        if (pathname === "/") return "Dashboard";
        if (pathname === "/admin/dashboard") return "Dashboard";
        if (pathname === "/chef/dashboard") return "Dashboard";
        if (pathname === "/driver/dashboard") return "Dashboard";
        if (pathname === "/distributor/summary") return "Dashboard";
        if (pathname === "/distributor/products") return "Daily Products";
        if (pathname === "/distributor/orders") return "Daily Orders";
        if (pathname.startsWith("/distributor/orders/")) return "Order Detail";
        if (pathname === "/client/new-order") return "New Order";
        if (pathname === "/client/order-history") return "Order History";
        if (pathname === "/admin/orders") return "Orders Management";
        if (pathname.startsWith("/admin/orders/")) return "Order Detail";
        if (pathname === "/admin/clients") return "Client Management";
        if (pathname.startsWith("/admin/clients/")) return "Client Detail";
        if (pathname === "/admin/products") return "Product Management";
        if (pathname.startsWith("/admin/products/")) return "Product Detail";
        if (pathname === "/admin/staff") return "Staff Management";
        if (pathname === "/admin/pricing") return "Price Lists";
        if (pathname.startsWith("/admin/pricing/")) return "Price List";
        if (pathname === "/distributor/pricing") return "Price Lists";
        if (pathname.startsWith("/distributor/pricing/")) return "Price List";
        if (pathname === "/distributor/clients") return "Clients";
        if (pathname.startsWith("/distributor/clients/")) return "Client Detail";
        if (pathname === "/profile") return "Profile";
        if (pathname.startsWith("/admin/staff/")) return "Staff Detail";
        if (pathname.startsWith("/client/order-history/"))
            return "Order Detail";
        if (pathname.startsWith("/admin/reports/orders"))
            return "Orders Report";
        if (pathname.startsWith("/admin/reports/production"))
            return "Production Report";
        if (pathname.startsWith("/admin/reports/financials"))
            return "Financials Report";
        if (pathname.startsWith("/admin/reports/customers"))
            return "Customers Report";

        // Extract from pathname
        const segments = pathname.split("/").filter(Boolean);
        if (segments.length > 0) {
            return segments[segments.length - 1]
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        }
        return "Dashboard";
    };

    if (!user) {
        return (
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    height: 72,
                    bgcolor: "#FFFFFF",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: { xs: 2, sm: 4 },
                    gap: { xs: 1, sm: 0 },
                }}>
                <Box sx={{ position: "relative", height: 40, width: { xs: 120, sm: 175 }, flexShrink: 0 }}>
                    <Image
                        src="/Light_logo.jpeg"
                        alt="Deras Logo"
                        fill
                        sizes="(max-width: 600px) 120px, 175px"
                        style={{ objectFit: "contain" }}
                        priority
                    />
                </Box>
                <Box display="flex" gap={{ xs: 1, sm: 2 }} sx={{ flexShrink: 0 }}>
                    <Box
                        component="button"
                        onClick={() => router.push("/login")}
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 500,
                            fontSize: { xs: 14, sm: 16 },
                            color: "#111827",
                            bgcolor: "transparent",
                            border: "1px solid rgba(0, 0, 0, 0.2)",
                            px: { xs: 2, sm: 3 },
                            py: { xs: 1, sm: 1.5 },
                            borderRadius: 3,
                            cursor: "pointer",
                            transition: "all 0.2s ease-in-out",
                            whiteSpace: "nowrap",
                            "&:hover": {
                                bgcolor: "rgba(0, 0, 0, 0.04)",
                                borderColor: "#C9A227",
                                color: "#C9A227",
                            },
                        }}>
                        Login
                    </Box>
                    <Box
                        component="button"
                        onClick={() => router.push("/register")}
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 600,
                            fontSize: { xs: 14, sm: 16 },
                            color: "#000000",
                            bgcolor: "#C9A227",
                            border: "none",
                            px: { xs: 2, sm: 3 },
                            py: { xs: 1, sm: 1.5 },
                            borderRadius: 3,
                            cursor: "pointer",
                            transition: "all 0.2s ease-in-out",
                            whiteSpace: "nowrap",
                            "&:hover": {
                                bgcolor: "#E0C097",
                                transform: "translateY(-1px)",
                                boxShadow: "0 8px 25px rgba(201, 162, 39, 0.3)",
                            },
                        }}>
                        Register
                    </Box>
                </Box>
            </Box>
        );
    }

    const pageTitle = getPageTitle();

    return (
        <Box
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1100,
                height: 72,
                bgcolor: "#FFFFFF",
                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: { xs: 2, sm: 4 },
            }}>
            {/* Left Side - Mobile Menu Button + Logo */}
            <Box display="flex" alignItems="center" gap={1}>
                {/* Mobile Hamburger Menu Button */}
                {showSidebar && isMobile && onToggleSidebar && (
                    <IconButton
                        onClick={onToggleSidebar}
                        sx={{
                            p: 1,
                            mr: 1,
                            color: "#111827",
                            "&:hover": {
                                bgcolor: "rgba(201, 162, 39, 0.1)",
                                color: "#C9A227",
                            },
                        }}
                        aria-label="Toggle navigation menu">
                        <MenuIcon />
                    </IconButton>
                )}
                <Typography
                    variant="h5"
                    sx={{
                        fontFamily:
                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                        color: "#111827",
                        fontSize: { xs: 20, sm: 24 },
                    }}>
                    {pageTitle}
                </Typography>
            </Box>

            {/* Right Side - User Profile Dropdown */}
            <Box display="flex" alignItems="center" gap={2}>
                {/* Profile Avatar with Dropdown */}
                <Tooltip title={`${user.name} (${user.role?.toLowerCase()})`}>
                    <IconButton
                        onClick={handleProfileMenuOpen}
                        sx={{
                            p: 0.5,
                            "&:hover": {
                                bgcolor: "rgba(201, 162, 39, 0.1)",
                            },
                        }}>
                        <Avatar
                            sx={{
                                bgcolor: "#C9A227",
                                color: "#000000",
                                fontWeight: 600,
                                width: 40,
                                height: 40,
                                fontSize: 16,
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            }}>
                            {user.name?.[0]?.toUpperCase()}
                        </Avatar>
                    </IconButton>
                </Tooltip>

                {/* Profile Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            mt: 1,
                            bgcolor: "#1C1C1E",
                            border: "1px solid rgba(201, 162, 39, 0.2)",
                            boxShadow: "0 20px 60px rgba(17, 24, 39, 0.15)",
                            minWidth: 200,
                        },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                    {/* User Info Header */}
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        }}>
                        <Typography
                            sx={{
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontWeight: 600,
                                fontSize: 16,
                                color: "#FFFFFF",
                            }}>
                            {user.name}
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily:
                                    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                fontSize: 14,
                                color: "#A0A0A0",
                            }}>
                            {user.email}
                        </Typography>
                    </Box>

                    {/* Profile Page Option */}
                    <MenuItem
                        onClick={handleProfileClick}
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 500,
                            fontSize: 16,
                            color: "#FFFFFF",
                            py: 1.5,
                            px: 3,
                            "&:hover": {
                                bgcolor: "rgba(201, 162, 39, 0.1)",
                                color: "#C9A227",
                            },
                        }}>
                        <ListItemIcon sx={{ color: "#C9A227", minWidth: 36 }}>
                            <ProfileIcon />
                        </ListItemIcon>
                        My Profile
                    </MenuItem>

                    {/* Logout Option */}
                    <MenuItem
                        onClick={handleLogoutClick}
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 500,
                            fontSize: 16,
                            color: "#FFFFFF",
                            py: 1.5,
                            px: 3,
                            "&:hover": {
                                bgcolor: "rgba(201, 162, 39, 0.1)",
                                color: "#C9A227",
                            },
                        }}>
                        <ListItemIcon sx={{ color: "#C9A227", minWidth: 36 }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
};
