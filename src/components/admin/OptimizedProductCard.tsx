// src/components/admin/OptimizedProductCard.tsx
import React from "react";
import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import { Product } from "../../services/productService";
import OptimizedImage from "../OptimizedImage";

interface OptimizedProductCardProps {
    product: Product;
    onView?: (product: Product) => void;
}

// Image utility function

// Memoization comparison
const areEqual = (
    prevProps: OptimizedProductCardProps,
    nextProps: OptimizedProductCardProps
) => {
    const prev = prevProps.product;
    const next = nextProps.product;

    return (
        prev.id === next.id &&
        prev.name === next.name &&
        prev.description === next.description &&
        prev.imageUrl === next.imageUrl &&
        prev.isActive === next.isActive &&
        prev.unit === next.unit &&
        prev.categoryId === next.categoryId &&
        prev.productGroup === next.productGroup &&
        prev.basePrice === next.basePrice
    );
};

export const OptimizedProductCard = React.memo(
    ({ product, onView }: OptimizedProductCardProps) => {
        const handleCardClick = () => {
            if (onView) {
                onView(product);
            }
        };

        return (
            <Card
                onClick={handleCardClick}
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                        borderColor: "#3B82F6",
                    },
                }}>
                {/* Product Image */}
                <Box sx={{ position: "relative" }}>
                    <OptimizedImage
                        src={product.imageUrl}
                        alt={`${product.name} product image`}
                        sx={{
                            height: 140,
                            backgroundColor: "#F3F4F6",
                        }}
                        sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                        objectFit="cover"
                        objectPosition="center"
                    />
                    {/* Status Badge */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                        }}>
                        <Chip
                            label={product.isActive ? "Active" : "Inactive"}
                            size="small"
                            variant="outlined"
                            sx={{
                                backgroundColor: "white",
                                color: product.isActive ? "#16A34A" : "#EF4444",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                border: `1px solid ${
                                    product.isActive ? "#16A34A" : "#EF4444"
                                }`,
                            }}
                        />
                    </Box>
                </Box>

                {/* Card Content */}
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    {/* Product Name */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: "#111827",
                            mb: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}>
                        {product.name}
                    </Typography>

                    {/* Category */}
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#6B7280",
                            mb: 1.5,
                            fontSize: "0.875rem",
                        }}>
                        {product.category?.name || (
                            <span
                                style={{
                                    color: "#EF4444",
                                    fontStyle: "italic",
                                }}>
                                Uncategorized
                            </span>
                        )}
                    </Typography>

                    {/* Product Group */}
                    <Box display="flex" justifyContent="flex-start" mb={1}>
                        <Chip
                            label={product.productGroup}
                            size="small"
                            variant="outlined"
                            sx={{
                                backgroundColor:
                                    product.productGroup === "SWEETS"
                                        ? "#F9F5E8" // Altın'ın çok açık tonu
                                        : "#F1F3F5", // Gri'nin çok açık tonu (BAKERY ve diğerleri)
                                color: "#2D2D2D", // Charcoal
                                fontWeight: 500,
                                fontSize: "0.75rem",
                                border: `1px solid ${
                                    product.productGroup === "SWEETS"
                                        ? "#CBA135" // Muted Gold
                                        : "#B0B0B0" // Ash Gray
                                }`,
                                "&:hover": {
                                    backgroundColor:
                                        product.productGroup === "SWEETS"
                                            ? "#F5F0E0" // Biraz daha koyu altın tonu
                                            : "#EAECEF", // Biraz daha koyu gri tonu
                                    borderColor:
                                        product.productGroup === "SWEETS"
                                            ? "#B8922F" // Daha koyu muted gold
                                            : "#9A9A9A", // Daha koyu ash gray
                                },
                            }}
                        />
                    </Box>

                    {/* Description (if available) */}
                    {product.description && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: "#9CA3AF",
                                display: "block",
                                mt: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}>
                            {product.description}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        );
    },
    areEqual
);

OptimizedProductCard.displayName = "OptimizedProductCard";
