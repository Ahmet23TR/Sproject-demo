'use client';

import React from 'react';
import { IconButton, IconButtonProps, CircularProgress } from '@mui/material';

export interface AsyncIconButtonProps extends Omit<IconButtonProps, 'onClick'> {
    loading?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export const AsyncIconButton: React.FC<AsyncIconButtonProps> = ({
    loading = false,
    children,
    disabled,
    onClick,
    ...iconButtonProps
}) => {
    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return;

        if (onClick) {
            try {
                await onClick(event);
            } catch (error) {
                console.error('Icon button click error:', error);
            }
        }
    };

    return (
        <IconButton
            {...iconButtonProps}
            disabled={disabled || loading}
            onClick={handleClick}
            aria-busy={loading}
            aria-disabled={disabled || loading}
        >
            {loading ? (
                <CircularProgress size={20} color="inherit" />
            ) : (
                children
            )}
        </IconButton>
    );
};

