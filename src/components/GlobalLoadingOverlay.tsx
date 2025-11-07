'use client';

import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { useLoading } from '../context/LoadingContext';

export default function GlobalLoadingOverlay() {
    const { isLoading } = useLoading();
    return (
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }} open={isLoading}>
            <CircularProgress color="inherit" />
        </Backdrop>
    );
}


