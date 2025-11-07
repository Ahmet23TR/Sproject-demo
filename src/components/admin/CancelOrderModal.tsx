"use client";
import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
} from "@mui/material";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import { Order } from "../../types/data";

interface CancelOrderModalProps {
    open: boolean;
    onClose: () => void;
    order: Order | null;
    onConfirm: (orderId: string, notes: string) => Promise<{ success: boolean; message: string }>;
}

export const CancelOrderModal = ({ open, onClose, order, onConfirm }: CancelOrderModalProps) => {
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        if (loading) return;
        setNotes("");
        setError(null);
        onClose();
    };

    const handleConfirm = async () => {
        if (!order) return;

        // Validation
        if (notes.trim().length < 5) {
            setError("The cancellation reason must be at least 5 characters");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await onConfirm(order.id, notes.trim());

            if (result.success) {
                // Başarılı durumda form'u temizle
                setNotes("");
                setError(null);
                // Parent component modal'ı kapatacak
            } else {
                setError(result.message || "Failed to cancel order");
            }
        } catch {
            setError("An error occurred while cancelling the order");
        } finally {
            setLoading(false);
        }
    };

    const canCancel = order && (order.deliveryStatus === 'PENDING' || order.deliveryStatus === 'READY_FOR_DELIVERY');

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: "0 20px 60px rgba(17, 24, 39, 0.12)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    pb: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: "error.light",
                        color: "error.main",
                    }}
                >
                    <CancelRoundedIcon />
                </Box>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                        Cancel Order
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                        {order ? `Order #${order.orderNumber}` : ""}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ py: 4, px: 3, mt: 2 }}>
                {!canCancel ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This order cannot be cancelled. Only orders in &ldquo;Pending&rdquo; and &ldquo;Ready for Delivery&rdquo; status can be cancelled.
                    </Alert>
                ) : (
                    <>

                        <TextField
                            fullWidth
                            label="Cancellation Reason *"
                            multiline
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Why is the order being cancelled? (At least 5 characters)"
                            error={!!error && error.includes("5 characters")}
                            sx={{
                                mt: 1,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                },
                                "& .MuiInputLabel-root": {
                                    backgroundColor: "background.paper",
                                    px: 1,
                                    transform: "translate(14px, -9px) scale(0.75)",
                                    "&.MuiInputLabel-shrink": {
                                        transform: "translate(14px, -9px) scale(0.75)",
                                    },
                                },
                            }}
                            disabled={loading}
                        />

                        {error && !error.includes("5 characters") && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                    }}
                    disabled={loading}
                >
                    Cancel
                </Button>
                {canCancel && (
                    <Button
                        onClick={handleConfirm}
                        variant="contained"
                        color="error"
                        disabled={loading || notes.trim().length < 5}
                        startIcon={loading ? <CircularProgress size={16} /> : <CancelRoundedIcon />}
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            px: 3,
                        }}
                    >
                        {loading ? "Cancelling..." : "Cancel Order"}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
