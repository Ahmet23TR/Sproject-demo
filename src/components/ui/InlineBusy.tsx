'use client';

import React from 'react';
import { Box, CircularProgress, BoxProps } from '@mui/material';

export interface InlineBusyProps extends BoxProps {
    loading?: boolean;
    children: React.ReactNode;
}

export const InlineBusy: React.FC<InlineBusyProps> = ({
    loading = false,
    children,
    ...boxProps
}) => {
    return (
        <Box
            {...boxProps}
            sx={{
                position: 'relative',
                opacity: loading ? 0.5 : 1,
                transition: 'opacity 0.2s ease-in-out',
                ...boxProps.sx,
            }}
            aria-busy={loading}
        >
            {children}
            {loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        right: 16,
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                    }}
                >
                    <CircularProgress size={16} />
                </Box>
            )}
        </Box>
    );
};

