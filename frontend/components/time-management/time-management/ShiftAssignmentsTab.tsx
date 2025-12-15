'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/services/api';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Plus, Edit, Trash2, Users, User, Building2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface ShiftAssignment {
  _id: string;
  employeeId?: { _id: string; firstName: string; lastName: string; employeeNumber: string };
  departmentId?: { _id: string; name: string };
  positionId?: { _id: string; title: string };
  shiftTypeId?: { _id: string; name: string };
  shiftId?: { _id: string; name: string };
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'CANCELLED' | 'EXPIRED';
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
}

interface ShiftType {
  _id: string;
  name: string;
}

export default function ShiftAssignmentsTab() {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ShiftAssignment | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [formData, setFormData] = useState({
    employeeId: '',
    shiftTypeId: '',
    startDate: '',
    endDate: '',
    status: 'PENDING' as 'PENDING' | 'APPROVED',
  });

  // Role-based permissions - matches backend controller @Roles decorators
  const isSystemAdmin = userRole === 'System Admin';
  const isHRAdmin = userRole === 'HR Admin';
  const isHRManager = userRole === 'HR Manager';
  const isAdmin = isSystemAdmin || isHRAdmin;
  const isManager = ['Department Head', 'Line Manager'].includes(userRole);
  const isEmployee = !isAdmin && !isHRManager && !isManager;

  // Who can do what - based on backend controller
  const canCreate = isAdmin || isHRManager; // POST: SYSTEM_ADMIN, HR_ADMIN, HR_MANAGER
  const canEdit = isAdmin || isHRManager; // PATCH: SYSTEM_ADMIN, HR_ADMIN, HR_MANAGER
  const canDelete = isAdmin; // DELETE: SYSTEM_ADMIN, HR_ADMIN only
  const canChangeStatus = isAdmin || isHRManager; // PATCH status: SYSTEM_ADMIN, HR_ADMIN, HR_MANAGER

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.userId) setUserId(user.userId);
        if (user.role) setUserRole(user.role);
      } catch (e) {
        console.error('Error parsing user from localStorage');
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [assignmentsRes, employeesRes, shiftTypesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/time-management/shifts`, { headers }),
        fetch(`${API_BASE_URL}/api/employee-profile`, { headers }),
        fetch(`${API_BASE_URL}/time-management/shift-types`, { headers }),
      ]);

      if (!assignmentsRes.ok || !employeesRes.ok || !shiftTypesRes.ok) {
        throw new Error('Failed to fetch required data');
      }

      const assignmentsData = await assignmentsRes.json();
      const employeesData = await employeesRes.json();
      const shiftTypesData = await shiftTypesRes.json();

      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      // Handle paginated response - employees come as { data: [...], page, limit, total }
      const employeesList = employeesData?.data || (Array.isArray(employeesData) ? employeesData : []);
      setEmployees(employeesList);
      setShiftTypes(Array.isArray(shiftTypesData) ? shiftTypesData : []);
    } catch (error: any) {
      console.error('Fetch data error:', error);
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    if (!formData.shiftTypeId) {
      toast.error('Please select a shift type');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Start date and end date are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const payload = {
        employeeId: formData.employeeId,
        shiftTypeId: formData.shiftTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
      };

      const response = await fetch(`${API_BASE_URL}/time-management/shifts/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to assign shift');
      }

      toast.success('Shift assigned successfully!');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to assign shift');
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedAssignment) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/time-management/shifts/${selectedAssignment._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update status');
      }

      toast.success(`Status updated to ${newStatus}`);
      setStatusDialogOpen(false);
      setSelectedAssignment(null);
      fetchData();
    } catch (error: any) {
      console.error('Update status error:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shift assignment?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/time-management/shifts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete shift assignment');
      }

      toast.success('Shift assignment deleted successfully!');
      fetchData();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete assignment');
    }
  };

  const resetForm = () => {
    setFormData({ employeeId: '', shiftTypeId: '', startDate: '', endDate: '', status: 'PENDING' });
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const getStatusChip = (status: string) => {
    const statusStyles: Record<string, { bg: string; color: string }> = {
      APPROVED: { bg: '#DCFCE7', color: '#16A34A' },
      PENDING: { bg: '#FEF3C7', color: '#D97706' },
      CANCELLED: { bg: '#FEE2E2', color: '#DC2626' },
      EXPIRED: { bg: '#F1F5F9', color: '#64748B' },
    };
    const style = statusStyles[status] || statusStyles.PENDING;
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          bgcolor: style.bg,
          color: style.color,
          fontWeight: 500,
          fontSize: '0.75rem',
        }}
      />
    );
  };

  // Filter assignments based on role
  const filteredAssignments = isEmployee
    ? assignments.filter(a => a.employeeId?._id === userId)
    : assignments;

  return (
    <Paper
      elevation={0}
      className="tm-fade-in-up"
      sx={{
        borderRadius: 3,
        border: '1px solid rgba(139, 92, 246, 0.15)',
        bgcolor: 'white',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.12)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(168, 85, 247, 0.03) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            className="tm-float"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
            }}
          >
            <Users size={22} color="white" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B', letterSpacing: '-0.01em' }}>
              Shift Assignments
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              {isEmployee ? 'Your assigned shifts and schedules' : 'Assign and manage employee shift schedules'}
            </Typography>
          </Box>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={handleOpenDialog}
            className="tm-btn"
            sx={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.45)',
              },
            }}
          >
            Assign Shift
          </Button>
        )}
      </Box>

      {/* Content */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 10, gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <CircularProgress size={40} sx={{ color: '#8B5CF6' }} />
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Users size={16} color="#8B5CF6" />
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>Loading shift assignments...</Typography>
          </Box>
        ) : (
          <TableContainer className="tm-scrollbar">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(139, 92, 246, 0.03)' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Assignee</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Shift Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Status</TableCell>
                  {(canEdit || canDelete || canChangeStatus) && <TableCell align="right" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={(canEdit || canDelete || canChangeStatus) ? 6 : 5} align="center" sx={{ py: 10 }}>
                      <Box className="tm-empty-state">
                        <Box className="tm-empty-state-icon" sx={{ mb: 2 }}>
                          <Users size={48} color="#CBD5E1" />
                        </Box>
                        <Typography sx={{ fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                          No shift assignments found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                          {canCreate ? 'Assign your first shift to get started' : 'No shifts assigned'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment, index) => (
                    <TableRow
                      key={assignment._id}
                      className="tm-table-row tm-table-highlight"
                      sx={{
                        '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.04)' },
                        animation: 'fadeInUp 0.4s ease-out',
                        animationDelay: `${index * 60}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      <TableCell>
                        {assignment.employeeId && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 3px 10px rgba(139, 92, 246, 0.3)',
                              }}
                            >
                              <User size={16} color="white" />
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>
                                {assignment.employeeId.firstName} {assignment.employeeId.lastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                {assignment.employeeId.employeeNumber}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        {assignment.departmentId && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(59, 130, 246, 0.3)' }}>
                              <Building2 size={16} color="white" />
                            </Box>
                            <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>{assignment.departmentId.name}</Typography>
                          </Box>
                        )}
                        {assignment.positionId && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(245, 158, 11, 0.3)' }}>
                              <Briefcase size={16} color="white" />
                            </Box>
                            <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>{assignment.positionId.title}</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>{assignment.shiftTypeId?.name || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                          {new Date(assignment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                          {new Date(assignment.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(assignment.status)}</TableCell>
                      {(canEdit || canDelete || canChangeStatus) && (
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            {canChangeStatus && (
                              <IconButton
                                size="small"
                                onClick={() => { setSelectedAssignment(assignment); setStatusDialogOpen(true); }}
                                className="tm-icon-btn"
                                sx={{ color: '#64748B', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' } }}
                              >
                                <Edit size={16} />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(assignment._id)}
                                className="tm-icon-btn"
                                sx={{ color: '#64748B', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' } }}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Create Assignment Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'tm-dialog',
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            pb: 1,
            background: 'linear-gradient(135deg, #F5F3FF 0%, #F8FAFC 100%)',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          Assign Shift
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={formData.employeeId || ''}
                    label="Employee"
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  >
                    {employees.map((emp) => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Shift Type</InputLabel>
                  <Select
                    value={formData.shiftTypeId || ''}
                    label="Shift Type"
                    onChange={(e) => setFormData({ ...formData, shiftTypeId: e.target.value })}
                  >
                    {shiftTypes.map((shift) => (
                      <MenuItem key={shift._id} value={shift._id}>
                        {shift.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || 'PENDING'}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748B' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="tm-btn"
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                px: 3,
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                },
              }}
            >
              Assign Shift
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          className: 'tm-dialog',
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            pb: 1,
            background: 'linear-gradient(135deg, #F5F3FF 0%, #F8FAFC 100%)',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          Update Status
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#64748B' }}>
            Change the status of this shift assignment
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Button
              onClick={() => handleStatusUpdate('APPROVED')}
              variant="contained"
              size="small"
              className="tm-btn"
              sx={{ bgcolor: '#16A34A', textTransform: 'none', '&:hover': { bgcolor: '#15803D' } }}
            >
              Approve
            </Button>
            <Button
              onClick={() => handleStatusUpdate('PENDING')}
              variant="contained"
              size="small"
              className="tm-btn"
              sx={{ bgcolor: '#D97706', textTransform: 'none', '&:hover': { bgcolor: '#B45309' } }}
            >
              Set Pending
            </Button>
            <Button
              onClick={() => handleStatusUpdate('CANCELLED')}
              variant="contained"
              size="small"
              className="tm-btn"
              sx={{ bgcolor: '#DC2626', textTransform: 'none', '&:hover': { bgcolor: '#B91C1C' } }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleStatusUpdate('EXPIRED')}
              variant="contained"
              size="small"
              className="tm-btn"
              sx={{ bgcolor: '#64748B', textTransform: 'none', '&:hover': { bgcolor: '#475569' } }}
            >
              Mark Expired
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setStatusDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748B' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
