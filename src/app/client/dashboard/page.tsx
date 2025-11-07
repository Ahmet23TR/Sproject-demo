"use client";

import Link from "next/link";
import Image from "next/image";
import { AddRounded } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useClientDashboard } from "@/hooks/useClientDashboard";
import type { Order } from "@/types/data";
import { calculateOrderItemPrices, formatCurrency } from "@/utils/price";
import { useRouter } from "next/navigation";

const formatOrderDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

const computeOrderTotal = (order: Order): number => {
    const finalRetail = order.finalRetailTotalAmount ?? order.finalTotalAmount;
    const initialRetail = order.initialRetailTotalAmount ?? order.initialTotalAmount;
    if (typeof finalRetail === "number") return finalRetail;
    if (typeof initialRetail === "number") return initialRetail;
    // Fallback to legacy totals if retail not present
    // Last resort: compute from items
    return order.items.reduce((sum, item) => {
        const total = item.retailTotalPrice ?? calculateOrderItemPrices(item).totalPrice;
        return sum + Number(total || 0);
    }, 0);
};

export default function ClientDashboardPage() {
    const router = useRouter();
    const {
        loading,
        error,
        recentOrders,
        favorites,
        lastOrder,
        greeting,
        greetingSubtitle,
        displayName,
        addingProductId,
        handleCreateOrder,
        handleViewHistory,
        handleQuickAddFavorite,
        handleRepeatLastOrder,
    } = useClientDashboard();

    return (
        <ProtectedRoute requiredRole="CLIENT">
            <Box
                sx={{
                    bgcolor: "#F1EDE5",
                    minHeight: "100vh",
                    py: { xs: 2.5, sm: 4, md: 6 },
                }}>
                <Box maxWidth={1200} mx="auto" px={{ xs: 2, sm: 3, md: 4 }}>
                    {loading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: "50vh",
                            }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    ) : (
                        <>
                            <Stack spacing={4}>
                                {/* Hero Section - Elegant Welcome with Background Image */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: 4,
                                        overflow: "hidden",
                                        position: "relative",
                                        height: { xs: 300, sm: 350, md: 450 },
                                        display: "flex",
                                        alignItems: {
                                            xs: "center",
                                            md: "flex-start",
                                        },
                                        justifyContent: "flex-start",
                                    }}>
                                    {/* Optimized Background Image */}
                                    <Image
                                        src="/image3.jpg"
                                        alt="Restaurant hero background"
                                        fill
                                        priority
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                                        style={{
                                            objectFit: "cover",
                                            objectPosition: "center",
                                        }}
                                    />

                                    {/* Gradient Overlay */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: `linear-gradient(
                                                135deg,
                                                rgba(31, 30, 27, 0.7) 0%,
                                                rgba(31, 30, 27, 0.5) 20%,
                                                rgba(31, 30, 27, 0.3) 50%,
                                                transparent 100%
                                            )`,
                                            zIndex: 1,
                                        }}
                                    />

                                    {/* Content Layer */}
                                    <Box
                                        sx={{
                                            position: "relative",
                                            zIndex: 2,
                                            p: { xs: 3, sm: 4, md: 6 },
                                            pt: { xs: 3, sm: 4, md: 35 },
                                            maxWidth: {
                                                xs: "100%",
                                                sm: "90%",
                                                md: "60%",
                                            },
                                            width: "100%",
                                        }}>
                                        {/* Welcome Text */}
                                        <Typography
                                            variant="h3"
                                            fontWeight={700}
                                            sx={{
                                                mb: { xs: 1, sm: 1.5 },
                                                color: "#F5F2E8",
                                                fontSize: {
                                                    xs: "1.75rem",
                                                    sm: "2rem",
                                                    md: "2.5rem",
                                                },
                                                lineHeight: {
                                                    xs: 1.2,
                                                    md: 1.3,
                                                },
                                                textAlign: {
                                                    xs: "center",
                                                    md: "left",
                                                },
                                            }}>
                                            {`${greeting}, ${displayName}!`}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: "#E8E3D3",
                                                mb: { xs: 3, md: 4 },
                                                fontWeight: 400,
                                                fontSize: {
                                                    xs: "1rem",
                                                    sm: "1.1rem",
                                                    md: "1.25rem",
                                                },
                                                textAlign: {
                                                    xs: "center",
                                                    md: "left",
                                                },
                                                lineHeight: 1.5,
                                            }}>
                                            {greetingSubtitle}
                                        </Typography>

                                        {/* Action Buttons */}
                                        <Stack
                                            direction={{
                                                xs: "column",
                                                sm: "row",
                                            }}
                                            spacing={{ xs: 2, sm: 2 }}
                                            sx={{
                                                width: {
                                                    xs: "100%",
                                                    sm: "fit-content",
                                                },
                                                alignItems: {
                                                    xs: "center",
                                                    sm: "flex-start",
                                                },
                                            }}>
                                            <Button
                                                variant="contained"
                                                size="medium"
                                                onClick={handleCreateOrder}
                                                sx={{
                                                    bgcolor: "#CBA135",
                                                    color: "#f7f2e2ff",
                                                    fontWeight: 600,
                                                    px: { xs: 2, sm: 4 },
                                                    py: { xs: 0.8, sm: 1.5 },
                                                    fontSize: {
                                                        xs: "0.8rem",
                                                        sm: "1rem",
                                                    },
                                                    border: "none",
                                                    width: {
                                                        xs: "100%",
                                                        sm: "auto",
                                                    },
                                                    maxWidth: {
                                                        xs: "200px",
                                                        sm: "none",
                                                    },
                                                    minHeight: {
                                                        xs: "38px",
                                                        sm: "44px",
                                                    },
                                                    "&:hover": {
                                                        bgcolor: "#B8941F",
                                                        color: "#f7f2e2ff",
                                                        transform: {
                                                            xs: "none",
                                                            sm: "translateY(-2px)",
                                                        },
                                                        boxShadow: 4,
                                                    },
                                                    transition: "all 0.2s ease",
                                                }}>
                                                Create New Order
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="medium"
                                                onClick={handleViewHistory}
                                                sx={{
                                                    bgcolor: "#CBA135",
                                                    color: "#f7f2e2ff",
                                                    fontWeight: 600,
                                                    px: { xs: 2, sm: 4 },
                                                    py: { xs: 0.8, sm: 1.5 },
                                                    fontSize: {
                                                        xs: "0.8rem",
                                                        sm: "1rem",
                                                    },
                                                    border: "none",
                                                    width: {
                                                        xs: "100%",
                                                        sm: "auto",
                                                    },
                                                    maxWidth: {
                                                        xs: "200px",
                                                        sm: "none",
                                                    },
                                                    minHeight: {
                                                        xs: "38px",
                                                        sm: "44px",
                                                    },
                                                    "&:hover": {
                                                        bgcolor: "#B8941F",
                                                        color: "#f7f2e2ff",
                                                        transform: {
                                                            xs: "none",
                                                            sm: "translateY(-2px)",
                                                        },
                                                        boxShadow: 4,
                                                    },
                                                    transition: "all 0.2s ease",
                                                }}>
                                                View Order History
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Paper>

                                {/* Repeat Last Order Banner */}
                                {lastOrder && (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: { xs: 2.5, sm: 3, md: 4 },
                                            borderRadius: 3,
                                            border: "1px solid",
                                            borderColor:
                                                "rgba(203, 161, 53, 0.3)",
                                            bgcolor: "#F5F4F0",
                                            display: "flex",
                                            alignItems: "center",
                                        }}>
                                        <Stack
                                            direction={{
                                                xs: "column",
                                                md: "row",
                                            }}
                                            spacing={{ xs: 2.5, sm: 3 }}
                                            justifyContent="space-between"
                                            alignItems={{
                                                xs: "stretch",
                                                md: "center",
                                            }}
                                            sx={{ width: "100%" }}>
                                            <Box>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight={600}>
                                                    Repeat Your Last Order
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        mt: 0.5,
                                                        color: "#6C6C6C",
                                                    }}>
                                                    {`Placed on ${formatOrderDate(
                                                        lastOrder.createdAt
                                                    )} • #${
                                                        lastOrder.orderNumber
                                                    }`}
                                                </Typography>
                                                <Stack
                                                    direction={{
                                                        xs: "column",
                                                        sm: "row",
                                                    }}
                                                    spacing={3}
                                                    sx={{ mt: 2 }}
                                                    divider={
                                                        <Divider
                                                            orientation="vertical"
                                                            flexItem
                                                            sx={{
                                                                borderColor:
                                                                    "rgba(17, 24, 39, 0.1)",
                                                                display: {
                                                                    xs: "none",
                                                                    sm: "block",
                                                                },
                                                            }}
                                                        />
                                                    }>
                                                    <Box>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: "text.secondary",
                                                                textTransform:
                                                                    "uppercase",
                                                                fontSize:
                                                                    "0.75rem",
                                                                fontWeight: 500,
                                                            }}>
                                                            Total Amount
                                                        </Typography>
                                                        <Typography
                                                            variant="h5"
                                                            fontWeight={700}
                                                            sx={{
                                                                color: "#1F2933",
                                                            }}>
                                                            {formatCurrency(
                                                                computeOrderTotal(
                                                                    lastOrder
                                                                )
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: "text.secondary",
                                                                textTransform:
                                                                    "uppercase",
                                                                fontSize:
                                                                    "0.75rem",
                                                                fontWeight: 500,
                                                            }}>
                                                            Items
                                                        </Typography>
                                                        <Typography
                                                            variant="h5"
                                                            fontWeight={700}
                                                            sx={{
                                                                color: "#1F2933",
                                                            }}>
                                                            {`${lastOrder.items.length} products`}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                sx={{
                                                    borderColor: "#CBA135",
                                                    color: "#CBA135",
                                                    px: { xs: 3, sm: 4 },
                                                    py: { xs: 1.2, sm: 1.5 },
                                                    fontSize: {
                                                        xs: "0.9rem",
                                                        sm: "1rem",
                                                    },
                                                    fontWeight: 600,
                                                    width: {
                                                        xs: "100%",
                                                        md: "auto",
                                                    },
                                                    minHeight: "44px",
                                                    alignSelf: {
                                                        xs: "stretch",
                                                        md: "center",
                                                    },
                                                    "&:hover": {
                                                        borderColor: "#CBA135",
                                                        bgcolor:
                                                            "rgba(203, 161, 53, 0.1)",
                                                        transform: {
                                                            xs: "none",
                                                            sm: "translateY(-1px)",
                                                        },
                                                    },
                                                    transition: "all 0.2s ease",
                                                }}
                                                onClick={handleRepeatLastOrder}>
                                                Repeat This Order
                                            </Button>
                                        </Stack>
                                    </Paper>
                                )}
                            </Stack>

                            <Box mt={{ xs: 5, sm: 6, md: 7 }}>
                                <Grid container spacing={{ xs: 2.5, sm: 3 }}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: { xs: 2.5, sm: 3, md: 4 },
                                                borderRadius: 3,
                                                bgcolor: "#F5F4F0",
                                                height: {
                                                    xs: 400,
                                                    sm: 450,
                                                    md: 480,
                                                },
                                                display: "flex",
                                                flexDirection: "column",
                                                overflow: "hidden",
                                            }}>
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                sx={{ mb: 2 }}>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight={600}>
                                                    Recent Orders
                                                </Typography>
                                                <Typography
                                                    component="button"
                                                    variant="body2"
                                                    onClick={handleViewHistory}
                                                    sx={{
                                                        color: "#CBA135",
                                                        fontWeight: 700,
                                                        textDecoration: "none",
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        padding: 0,
                                                        transition:
                                                            "opacity 0.2s ease",
                                                        "&:hover": {
                                                            opacity: 0.7,
                                                        },
                                                    }}>
                                                    View All
                                                </Typography>
                                            </Stack>

                                            <Divider
                                                sx={{
                                                    mb: 2,
                                                    borderColor:
                                                        "rgba(0, 0, 0, 0.12)",
                                                }}
                                            />

                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    overflow: "auto",
                                                    minHeight: 0,
                                                }}>
                                                {recentOrders.length === 0 ? (
                                                    <Box
                                                        sx={{
                                                            mt: 4,
                                                            textAlign: "center",
                                                            color: "text.secondary",
                                                        }}>
                                                        <Typography variant="body2">
                                                            Your recent orders
                                                            will appear here.
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <List disablePadding>
                                                        {recentOrders.map(
                                                            (order) => {
                                                                return (
                                                                    <ListItem
                                                                        disablePadding
                                                                        key={
                                                                            order.id
                                                                        }>
                                                                        <ListItemButton
                                                                            sx={{
                                                                                borderRadius: 2,
                                                                                mb: 1.5,
                                                                                alignItems:
                                                                                    "flex-start",
                                                                            }}
                                                                            onClick={() =>
                                                                                router.push(
                                                                                    `/client/order-history/${order.id}`
                                                                                )
                                                                            }>
                                                                            <Box
                                                                                sx={{
                                                                                    display:
                                                                                        "flex",
                                                                                    flexDirection:
                                                                                        {
                                                                                            xs: "column",
                                                                                            sm: "row",
                                                                                        },
                                                                                    width: "100%",
                                                                                    gap: {
                                                                                        xs: 1.5,
                                                                                        sm: 2.5,
                                                                                    },
                                                                                    alignItems:
                                                                                        {
                                                                                            xs: "flex-start",
                                                                                            sm: "center",
                                                                                        },
                                                                                    justifyContent:
                                                                                        {
                                                                                            xs: "flex-start",
                                                                                            sm: "space-between",
                                                                                        },
                                                                                }}>
                                                                                <Box>
                                                                                    <Typography
                                                                                        variant="subtitle1"
                                                                                        fontWeight={
                                                                                            600
                                                                                        }>
                                                                                        {`#${order.orderNumber}`}
                                                                                    </Typography>
                                                                                    <Typography
                                                                                        variant="body2"
                                                                                        sx={{
                                                                                            color: "#6C6C6C",
                                                                                        }}>
                                                                                        {formatOrderDate(
                                                                                            order.createdAt
                                                                                        )}
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Stack
                                                                                    direction="row"
                                                                                    spacing={
                                                                                        1.5
                                                                                    }
                                                                                    alignItems="center"
                                                                                    sx={{
                                                                                        flexShrink: 0,
                                                                                        alignSelf:
                                                                                            {
                                                                                                xs: "flex-start",
                                                                                                sm: "center",
                                                                                            },
                                                                                    }}>
                                                                                    <Typography
                                                                                        variant="body2"
                                                                                        fontWeight={
                                                                                            600
                                                                                        }>
                                                                                        {formatCurrency(
                                                                                            computeOrderTotal(
                                                                                                order
                                                                                            )
                                                                                        )}
                                                                                    </Typography>
                                                                                </Stack>
                                                                            </Box>
                                                                        </ListItemButton>
                                                                    </ListItem>
                                                                );
                                                            }
                                                        )}
                                                    </List>
                                                )}
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: { xs: 2.5, sm: 3, md: 4 },
                                                borderRadius: 3,
                                                bgcolor: "#F5F4F0",
                                                height: {
                                                    xs: 400,
                                                    sm: 450,
                                                    md: 480,
                                                },
                                                display: "flex",
                                                flexDirection: "column",
                                                overflow: "hidden",
                                                mt: { xs: 2.5, md: 0 }, // Add top margin on mobile for better spacing
                                            }}>
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                sx={{ mb: 2 }}>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight={600}>
                                                    Your Favorite Products
                                                </Typography>
                                                <Typography
                                                    component={Link}
                                                    href="/client/new-order"
                                                    variant="body2"
                                                    sx={{
                                                        color: "#CBA135",
                                                        fontWeight: 700,
                                                        textDecoration: "none",
                                                        transition:
                                                            "opacity 0.2s ease",
                                                        "&:hover": {
                                                            opacity: 0.7,
                                                        },
                                                    }}>
                                                    View All
                                                </Typography>
                                            </Stack>

                                            <Divider
                                                sx={{
                                                    mb: 2,
                                                    borderColor:
                                                        "rgba(0, 0, 0, 0.12)",
                                                }}
                                            />

                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    overflow: "auto",
                                                    minHeight: 0,
                                                }}>
                                                {favorites.length === 0 ? (
                                                    <Box
                                                        sx={{
                                                            mt: 4,
                                                            textAlign: "center",
                                                            color: "text.secondary",
                                                        }}>
                                                        <Typography variant="body2">
                                                            Mark products as
                                                            favourites to access
                                                            them here.
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <List disablePadding>
                                                        {favorites.map(
                                                            (favorite) => {
                                                                const product =
                                                                    favorite.product;
                                                                if (!product)
                                                                    return null;
                                                                const isAdding =
                                                                    addingProductId ===
                                                                    product.id;
                                                                return (
                                                                    <ListItem
                                                                        key={
                                                                            favorite.id
                                                                        }
                                                                        sx={{
                                                                            borderRadius: 2,
                                                                            mb: 1.5,
                                                                            px: 0,
                                                                        }}
                                                                        secondaryAction={
                                                                            <IconButton
                                                                                edge="end"
                                                                                onClick={() =>
                                                                                    handleQuickAddFavorite(
                                                                                        favorite
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    isAdding
                                                                                }
                                                                                sx={{
                                                                                    bgcolor:
                                                                                        "#F1EDE5",
                                                                                    color: "#CBA135",
                                                                                    width: {
                                                                                        xs: 40,
                                                                                        sm: 44,
                                                                                    },
                                                                                    height: {
                                                                                        xs: 40,
                                                                                        sm: 44,
                                                                                    },
                                                                                    minWidth:
                                                                                        "40px", // Better touch target
                                                                                    minHeight:
                                                                                        "40px",
                                                                                    transition:
                                                                                        "all 0.2s ease",
                                                                                    "&:hover":
                                                                                        {
                                                                                            bgcolor:
                                                                                                "rgba(203, 161, 53, 0.2)",
                                                                                            color: "#1F2933",
                                                                                            transform:
                                                                                                {
                                                                                                    xs: "none",
                                                                                                    sm: "scale(1.05)",
                                                                                                },
                                                                                        },
                                                                                }}>
                                                                                {isAdding ? (
                                                                                    <CircularProgress
                                                                                        size={
                                                                                            18
                                                                                        }
                                                                                        color="inherit"
                                                                                    />
                                                                                ) : (
                                                                                    <AddRounded
                                                                                        sx={{
                                                                                            fontSize:
                                                                                                {
                                                                                                    xs: "1.2rem",
                                                                                                    sm: "1.5rem",
                                                                                                },
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </IconButton>
                                                                        }>
                                                                        <ListItemText
                                                                            primary={
                                                                                <Typography
                                                                                    variant="subtitle1"
                                                                                    fontWeight={
                                                                                        600
                                                                                    }>
                                                                                    {
                                                                                        product.name
                                                                                    }
                                                                                </Typography>
                                                                            }
                                                                            secondary={
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    sx={{
                                                                                        color: "#6C6C6C",
                                                                                    }}>
                                                                                    {product.description ||
                                                                                        "Default configuration"}
                                                                                </Typography>
                                                                            }
                                                                        />
                                                                    </ListItem>
                                                                );
                                                            }
                                                        )}
                                                    </List>
                                                )}
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
