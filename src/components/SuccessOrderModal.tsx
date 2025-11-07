import React from "react";
import {
    Button,
    Typography,
    Box,
    IconButton,
    Fade,
    useTheme,
    useMediaQuery,
    SwipeableDrawer,
    Modal,
    Paper,
} from "@mui/material";
import {
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface SuccessOrderModalProps {
    open: boolean;
    onClose: () => void;
    orderNumber?: number;
}

export const SuccessOrderModal: React.FC<SuccessOrderModalProps> = ({
    open,
    onClose,
    orderNumber,
}) => {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleViewOrders = () => {
        onClose();
        router.push("/client/order-history");
    };

    const handleNewOrder = () => {
        onClose();
        router.push("/client/new-order");
    };

    // Shared Modal Content Component
    const ModalContent = () => (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
            }}>
            {/* Close Button */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: "absolute",
                    top: { xs: 12, sm: 16 },
                    right: { xs: 12, sm: 16 },
                    zIndex: 10,
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                    "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.95)",
                        transform: "scale(1.05)",
                        borderColor: "rgba(203, 161, 53, 0.3)",
                    },
                    transition: "all 0.2s ease-in-out",
                }}>
                <CloseIcon
                    sx={{
                        fontSize: { xs: 16, sm: 18 },
                        color: "text.secondary",
                    }}
                />
            </IconButton>

            {/* Main Content Panel */}
            <Box
                sx={{
                    p: { xs: 3, sm: 4 },
                    pt: { xs: 4, sm: 5 },
                    pb: { xs: 2, sm: 3 },
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}>
                {/* Large Success Icon */}
                <Fade in={open} timeout={600}>
                    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                        <Box
                            sx={{
                                width: { xs: 80, sm: 100 },
                                height: { xs: 80, sm: 100 },
                                borderRadius: "50%",
                                bgcolor: "#CBA135", // Muted Gold
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mx: "auto",
                                boxShadow: "0 8px 32px rgba(203, 161, 53, 0.3)",
                                animation: "bounce 0.8s ease-out",
                            }}>
                            <CheckCircleIcon
                                sx={{
                                    fontSize: { xs: 40, sm: 50 },
                                    color: "#FFFFFF",
                                }}
                            />
                        </Box>
                    </Box>
                </Fade>

                {/* Main Heading */}
                <Fade in={open} timeout={800}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 700,
                            fontSize: { xs: "2rem", sm: "2.5rem" },
                            color: "#111827",
                            mb: { xs: 2, sm: 3 },
                            lineHeight: 1.2,
                        }}>
                        Order Received!
                    </Typography>
                </Fade>

                {/* Confirmation Text */}
                <Fade in={open} timeout={1000}>
                    <Typography
                        variant="body1"
                        sx={{
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontSize: { xs: "1.125rem", sm: "1.25rem" },
                            color: "text.secondary",
                            mb: { xs: 4, sm: 5 },
                            lineHeight: 1.5,
                            maxWidth: 400,
                            mx: "auto",
                        }}>
                        We&apos;ve received your order and will start preparing
                        it right away.
                    </Typography>
                </Fade>

                {/* Subtle Divider */}
                <Fade in={open} timeout={1200}>
                    <Box
                        sx={{
                            width: 60,
                            height: 1,
                            bgcolor: "divider",
                            mx: "auto",
                            mb: { xs: 3, sm: 4 },
                        }}
                    />
                </Fade>

                {/* Order Number */}
                {orderNumber && (
                    <Fade in={open} timeout={1400}>
                        <Box sx={{ mb: { xs: 4, sm: 5 } }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontSize: {
                                        xs: "0.875rem",
                                        sm: "1rem",
                                    },
                                    color: "text.secondary",
                                    mb: 1,
                                }}>
                                Your Order Number:
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily:
                                        '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                                    fontWeight: 700,
                                    fontSize: {
                                        xs: "1.25rem",
                                        sm: "1.5rem",
                                    },
                                    color: "#111827",
                                    letterSpacing: "0.5px",
                                }}>
                                #{orderNumber}
                            </Typography>
                        </Box>
                    </Fade>
                )}

                {/* Another Subtle Divider */}
                <Fade in={open} timeout={1600}>
                    <Box
                        sx={{
                            width: 60,
                            height: 1,
                            bgcolor: "divider",
                            mx: "auto",
                            mb: { xs: 4, sm: 5 },
                        }}
                    />
                </Fade>
            </Box>

            {/* Action Buttons */}
            <Box
                sx={{
                    p: { xs: 3, sm: 4 },
                    pt: { xs: 1, sm: 2 },
                    pb: { xs: 4, sm: 4 },
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 2, sm: 2 },
                    bgcolor: "#F8F5EE",
                    borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                    mt: 1,
                }}>
                {/* Primary Action - View My Orders */}
                <Fade in={open} timeout={1800}>
                    <Button
                        variant="contained"
                        onClick={handleViewOrders}
                        fullWidth
                        sx={{
                            height: { xs: 50, sm: 54 },
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 600,
                            fontSize: { xs: "1rem", sm: "1.125rem" },
                            borderRadius: 3,
                            bgcolor: "#CBA135", // Muted Gold
                            color: "#FFFFFF",
                            boxShadow: "0 4px 20px rgba(203, 161, 53, 0.3)",
                            textTransform: "none",
                            "&:hover": {
                                bgcolor: "#B8932F",
                                transform: "translateY(-1px)",
                                boxShadow: "0 8px 30px rgba(203, 161, 53, 0.4)",
                            },
                            transition: "all 0.2s ease-in-out",
                        }}>
                        View My Orders
                    </Button>
                </Fade>

                {/* Secondary Action - Create New Order */}
                <Fade in={open} timeout={2000}>
                    <Button
                        variant="outlined"
                        onClick={handleNewOrder}
                        fullWidth
                        sx={{
                            height: { xs: 50, sm: 54 },
                            fontFamily:
                                '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                            fontWeight: 600,
                            fontSize: { xs: "1rem", sm: "1.125rem" },
                            borderRadius: 3,
                            borderColor: "#CBA135",
                            color: "#CBA135",
                            borderWidth: 2,
                            textTransform: "none",
                            "&:hover": {
                                bgcolor: "rgba(203, 161, 53, 0.1)",
                                borderColor: "#B8932F",
                                color: "#B8932F",
                                borderWidth: 2,
                                transform: "translateY(-1px)",
                            },
                            transition: "all 0.2s ease-in-out",
                        }}>
                        Create a New Order
                    </Button>
                </Fade>
            </Box>
        </Box>
    );

    if (isMobile) {
        // Mobile: Use SwipeableDrawer (slides from bottom)
        return (
            <SwipeableDrawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                onOpen={() => {}} // Required for SwipeableDrawer but not used
                disableSwipeToOpen={true}
                ModalProps={{
                    keepMounted: true,
                }}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        maxWidth: "100%",
                        mx: "auto",
                        maxHeight: "95vh",
                        overflow: "hidden",
                        bgcolor: "#F8F5EE",
                        boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.12)",
                    },
                }}>
                {/* Drag Handle for mobile */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        pt: 1.5,
                        pb: 1,
                        cursor: "grab",
                    }}
                    onClick={onClose}>
                    <Box
                        sx={{
                            width: 40,
                            height: 4,
                            bgcolor: "rgba(0, 0, 0, 0.2)",
                            borderRadius: 2,
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                                bgcolor: "rgba(0, 0, 0, 0.3)",
                                width: 50,
                            },
                        }}
                    />
                </Box>
                <ModalContent />
            </SwipeableDrawer>
        );
    }

    // Desktop: Use centered Modal
    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
            }}>
            <Fade in={open} timeout={400}>
                <Paper
                    sx={{
                        borderRadius: 4,
                        maxWidth: 500,
                        width: "100%",
                        maxHeight: "90vh",
                        overflow: "auto",
                        bgcolor: "#F8F5EE",
                        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.15)",
                        outline: "none",
                        "&:focus": {
                            outline: "none",
                        },
                    }}>
                    <ModalContent />
                </Paper>
            </Fade>
        </Modal>
    );
};
