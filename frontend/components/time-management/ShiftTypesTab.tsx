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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import { Plus, Edit, Trash2, Clock, Sun, Moon, Calendar } from 'lucide-react';
import { toast } from 'sonner';

// Shift category types
type ShiftCategory = 'NORMAL' | 'SPLIT' | 'OVERNIGHT' | 'ROTATIONAL' | 'FLEXIBLE';

interface ShiftType {
  _id: string;
  code: string;
  name: string;
  category: ShiftCategory;
  startTime?: string;
  endTime?: string;
  totalDurationMinutes: number;
  breakDurationMinutes: number;
  isNightShift: boolean;
  isWeekendShift: boolean;
  graceMinutesIn: number;
  graceMinutesOut: number;
  description?: string;
  active: boolean;
}

const defaultFormData = {
  code: '',
  name: '',
  category: 'NORMAL' as ShiftCategory,
  startTime: '09:00',
  endTime: '17:00',
  totalDurationMinutes: 480,
  breakDurationMinutes: 60,
  isNightShift: false,
  isWeekendShift: false,
  graceMinutesIn: 15,
  graceMinutesOut: 10,
  description: '',
  active: true,
};

const categoryLabels: Record<ShiftCategory, { label: string; color: string; bg: string }> = {
  NORMAL: { label: 'Normal', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  SPLIT: { label: 'Split', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  OVERNIGHT: { label: 'Overnight', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  ROTATIONAL: { label: 'Rotational', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  FLEXIBLE: { label: 'Flexible', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)' },
};

export default function ShiftTypesTab() {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShiftType, setEditingShiftType] = useState<ShiftType | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [userRole, setUserRole] = useState<string>('');

  // Role-based permissions - matches backend controller @Roles decorators
  const isSystemAdmin = userRole === 'System Admin';
  const isHRAdmin = userRole === 'HR Admin';
  const isAdmin = isSystemAdmin || isHRAdmin;
  const canCreate = isAdmin; // POST: SYSTEM_ADMIN, HR_ADMIN
  const canEdit = isAdmin; // PATCH: SYSTEM_ADMIN, HR_ADMIN
  const canDelete = isSystemAdmin; // DELETE: SYSTEM_ADMIN only

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
    fetchShiftTypes();
  }, []);

  const fetchShiftTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/time-management/shift-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setShiftTypes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Fetch shift types error:', error);
      toast.error(error.message || 'Failed to fetch shift types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error('Shift type code is required');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Shift type name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const url = editingShiftType
        ? `${API_BASE_URL}/time-management/shift-types/${editingShiftType._id}`
        : `${API_BASE_URL}/time-management/shift-types`;

      const response = await fetch(url, {
        method: editingShiftType ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save shift type');
      }

      toast.success(editingShiftType ? 'Shift type updated successfully!' : 'Shift type created successfully!');
      setDialogOpen(false);
      resetForm();
      fetchShiftTypes();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save shift type');
    }
  };

  const handleEdit = (shiftType: ShiftType) => {
    setEditingShiftType(shiftType);
    setFormData({
      code: shiftType.code || '',
      name: shiftType.name,
      category: shiftType.category || 'NORMAL',
      startTime: shiftType.startTime || '09:00',
      endTime: shiftType.endTime || '17:00',
      totalDurationMinutes: shiftType.totalDurationMinutes || 480,
      breakDurationMinutes: shiftType.breakDurationMinutes || 60,
      isNightShift: shiftType.isNightShift || false,
      isWeekendShift: shiftType.isWeekendShift || false,
      graceMinutesIn: shiftType.graceMinutesIn || 15,
      graceMinutesOut: shiftType.graceMinutesOut || 10,
      description: shiftType.description || '',
      active: shiftType.active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shift type?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/time-management/shift-types/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete shift type');
      }

      toast.success('Shift type deleted successfully!');
      fetchShiftTypes();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete shift type');
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingShiftType(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  return (
    <Paper
      elevation={0}
      className="tm-fade-in-up"
      sx={{
        borderRadius: 3,
        border: '1px solid rgba(99, 102, 241, 0.15)',
        bgcolor: 'white',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.12)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            className="tm-float"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Clock size={22} color="white" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B', letterSpacing: '-0.01em' }}>
              Shift Types
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Define work shift categories for your organization
            </Typography>
          </Box>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={handleOpenDialog}
            className="tm-btn"
            sx={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.45)',
              },
            }}
          >
            Add Shift Type
          </Button>
        )}
      </Box>

      {/* Content */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 10, gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <CircularProgress size={40} sx={{ color: '#6366F1' }} />
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Clock size={16} color="#6366F1" />
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>Loading shift types...</Typography>
          </Box>
        ) : (
          <TableContainer className="tm-scrollbar">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(99, 102, 241, 0.03)' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Status</TableCell>
                  {(canEdit || canDelete) && <TableCell align="right" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {shiftTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={(canEdit || canDelete) ? 6 : 5} sx={{ py: 10, textAlign: 'center' }}>
                      <Box className="tm-empty-state">
                        <Box className="tm-empty-state-icon" sx={{ mb: 2 }}>
                          <Clock size={48} color="#CBD5E1" />
                        </Box>
                        <Typography sx={{ color: '#64748B', fontWeight: 600, mb: 0.5 }}>
                          No shift types found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                          {canCreate ? 'Create your first shift type to get started' : 'No shift types available'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  shiftTypes.map((shiftType, index) => (
                    <TableRow 
                      key={shiftType._id} 
                      className="tm-table-row tm-table-highlight"
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.04)' },
                        animation: 'fadeInUp 0.4s ease-out',
                        animationDelay: `${index * 60}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: '#6366F1', fontSize: '0.85rem' }}>{shiftType.code || 'N/A'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: shiftType.active ? '#10B981' : '#94A3B8',
                              boxShadow: shiftType.active ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none',
                              transition: 'all 0.3s ease',
                            }}
                          />
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>{shiftType.name}</Typography>
                            {shiftType.description && (
                              <Typography variant="caption" sx={{ color: '#64748B' }}>{shiftType.description}</Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip
                            label={categoryLabels[shiftType.category]?.label || shiftType.category}
                            size="small"
                            sx={{
                              bgcolor: categoryLabels[shiftType.category]?.bg || 'rgba(99, 102, 241, 0.1)',
                              color: categoryLabels[shiftType.category]?.color || '#6366F1',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                          {shiftType.isNightShift && (
                            <Chip
                              icon={<Moon size={12} />}
                              label="Night"
                              size="small"
                              sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', fontWeight: 600, fontSize: '0.65rem' }}
                            />
                          )}
                          {shiftType.isWeekendShift && (
                            <Chip
                              icon={<Calendar size={12} />}
                              label="Weekend"
                              size="small"
                              sx={{ bgcolor: 'rgba(236, 72, 153, 0.1)', color: '#EC4899', fontWeight: 600, fontSize: '0.65rem' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.85rem' }}>
                            {shiftType.startTime || '--'} - {shiftType.endTime || '--'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {Math.floor((shiftType.totalDurationMinutes || 0) / 60)}h {(shiftType.totalDurationMinutes || 0) % 60}m (incl. {shiftType.breakDurationMinutes || 0}m break)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={shiftType.active ? 'Active' : 'Inactive'}
                          size="small"
                          className="tm-chip"
                          sx={{
                            bgcolor: shiftType.active ? '#DCFCE7' : '#F1F5F9',
                            color: shiftType.active ? '#059669' : '#64748B',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            border: shiftType.active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #E2E8F0',
                          }}
                        />
                      </TableCell>
                      {(canEdit || canDelete) && (
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            {canEdit && (
                              <IconButton 
                                size="small" 
                                onClick={() => handleEdit(shiftType)} 
                                className="tm-icon-btn"
                                sx={{ 
                                  color: '#64748B',
                                  '&:hover': { color: '#6366F1', bgcolor: 'rgba(99, 102, 241, 0.1)' },
                                }}
                              >
                                <Edit size={16} />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton 
                                size="small" 
                                onClick={() => handleDelete(shiftType._id)} 
                                className="tm-icon-btn"
                                sx={{ 
                                  color: '#64748B',
                                  '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: 'tm-dialog',
          sx: { 
            borderRadius: 3,
            boxShadow: '0 25px 80px rgba(99, 102, 241, 0.25)',
          },
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          pb: 1,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}>
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Clock size={18} color="white" />
          </Box>
          {editingShiftType ? 'Edit' : 'Create'} Shift Type
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Shift Code"
                  placeholder="e.g., DAY-001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  fullWidth
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#6366F1' },
                      '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#6366F1' },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Shift Name"
                  placeholder="e.g., Morning Shift"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  fullWidth
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#6366F1' },
                      '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#6366F1' },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description"
                  placeholder="Optional description for this shift type"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#6366F1' },
                      '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#6366F1' },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ShiftCategory })}
                    label="Category"
                  >
                    <MenuItem value="NORMAL">Normal</MenuItem>
                    <MenuItem value="SPLIT">Split</MenuItem>
                    <MenuItem value="OVERNIGHT">Overnight</MenuItem>
                    <MenuItem value="ROTATIONAL">Rotational</MenuItem>
                    <MenuItem value="FLEXIBLE">Flexible</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Total Duration"
                  type="number"
                  value={formData.totalDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, totalDurationMinutes: Number(e.target.value) })}
                  fullWidth
                  InputProps={{ endAdornment: <InputAdornment position="end">minutes</InputAdornment> }}
                  helperText="480 min = 8 hours"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Break Duration"
                  type="number"
                  value={formData.breakDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, breakDurationMinutes: Number(e.target.value) })}
                  fullWidth
                  InputProps={{ endAdornment: <InputAdornment position="end">minutes</InputAdornment> }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Grace Minutes (In)"
                  type="number"
                  value={formData.graceMinutesIn}
                  onChange={(e) => setFormData({ ...formData, graceMinutesIn: Number(e.target.value) })}
                  fullWidth
                  InputProps={{ endAdornment: <InputAdornment position="end">minutes</InputAdornment> }}
                  helperText="Grace period for late arrival"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Grace Minutes (Out)"
                  type="number"
                  value={formData.graceMinutesOut}
                  onChange={(e) => setFormData({ ...formData, graceMinutesOut: Number(e.target.value) })}
                  fullWidth
                  InputProps={{ endAdornment: <InputAdornment position="end">minutes</InputAdornment> }}
                  helperText="Grace period for early leave"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isNightShift}
                        onChange={(e) => setFormData({ ...formData, isNightShift: e.target.checked })}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#3B82F6' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#3B82F6' },
                        }}
                      />
                    }
                    label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Moon size={16} /> Night Shift</Box>}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isWeekendShift}
                        onChange={(e) => setFormData({ ...formData, isWeekendShift: e.target.checked })}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#EC4899' },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#EC4899' },
                        }}
                      />
                    }
                    label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Calendar size={16} /> Weekend Shift</Box>}
                  />
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
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
            <Button 
              onClick={() => setDialogOpen(false)} 
              sx={{ textTransform: 'none', color: '#64748B', fontWeight: 500 }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              className="tm-btn"
              sx={{ 
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                px: 3,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                },
              }}
            >
              {editingShiftType ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
}
