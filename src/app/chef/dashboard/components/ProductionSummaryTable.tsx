import React from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";
import { GroupedProductionList } from "../../../../hooks/chef/useChefDashboard";

interface ProductionSummaryProps {
    groupedList: GroupedProductionList;
    onClick?: () => void;
}

export const ProductionSummaryTable = ({
    groupedList,
    onClick,
}: ProductionSummaryProps) => (
    <section>
        <Typography
            variant="h6"
            fontWeight={700}
            gutterBottom
            sx={{ fontSize: "16px", color: "#111827" }}>
            Daily Production Summary
        </Typography>
        <Paper
            sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(17, 24, 39, 0.06)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                bgcolor: "#FFFFFF",
                cursor: onClick ? "pointer" : "default",
                transition:
                    "border-color 0.2s ease, background-color 0.2s ease",
                minHeight: 120,
                "&:hover": onClick
                    ? {
                          borderColor: "rgba(0, 0, 0, 0.12)",
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                      }
                    : {},
            }}
            onClick={onClick}>
            {Object.keys(groupedList).length > 0 ? (
                <Box>
                    {/* Table Header */}
                    <Box
                        display="flex"
                        fontWeight={600}
                        px={2}
                        py={1}
                        mb={1.5}
                        sx={{
                            bgcolor: "rgba(0, 0, 0, 0.03)",
                            border: "1px solid rgba(0, 0, 0, 0.06)",
                            borderRadius: 1.5,
                            color: "#111827",
                            fontSize: "12px",
                        }}>
                        <Box flex={2}>Product</Box>
                        <Box flex={2}>Variant</Box>
                        <Box flex={1} textAlign="right">
                            Remaining Today
                        </Box>
                    </Box>
                    <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />
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
                                            px={2}
                                            py={0.75}
                                            sx={{
                                                fontSize: "13px",
                                                color: "#111827",
                                                transition:
                                                    "background-color 0.15s ease",
                                                "&:hover": {
                                                    backgroundColor:
                                                        "rgba(0, 0, 0, 0.02)",
                                                },
                                            }}>
                                            <Box flex={2} fontWeight={600}>
                                                {idx === 0 ? productName : ""}
                                            </Box>
                                            <Box flex={2}>
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        display: "inline-block",
                                                        px: 1,
                                                        py: 0.25,
                                                        borderRadius: 1,
                                                        bgcolor:
                                                            "rgba(0, 0, 0, 0.04)",
                                                        color: "#374151",
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                    }}>
                                                    {variantName}
                                                </Box>
                                            </Box>
                                            <Box flex={1} textAlign="right">
                                                {new Intl.NumberFormat(
                                                    "en-US"
                                                ).format(variant.total)}{" "}
                                                {variant.unit === "KG"
                                                    ? "kg"
                                                    : variant.unit === "TRAY"
                                                    ? "tray"
                                                    : "pcs"}
                                            </Box>
                                        </Box>
                                    )
                                )}
                                {i < Object.keys(groupedList).length - 1 && (
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
