"use client";
import type React from "react";
import { Avatar, Box, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import type { User } from "@/types/data";
import { formatCurrency } from "@/app/admin/clients/[id]/components/clientDetailUtils";

interface StatCardConfig {
    label: string;
    value: number;
    icon: React.ReactNode;
    pillSx?: SxProps<Theme>;
}

interface DistributorOverviewCardProps {
    user: User;
    customerSince: string;
    lastOrderDateLabel: string;
    phoneDisplay: string;
    emailDisplay: string;
    companyDisplay: string;
    addressDisplay: string;
    priceListName: string;
    totalSpend: number;
    averageOrderValue: number | null;
    statCards: StatCardConfig[];
}

export const DistributorOverviewCard = ({
    user,
    customerSince,
    lastOrderDateLabel,
    phoneDisplay,
    emailDisplay,
    companyDisplay,
    addressDisplay,
    priceListName,
    totalSpend,
    averageOrderValue,
    statCards,
}: DistributorOverviewCardProps) => {
    return (
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: "1px solid rgba(148, 163, 184, 0.2)", boxShadow: "0px 18px 40px rgba(15, 23, 42, 0.12)" }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={3}>
                <Stack direction="row" spacing={{ xs: 1.5, md: 2.5 }} alignItems="center">
                    <Avatar sx={{ bgcolor: "#2563eb", width: { xs: 48, md: 64 }, height: { xs: 48, md: 64 }, fontSize: { xs: 18, md: 24 } }}>
                        {(user.name?.[0] || "U").toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ color: "#0f172a", mb: 0.5, fontSize: { xs: "1.1rem", md: "1.5rem" } }}>
                            {user.name} {user.surname}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            Customer since {customerSince}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
                            Last order {lastOrderDateLabel}
                        </Typography>
                    </Box>
                </Stack>
                {/* Status chip removed for distributor view */}
            </Stack>

            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(148, 163, 184, 0.18)", boxShadow: "0px 12px 24px rgba(15, 23, 42, 0.08)" }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>Contact Details</Typography>
                        <Stack spacing={1.2}>
                            <Stack direction="row" spacing={1.2} alignItems="center">
                                <PhoneOutlinedIcon sx={{ color: "#2563eb", fontSize: { xs: "1rem", md: "1.25rem" } }} />
                                <Typography variant="body2" color="text.primary" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>{phoneDisplay}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.2} alignItems="center">
                                <MailOutlineRoundedIcon sx={{ color: "#6366f1", fontSize: { xs: "1rem", md: "1.25rem" } }} />
                                <Typography variant="body2" color="text.primary" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emailDisplay}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.2} alignItems="center">
                                <BusinessCenterOutlinedIcon sx={{ color: "#0ea5e9", fontSize: { xs: "1rem", md: "1.25rem" } }} />
                                <Typography variant="body2" color="text.primary" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>{companyDisplay}</Typography>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(148, 163, 184, 0.18)", boxShadow: "0px 12px 24px rgba(15, 23, 42, 0.08)" }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>Address & Pricing</Typography>
                        <Stack spacing={1.2}>
                            <Stack direction="row" spacing={1.2} alignItems="center">
                                <LocationOnOutlinedIcon sx={{ color: "#f97316", fontSize: { xs: "1rem", md: "1.25rem" } }} />
                                <Typography variant="body2" color="text.primary" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>{addressDisplay}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1.2} alignItems="center">
                                <LocalMallOutlinedIcon sx={{ color: "#2563eb", fontSize: { xs: "1rem", md: "1.25rem" } }} />
                                <Typography variant="body2" color="text.primary" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>Price list: {priceListName}</Typography>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(148, 163, 184, 0.18)", boxShadow: "0px 12px 24px rgba(15, 23, 42, 0.08)" }}>
                        <Stack direction="row" spacing={{ xs: 1.5, md: 2 }} alignItems="center">
                            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(59, 130, 246, 0.12)", color: "primary.main" }}>
                                <PaymentsOutlinedIcon sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" } }} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}>Total Spend</Typography>
                                <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}>{formatCurrency(totalSpend)}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                                    Avg. order value {formatCurrency(averageOrderValue ?? undefined)}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "grid", gap: { xs: 1.5, md: 2 }, gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))", xl: "repeat(5, minmax(0, 1fr))" }, mt: 2 }}>
                {statCards.map((card) => (
                    <Paper key={card.label} sx={{ p: 2, borderRadius: 1.5, border: "1px solid rgba(148, 163, 184, 0.14)", display: "flex", alignItems: "center", gap: 2, minWidth: 160 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center", ...(card.pillSx || { backgroundColor: "rgba(59, 130, 246, 0.12)", color: "#2563eb" }) }}>
                            {card.icon}
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", md: "0.875rem" } }}>{card.label}</Typography>
                            <Typography variant="h6" color="text.primary" fontWeight={700} sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}>{card.value.toLocaleString()}</Typography>
                        </Box>
                    </Paper>
                ))}
            </Box>
        </Paper>
    );
};


