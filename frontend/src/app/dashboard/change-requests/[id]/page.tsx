'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { changeRequestsService } from '@/services/changeRequestsService';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Chip,
    Divider,
    Button,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

export default function ChangeRequestDetailPage() {
    const params = useParams();
    const requestId = params.id as string;

    const { data: request, isLoading, error } = useQuery({
        queryKey: ['change-request', requestId],
        queryFn: () => changeRequestsService.getChangeRequestById(requestId),
        enabled: !!requestId,
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Typography color="error">Error loading change request</Typography>
            </Box>
        );
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
            APPROVED: 'success',
            REJECTED: 'error',
            PENDING: 'warning',
        };
        return colors[status] || 'default';
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <Button
                    component={Link}
                    href="/dashboard/change-requests"
                    startIcon={<ArrowBack />}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4">Change Request Details</Typography>
            </Box>

            <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Request Information
                        </Typography>
                    </Box>
                    <Chip
                        label={request?.status}
                        color={getStatusColor(request?.status || '')}
                        size="medium"
                    />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box mb={3}>
                    <Typography variant="caption" color="text.secondary">Employee</Typography>
                    <Typography variant="body1" fontWeight="bold">
                        {typeof request?.employeeProfileId === 'object' ? request.employeeProfileId.fullName : 'N/A'}
                    </Typography>
                </Box>

                <Box mb={3}>
                    <Typography variant="caption" color="text.secondary">Employee Number</Typography>
                    <Typography variant="body1">
                        {typeof request?.employeeProfileId === 'object' ? request.employeeProfileId.employeeNumber : 'N/A'}
                    </Typography>
                </Box>

                <Box mb={3}>
                    <Typography variant="caption" color="text.secondary">Request Description</Typography>
                    <Typography variant="body1">
                        {request?.requestDescription || 'N/A'}
                    </Typography>
                </Box>

                {request?.reason && (
                    <Box mb={3}>
                        <Typography variant="caption" color="text.secondary">Reason</Typography>
                        <Typography variant="body1">
                            {request.reason}
                        </Typography>
                    </Box>
                )}

                <Box mb={3}>
                    <Typography variant="caption" color="text.secondary">Created At</Typography>
                    <Typography variant="body1">
                        {request?.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}
                    </Typography>
                </Box>

                <Box mb={3}>
                    <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body1">
                        {request?.updatedAt ? new Date(request.updatedAt).toLocaleString() : 'N/A'}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
