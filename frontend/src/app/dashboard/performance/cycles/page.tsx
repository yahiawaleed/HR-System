'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';

export default function CyclesPage() {
    const queryClient = useQueryClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

    const { data: cycles, isLoading } = useQuery({
        queryKey: ['cycles'],
        queryFn: performanceService.getAllCycles,
    });

    const deleteMutation = useMutation({
        // Note: Delete cycle endpoint might not exist in controller, checking service...
        // Assuming it doesn't exist based on previous file read, but let's check if I missed it.
        // Actually, I didn't see a deleteCycle in the controller.
        // I'll skip delete for now or implement it if needed.
        // Wait, I should check if I added deleteCycle to performanceService.
        // I didn't add deleteCycle to performanceService because it wasn't in the controller.
        // So I can't implement delete here yet.
        mutationFn: async () => { },
    });

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Appraisal Cycles</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        component={Link}
                        href="/dashboard/performance/assignments/new"
                        sx={{ mr: 2 }}
                    >
                        Assign Appraisal
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        component={Link}
                        href="/dashboard/performance/cycles/create"
                    >
                        Create Cycle
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cycles?.map((cycle) => (
                            <TableRow key={cycle._id}>
                                <TableCell>{cycle.name}</TableCell>
                                <TableCell>{new Date(cycle.startDate).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(cycle.endDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={cycle.status}
                                        color={
                                            cycle.status === 'ACTIVE'
                                                ? 'success'
                                                : cycle.status === 'UPCOMING'
                                                    ? 'info'
                                                    : 'default'
                                        }
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        component={Link}
                                        href={`/dashboard/performance/cycles/${cycle._id}/edit`}
                                        color="primary"
                                    >
                                        <Edit />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {cycles?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No appraisal cycles found. Create one to start an appraisal period.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
