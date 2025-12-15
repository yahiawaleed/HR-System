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
    Avatar,
} from '@mui/material';
import { Visibility, RateReview } from '@mui/icons-material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TeamAppraisalsPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setUser(authService.getStoredUser());
    }, []);

    const { data: appraisals, isLoading } = useQuery({
        queryKey: ['team-appraisals', user?.userId],
        queryFn: () => performanceService.getMyTeamAppraisals(user.userId),
        enabled: !!user?.userId,
    });

    if (isLoading || !user) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Team Appraisals
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
                Manage performance reviews for your team members.
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee</TableCell>
                            <TableCell>Cycle</TableCell>
                            <TableCell>Template</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {appraisals?.map((appraisal) => (
                            <TableRow key={appraisal._id}>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar
                                            src={(appraisal.employeeProfileId as any).profilePictureUrl}
                                            alt={(appraisal.employeeProfileId as any).fullName}
                                        />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                                {(appraisal.employeeProfileId as any).fullName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {(appraisal.employeeProfileId as any).employeeNumber}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {typeof appraisal.cycleId === 'object' ? (appraisal.cycleId as any).name : 'Unknown Cycle'}
                                </TableCell>
                                <TableCell>
                                    {typeof appraisal.templateId === 'object' ? (appraisal.templateId as any).name : 'Unknown Template'}
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
                                                : appraisal.status === 'SUBMITTED'
                                                    ? 'info'
                                                    : appraisal.status === 'IN_PROGRESS'
                                                        ? 'warning'
                                                        : 'default'
                                        }
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant={appraisal.status === 'SUBMITTED' ? 'contained' : 'outlined'}
                                        size="small"
                                        startIcon={
                                            appraisal.status === 'SUBMITTED' ? (
                                                <RateReview />
                                            ) : (
                                                <Visibility />
                                            )
                                        }
                                        component={Link}
                                        href={`/dashboard/performance/appraisals/${appraisal._id}`}
                                    >
                                        {appraisal.status === 'SUBMITTED' ? 'Review' : 'View'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {appraisals?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No team appraisals found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
