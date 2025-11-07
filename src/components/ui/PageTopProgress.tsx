'use client';

import React, { useEffect, useState } from 'react';
import { LinearProgress, Box } from '@mui/material';

export interface PageTopProgressProps {
    loading?: boolean;
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export const PageTopProgress: React.FC<PageTopProgressProps> = ({
    loading = false,
    color = 'primary',
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (loading) {
            // Show progress bar immediately
            setIsVisible(true);
        } else {
            // Hide progress bar after a short delay to prevent flickering
            timeoutId = setTimeout(() => {
                setIsVisible(false);
            }, 200);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [loading]);

    // Listen to route changes
    useEffect(() => {
        // Note: Next.js 13+ App Router doesn't have these events by default
        // We'll rely on manual control through the loading prop
        // If you want route-based progress, you'll need to implement it in your layout

        return () => {
            // Cleanup if needed
        };
    }, []);

    if (!isVisible) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: (theme) => theme.zIndex.appBar + 1,
                width: '100%',
            }}
        >
            <LinearProgress
                color={color}
                sx={{
                    height: 3,
                    '& .MuiLinearProgress-bar': {
                        transition: 'transform 0.2s ease-in-out',
                    },
                }}
            />
        </Box>
    );
};
