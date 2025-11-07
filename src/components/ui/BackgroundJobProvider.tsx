'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Box, LinearProgress, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export type BackgroundJob = {
    id: string;
    label: string;
    progress?: number; // 0-100, undefined means indeterminate
    createdAt: number;
};

type BackgroundJobsContextValue = {
    jobs: BackgroundJob[];
    startJob: (job: Omit<BackgroundJob, 'createdAt'>) => void;
    updateJob: (id: string, updates: Partial<BackgroundJob>) => void;
    finishJob: (id: string) => void;
};

const BackgroundJobsContext = createContext<BackgroundJobsContextValue | undefined>(undefined);

export function useBackgroundJobs(): BackgroundJobsContextValue {
    const ctx = useContext(BackgroundJobsContext);
    if (!ctx) throw new Error('useBackgroundJobs must be used within BackgroundJobProvider');
    return ctx;
}

export function BackgroundJobProvider({ children }: { children: React.ReactNode }) {
    const [jobs, setJobs] = useState<BackgroundJob[]>([]);

    const startJob: BackgroundJobsContextValue['startJob'] = useCallback((job) => {
        setJobs(prev => [{ ...job, createdAt: Date.now() }, ...prev]);
    }, []);

    const updateJob: BackgroundJobsContextValue['updateJob'] = useCallback((id, updates) => {
        setJobs(prev => prev.map(j => (j.id === id ? { ...j, ...updates } : j)));
    }, []);

    const finishJob: BackgroundJobsContextValue['finishJob'] = useCallback((id) => {
        setJobs(prev => prev.filter(j => j.id !== id));
    }, []);

    const value = useMemo<BackgroundJobsContextValue>(() => ({ jobs, startJob, updateJob, finishJob }), [jobs, startJob, updateJob, finishJob]);

    return (
        <BackgroundJobsContext.Provider value={value}>
            {children}
            <JobTray jobs={jobs} onDismiss={finishJob} />
        </BackgroundJobsContext.Provider>
    );
}

function JobTray({ jobs, onDismiss }: { jobs: BackgroundJob[]; onDismiss: (id: string) => void }) {
    if (jobs.length === 0) return null;

    return (
        <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: (t) => t.zIndex.snackbar + 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {jobs.slice(0, 3).map((job) => (
                <Paper key={job.id} elevation={3} sx={{ p: 1.5, minWidth: 260, maxWidth: 340 }} aria-live="polite">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600} noWrap title={job.label}>
                            {job.label}
                        </Typography>
                        <Tooltip title="Kapat">
                            <IconButton size="small" onClick={() => onDismiss(job.id)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <LinearProgress variant={typeof job.progress === 'number' ? 'determinate' : 'indeterminate'} value={job.progress} sx={{ height: 4, borderRadius: 2 }} />
                </Paper>
            ))}
        </Box>
    );
}

