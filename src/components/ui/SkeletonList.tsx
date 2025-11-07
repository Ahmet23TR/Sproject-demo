'use client';

import React from 'react';
import { Skeleton, Box, Card, CardContent } from '@mui/material';

export interface SkeletonListProps {
    count?: number;
    variant?: 'list' | 'grid' | 'table';
    columns?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
    count = 6,
    variant = 'list',
    columns = 3,
}) => {
    const skeletons = Array.from({ length: count }, (_, index) => index);

    if (variant === 'grid') {
        return (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: `repeat(${columns}, 1fr)` }, gap: 2 }}>
                {skeletons.map((index) => (
                    <Card key={index}>
                        <CardContent>
                            <Skeleton variant="rectangular" height={140} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="80%" height={20} />
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    }

    if (variant === 'table') {
        return (
            <Box>
                {skeletons.map((index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                        <Skeleton variant="rectangular" height={56} />
                    </Box>
                ))}
            </Box>
        );
    }

    // Default list variant
    return (
        <Box>
            {skeletons.map((index) => (
                <Box key={index} sx={{ mb: 2 }}>
                    <Skeleton variant="rectangular" height={80} />
                </Box>
            ))}
        </Box>
    );
};
