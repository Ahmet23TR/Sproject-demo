'use client';

import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

export interface LoadingButtonProps extends Omit<ButtonProps, 'onClick'> {
    loading?: boolean;
    loadingLabel?: string;
    startIcon?: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
    loading = false,
    loadingLabel,
    startIcon,
    children,
    disabled,
    onClick,
    ...buttonProps
}) => {
    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return;

        if (onClick) {
            try {
                await onClick(event);
            } catch (error) {
                // Error handling will be done by the parent component or useAsyncAction hook
                console.error('Button click error:', error);
            }
        }
    };

    const getLoadingLabel = () => {
        if (loadingLabel) return loadingLabel;

        // Default loading labels based on button text
        const buttonText = typeof children === 'string' ? children : '';
        if (buttonText.toLowerCase().includes('save') || buttonText.toLowerCase().includes('kaydet')) {
            return 'Saving...';
        }
        if (buttonText.toLowerCase().includes('update') || buttonText.toLowerCase().includes('güncelle')) {
            return 'Updating...';
        }
        if (buttonText.toLowerCase().includes('delete') || buttonText.toLowerCase().includes('sil')) {
            return 'Deleting...';
        }
        if (buttonText.toLowerCase().includes('login') || buttonText.toLowerCase().includes('giriş')) {
            return 'Logging in...';
        }
        if (buttonText.toLowerCase().includes('register') || buttonText.toLowerCase().includes('kayıt')) {
            return 'Registering...';
        }
        if (buttonText.toLowerCase().includes('complete') || buttonText.toLowerCase().includes('tamamla')) {
            return 'Completing...';
        }
        if (buttonText.toLowerCase().includes('approve') || buttonText.toLowerCase().includes('onayla')) {
            return 'Approving...';
        }
        if (buttonText.toLowerCase().includes('activate') || buttonText.toLowerCase().includes('aktifleştir')) {
            return 'Activating...';
        }
        if (buttonText.toLowerCase().includes('deactivate') || buttonText.toLowerCase().includes('deaktifleştir')) {
            return 'Deactivating...';
        }

        return 'Processing...';
    };

    return (
        <Button
            {...buttonProps}
            disabled={disabled || loading}
            onClick={handleClick}
            startIcon={
                loading ? (
                    <CircularProgress size={16} color="inherit" />
                ) : (
                    startIcon
                )
            }
            aria-busy={loading}
            aria-disabled={disabled || loading}
        >
            {loading ? getLoadingLabel() : children}
        </Button>
    );
};
