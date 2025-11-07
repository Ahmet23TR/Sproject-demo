// src/components/home/FeaturedProducts.tsx
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    Skeleton,
} from "@mui/material";
import { Product } from "../../services/productService"; // Product tipi Category objesini içermeli
import OptimizedImage from "../OptimizedImage";

interface FeaturedProductsProps {
    products: Product[];
    loading: boolean;
}

export const FeaturedProducts = ({
    products,
    loading,
}: FeaturedProductsProps) => (
    <Box width="100%" maxWidth={900} mt={4}>
        <Typography variant="h5" fontWeight={700} mb={3}>
            Featured Products
        </Typography>
        <Grid container spacing={3} justifyContent="center">
            {loading ? (
                Array.from(new Array(3)).map((_, index) => (
                    <Grid size={4} key={index}>
                        <Skeleton
                            variant="rectangular"
                            height={240}
                            sx={{ borderRadius: 2 }}
                        />
                    </Grid>
                ))
            ) : products.length === 0 ? (
                <Grid size={4}>
                    <Typography color="text.secondary">
                        No products to display.
                    </Typography>
                </Grid>
            ) : (
                products.map((product) => (
                    <Grid size={4} key={product.id}>
                        <Card
                            sx={{
                                borderRadius: 2,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                            }}>
                            {product.imageUrl && (
                                <OptimizedImage
                                    src={product.imageUrl}
                                    alt={product.name}
                                    sx={{ height: 140 }}
                                    sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                                    objectFit="cover"
                                />
                            )}
                            <CardContent
                                sx={{
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                }}>
                                <Typography
                                    fontWeight={600}
                                    gutterBottom
                                    sx={{ flexGrow: 1 }}>
                                    {product.name}
                                </Typography>
                                {/* DEĞİŞİKLİK BURADA: Artık kategori adını güvenle gösteriyoruz */}
                                <Chip
                                    label={
                                        product.category?.name ||
                                        "Uncategorized"
                                    }
                                    size="small"
                                    color="primary"
                                    sx={{ mt: 1, alignSelf: "flex-start" }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))
            )}
        </Grid>
    </Box>
);
