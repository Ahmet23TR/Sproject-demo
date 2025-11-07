'use client';

import React from 'react';
import { Skeleton, Card, CardContent, CardActions, Box } from '@mui/material';

export interface SkeletonCardProps {
    variant?: 'product' | 'order' | 'user' | 'simple';
    showActions?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
    variant = 'simple',
    showActions = false,
}) => {
    if (variant === 'product') {
        return (
            <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                    <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={16} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="60%" height={16} />
                </CardContent>
                {showActions && (
                    <CardActions>
                        <Skeleton variant="rectangular" width={80} height={36} />
                        <Skeleton variant="rectangular" width={80} height={36} />
                    </CardActions>
                )}
            </Card>
        );
    }

    if (variant === 'order') {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Skeleton variant="text" width="30%" height={20} />
                        <Skeleton variant="text" width="20%" height={20} />
                    </Box>
                    <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="80%" height={16} />
                </CardContent>
                {showActions && (
                    <CardActions>
                        <Skeleton variant="rectangular" width={100} height={36} />
                    </CardActions>
                )}
            </Card>
        );
    }

    if (variant === 'user') {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" height={20} />
                            <Skeleton variant="text" width="40%" height={16} />
                        </Box>
                    </Box>
                    <Skeleton variant="text" width="80%" height={16} />
                </CardContent>
                {showActions && (
                    <CardActions>
                        <Skeleton variant="rectangular" width={80} height={32} />
                        <Skeleton variant="rectangular" width={80} height={32} />
                    </CardActions>
                )}
            </Card>
        );
    }

    // Default simple variant
    return (
        <Card>
            <CardContent>
                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={16} />
            </CardContent>
            {showActions && (
                <CardActions>
                    <Skeleton variant="rectangular" width={80} height={36} />
                </CardActions>
            )}
        </Card>
    );
};

