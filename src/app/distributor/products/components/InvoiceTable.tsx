"use client";
import { Box, Typography } from "@mui/material";
import type { DistributorProductSummaryItem } from "@/types/data";

interface InvoiceTableProps {
    products: DistributorProductSummaryItem[];
}

interface ProductRowProps {
    product: DistributorProductSummaryItem;
    index: number;
}

const ProductRow = ({ product, index }: ProductRowProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    sm: "0.5fr 3fr 1fr 1.5fr 1.5fr",
                },
                gap: { xs: 1, sm: 2 },
                p: { xs: 2, sm: 2.5 },
                borderBottom: "1px solid #E5E7EB",
                "&:hover": {
                    bgcolor: "#F9FAFB",
                },
            }}
        >
            {/* Index */}
            <Box
                sx={{
                    display: { xs: "none", sm: "flex" },
                    alignItems: "flex-start",
                    justifyContent: "center",
                }}
            >
                <Typography
                    sx={{
                        color: "#9CA3AF",
                        fontSize: "14px",
                        fontWeight: 500,
                    }}
                >
                    {index + 1}
                </Typography>
            </Box>

            {/* Product Name & Options */}
            <Box>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography
                        sx={{
                            display: { xs: "inline", sm: "none" },
                            color: "#9CA3AF",
                            fontSize: "12px",
                            fontWeight: 600,
                        }}
                    >
                        #{index + 1}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 600,
                            color: "#111827",
                            fontSize: { xs: "15px", sm: "16px" },
                        }}
                    >
                        {product.productName}
                    </Typography>
                </Box>

                {/* Options - Compact Display */}
                {product.optionGroups && product.optionGroups.length > 0 && (
                    <Box sx={{ mt: 0.75 }}>
                        {product.optionGroups.map((group, groupIdx) => (
                            <Box
                                key={groupIdx}
                                sx={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    flexWrap: "wrap",
                                    gap: 0.5,
                                    mb: 0.5,
                                }}
                            >
                                {/* Option Group Name */}
                                <Typography
                                    sx={{
                                        color: "#6B7280",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {group.optionGroupName}:
                                </Typography>
                                {/* Selected Items - Inline */}
                                {group.selectedItems.map((item, itemIdx) => (
                                    <Box
                                        key={itemIdx}
                                        sx={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 0.25,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                color: "#111827",
                                                fontSize: "11px",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {item.optionItemName}
                                        </Typography>
                                        {item.multiplier &&
                                            item.multiplier !== 1 && (
                                                <Typography
                                                    sx={{
                                                        color: "#C9A227",
                                                        fontSize: "10px",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    (×{item.multiplier})
                                                </Typography>
                                            )}
                                        {itemIdx <
                                            group.selectedItems.length - 1 && (
                                                <Typography
                                                    sx={{
                                                        color: "#9CA3AF",
                                                        fontSize: "11px",
                                                        mx: 0.25,
                                                    }}
                                                >
                                                    ,
                                                </Typography>
                                            )}
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Unit - Mobile */}
                <Typography
                    variant="body2"
                    sx={{
                        display: { xs: "block", sm: "none" },
                        color: "#9CA3AF",
                        fontSize: "12px",
                        mt: 0.5,
                    }}
                >
                    Unit: {product.productUnit}
                </Typography>
            </Box>

            {/* Unit - Desktop */}
            <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "flex-start" }}>
                <Typography
                    sx={{
                        color: "#6B7280",
                        fontSize: "14px",
                    }}
                >
                    {product.productUnit}
                </Typography>
            </Box>

            {/* Quantity */}
            <Box>
                <Typography
                    variant="body2"
                    sx={{
                        display: { xs: "block", sm: "none" },
                        color: "#9CA3AF",
                        fontSize: "12px",
                        mb: 0.5,
                    }}
                >
                    Quantity
                </Typography>
                <Typography
                    sx={{
                        fontFamily:
                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 600,
                        color: "#111827",
                        fontSize: { xs: "15px", sm: "16px" },
                    }}
                >
                    {product.totalQuantity}
                </Typography>
            </Box>

            {/* Total Amount */}
            <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Typography
                    variant="body2"
                    sx={{
                        display: { xs: "block", sm: "none" },
                        color: "#9CA3AF",
                        fontSize: "12px",
                        mb: 0.5,
                    }}
                >
                    Total Amount
                </Typography>
                <Typography
                    sx={{
                        fontFamily:
                            '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                        color: "#111827",
                        fontSize: { xs: "16px", sm: "18px" },
                    }}
                >
                    {formatCurrency(product.totalAmount)}
                </Typography>
            </Box>
        </Box>
    );
};

export const InvoiceTable = ({ products }: InvoiceTableProps) => {
    if (products.length === 0) {
        return (
            <Box
                sx={{
                    p: 8,
                    textAlign: "center",
                    border: "2px dashed #E5E7EB",
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        color: "#9CA3AF",
                        fontSize: { xs: "16px", sm: "18px" },
                        fontWeight: 500,
                    }}
                >
                    No products found for this date
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                overflow: "hidden",
            }}
        >
            {/* Table Header - Desktop Only */}
            <Box
                sx={{
                    display: { xs: "none", sm: "grid" },
                    gridTemplateColumns: "0.5fr 3fr 1fr 1.5fr 1.5fr",
                    gap: 2,
                    p: 2.5,
                    bgcolor: "#F9FAFB",
                    borderBottom: "2px solid #E5E7EB",
                }}
            >
                <Typography
                    sx={{
                        color: "#6B7280",
                        fontSize: "13px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        textAlign: "center",
                    }}
                >
                    #
                </Typography>
                <Typography
                    sx={{
                        color: "#6B7280",
                        fontSize: "13px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}
                >
                    Product Description
                </Typography>
                <Typography
                    sx={{
                        color: "#6B7280",
                        fontSize: "13px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}
                >
                    Unit
                </Typography>
                <Typography
                    sx={{
                        color: "#6B7280",
                        fontSize: "13px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}
                >
                    Quantity
                </Typography>
                <Typography
                    sx={{
                        color: "#6B7280",
                        fontSize: "13px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        textAlign: "right",
                    }}
                >
                    Amount
                </Typography>
            </Box>

            {/* Product Rows */}
            <Box sx={{ bgcolor: "#FFFFFF" }}>
                {products.map((product, index) => (
                    <ProductRow
                        key={`${product.productId}-${index}`}
                        product={product}
                        index={index}
                    />
                ))}
            </Box>
        </Box>
    );
};

