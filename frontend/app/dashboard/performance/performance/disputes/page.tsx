'use client';

import { useQuery } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
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
    Chip,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DisputesPage() {
    const { user } = useAuth();
    const { data: disputes, isLoading, error } = useQuery({
        queryKey: ['disputes'],
        queryFn: performanceService.getAllDisputes,
    });

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">Failed to load disputes</Alert>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'warning';
            case 'RESOLVED':
            case 'ADJUSTED':
                return 'success';
            case 'REJECTED':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Appraisal Disputes
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee</TableCell>
                            <TableCell>Reason</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Raised At</TableCell>
                            <TableCell>Resolved By</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {disputes?.map((dispute: any) => (
                            <TableRow key={dispute._id}>
                                <TableCell>
                                    {dispute.raisedByEmployeeId?.firstName} {dispute.raisedByEmployeeId?.lastName}
                                </TableCell>
                                <TableCell>{dispute.reason}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={dispute.status}
                                        color={getStatusColor(dispute.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(dispute.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {dispute.resolvedByEmployeeId
                                        ? `${dispute.resolvedByEmployeeId.firstName} ${dispute.resolvedByEmployeeId.lastName}`
                                        : '-'}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        component={Link}
                                        href={`/dashboard/performance/disputes/${dispute._id}`}
                                        startIcon={<Visibility />}
                                        size="small"
                                    >
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {disputes?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No disputes found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
