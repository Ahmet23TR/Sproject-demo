// src/components/admin/OptimizedProductCardView.tsx
import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import { Product } from "../../services/productService";
import { OptimizedProductCard } from "./OptimizedProductCard";

interface OptimizedProductCardViewProps {
    products: Product[];
    onViewProduct?: (product: Product) => void;
}

export const OptimizedProductCardView: React.FC<
    OptimizedProductCardViewProps
> = ({ products, onViewProduct }) => {
    if (products.length === 0) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 8,
                    color: "#6B7280",
                }}>
                <Typography variant="h6">No products found</Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            {products.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                    <OptimizedProductCard
                        product={product}
                        onView={onViewProduct}
                    />
                </Grid>
            ))}
        </Grid>
    );
};
