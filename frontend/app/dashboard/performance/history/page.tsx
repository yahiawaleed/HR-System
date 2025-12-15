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

export default function HistoryPage() {
    const { user } = useAuth();
    const { data: history, isLoading, error } = useQuery({
        queryKey: ['history', user?.userId],
        queryFn: () => performanceService.getMyHistory(user!.userId),
        enabled: !!user?.userId,
    });

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">Failed to load history</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                My Appraisal History
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Summary
                </Typography>
                <Typography variant="body1">
                    Total Appraisals: <strong>{history?.totalAppraisals || 0}</strong>
                </Typography>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Cycle</TableCell>
                            <TableCell>Template</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Score</TableCell>
                            <TableCell>Rating</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {history?.appraisals?.map((record: any) => (
                            <TableRow key={record._id}>
                                <TableCell>{record.cycleId?.name}</TableCell>
                                <TableCell>{record.templateId?.name}</TableCell>
                                <TableCell>
                                    {new Date(record.hrPublishedAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{record.totalScore}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={record.overallRatingLabel}
                                        color="primary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        component={Link}
                                        href={`/dashboard/performance/appraisals/${record.assignmentId}`}
                                        startIcon={<Visibility />}
                                        size="small"
                                    >
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {history?.appraisals?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No history found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
