'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { Add, Edit, Visibility } from '@mui/icons-material';
import Link from 'next/link';

export default function EmployeesPage() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['employees', page + 1, rowsPerPage, search, status],
        queryFn: () => employeeService.getAll(page + 1, rowsPerPage, search, status),
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
            ACTIVE: 'success',
            SUSPENDED: 'warning',
            TERMINATED: 'error',
            RETIRED: 'default',
        };
        return colors[status] || 'default';
    };

    if (error) {
        return (
            <Box>
                <Typography color="error">Error loading employees</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Employees</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    href="/dashboard/employees/create"
                >
                    Add Employee
                </Button>
            </Box>

            <Paper sx={{ mb: 2, p: 2 }}>
                <Box display="flex" gap={2}>
                    <TextField
                        label="Search"
                        variant="outlined"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or employee number"
                        sx={{ flexGrow: 1 }}
                    />
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            label="Status"
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="SUSPENDED">Suspended</MenuItem>
                            <MenuItem value="TERMINATED">Terminated</MenuItem>
                            <MenuItem value="RETIRED">Retired</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee #</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date of Hire</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : data?.data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No employees found
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data?.map((employee: any) => (
                                <TableRow key={employee._id} hover>
                                    <TableCell>{employee.employeeNumber}</TableCell>
                                    <TableCell>{employee.fullName}</TableCell>
                                    <TableCell>{employee.workEmail}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={employee.status}
                                            color={getStatusColor(employee.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(employee.dateOfHire).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            component={Link}
                                            href={`/dashboard/employees/${employee._id}`}
                                            size="small"
                                        >
                                            <Visibility />
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            href={`/dashboard/employees/${employee._id}/edit`}
                                            size="small"
                                        >
                                            <Edit />
                                        </IconButton>
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
        </Box>
    );
}
