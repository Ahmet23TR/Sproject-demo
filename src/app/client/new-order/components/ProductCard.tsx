import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Button,
    Box,
    IconButton,
    Chip,
} from "@mui/material";
import { FavoriteOutlined, Favorite, Add } from "@mui/icons-material";
import { Product } from "../../../../services/catalogService";
import { getImageUrl } from "../../../../utils/image";
import React from "react";

interface ProductCardProps {
    product: Product;
    onProductSelect: (product: Product) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (productId: string) => void;
}

export const ProductCard = React.memo(
    ({
        product,
        onProductSelect,
        isFavorite = false,
        onToggleFavorite,
    }: ProductCardProps) => {
        return (
            <Card
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    borderRadius: 3,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                    backgroundColor: "grey.100",
                }}
                onClick={() => onProductSelect(product)}>
                {/* Favorite Button */}
                {onToggleFavorite && (
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(product.id);
                        }}
                        sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            zIndex: 2,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            color: isFavorite ? "error.main" : "text.secondary",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 1)",
                                color: isFavorite ? "error.dark" : "error.main",
                            },
                            width: 36,
                            height: 36,
                        }}
                        aria-label={
                            isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                        }>
                        {isFavorite ? (
                            <Favorite fontSize="small" />
                        ) : (
                            <FavoriteOutlined fontSize="small" />
                        )}
                    </IconButton>
                )}

                {/* Product Image */}
                <CardMedia
                    component="img"
                    image={
                        product.imageUrl
                            ? getImageUrl(product.imageUrl)
                            : "/placeholder.png"
                    }
                    alt={product.name}
                    sx={{
                        height: { xs: 180, sm: 200 },
                        objectFit: "cover",
                        backgroundColor: "grey.100",
                    }}
                />

                {/* Product Info */}
                <CardContent
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        p: 2,
                        "&:last-child": { pb: 2 },
                    }}>
                    {/* Category Indicator */}
                    {product.category && (
                        <Chip
                            label={product.category.name}
                            size="small"
                            sx={{
                                alignSelf: "flex-start",
                                mb: 1,
                                backgroundColor: "primary.main",
                                color: "white",
                                fontSize: "0.75rem",
                                height: 24,
                            }}
                        />
                    )}

                    {/* Product Name and Add Button on Same Line */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                            mt: "auto",
                        }}>
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                                lineHeight: 1.3,
                                fontSize: "1.1rem",
                                color: "text.primary",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                flex: 1,
                                mr: 1,
                            }}>
                            {product.name}
                        </Typography>

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
                                flexShrink: 0,
                            }}>
                            <Add fontSize="small" />
                        </Button>
                    </Box>

                    {/* Product Description */}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 2,
                            flex: 1,
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}>
                        {product.description}
                    </Typography>
                </CardContent>
            </Card>
        );
    }
);

ProductCard.displayName = "ProductCard";
