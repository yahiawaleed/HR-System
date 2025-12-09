'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatesService, ConvertCandidateData } from '@/services/candidatesService';
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
    TablePagination,
    TextField,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import { Add, PersonAdd, Edit, Visibility } from '@mui/icons-material';
import Link from 'next/link';

export default function CandidatesPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [convertDialog, setConvertDialog] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [convertData, setConvertData] = useState<ConvertCandidateData>({
        employeeNumber: '',
        workEmail: '',
        password: '',
        primaryPositionId: '',
        primaryDepartmentId: '',
        payGradeId: '',
    });
    const [statusDialog, setStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['candidates', page + 1, rowsPerPage, search],
        queryFn: () => candidatesService.getAllCandidates(page + 1, rowsPerPage, search),
    });

    const convertMutation = useMutation({
        mutationFn: (data: { id: string; formData: ConvertCandidateData }) =>
            candidatesService.convertToEmployee(data.id, data.formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            setConvertDialog(false);
            setConvertData({
                employeeNumber: '',
                workEmail: '',
                password: '',
                primaryPositionId: '',
                primaryDepartmentId: '',
                payGradeId: '',
            });
        },
    });

    const statusMutation = useMutation({
        mutationFn: (data: { id: string; status: string }) =>
            candidatesService.updateStatus(data.id, data.status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            setStatusDialog(false);
        },
    });

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
            APPLIED: 'info',
            SCREENING: 'warning',
            INTERVIEW: 'warning',
            OFFER_SENT: 'success',
            OFFER_ACCEPTED: 'success',
            HIRED: 'success',
            REJECTED: 'error',
            WITHDRAWN: 'default',
        };
        return colors[status] || 'default';
    };

    const handleConvert = () => {
        if (selectedCandidate) {
            convertMutation.mutate({ id: selectedCandidate._id, formData: convertData });
        }
    };

    const handleStatusUpdate = () => {
        if (selectedCandidate && newStatus) {
            statusMutation.mutate({ id: selectedCandidate._id, status: newStatus });
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Candidates</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    href="/dashboard/candidates/create"
                >
                    Add Candidate
                </Button>
            </Box>

            <Paper sx={{ mb: 2, p: 2 }}>
                <TextField
                    fullWidth
                    label="Search"
                    variant="outlined"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email"
                />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Position</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Applied Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : data?.data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No candidates found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data?.map((candidate: any) => (
                                <TableRow key={candidate._id} hover>
                                    <TableCell>{candidate.fullName}</TableCell>
                                    <TableCell>{candidate.email}</TableCell>
                                    <TableCell>{candidate.phone}</TableCell>
                                    <TableCell>{candidate.appliedPosition}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={candidate.status}
                                            color={getStatusColor(candidate.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(candidate.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            component={Link}
                                            href={`/dashboard/candidates/${candidate._id}`}
                                            title="View Details"
                                        >
                                            <Visibility />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setSelectedCandidate(candidate);
                                                setNewStatus(candidate.status || '');
                                                setStatusDialog(true);
                                            }}
                                            title="Edit Status"
                                        >
                                            <Edit />
                                        </IconButton>
                                        {candidate.status === 'OFFER_ACCEPTED' && (
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setSelectedCandidate(candidate);
                                                    setConvertDialog(true);
                                                }}
                                            >
                                                <PersonAdd />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data?.total || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Convert to Employee Dialog */}
            <Dialog open={convertDialog} onClose={() => setConvertDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Convert Candidate to Employee</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Converting: {selectedCandidate?.fullName}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                label="Employee Number"
                                value={convertData.employeeNumber}
                                onChange={(e) => setConvertData(prev => ({ ...prev, employeeNumber: e.target.value }))}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                type="email"
                                label="Work Email"
                                value={convertData.workEmail}
                                onChange={(e) => setConvertData(prev => ({ ...prev, workEmail: e.target.value }))}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                required
                                type="password"
                                label="Initial Password"
                                value={convertData.password}
                                onChange={(e) => setConvertData(prev => ({ ...prev, password: e.target.value }))}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Position ID"
                                value={convertData.primaryPositionId}
                                onChange={(e) => setConvertData(prev => ({ ...prev, primaryPositionId: e.target.value }))}
                                helperText="Optional"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Department ID"
                                value={convertData.primaryDepartmentId}
                                onChange={(e) => setConvertData(prev => ({ ...prev, primaryDepartmentId: e.target.value }))}
                                helperText="Optional"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Pay Grade ID"
                                value={convertData.payGradeId}
                                onChange={(e) => setConvertData(prev => ({ ...prev, payGradeId: e.target.value }))}
                                helperText="Optional"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConvertDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleConvert}
                        variant="contained"
                        disabled={convertMutation.isPending}
                    >
                        {convertMutation.isPending ? 'Converting...' : 'Convert to Employee'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog open={statusDialog} onClose={() => setStatusDialog(false)}>
                <DialogTitle>Update Candidate Status</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={newStatus}
                            label="Status"
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <MenuItem value="APPLIED">Applied</MenuItem>
                            <MenuItem value="SCREENING">Screening</MenuItem>
                            <MenuItem value="INTERVIEW">Interview</MenuItem>
                            <MenuItem value="OFFER_SENT">Offer Sent</MenuItem>
                            <MenuItem value="OFFER_ACCEPTED">Offer Accepted</MenuItem>
                            <MenuItem value="HIRED">Hired</MenuItem>
                            <MenuItem value="REJECTED">Rejected</MenuItem>
                            <MenuItem value="WITHDRAWN">Withdrawn</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleStatusUpdate}
                        variant="contained"
                        disabled={statusMutation.isPending}
                    >
                        {statusMutation.isPending ? 'Updating...' : 'Update Status'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
