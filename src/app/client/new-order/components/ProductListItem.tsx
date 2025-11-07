import { Box, Typography, ListItem, Button, IconButton } from "@mui/material";
import { FavoriteOutlined, Favorite } from "@mui/icons-material";
import { Product } from "../../../../services/catalogService"; // catalogService'den import et
import { getImageUrl } from "../../../../utils/image"; // getImageUrl fonksiyonunu utils'e taşıdığımızı varsayıyoruz
import React from "react";

interface ProductListItemProps {
    product: Product;
    onProductSelect: (product: Product) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (productId: string) => void;
}

export const ProductListItem = React.memo(({
    product,
    onProductSelect,
    isFavorite = false,
    onToggleFavorite,
}: ProductListItemProps) => (
    <ListItem
        sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
            p: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            position: "relative",
        }}>
        {/* Favori ikonu - sağ üst köşe */}
        {onToggleFavorite && (
            <IconButton
                onClick={() => onToggleFavorite(product.id)}
                sx={{
                    position: "absolute",
                    top: 15,
                    right: 140,
                    color: isFavorite ? "red" : "gray",
                    "&:hover": {
                        color: isFavorite ? "darkred" : "red",
                    },
                }}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                {isFavorite ? <Favorite /> : <FavoriteOutlined />}
            </IconButton>
        )}

        {product.imageUrl && (
            <Box
                component="img"
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 1,
                    objectFit: "cover",
                }}
            />
        )}
        <Box flex={1}>
            <Typography variant="h6" fontWeight={600}>
                {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {product.description}
            </Typography>
        </Box>
        <Button variant="outlined" onClick={() => onProductSelect(product)}>
            View Options
        </Button>
    </ListItem>
));

ProductListItem.displayName = 'ProductListItem';
