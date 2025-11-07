"use client";
import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import { LoadingButton } from "../../../../components/ui/LoadingButton";

interface FailReasonDialogProps {
    open: boolean;
    reason: string;
    onChangeReason: (value: string) => void;
    onClose: () => void;
    onSave: () => void;
}

const FailReasonDialog: React.FC<FailReasonDialogProps> = ({
    open,
    reason,
    onChangeReason,
    onClose,
    onSave,
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Delivery Failed Reason</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    type="text"
                    fullWidth
                    value={reason}
                    onChange={(e) => onChangeReason(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <LoadingButton onClick={onClose}>Cancel</LoadingButton>
                <LoadingButton onClick={onSave} color="error" disabled={!reason}>
                    Save
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};

export default FailReasonDialog;
