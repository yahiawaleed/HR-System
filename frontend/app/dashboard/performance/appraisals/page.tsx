'use client';

import { useQuery } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
import { authService } from '@/services/authService';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    CircularProgress,
} from '@mui/material';
import { Visibility, PlayArrow } from '@mui/icons-material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MyAppraisalsPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setUser(authService.getStoredUser());
    }, []);

    const { data: appraisals, isLoading } = useQuery({
        queryKey: ['my-appraisals', user?.userId],
        queryFn: () => performanceService.getMyAppraisals(user.userId),
        enabled: !!user?.userId,
    });

    if (isLoading || !user) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                My Appraisals
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
                View and complete your performance appraisals.
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Cycle</TableCell>
                            <TableCell>Template</TableCell>
                            <TableCell>Manager</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {appraisals?.map((appraisal) => (
                            <TableRow key={appraisal._id}>
                                <TableCell>
                                    {appraisal.cycleId && typeof appraisal.cycleId === 'object' ? (appraisal.cycleId as any).name : 'Unknown Cycle'}
                                </TableCell>
                                <TableCell>
                                    {appraisal.templateId && typeof appraisal.templateId === 'object' ? (appraisal.templateId as any).name : 'Unknown Template'}
                                </TableCell>
                                <TableCell>
                                    {appraisal.managerProfileId && typeof appraisal.managerProfileId === 'object'
                                        ? (appraisal.managerProfileId as any).fullName
                                        : 'Unknown Manager'}
                                </TableCell>
                                <TableCell>
                                    {appraisal.dueDate ? new Date(appraisal.dueDate).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={appraisal.status.replace('_', ' ')}
                                        color={
                                            appraisal.status === 'PUBLISHED'
                                                ? 'success'
                                                : appraisal.status === 'IN_PROGRESS'
                                                    ? 'warning'
                                                    : appraisal.status === 'SUBMITTED'
                                                        ? 'info'
                                                        : 'default'
                                        }
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant={appraisal.status === 'NOT_STARTED' || appraisal.status === 'IN_PROGRESS' ? 'contained' : 'outlined'}
                                        size="small"
                                        startIcon={
                                            appraisal.status === 'NOT_STARTED' || appraisal.status === 'IN_PROGRESS' ? (
                                                <PlayArrow />
                                            ) : (
                                                <Visibility />
                                            )
                                        }
                                        component={Link}
                                        href={`/dashboard/performance/appraisals/${appraisal._id}`}
                                    >
                                        {appraisal.status === 'NOT_STARTED' || appraisal.status === 'IN_PROGRESS'
                                            ? 'Start / Continue'
                                            : 'View'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {appraisals?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No appraisals found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
