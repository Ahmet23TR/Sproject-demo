'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { LoadingButton } from './LoadingButton';
import { useBackgroundJobs } from './BackgroundJobProvider';
import { v4 as uuidv4 } from 'uuid';

export const BackgroundJobExample: React.FC = () => {
    const { startJob, updateJob, finishJob } = useBackgroundJobs();

    const handleExportData = async () => {
        const jobId = uuidv4();

        // Start the background job
        startJob({
            id: jobId,
            label: 'Exporting data...',
            progress: 0
        });

        // Simulate a long-running export process
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay

            updateJob(jobId, {
                progress: i,
                label: `Exporting data... ${i}%`
            });
        }

        // Finish the job
        finishJob(jobId);
    };

    const handleIndeterminateJob = async () => {
        const jobId = uuidv4();

        startJob({
            id: jobId,
            label: 'Server synchronization in progress...'
            // No progress = indeterminate
        });

        // Simulate an indeterminate process
        await new Promise(resolve => setTimeout(resolve, 3000));

        finishJob(jobId);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
                Background Job Examples
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <LoadingButton
                    variant="contained"
                    onClick={handleExportData}
                >
                    Export Data (Progress)
                </LoadingButton>

                <LoadingButton
                    variant="outlined"
                    onClick={handleIndeterminateJob}
                >
                    Synchronize (Indeterminate)
                </LoadingButton>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                When you click these buttons, the background job indicators will appear in the bottom right.
            </Typography>
        </Box>
    );
};
