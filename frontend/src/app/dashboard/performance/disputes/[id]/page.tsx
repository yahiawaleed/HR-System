'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Chip,
    Divider,
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel } from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DisputeDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [resolutionSummary, setResolutionSummary] = useState('');
    const [resolutionStatus, setResolutionStatus] = useState('ADJUSTED');
    const [error, setError] = useState('');

    const { data: dispute, isLoading } = useQuery({
        queryKey: ['dispute', id],
        queryFn: () => performanceService.getDisputeById(id),
    });

    const resolveMutation = useMutation({
        mutationFn: (data: any) => performanceService.resolveDispute(id, user!.userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disputes'] });
            queryClient.invalidateQueries({ queryKey: ['dispute', id] });
            alert('Dispute resolved successfully!');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to resolve dispute');
        },
    });

    const handleResolve = () => {
        if (!resolutionSummary) {
            setError('Please provide a resolution summary');
            return;
        }
        resolveMutation.mutate({
            resolutionSummary,
            status: resolutionStatus,
        });
    };

    if (isLoading) return <CircularProgress />;
    if (!dispute) return <Alert severity="error">Dispute not found</Alert>;

    const isHR = user?.role === 'HR Manager' || user?.role === 'Admin';
    const canResolve = isHR && dispute.status === 'OPEN';

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <Button
                    component={Link}
                    href="/dashboard/performance/disputes"
                    startIcon={<ArrowBack />}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4">Dispute Details</Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Employee
                        </Typography>
                        <Typography variant="h6">
                            {dispute.raisedByEmployeeId?.firstName} {dispute.raisedByEmployeeId?.lastName}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Status
                        </Typography>
                        <Chip
                            label={dispute.status}
                            color={dispute.status === 'OPEN' ? 'warning' : dispute.status === 'REJECTED' ? 'error' : 'success'}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Reason
                        </Typography>
                        <Typography variant="body1">{dispute.reason}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Description
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {dispute.description}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Raised At
                        </Typography>
                        <Typography variant="body1">
                            {new Date(dispute.createdAt).toLocaleString()}
                        </Typography>
                    </Grid>
                </Grid>

                {dispute.status !== 'OPEN' && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" gutterBottom>
                            Resolution
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Resolution Summary
                                </Typography>
                                <Typography variant="body1">{dispute.resolutionSummary}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Resolved By
                                </Typography>
                                <Typography variant="body1">
                                    {dispute.resolvedByEmployeeId?.firstName} {dispute.resolvedByEmployeeId?.lastName}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Resolved At
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(dispute.resolvedAt).toLocaleString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Paper>

            {canResolve && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Resolve Dispute
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Resolution Summary"
                                value={resolutionSummary}
                                onChange={(e) => setResolutionSummary(e.target.value)}
                                placeholder="Explain how the dispute was resolved..."
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Resolution Status</InputLabel>
                                <Select
                                    value={resolutionStatus}
                                    label="Resolution Status"
                                    onChange={(e) => setResolutionStatus(e.target.value)}
                                >
                                    <MenuItem value="ADJUSTED">Adjusted (Update Appraisal)</MenuItem>
                                    <MenuItem value="REJECTED">Rejected (Keep Original)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<CheckCircle />}
                                onClick={handleResolve}
                                disabled={resolveMutation.isPending}
                            >
                                {resolveMutation.isPending ? 'Resolving...' : 'Submit Resolution'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Box>
    );
}
