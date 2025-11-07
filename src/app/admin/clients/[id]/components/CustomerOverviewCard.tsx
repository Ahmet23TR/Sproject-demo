"use client";
import type React from "react";
import { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { styled } from "@mui/material/styles";
import type { User } from "@/types/data";
import { formatCurrency } from "./clientDetailUtils";

interface StatCardConfig {
    label: string;
    value: number;
    icon: React.ReactNode;
    pillSx: SxProps<Theme>;
}

interface CustomerOverviewCardProps {
    user: User;
    customerSince: string;
    lastOrderDateLabel: string;
    phoneDisplay: string;
    emailDisplay: string;
    companyDisplay: string;
    addressDisplay: string;
    totalSpend: number;
    averageOrderValue: number | null;
    statCards: StatCardConfig[];
    copiedId: boolean;
    onCopyCustomerId: () => void;
    onEditClick: () => void;
    onToggleStatus: () => void;
    isActivating: boolean;
    toggleLabel: string;
}

const SummaryCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
        padding: theme.spacing(4),
    },
    borderRadius: 16,
    border: "1px solid rgba(148, 163, 184, 0.2)",
    backgroundColor: theme.palette.common.white,
    boxShadow: "0px 18px 40px rgba(15, 23, 42, 0.12)",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
        gap: theme.spacing(3),
    },
}));

const MiniCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
        padding: theme.spacing(2.5),
    },
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    backgroundColor: theme.palette.common.white,
    boxShadow: "0px 12px 24px rgba(15, 23, 42, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
}));

const StatCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.14)",
    backgroundColor: theme.palette.common.white,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    minWidth: 160,
}));

const IconPill = styled(Box)(({ theme }) => ({
    width: 36,
    height: 36,
    [theme.breakpoints.up("md")]: {
        width: 44,
        height: 44,
    },
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    color: theme.palette.primary.main,
    "& .MuiSvgIcon-root": {
        fontSize: { xs: "1.2rem", md: "1.5rem" },
    },
}));

