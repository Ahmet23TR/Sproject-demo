"use client";
import {
    TableRow,
    TableCell,
    Box,
    Avatar,
    Typography,
    Chip,
} from "@mui/material";
import { User } from "@/types/data";
import { useRouter } from "next/navigation";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});

const formatCurrency = (value?: number | null) => {
    if (typeof value !== "number") {
        return "—";
    }
    return currencyFormatter.format(value);
};

const formatDate = (value?: string | null) => {
    if (!value) {
        return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "—";
    }
    return dateFormatter.format(date);
};

interface UserRowProps {
    user: User;
    title: string;
    currentUser: User | null;
    actionLoading: string | null;
    onActivate: (userId: string) => void;
    onDeactivate: (userId: string) => void;
    onUpdateChefProductGroup?: (
        chefId: string,
        productGroup: "SWEETS" | "BAKERY"
    ) => void;
}

const roleChipMap: Record<string, { label: string; sx: object }> = {
    ADMIN: { label: "Admin", sx: { bgcolor: "#e8f7f0", color: "#27AE60" } },
    CLIENT: { label: "Client", sx: { bgcolor: "#f0f0f0", color: "#171717" } },
    CHEF: { label: "Chef", sx: { bgcolor: "#fff3e0", color: "#e67e22" } },
    DRIVER: { label: "Driver", sx: { bgcolor: "#e3f2fd", color: "#1976d2" } },
    DISTRIBUTOR: { label: "Distributor", sx: { bgcolor: "rgba(201, 162, 39, 0.16)", color: "#C9A227" } },
};

export const UserRow = ({ user, title, actionLoading }: UserRowProps) => {
    const roleStyle = roleChipMap[user.role] || {};
    const router = useRouter();
    const isLoading = actionLoading === user.id;

    // Handle row click to navigate to detail page
    const handleRowClick = () => {
        if (user.role === "CLIENT") {
            router.push(`/admin/clients/${user.id}`);
        } else {
            router.push(`/admin/staff/${user.id}`);
        }
    };

    return (
        <TableRow
            onClick={handleRowClick}
            sx={{
                "&:hover": {
                    background: "rgba(248, 250, 252, 0.6)",
                    cursor: "pointer",
                },
                opacity: isLoading ? 0.55 : 1,
                transition: "opacity 0.2s ease-in-out",
                cursor: "pointer",
                "& .MuiTableCell-root": {
                    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                    py: { xs: 2, md: 2.5 },
                    px: { xs: 1.5, md: 2 },
                },
            }}>
            <TableCell>
                <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5 }}>
                    <Avatar sx={{
                        bgcolor: "#C9A227",
                        width: { xs: 32, md: 40 },
                        height: { xs: 32, md: 40 },
                        fontSize: { xs: "0.875rem", md: "1rem" },
                    }}>
                        {(user.name?.[0] || "U").toUpperCase()}
                    </Avatar>
                    <Typography
                        fontWeight={600}
                        sx={{
                            fontSize: { xs: "0.875rem", md: "1rem" },
                            whiteSpace: "nowrap",
                        }}>
                        {user.name} {user.surname}
                    </Typography>
                </Box>
            </TableCell>
            <TableCell sx={{
                fontSize: { xs: "0.875rem", md: "1rem" },
                maxWidth: { xs: 150, md: "none" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}>
                {user.email}
            </TableCell>
            {title === "Clients" ? (
                <>
                    <TableCell sx={{
                        fontSize: { xs: "0.875rem", md: "1rem" },
                        whiteSpace: "nowrap",
                    }}>
                        {user.phone || "—"}
                    </TableCell>
                    <TableCell sx={{
                        fontSize: { xs: "0.875rem", md: "1rem" },
                        maxWidth: { xs: 120, md: "none" },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}>
                        {user.companyName || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                        {typeof user.orderCount === "number"
                            ? user.orderCount
                            : "—"}
                    </TableCell>
                    <TableCell sx={{
                        fontSize: { xs: "0.875rem", md: "1rem" },
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                    }}>
                        {formatCurrency(user.totalOrderAmount)}
                    </TableCell>
                    <TableCell sx={{
                        fontSize: { xs: "0.875rem", md: "1rem" },
                        whiteSpace: "nowrap",
                    }}>
                        {formatDate(user.createdAt)}
                    </TableCell>
                </>
            ) : (
                <>
                    <TableCell>
                        <Chip
                            label={roleStyle.label}
                            size="small"
                            sx={{
                                fontWeight: 600,
                                fontSize: { xs: "0.7rem", md: "0.8125rem" },
                                ...roleStyle.sx
                            }}
                        />
                    </TableCell>
                </>
            )}
            <TableCell>
                <Chip
                    label={user.isActive ? "Active" : "Pending Approval"}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.7rem", md: "0.8125rem" },
                        backgroundColor: user.isActive
                            ? "rgba(16, 185, 129, 0.12)"
                            : "rgba(234, 179, 8, 0.16)",
                        color: user.isActive ? "#047857" : "#b45309",
                    }}
                />
            </TableCell>
        </TableRow>
    );
};
