import { Box, Typography, Grid } from "@mui/material";
import { Product } from "../../../../services/catalogService";
import { ProductCard } from "./ProductCard";
import React from "react";

interface ProductCatalogViewProps {
    products: Product[];
    onProductSelect: (product: Product) => void;
    favoriteProductIds?: Set<string>;
    onToggleFavorite?: (productId: string) => void;
}

export const ProductCatalogView = React.memo(
    ({
        products,
        onProductSelect,
        favoriteProductIds,
        onToggleFavorite,
    }: ProductCatalogViewProps) => (
        <Box>
            {products.length === 0 ? (
                <Box
                    sx={{
                        textAlign: "center",
                        py: 8,
                        color: "text.secondary",
                    }}>
                    <Typography variant="h6" gutterBottom>
                        No products found
                    </Typography>
                    <Typography variant="body2">
                        Try adjusting your search or category filters
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {products.map((product) => (
                        <Grid
                            key={product.id}
                            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <ProductCard
                                product={product}
                                onProductSelect={onProductSelect}
                                isFavorite={
                                    favoriteProductIds?.has(product.id) || false
                                }
                                onToggleFavorite={onToggleFavorite}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    )
);

ProductCatalogView.displayName = "ProductCatalogView";