export const CustomerOverviewCard = ({
    user,
    customerSince,
    lastOrderDateLabel,
    phoneDisplay,
    emailDisplay,
    companyDisplay,
    addressDisplay,
    totalSpend,
    averageOrderValue,
    statCards,
    onToggleStatus,
    isActivating,
    toggleLabel,
}: CustomerOverviewCardProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleToggleStatus = () => {
        handleMenuClose();
        onToggleStatus();
    };

    return (
        <SummaryCard>
            <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={3}>
                <Stack direction="row" spacing={{ xs: 1.5, md: 2.5 }} alignItems="center">
                    <Avatar
                        sx={{
                            bgcolor: "#2563eb",
                            width: { xs: 48, md: 64 },
                            height: { xs: 48, md: 64 },
                            fontSize: { xs: 18, md: 24 },
                        }}>
                        {(user.name?.[0] || "U").toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{
                                color: "#0f172a",
                                mb: 0.5,
                                fontSize: { xs: "1.1rem", md: "1.5rem" },
                            }}>
                            {user.name} {user.surname}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            Customer since {customerSince}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            Last order {lastOrderDateLabel}
                        </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={{ xs: 1, md: 1.5 }} alignItems="center">
                    <Chip
                        label={user.isActive ? "Active" : "Suspended"}
                        size="medium"
                        sx={{
                            fontWeight: 600,
                            fontSize: { xs: "0.75rem", md: "0.8125rem" },
                            height: { xs: 28, md: 32 },
                            backgroundColor: user.isActive
                                ? "rgba(16, 185, 129, 0.16)"
                                : "rgba(248, 113, 113, 0.18)",
                            color: user.isActive ? "#047857" : "#b91c1c",
                        }}
                    />
                    <Button
                        variant="outlined"
                        onClick={handleMenuClick}
                        disabled={isActivating}
                        sx={{
                            minWidth: { xs: 36, md: 40 },
                            width: { xs: 40, md: 50 },
                            height: { xs: 36, md: 40 },
                            padding: 0,
                            borderRadius: 1,
                            borderColor: "rgba(148, 163, 184, 0.5)",
                            "&:hover": {
                                borderColor: "rgba(148, 163, 184, 0.7)",
                            },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                        <MoreHorizRoundedIcon sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" } }} />
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        MenuListProps={{
                            "aria-labelledby": "basic-button",
                        }}
                        transformOrigin={{
                            horizontal: "right",
                            vertical: "top",
                        }}
                        anchorOrigin={{
                            horizontal: "right",
                            vertical: "bottom",
                        }}>
                        <MenuItem
                            onClick={handleToggleStatus}
                            disabled={isActivating}
                            sx={{
                                color: user.isActive ? "#b91c1c" : "#047857",
                                fontWeight: 600,
                                minWidth: 120,
                            }}>
                            {isActivating ? "Processing..." : toggleLabel}
                        </MenuItem>
                    </Menu>
                </Stack>
            </Stack>

            <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <MiniCard>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            Contact Details
                        </Typography>
                        <Stack spacing={1.2}>
                            <Stack
                                direction="row"
                                spacing={1.2}
                                alignItems="center">
                                <PhoneOutlinedIcon
                                    sx={{
                                        color: "#2563eb",
                                        fontSize: { xs: "1rem", md: "1.25rem" },
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                                    {phoneDisplay}
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                spacing={1.2}
                                alignItems="center">
                                <MailOutlineRoundedIcon
                                    sx={{
                                        color: "#6366f1",
                                        fontSize: { xs: "1rem", md: "1.25rem" },
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{
                                        fontSize: { xs: "0.8rem", md: "0.875rem" },
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>
                                    {emailDisplay}
                                </Typography>
                            </Stack>
                            <Stack
                                direction="row"
                                spacing={1.2}
                                alignItems="center">
                                <BusinessCenterOutlinedIcon
                                    sx={{
                                        color: "#0ea5e9",
                                        fontSize: { xs: "1rem", md: "1.25rem" },
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                                    {companyDisplay}
                                </Typography>
                            </Stack>
                        </Stack>
                    </MiniCard>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <MiniCard>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            Address
                        </Typography>
                        <Stack spacing={1.2}>
                            <Stack
                                direction="row"
                                spacing={1.2}
                                alignItems="center">
                                <LocationOnOutlinedIcon
                                    sx={{
                                        color: "#f97316",
                                        fontSize: { xs: "1rem", md: "1.25rem" },
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                                    {addressDisplay}
                                </Typography>
                            </Stack>
                        </Stack>
                    </MiniCard>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <MiniCard>
                        <Stack direction="row" spacing={{ xs: 1.5, md: 2 }} alignItems="center">
                            <IconPill>
                                <PaymentsOutlinedIcon />
                            </IconPill>
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                                    Total Spend
                                </Typography>
                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    color="text.primary"
                                    sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
                                    {formatCurrency(totalSpend)}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                                    Avg. order value{" "}
                                    {formatCurrency(
                                        averageOrderValue ?? undefined
                                    )}
                                </Typography>
                            </Box>
                        </Stack>
                    </MiniCard>
                </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />

            <Box
                sx={{
                    display: "grid",
                    gap: { xs: 1.5, md: 2 },
                    gridTemplateColumns: {
                        xs: "repeat(2, minmax(0, 1fr))",
                        sm: "repeat(3, minmax(0, 1fr))",
                        lg: "repeat(3, minmax(0, 1fr))",
                        xl: "repeat(5, minmax(0, 1fr))",
                    },
                }}>
                {statCards.map((card) => (
                    <StatCard
                        key={card.label}
                        sx={{
                            p: { xs: 1.5, md: 2 },
                            gap: { xs: 1.5, md: 2 },
                        }}>
                        <IconPill sx={card.pillSx}>{card.icon}</IconPill>
                        <Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: { xs: "0.7rem", md: "0.875rem" } }}>
                                {card.label}
                            </Typography>
                            <Typography
                                variant="h6"
                                color="text.primary"
                                fontWeight={700}
                                sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}>
                                {card.value.toLocaleString()}
                            </Typography>
                        </Box>
                    </StatCard>
                ))}
            </Box>
        </SummaryCard>
    );
};
