'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { changeRequestsService } from '@/services/changeRequestsService';
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
    TablePagination,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
} from '@mui/material';
import { useEffect } from 'react';

export default function ChangeRequestsPage() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [user, setUser] = useState<any>(null);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [tabValue, setTabValue] = useState(0); // 0 = Employee, 1 = Organization
    const queryClient = useQueryClient();

    useEffect(() => {
        setUser(authService.getStoredUser());
    }, []);

    // Employee Requests Query
    const { data: empData, isLoading: empLoading } = useQuery({
        queryKey: ['change-requests', page + 1, rowsPerPage, statusFilter],
        queryFn: () => changeRequestsService.getAllChangeRequests(page + 1, rowsPerPage, statusFilter || undefined),
        enabled: tabValue === 0,
    });

    // Organization Requests Query
    const { data: orgData, isLoading: orgLoading } = useQuery({
        queryKey: ['org-change-requests', page + 1, rowsPerPage, statusFilter],
        queryFn: () => changeRequestsService.getAllOrgChangeRequests(page + 1, rowsPerPage, statusFilter || undefined),
        enabled: tabValue === 1,
    });

    const data = tabValue === 0 ? empData : orgData;
    const isLoading = tabValue === 0 ? empLoading : orgLoading;

    // Employee Mutations
    const approveEmpMutation = useMutation({
        mutationFn: (requestId: string) => changeRequestsService.approveChangeRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['change-requests'] });
            setOpenDialog(false);
            setSelectedRequest(null);
        },
    });

    const rejectEmpMutation = useMutation({
        mutationFn: (requestId: string) => changeRequestsService.rejectChangeRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['change-requests'] });
            setOpenDialog(false);
            setSelectedRequest(null);
        },
    });

    // Organization Mutations
    const approveOrgMutation = useMutation({
        mutationFn: (requestId: string) => changeRequestsService.approveOrgChangeRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['org-change-requests'] });
            setOpenDialog(false);
            setSelectedRequest(null);
        },
    });

    const rejectOrgMutation = useMutation({
        mutationFn: (requestId: string) => changeRequestsService.rejectOrgChangeRequest(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['org-change-requests'] });
            setOpenDialog(false);
            setSelectedRequest(null);
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
        const colors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
            APPROVED: 'success',
            REJECTED: 'error',
            PENDING: 'warning',
            SUBMITTED: 'warning',
        };
        return colors[status] || 'default';
    };

    const handleApprove = (request: any) => {
        setSelectedRequest(request);
        setActionType('approve');
        setOpenDialog(true);
    };

    const handleReject = (request: any) => {
        setSelectedRequest(request);
        setActionType('reject');
        setOpenDialog(true);
    };

    const confirmAction = () => {
        if (!selectedRequest) return;

        if (tabValue === 0) {
            if (actionType === 'approve') approveEmpMutation.mutate(selectedRequest._id);
            else rejectEmpMutation.mutate(selectedRequest._id);
        } else {
            if (actionType === 'approve') approveOrgMutation.mutate(selectedRequest._id);
            else rejectOrgMutation.mutate(selectedRequest._id);
        }
    };

    const isHRAdminOrManager = user?.role === 'HR Admin' || user?.role === 'HR Manager';

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Change Requests
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e: React.SyntheticEvent, v: number) => { setTabValue(v); setPage(0); }}>
                    <Tab label="Employee Profile Requests" />
                    <Tab label="Organization Requests" />
                </Tabs>
            </Box>

            <Paper sx={{ mb: 2, p: 2 }}>
                <FormControl fullWidth>
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Filter by Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="SUBMITTED">Submitted</MenuItem>
                        <MenuItem value="APPROVED">Approved</MenuItem>
                        <MenuItem value="REJECTED">Rejected</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Requester</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date Created</TableCell>
                            {isHRAdminOrManager && <TableCell align="right">Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={isHRAdminOrManager ? 6 : 5} align="center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : data?.data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isHRAdminOrManager ? 6 : 5} align="center">
                                    No change requests found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data?.map((request: any) => (
                                <TableRow key={request._id} hover>
                                    <TableCell>
                                        {tabValue === 0 ? (
                                            request.employeeProfileId?.fullName || 'N/A'
                                        ) : (
                                            request.requestedByEmployeeId?.fullName || 'N/A'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {tabValue === 0 ? 'Profile Update' : request.requestType || 'Org Change'}
                                    </TableCell>
                                    <TableCell>
                                        {tabValue === 0 ? request.requestDescription : (
                                            <Box>
                                                <Typography variant="body2">{request.reason}</Typography>
                                                {request.details && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {JSON.stringify(request.details)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={request.status}
                                            color={getStatusColor(request.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(request.submittedAt || request.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    {isHRAdminOrManager && (
                                        <TableCell align="right">
                                            {(request.status === 'PENDING' || request.status === 'SUBMITTED') ? (
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        onClick={() => handleApprove(request)}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => handleReject(request)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="textSecondary">
                                                    {request.status}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    )}
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

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>
                    {actionType === 'approve' ? 'Approve Change Request' : 'Reject Change Request'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {actionType} this request?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color={actionType === 'approve' ? 'success' : 'error'}
                        onClick={confirmAction}
                    >
                        {actionType === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}
