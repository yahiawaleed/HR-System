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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
} from '@mui/material';
import { Visibility, Download } from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';

export default function ReportsPage() {
    const [selectedCycleId, setSelectedCycleId] = useState('');

    const { data: cycles, isLoading: cyclesLoading } = useQuery({
        queryKey: ['cycles'],
        queryFn: performanceService.getAllCycles,
    });

    const { data: report, isLoading: reportLoading } = useQuery({
        queryKey: ['report', selectedCycleId],
        queryFn: () => performanceService.getCycleReport(selectedCycleId),
        enabled: !!selectedCycleId,
    });

    if (cyclesLoading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Performance Reports
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Select Cycle</InputLabel>
                            <Select
                                value={selectedCycleId}
                                label="Select Cycle"
                                onChange={(e) => setSelectedCycleId(e.target.value)}
                            >
                                {cycles?.map((cycle) => (
                                    <MenuItem key={cycle._id} value={cycle._id}>
                                        {cycle.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {reportLoading && <CircularProgress />}

            {report && (
                <>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Cycle Summary
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Total Assignments
                                </Typography>
                                <Typography variant="h4">{report.totalAssignments}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Completed
                                </Typography>
                                <Typography variant="h4">{report.totalCompleted}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Completion Rate
                                </Typography>
                                <Typography variant="h4">
                                    {report.totalAssignments > 0
                                        ? ((report.totalCompleted / report.totalAssignments) * 100).toFixed(1)
                                        : 0}
                                    %
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Score</TableCell>
                                    <TableCell>Rating</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {report.assignments?.map((assignment: any) => {
                                    const record = report.records?.find(
                                        (r: any) => r.assignmentId === assignment._id
                                    );
                                    return (
                                        <TableRow key={assignment._id}>
                                            <TableCell>
                                                {assignment.employeeProfileId?.firstName} {assignment.employeeProfileId?.lastName}
                                            </TableCell>
                                            <TableCell>
                                                {assignment.departmentId?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={assignment.status}
                                                    color={
                                                        assignment.status === 'PUBLISHED' || assignment.status === 'ACKNOWLEDGED'
                                                            ? 'success'
                                                            : 'default'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{record?.totalScore || '-'}</TableCell>
                                            <TableCell>
                                                {record?.overallRatingLabel ? (
                                                    <Chip
                                                        label={record.overallRatingLabel}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    component={Link}
                                                    href={`/dashboard/performance/appraisals/${assignment._id}`}
                                                    startIcon={<Visibility />}
                                                    size="small"
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );
}
