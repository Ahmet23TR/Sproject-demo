"use client";
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
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

interface UserCardProps {
    user: User;
    title: string;
    actionLoading: string | null;
}

const roleChipMap: Record<string, { label: string; sx: object }> = {
    ADMIN: { label: "Admin", sx: { bgcolor: "#e8f7f0", color: "#27AE60" } },
    CLIENT: { label: "Client", sx: { bgcolor: "#f0f0f0", color: "#171717" } },
    CHEF: { label: "Chef", sx: { bgcolor: "#fff3e0", color: "#e67e22" } },
    DRIVER: { label: "Driver", sx: { bgcolor: "#e3f2fd", color: "#1976d2" } },
};

export const UserCard = ({ user, title, actionLoading }: UserCardProps) => {
    const roleStyle = roleChipMap[user.role] || {};
    const router = useRouter();
    const isLoading = actionLoading === user.id;

    const handleCardClick = () => {
        if (user.role === "CLIENT") {
            router.push(`/admin/clients/${user.id}`);
        } else {
            router.push(`/admin/staff/${user.id}`);
        }
    };

    return (
        <Card
            onClick={handleCardClick}
            sx={{
                cursor: "pointer",
                opacity: isLoading ? 0.55 : 1,
                transition: "all 0.2s ease-in-out",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                boxShadow: "0px 4px 12px rgba(15, 23, 42, 0.06)",
                "&:hover": {
                    boxShadow: "0px 8px 20px rgba(15, 23, 42, 0.12)",
                    transform: "translateY(-2px)",
                },
                "&:active": {
                    transform: "translateY(0)",
                },
            }}>
            <CardContent sx={{ p: 2 }}>
                <Stack spacing={2}>
                    {/* Header with Avatar and Name */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                                sx={{
                                    bgcolor: "#C9A227",
                                    width: 40,
                                    height: 40,
                                    fontSize: "1rem",
                                }}>
                                {(user.name?.[0] || "U").toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography
                                    fontWeight={600}
                                    sx={{
                                        fontSize: "0.95rem",
                                        color: "#111827",
                                    }}>
                                    {user.name} {user.surname}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: "0.8rem",
                                        color: "#6b7280",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        maxWidth: "200px",
                                    }}>
                                    {user.email}
                                </Typography>
                            </Box>
                        </Stack>
                        <Chip
                            label={user.isActive ? "Active" : "Inactive"}
                            size="small"
                            sx={{
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                height: 24,
                                backgroundColor: user.isActive
                                    ? "rgba(16, 185, 129, 0.12)"
                                    : "rgba(234, 179, 8, 0.16)",
                                color: user.isActive ? "#047857" : "#b45309",
                            }}
                        />
                    </Stack>

                    {/* Details Section */}
                    {title === "Clients" ? (
                        <Stack spacing={1.2}>
                            {user.phone && (
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}>
                                    <PhoneOutlinedIcon
                                        sx={{
                                            fontSize: "1rem",
                                            color: "#6b7280",
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: "0.8rem",
                                            color: "#374151",
                                        }}>
                                        {user.phone}
                                    </Typography>
                                </Stack>
                            )}

                            {user.companyName && (
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}>
                                    <BusinessCenterOutlinedIcon
                                        sx={{
                                            fontSize: "1rem",
                                            color: "#6b7280",
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: "0.8rem",
                                            color: "#374151",
                                        }}>
                                        {user.companyName}
                                    </Typography>
                                </Stack>
                            )}

                            {/* Stats Row */}
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{
                                    mt: 1,
                                    pt: 1.5,
                                    borderTop: "1px solid rgba(148, 163, 184, 0.15)",
                                }}>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <LocalMallOutlinedIcon
                                        sx={{
                                            fontSize: "0.9rem",
                                            color: "#6b7280",
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: "0.75rem",
                                            color: "#6b7280",
                                        }}>
                                        {typeof user.orderCount === "number"
                                            ? `${user.orderCount} orders`
                                            : "No orders"}
                                    </Typography>
                                </Stack>

                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <PaymentsOutlinedIcon
                                        sx={{
                                            fontSize: "0.9rem",
                                            color: "#6b7280",
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "#111827",
                                        }}>
                                        {formatCurrency(user.totalOrderAmount)}
                                    </Typography>
                                </Stack>

                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <CalendarTodayOutlinedIcon
                                        sx={{
                                            fontSize: "0.8rem",
                                            color: "#6b7280",
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: "0.7rem",
                                            color: "#6b7280",
                                        }}>
                                        {formatDate(user.createdAt)}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    ) : (
                        <Chip
                            label={roleStyle.label}
                            size="small"
                            sx={{
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                width: "fit-content",
                                ...roleStyle.sx,
                            }}
                        />
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

