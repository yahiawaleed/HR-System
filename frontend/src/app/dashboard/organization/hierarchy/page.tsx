'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Card,
    CardContent,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    ExpandMore,
    Business,
    Work,
    Person,
    AccountTree,
    Group,
} from '@mui/icons-material';
import api from '@/services/api';
import dynamic from 'next/dynamic';
import { employeeService } from '@/services/employeeService';

// Dynamically import OrgChart to avoid SSR issues with ReactFlow
const OrgChart = dynamic(
    () => import('@/components/Organization/OrgChart'),
    { ssr: false, loading: () => <CircularProgress /> }
);

interface Position {
    _id: string;
    title: string;
    level: number;
    status: string;
    reportsTo?: string;
}

interface Position {
    _id: string;
    title: string;
    level: number;
    isActive: boolean;
    reportsTo?: string;
}

interface Department {
    _id: string;
    name: string;
    code: string;
    isActive: boolean;
    headOfDepartment?: {
        fullName: string;
        employeeNumber: string;
    };
    positions?: Position[];
}

interface SystemRole {
    _id: string;
    employeeProfile: {
        _id: string;
        fullName: string;
        employeeNumber: string;
        workEmail: string;
    };
    systemRole: string;
    assignedAt: Date;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function HierarchyPage() {
    const [tabValue, setTabValue] = useState(0);
    const [expanded, setExpanded] = useState<string | false>(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const { data: departments, isLoading: deptLoading } = useQuery({
        queryKey: ['departments-hierarchy'],
        queryFn: async () => {
            const response = await api.get('/api/organization-structure/departments');
            return response.data as Department[];
        },
    });

    const { data: employees, isLoading: empLoading } = useQuery({
        queryKey: ['employees-for-chart'],
        queryFn: async () => {
            const response = await employeeService.getAll(1, 100);
            return response.data;
        },
    });

    const { data: systemRoles, isLoading: rolesLoading } = useQuery({
        queryKey: ['system-roles'],
        queryFn: async () => {
            const response = await api.get('/api/employee-profile/roles');
            return response.data as SystemRole[];
        },
    });

    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    // Group roles by type
    const roleGroups = systemRoles?.reduce((acc, role) => {
        const roleName = role.systemRole;
        if (!acc[roleName]) {
            acc[roleName] = [];
        }
        acc[roleName].push(role);
        return acc;
    }, {} as Record<string, SystemRole[]>);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Organization Hierarchy
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                View departments, positions, and system roles
            </Typography>

            <Paper sx={{ width: '100%' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="hierarchy tabs">
                    <Tab icon={<AccountTree />} iconPosition="start" label="Org Chart" />
                    <Tab icon={<Business />} iconPosition="start" label="Departments" />
                    <Tab icon={<Group />} iconPosition="start" label="System Roles" />
                </Tabs>

                {/* Org Chart Tab */}
                <TabPanel value={tabValue} index={0}>
                    {empLoading || rolesLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : employees && employees.length > 0 ? (
                        <>
                            <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                                <Typography variant="body2">
                                    Showing {employees.filter((emp: any) => emp.status === 'ACTIVE').length} employees in organizational chart
                                </Typography>
                            </Box>
                            <OrgChart employees={employees.filter((emp: any) => emp.status === 'ACTIVE').map((emp: any) => {
                                // Find the system role for this employee
                                const empRole = systemRoles?.find(
                                    (role: SystemRole) => role.employeeProfile._id === emp._id ||
                                        role.employeeProfile.employeeNumber === emp.employeeNumber
                                );
                                return {
                                    ...emp,
                                    systemRole: empRole?.systemRole || 'Employee'
                                };
                            })} />
                        </>
                    ) : (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                No employees found for org chart. Total employees: {employees?.length || 0}
                            </Typography>
                        </Paper>
                    )}
                </TabPanel>

                {/* Departments Tab */}
                <TabPanel value={tabValue} index={1}>
                    {deptLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {/* Overview Stats */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                                <Card sx={{ minWidth: 200, flex: '1 1 auto' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Business color="primary" />
                                            <Box>
                                                <Typography variant="h4">
                                                    {departments?.filter(d => d.isActive).length || 0}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Active Departments
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>

                            {/* Departments List */}
                            {departments?.map((dept) => (
                                <Accordion
                                    key={dept._id}
                                    expanded={expanded === dept._id}
                                    onChange={handleChange(dept._id)}
                                    sx={{ mb: 1 }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMore />}
                                        aria-controls={`${dept._id}-content`}
                                        id={`${dept._id}-header`}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                            <Business color="primary" />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6">{dept.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Code: {dept.code}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={dept.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                color={dept.isActive ? 'success' : 'default'}
                                                size="small"
                                            />
                                            {dept.headOfDepartment && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Person fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Head: {dept.headOfDepartment.fullName}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <DepartmentPositions departmentId={dept._id} />
                                    </AccordionDetails>
                                </Accordion>
                            ))}

                            {!departments || departments.length === 0 && (
                                <Paper sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        No departments found
                                    </Typography>
                                </Paper>
                            )}
                        </>
                    )}
                </TabPanel>

                {/* System Roles Tab */}
                <TabPanel value={tabValue} index={2}>
                    {rolesLoading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                                System Roles & Assignments
                            </Typography>

                            {roleGroups && Object.keys(roleGroups).map((roleName) => (
                                <Accordion key={roleName} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                            <AccountTree color="primary" />
                                            <Typography variant="h6">{roleName}</Typography>
                                            <Chip
                                                label={`${roleGroups[roleName].length} users`}
                                                color="primary"
                                                size="small"
                                            />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Employee Name</TableCell>
                                                        <TableCell>Employee Number</TableCell>
                                                        <TableCell>Email</TableCell>
                                                        <TableCell>Assigned Date</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {roleGroups[roleName].map((role) => (
                                                        <TableRow key={role._id}>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Person fontSize="small" color="action" />
                                                                    {role.employeeProfile.fullName}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>{role.employeeProfile.employeeNumber}</TableCell>
                                                            <TableCell>{role.employeeProfile.workEmail}</TableCell>
                                                            <TableCell>
                                                                {new Date(role.assignedAt).toLocaleDateString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </AccordionDetails>
                                </Accordion>
                            ))}

                            {!roleGroups || Object.keys(roleGroups).length === 0 && (
                                <Paper sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        No system roles assigned
                                    </Typography>
                                </Paper>
                            )}
                        </>
                    )}
                </TabPanel>
            </Paper>
        </Box>
    );
}

function DepartmentPositions({ departmentId }: { departmentId: string }) {
    const { data: positions, isLoading } = useQuery({
        queryKey: ['department-positions', departmentId],
        queryFn: async () => {
            const response = await api.get(`/api/organization-structure/departments/${departmentId}/positions`);
            return response.data as Position[];
        },
    });

    if (isLoading) {
        return <CircularProgress size={24} />;
    }

    if (!positions || positions.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                No positions in this department
            </Typography>
        );
    }

    return (
        <Box sx={{ pl: 4 }}>
            {positions.map((position) => (
                <Card key={position._id} sx={{ mb: 1, bgcolor: 'grey.50' }}>
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Work color="action" fontSize="small" />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" fontWeight="medium">
                                    {position.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Level: {position.level}
                                </Typography>
                            </Box>
                            <Chip
                                label={position.isActive ? 'ACTIVE' : 'INACTIVE'}
                                color={position.isActive ? 'success' : 'default'}
                                size="small"
                            />
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
