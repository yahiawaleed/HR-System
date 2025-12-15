'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/services/api';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
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
  Grid,
} from '@mui/material';
import { Plus, Edit, Trash2, CalendarDays, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Holiday {
  _id: string;
  type: 'NATIONAL' | 'ORGANIZATIONAL' | 'WEEKLY';
  startDate: string;
  endDate?: string;
  name: string;
  active: boolean;
}

export default function HolidaysTab() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [formData, setFormData] = useState({
    type: 'NATIONAL' as 'NATIONAL' | 'ORGANIZATIONAL' | 'WEEKLY',
    startDate: '',
    endDate: '',
    name: '',
    active: true,
  });

  // Role-based permissions - matches backend controller @Roles decorators
  const isSystemAdmin = userRole === 'System Admin';
  const isHRAdmin = userRole === 'HR Admin';
  const isAdmin = isSystemAdmin || isHRAdmin;
  const canCreate = isAdmin; // POST: SYSTEM_ADMIN, HR_ADMIN
  const canEdit = isAdmin; // PATCH: SYSTEM_ADMIN, HR_ADMIN
  const canDelete = isAdmin; // DELETE: SYSTEM_ADMIN, HR_ADMIN

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role) setUserRole(user.role);
      } catch (e) {
        console.error('Error parsing user from localStorage');
      }
    }
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/time-management/holidays`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHolidays(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Fetch holidays error:', error);
      toast.error(error.message || 'Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Holiday name is required');
      return;
    }
    if (!formData.startDate) {
      toast.error('Start date is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const payload = {
        type: formData.type,
        name: formData.name,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        active: formData.active,
      };

      const url = editingHoliday
        ? `${API_BASE_URL}/time-management/holidays/${editingHoliday._id}`
        : `${API_BASE_URL}/time-management/holidays`;

      const response = await fetch(url, {
        method: editingHoliday ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save holiday');
      }

      toast.success(editingHoliday ? 'Holiday updated successfully!' : 'Holiday created successfully!');
      setDialogOpen(false);
      resetForm();
      fetchHolidays();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save holiday');
    }
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      type: holiday.type,
      name: holiday.name,
      startDate: holiday.startDate ? holiday.startDate.split('T')[0] : '',
      endDate: holiday.endDate ? holiday.endDate.split('T')[0] : '',
      active: holiday.active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/time-management/holidays/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete holiday');
      }

      toast.success('Holiday deleted successfully!');
      fetchHolidays();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete holiday');
    }
  };

  const resetForm = () => {
    setFormData({ type: 'NATIONAL', startDate: '', endDate: '', name: '', active: true });
    setEditingHoliday(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const getTypeChip = (type: string) => {
    const typeStyles: Record<string, { bg: string; color: string; gradient: string; border: string }> = {
      NATIONAL: { bg: '#DBEAFE', color: '#2563EB', gradient: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)', border: 'rgba(59, 130, 246, 0.2)' },
      ORGANIZATIONAL: { bg: '#EDE9FE', color: '#7C3AED', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)', border: 'rgba(139, 92, 246, 0.2)' },
      WEEKLY: { bg: '#CCFBF1', color: '#0D9488', gradient: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)', border: 'rgba(20, 184, 166, 0.2)' },
    };
    const style = typeStyles[type] || typeStyles.NATIONAL;
    return (
      <Chip
        label={type}
        size="small"
        className="tm-chip"
        sx={{
          bgcolor: style.bg,
          color: style.color,
          fontWeight: 600,
          fontSize: '0.7rem',
          border: `1px solid ${style.border}`,
        }}
      />
    );
  };

  return (
    <Paper
      elevation={0}
      className="tm-fade-in-up"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        background: 'white',
        border: '1px solid rgba(249, 115, 22, 0.15)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(249, 115, 22, 0.12)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid rgba(249, 115, 22, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(234, 88, 12, 0.03) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            className="tm-float"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(249, 115, 22, 0.4)',
            }}
          >
            <CalendarDays size={22} color="white" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B', letterSpacing: '-0.01em' }}>
              Holidays
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Manage company-wide holidays and special days
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
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                boxShadow: '0 6px 20px rgba(249, 115, 22, 0.45)',
              },
            }}
          >
            Add Holiday
          </Button>
        )}
      </Box>

      {/* Content */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 10, gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <CircularProgress size={40} sx={{ color: '#F97316' }} />
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CalendarDays size={16} color="#F97316" />
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>Loading holidays...</Typography>
          </Box>
        ) : (
          <TableContainer className="tm-scrollbar">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(249, 115, 22, 0.03)' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Status</TableCell>
                  {(canEdit || canDelete) && <TableCell align="right" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {holidays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={(canEdit || canDelete) ? 6 : 5} align="center" sx={{ py: 10 }}>
                      <Box className="tm-empty-state">
                        <Box className="tm-empty-state-icon" sx={{ mb: 2 }}>
                          <CalendarDays size={48} color="#CBD5E1" />
                        </Box>
                        <Typography sx={{ fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                          No holidays found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                          {canCreate ? 'Add your first holiday to get started' : 'No holidays available'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  holidays.map((holiday, index) => (
                    <TableRow
                      key={holiday._id}
                      className="tm-table-row tm-table-highlight"
                      sx={{
                        '&:hover': { bgcolor: 'rgba(249, 115, 22, 0.04)' },
                        animation: 'fadeInUp 0.4s ease-out',
                        animationDelay: `${index * 60}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: holiday.active ? '#F97316' : '#94A3B8',
                              boxShadow: holiday.active ? '0 0 10px rgba(249, 115, 22, 0.5)' : 'none',
                              transition: 'all 0.3s ease',
                            }}
                          />
                          <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>{holiday.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{getTypeChip(holiday.type)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                          {new Date(holiday.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                          {holiday.endDate ? new Date(holiday.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={holiday.active ? 'Active' : 'Inactive'}
                          size="small"
                          className="tm-chip"
                          sx={{
                            bgcolor: holiday.active ? '#DCFCE7' : '#F1F5F9',
                            color: holiday.active ? '#059669' : '#64748B',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            border: holiday.active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #E2E8F0',
                          }}
                        />
                      </TableCell>
                      {(canEdit || canDelete) && (
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            {canEdit && (
                              <IconButton
                                onClick={() => handleEdit(holiday)}
                                size="small"
                                className="tm-icon-btn"
                                sx={{
                                  color: '#64748B',
                                  '&:hover': { bgcolor: 'rgba(249, 115, 22, 0.1)', color: '#F97316' },
                                }}
                              >
                                <Edit size={16} />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton
                                onClick={() => handleDelete(holiday._id)}
                                size="small"
                                className="tm-icon-btn"
                                sx={{
                                  color: '#64748B',
                                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
                                }}
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

      {/* Dialog */}
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
            background: 'linear-gradient(135deg, #FFF7ED 0%, #F8FAFC 100%)',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          {editingHoliday ? 'Edit' : 'Create'} Holiday
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Holiday Name"
                  placeholder="e.g., Christmas Day"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <MenuItem value="NATIONAL">National</MenuItem>
                    <MenuItem value="ORGANIZATIONAL">Organizational</MenuItem>
                    <MenuItem value="WEEKLY">Weekly</MenuItem>
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
                  label="End Date (Optional)"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  helperText="Leave empty for single-day"
                />
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10B981' },
                    }}
                  />
                }
                label={<Typography sx={{ fontWeight: 500 }}>Active</Typography>}
              />
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
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                px: 3,
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                },
              }}
            >
              {editingHoliday ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
}
