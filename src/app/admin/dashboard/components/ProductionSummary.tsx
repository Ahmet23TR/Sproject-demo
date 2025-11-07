import React from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";

// Type definition matching the Chef's GroupedProductionList structure
export interface GroupedProductionList {
    [productName: string]: {
        variants: {
            [variantName: string]: {
                total: number;
                unit: "PIECE" | "KG" | "TRAY";
                productGroup: string;
            };
        };
    };
}

interface ProductionSummaryProps {
    groupedList: GroupedProductionList;
    onViewDetails?: () => void;
}

export const ProductionSummary = ({
    groupedList,
    onViewDetails,
}: ProductionSummaryProps) => (
    <section>
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}>
            <Typography
                variant="h6"
                fontWeight={700}
                sx={{ fontSize: { xs: "14px", sm: "15px", md: "16px" }, color: "#111827" }}>
                Daily Production Summary
            </Typography>
        </Box>
        <Paper
            onClick={onViewDetails}
            sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(17, 24, 39, 0.06)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                bgcolor: "#FFFFFF",
                minHeight: 120,
                maxHeight: { xs: 500, sm: 450, md: 400 },
                cursor: onViewDetails ? "pointer" : "default",
                transition: "all 0.2s ease-in-out",
                "&:hover": onViewDetails
                    ? {
                        borderColor: "rgba(201, 162, 39, 0.3)",
                        backgroundColor: "rgba(201, 162, 39, 0.02)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 25px rgba(17, 24, 39, 0.1)",
                    }
                    : {},
            }}>
            {Object.keys(groupedList).length > 0 ? (
                <Box>
                    {/* Table Header */}
                    <Box
                        display="flex"
                        fontWeight={600}
                        px={{ xs: 1, sm: 1.5, md: 2 }}
                        py={{ xs: 0.75, sm: 1 }}
                        mb={1.5}
                        sx={{
                            bgcolor: "rgba(0, 0, 0, 0.03)",
                            border: "1px solid rgba(0, 0, 0, 0.06)",
                            borderRadius: 1.5,
                            color: "#111827",
                            fontSize: { xs: '11px', sm: '12px' },
                        }}>
                        <Box flex={2}>Product</Box>
                        <Box flex={2}>Variant</Box>
                        <Box flex={1} textAlign="right">
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Remaining Today</Box>
                            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Qty</Box>
                        </Box>
                    </Box>
                    <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />

                    {/* Scrollable Table Content */}
                    <Box
                        sx={{
                            maxHeight: { xs: 350, sm: 300, md: 280 },
                            overflowY: "auto",
                            overflowX: "hidden",
                            "&::-webkit-scrollbar": {
                                width: "4px",
                            },
                            "&::-webkit-scrollbar-track": {
                                background: "transparent",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                background: "rgba(201, 162, 39, 0.3)",
                                borderRadius: "2px",
                            },
                            "&::-webkit-scrollbar-thumb:hover": {
                                background: "rgba(201, 162, 39, 0.5)",
                            },
                        }}>
                        {/* Table Rows */}
                        {Object.entries(groupedList).map(
                            ([productName, productData], i) => (
                                <React.Fragment key={productName}>
                                    {Object.entries(productData.variants).map(
                                        ([variantName, variant], idx) => (
                                            <Box
                                                key={idx}
                                                display="flex"
                                                alignItems="center"
                                                px={{ xs: 1, sm: 1.5, md: 2 }}
                                                py={{ xs: 0.5, sm: 0.75 }}
                                                sx={{
                                                    fontSize: { xs: "12px", sm: "13px" },
                                                    color: "#111827",
                                                    transition:
                                                        "background-color 0.15s ease",
                                                    borderRadius: 1,
                                                    mx: -0.5,
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "rgba(201, 162, 39, 0.05)",
                                                    },
                                                }}>
                                                <Box flex={2} fontWeight={600}>
                                                    {idx === 0
                                                        ? productName
                                                        : ""}
                                                </Box>
                                                <Box flex={2}>
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            display:
                                                                "inline-block",
                                                            px: { xs: 0.75, sm: 1 },
                                                            py: 0.25,
                                                            borderRadius: 1,
                                                            bgcolor:
                                                                "rgba(0, 0, 0, 0.04)",
                                                            color: "#374151",
                                                            fontSize: { xs: "10px", sm: "11px" },
                                                            fontWeight: 600,
                                                        }}>
                                                        {variantName}
                                                    </Box>
                                                </Box>
                                                <Box flex={1} textAlign="right" fontSize={{ xs: "11px", sm: "12px", md: "13px" }}>
                                                    {new Intl.NumberFormat(
                                                        "en-US"
                                                    ).format(
                                                        variant.total
                                                    )}{" "}
                                                    {variant.unit === "KG"
                                                        ? "kg"
                                                        : variant.unit ===
                                                            "TRAY"
                                                            ? "tray"
                                                            : "pcs"}
                                                </Box>
                                            </Box>
                                        )
                                    )}
                                    {i <
                                        Object.keys(groupedList).length - 1 && (
                                            <Divider
                                                sx={{
                                                    my: 0.5,
                                                    borderColor: "rgba(0,0,0,0.06)",
                                                }}
                                            />
                                        )}
                                </React.Fragment>
                            )
                        )}
                    </Box>
                </Box>
            ) : (
                <Typography
                    color="text.secondary"
                    sx={{ p: 2, textAlign: "center", fontSize: "13px" }}>
                    No products to produce.
                </Typography>
            )}
        </Paper>
    </section>
);
