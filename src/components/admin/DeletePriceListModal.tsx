import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Box,
    Typography,
    Divider,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { PriceListSummary } from "../../types/data";

interface DeletePriceListModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    priceList: PriceListSummary | null;
    loading: boolean;
}

export const DeletePriceListModal = ({
    open,
    onClose,
    onConfirm,
    priceList,
    loading,
}: DeletePriceListModalProps) => {
    if (!priceList) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <WarningIcon color="error" />
                    <Typography variant="h6">Delete Price List</Typography>
                </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <DialogContentText color="textPrimary">
                    Are you sure you want to delete the price list{" "}
                    <strong>&quot;{priceList.name}&quot;</strong>?
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={loading} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : null}>
                    {loading ? "Deleting..." : "Delete Price List"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
