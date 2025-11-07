import {
    Box,
    Typography,
    List,
    ListItem,
    Button,
    IconButton,
    Chip,
    Avatar,
} from "@mui/material";
import { FavoriteOutlined, Favorite, Add } from "@mui/icons-material";
import { Product } from "../../../../services/catalogService";
import { getImageUrl } from "../../../../utils/image";
import React from "react";

interface ProductListViewProps {
    products: Product[];
    onProductSelect: (product: Product) => void;
    favoriteProductIds?: Set<string>;
    onToggleFavorite?: (productId: string) => void;
}

export const ProductListView = React.memo(
    ({
        products,
        onProductSelect,
        favoriteProductIds,
        onToggleFavorite,
    }: ProductListViewProps) => (
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
                <List sx={{ p: 0 }}>
                    {products.map((product) => (
                        <ListItem
                            key={product.id}
                            sx={{
                                bgcolor: "background.paper",
                                borderRadius: 2,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                mb: 2,
                                p: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                position: "relative",
                                cursor: "pointer",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                                },
                            }}
                            onClick={() => onProductSelect(product)}>
                            {/* Product Image */}
                            <Avatar
                                src={
                                    product.imageUrl
                                        ? getImageUrl(product.imageUrl)
                                        : "/placeholder.png"
                                }
                                alt={product.name}
                                variant="rounded"
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 2,
                                }}
                            />

                            {/* Product Info */}
                            <Box flex={1} sx={{ minWidth: 0 }}>
                                {/* Category Chip */}
                                {product.category && (
                                    <Chip
                                        label={product.category.name}
                                        size="small"
                                        sx={{
                                            mb: 1,
                                            backgroundColor: "primary.main",
                                            color: "white",
                                            fontSize: "0.75rem",
                                            height: 20,
                                        }}
                                    />
                                )}

                                {/* Product Name */}
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                    sx={{
                                        mb: 0.5,
                                        color: "text.primary",
                                        lineHeight: 1.3,
                                    }}>
                                    {product.name}
                                </Typography>

                                {/* Product Description */}
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        lineHeight: 1.4,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}>
                                    {product.description}
                                </Typography>
                            </Box>

                            {/* Action Buttons */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}>
                                {/* Favorite Button */}
                                {onToggleFavorite && (
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleFavorite(product.id);
                                        }}
                                        sx={{
                                            color: favoriteProductIds?.has(
                                                product.id
                                            )
                                                ? "error.main"
                                                : "text.secondary",
                                            "&:hover": {
                                                color: favoriteProductIds?.has(
                                                    product.id
                                                )
                                                    ? "error.dark"
                                                    : "error.main",
                                            },
                                            width: 36,
                                            height: 36,
                                        }}
                                        aria-label={
                                            favoriteProductIds?.has(product.id)
                                                ? "Remove from favorites"
                                                : "Add to favorites"
                                        }>
                                        {favoriteProductIds?.has(product.id) ? (
                                            <Favorite fontSize="small" />
                                        ) : (
                                            <FavoriteOutlined fontSize="small" />
                                        )}
                                    </IconButton>
                                )}

                                {/* Add Button */}
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onProductSelect(product);
                                    }}
                                    sx={{
                                        minWidth: 36,
                                        width: 36,
                                        height: 36,
                                        borderRadius: "50%",
                                        backgroundColor: "secondary.main",
                                        color: "black",
                                        "&:hover": {
                                            backgroundColor: "secondary.dark",
                                        },
                                        p: 0,
                                    }}>
                                    <Add fontSize="small" />
                                </Button>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    )
);

ProductListView.displayName = "ProductListView";
