// src/app/admin/dashboard/components/ProductionList.tsx
import { Box, Typography, CircularProgress } from "@mui/material";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";
import CakeIcon from "@mui/icons-material/Cake";

interface ProductionListProps {
    loading: boolean;
    error: string | null;
    productionList: {
        name: string;
        variantName?: string;
        totalQuantity: number;
        unit: string;
        productGroup: string;
    }[];
}

export const ProductionList = ({
    loading,
    error,
    productionList,
}: ProductionListProps) => {
    const getUnitDisplay = (unit: string, productGroup: string) => {
        // SWEETS için PIECE yerine TRAY göster
        if (productGroup === "SWEETS" && unit === "PIECE") {
            return "tray";
        }

        switch (unit) {
            case "KG":
                return "kg";
            case "PIECE":
                return "pcs";
            case "TRAY":
                return "tray";
            default:
                return unit.toLowerCase();
        }
    };

    const getProductIcon = (productGroup: string) => {
        if (productGroup === "BAKERY") {
            return <BakeryDiningIcon sx={{ color: "#C9A227", fontSize: 20 }} />;
        }
        if (productGroup === "SWEETS") {
            return <CakeIcon sx={{ color: "#C9A227", fontSize: 20 }} />;
        }
        return <BakeryDiningIcon sx={{ color: "#C9A227", fontSize: 20 }} />;
    };

    if (loading) {
        return (
            <Box
                sx={{
                    bgcolor: "#FFFFFF",
                    borderRadius: 3,
                    p: 3,
                    border: "1px solid",
                    borderColor: "rgba(0, 0, 0, 0.06)",
                    boxShadow: "0 4px 20px rgba(17, 24, 39, 0.06)",
                }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily:
                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 600,
                        color: "#111827",
                        fontSize: "16px",
                        mb: 2,
                    }}>
                    Daily Production List
                </Typography>
                <Box display="flex" justifyContent="center" py={3}>
                    <CircularProgress size={24} sx={{ color: "#C9A227" }} />
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    bgcolor: "#FFFFFF",
                    borderRadius: 3,
                    p: 3,
                    border: "1px solid",
                    borderColor: "rgba(0, 0, 0, 0.06)",
                    boxShadow: "0 4px 20px rgba(17, 24, 39, 0.06)",
                }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily:
                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 600,
                        color: "#111827",
                        fontSize: "16px",
                        mb: 2,
                    }}>
                    Daily Production List
                </Typography>
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                bgcolor: "#FFFFFF",
                borderRadius: 3,
                p: 3,
                border: "1px solid",
                borderColor: "rgba(0, 0, 0, 0.06)",
                boxShadow: "0 4px 20px rgba(17, 24, 39, 0.06)",
            }}>
            {/* Header */}
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={3}>
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily:
                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 600,
                        color: "#111827",
                        fontSize: "16px",
                    }}>
                    Daily Production List
                </Typography>
                {/* <IconButton size="small" sx={{ color: '#9CA3AF' }}>
                    <ExpandMoreIcon fontSize="small" />
                </IconButton> */}
            </Box>

            {/* Production Items */}
            {productionList.length === 0 ? (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    py={4}>
                    <Typography color="text.secondary" mb={1}>
                        No Production Today
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center">
                        Production items will appear here when available.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
                    {productionList.map((item, idx) => (
                        <Box
                            key={`${item.name}-${idx}`}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 2,
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "rgba(0, 0, 0, 0.04)",
                                mb: idx < productionList.length - 1 ? 2 : 0,
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                    borderColor: "rgba(201, 162, 39, 0.3)",
                                    bgcolor: "rgba(201, 162, 39, 0.02)",
                                },
                            }}>
                            {/* Product Icon */}
                            <Box
                                sx={{
                                    bgcolor: "rgba(201, 162, 39, 0.1)",
                                    borderRadius: 2,
                                    p: 1,
                                    mr: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                {getProductIcon(item.productGroup)}
                            </Box>

                            {/* Product Info */}
                            <Box flex={1}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontFamily:
                                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                        fontWeight: 600,
                                        color: "#111827",
                                        fontSize: "14px",
                                        mb: 0.5,
                                    }}>
                                    {item.name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#9CA3AF",
                                        fontSize: "12px",
                                    }}>
                                    {item.productGroup}
                                    {item.variantName && (
                                        <Typography
                                            component="span"
                                            sx={{
                                                color: "#C9A227",
                                                fontSize: "11px",
                                                fontWeight: 500,
                                                ml: 1,
                                                px: 1,
                                                py: 0.25,
                                                bgcolor:
                                                    "rgba(201, 162, 39, 0.1)",
                                                borderRadius: 1,
                                            }}>
                                            {item.variantName}
                                        </Typography>
                                    )}
                                </Typography>
                            </Box>

                            {/* Quantity */}
                            <Box textAlign="right">
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontFamily:
                                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                        fontWeight: 600,
                                        color: "#111827",
                                        fontSize: "14px",
                                    }}>
                                    {new Intl.NumberFormat("en-US").format(
                                        item.totalQuantity
                                    )}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#9CA3AF",
                                        fontSize: "12px",
                                    }}>
                                    {getUnitDisplay(
                                        item.unit,
                                        item.productGroup
                                    )}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};
