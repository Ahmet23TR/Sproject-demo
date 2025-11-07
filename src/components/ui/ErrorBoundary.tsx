'use client';

import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';

type ErrorBoundaryProps = {
    children: React.ReactNode;
    fallbackTitle?: string;
    fallbackDescription?: string;
};

type ErrorBoundaryState = {
    hasError: boolean;
    error?: Error;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log if desired
        console.error('Uncaught UI error:', error, errorInfo);
    }

    handleReload = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', p: 2 }}>
                    <Paper elevation={2} sx={{ p: 3, maxWidth: 560, width: '100%', textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            {this.props.fallbackTitle || 'Something went wrong'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {this.props.fallbackDescription || 'Please reload the page or try again later.'}
                        </Typography>
                        <Button variant="contained" onClick={this.handleReload}>
                            Reload Page
                        </Button>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}
