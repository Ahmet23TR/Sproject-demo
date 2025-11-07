"use client";
import React from "react";
import { Snackbar, Alert, AlertTitle } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

interface SuccessPopupProps {
    open: boolean;
    message: string;
    type: "success" | "error";
    onClose: () => void;
    autoHideDuration?: number;
}

export default function SuccessPopup({
    open,
    message,
    type,
    onClose,
    autoHideDuration = 3000,
}: SuccessPopupProps) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}>
            <Alert
                onClose={onClose}
                severity={type}
                variant="filled"
                icon={type === "success" ? <CheckCircleIcon /> : <ErrorIcon />}
                sx={{
                    width: "100%",
                    fontSize: "1rem",
                    fontWeight: 500,
                }}>
                <AlertTitle sx={{ fontWeight: 600 }}>
                    {type === "success" ? "Success!" : "Error!"}
                </AlertTitle>
                {message}
            </Alert>
        </Snackbar>
    );
}
