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
} from '@mui/material';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleRule {
  _id: string;
  name: string;
  pattern: string;
  active: boolean;
}

export default function ScheduleRulesTab() {
  const [scheduleRules, setScheduleRules] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ScheduleRule | null>(null);
  const [formData, setFormData] = useState({ name: '', pattern: '', active: true });
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
    fetchScheduleRules();
  }, []);

  const fetchScheduleRules = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/time-management/schedule-rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setScheduleRules(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Fetch schedule rules error:', error);
      toast.error(error.message || 'Failed to fetch schedule rules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Rule name is required');
      return;
    }
    if (!formData.pattern.trim()) {
      toast.error('Pattern description is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const url = editingRule
        ? `${API_BASE_URL}/time-management/schedule-rules/${editingRule._id}`
        : `${API_BASE_URL}/time-management/schedule-rules`;

      const response = await fetch(url, {
        method: editingRule ? 'PATCH' : 'POST',
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

      toast.success(editingRule ? 'Schedule rule updated successfully!' : 'Schedule rule created successfully!');
      setDialogOpen(false);
      resetForm();
      fetchScheduleRules();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save schedule rule');
    }
  };

  const handleEdit = (rule: ScheduleRule) => {
    setEditingRule(rule);
    setFormData({ name: rule.name, pattern: rule.pattern, active: rule.active });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule rule?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/time-management/schedule-rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete schedule rule');
      }

      toast.success('Schedule rule deleted successfully!');
      fetchScheduleRules();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete schedule rule');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', pattern: '', active: true });
    setEditingRule(null);
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
        border: '1px solid rgba(16, 185, 129, 0.15)',
        bgcolor: 'white',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.12)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(20, 184, 166, 0.03) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            className="tm-float"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Calendar size={22} color="white" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B', letterSpacing: '-0.01em' }}>
              Schedule Rules
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Define custom scheduling patterns and policies
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
              background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
              },
            }}
          >
            Add Rule
          </Button>
        )}
      </Box>

      {/* Content */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 10, gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <CircularProgress size={40} sx={{ color: '#10B981' }} />
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Calendar size={16} color="#10B981" />
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>Loading schedule rules...</Typography>
          </Box>
        ) : (
          <TableContainer className="tm-scrollbar">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(16, 185, 129, 0.03)' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Pattern</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Status</TableCell>
                  {(canEdit || canDelete) && <TableCell align="right" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 1.75 }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduleRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={(canEdit || canDelete) ? 4 : 3} sx={{ py: 10, textAlign: 'center' }}>
                      <Box className="tm-empty-state">
                        <Box className="tm-empty-state-icon" sx={{ mb: 2 }}>
                          <Calendar size={48} color="#CBD5E1" />
                        </Box>
                        <Typography sx={{ fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                          No schedule rules found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                          {canCreate ? 'Create your first rule to get started' : 'No schedule rules available'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  scheduleRules.map((rule, index) => (
                    <TableRow
                      key={rule._id}
                      className="tm-table-row tm-table-highlight"
                      sx={{
                        '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.04)' },
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
                              bgcolor: rule.active ? '#10B981' : '#94A3B8',
                              boxShadow: rule.active ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none',
                              transition: 'all 0.3s ease',
                            }}
                          />
                          <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>{rule.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 280, fontWeight: 500 }}>
                          {rule.pattern}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rule.active ? 'Active' : 'Inactive'}
                          size="small"
                          className="tm-chip"
                          sx={{
                            bgcolor: rule.active ? '#DCFCE7' : '#F1F5F9',
                            color: rule.active ? '#059669' : '#64748B',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            border: rule.active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #E2E8F0',
                          }}
                        />
                      </TableCell>
                      {(canEdit || canDelete) && (
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            {canEdit && (
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(rule)}
                                className="tm-icon-btn"
                                sx={{
                                  color: '#64748B',
                                  '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
                                }}
                              >
                                <Edit size={16} />
                              </IconButton>
                            )}
                            {canDelete && (
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(rule._id)}
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
        <DialogTitle sx={{ 
          fontWeight: 600, 
          pb: 1,
          background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 100%)',
          borderBottom: '1px solid #E2E8F0',
        }}>
          {editingRule ? 'Edit' : 'Create'} Schedule Rule
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Rule Name"
                placeholder="e.g., Flexible Working Hours"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Pattern Description"
                placeholder="e.g., Core hours: 11 AM - 3 PM"
                value={formData.pattern}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                required
                multiline
                rows={3}
                fullWidth
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
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                px: 3,
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                },
              }}
            >
              {editingRule ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
}
