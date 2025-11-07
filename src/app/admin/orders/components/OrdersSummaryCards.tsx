"use client";
import { ReactNode } from "react";
import { Box, Paper, Typography, Chip, Skeleton } from "@mui/material";
import { styled } from "@mui/material/styles";

export interface OrdersSummaryItem {
    id: string;
    label: string;
    value: string | number;
    helper?: string;
    chipLabel?: string;
    chipColor?: "default" | "primary" | "success" | "error" | "info" | "warning";
    icon: ReactNode;
    trend?: {
        label: string;
        direction: "up" | "down" | "flat";
    };
}

const SummaryCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: 24,
    boxShadow: "0px 12px 34px rgba(15, 23, 42, 0.06)",
    backgroundColor: theme.palette.common.white,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    minHeight: 160,
}));

const IconWrapper = styled(Box)(({ theme }) => ({
    width: 48,
    height: 48,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(93, 111, 241, 0.12)",
    color: theme.palette.primary.main,
}));

interface OrdersSummaryCardsProps {
    items: OrdersSummaryItem[];
    loading?: boolean;
    dense?: boolean; // smaller card layout
    mdColumns?: number; // number of columns at md breakpoint
}

export const OrdersSummaryCards = ({ items, loading = false, dense = false, mdColumns = 3 }: OrdersSummaryCardsProps) => {
    if (loading) {
        return (
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                    },
                    gap: 3,
                }}
            >
                {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="rounded"
                        height={160}
                        animation="wave"
                        sx={{ borderRadius: 3 }}
                    />
                ))}
            </Box>
        );
    }

    if (!items.length) {
        return null;
    }

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: `repeat(${mdColumns}, 1fr)`,
                },
                gap: 3,
            }}>
            {items.map((item) => (
                <SummaryCard
                    key={item.id}
                    elevation={0}
                    sx={dense ? { p: 2, minHeight: 120 } : undefined}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 2,
                        }}>
                        <IconWrapper sx={dense ? { width: 40, height: 40 } : undefined}>
                            {item.icon}
                        </IconWrapper>
                        {item.chipLabel && (
                            <Chip
                                label={item.chipLabel}
                                color={item.chipColor ?? "default"}
                                size="small"
                                sx={{ borderRadius: 12, fontWeight: 600 }}
                            />
                        )}
                    </Box>
                    <Box>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#64748b",
                                textTransform: "uppercase",
                                letterSpacing: 0.8,
                                fontWeight: 600,
                            }}>
                            {item.label}
                        </Typography>
                        <Typography
                            variant={dense ? "h6" : "h5"}
                            sx={{
                                fontWeight: 700,
                                color: "#111827",
                                mt: 1,
                            }}>
                            {item.value}
                        </Typography>
                        {item.helper && (
                            <Typography
                                variant="body2"
                                sx={{ color: "#6b7280", mt: 0.5 }}>
                                {item.helper}
                            </Typography>
                        )}
                    </Box>
                    {item.trend && (
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color:
                                    item.trend.direction === "up"
                                        ? "success.main"
                                        : item.trend.direction === "down"
                                            ? "error.main"
                                            : "#6b7280",
                            }}>
                            {item.trend.label}
                        </Typography>
                    )}
                </SummaryCard>
            ))}
        </Box>
    );
};
