"use client";
import React from 'react';
import { Typography, Button, Container, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import { useErrorContext } from '../context/ErrorContext';

interface GlobalErrorDisplayProps {
    onRetry?: () => void;
}

export const GlobalErrorDisplay: React.FC<GlobalErrorDisplayProps> = ({ onRetry }) => {
    const { criticalErrorMessage } = useErrorContext();

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            window.location.reload();
        }
    };

    return (
        <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 2,
                    width: '100%'
                }}
            >
                <ErrorIcon
                    sx={{
                        fontSize: 64,
                        color: 'error.main',
                        mb: 2
                    }}
                />

                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{ fontWeight: 'bold', mb: 2 }}
                >
                    Connection Error
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, lineHeight: 1.6 }}
                >
                    {criticalErrorMessage || "We're having trouble connecting to our servers. Please check your internet connection and try again."}
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    onClick={handleRetry}
                    sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem'
                    }}
                >
                    Try Again
                </Button>
            </Paper>
        </Container>
    );
};
