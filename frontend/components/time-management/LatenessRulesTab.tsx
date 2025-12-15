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
  InputAdornment,
  Grid,
} from '@mui/material';
import { Plus, Edit, Trash2, Clock, AlertTriangle, Timer } from 'lucide-react';
import { toast } from 'sonner';

interface LatenessRule {
  _id: string;
  code: string;
  name: string;
  description?: string;
  gracePeriodMinutes: number;
  deductionPerMinute: number;
  isPercentage: boolean;
  maxDeductionMinutes: number;
  warningThreshold: number;
  escalationThreshold: number;
  periodDays: number;
  autoDeduct: boolean;
  active: boolean;
}

const defaultFormData = {
  code: '',
  name: '',
  description: '',
  gracePeriodMinutes: 15,
  deductionPerMinute: 0,
  isPercentage: false,
  maxDeductionMinutes: 60,
  warningThreshold: 3,
  escalationThreshold: 5,
  periodDays: 7,
  autoDeduct: false,
  active: true,
};

export default function LatenessRulesTab() {
  const [rules, setRules] = useState<LatenessRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LatenessRule | null>(null);
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
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/time-management/lateness-rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRules(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Fetch lateness rules error:', error);
      toast.error(error.message || 'Failed to fetch lateness rules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error('Rule code is required');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Rule name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const url = editingRule
        ? `${API_BASE_URL}/time-management/lateness-rules/${editingRule._id}`
        : `${API_BASE_URL}/time-management/lateness-rules`;

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
        throw new Error(errorData.message || 'Failed to save lateness rule');
      }

      toast.success(editingRule ? 'Lateness rule updated successfully!' : 'Lateness rule created successfully!');
      setDialogOpen(false);
      resetForm();
      fetchRules();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save lateness rule');
    }
  };

  const handleEdit = (rule: LatenessRule) => {
    setEditingRule(rule);
    setFormData({
      code: rule.code,
      name: rule.name,
      description: rule.description || '',
      gracePeriodMinutes: rule.gracePeriodMinutes,
      deductionPerMinute: rule.deductionPerMinute,
      isPercentage: rule.isPercentage,
      maxDeductionMinutes: rule.maxDeductionMinutes,
      warningThreshold: rule.warningThreshold,
      escalationThreshold: rule.escalationThreshold,
      periodDays: rule.periodDays,
      autoDeduct: rule.autoDeduct,
      active: rule.active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lateness rule?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/time-management/lateness-rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete lateness rule');
      }

      toast.success('Lateness rule deleted successfully!');
      fetchRules();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete lateness rule');
    }
  };

  const resetForm = () => {
    setEditingRule(null);
    setFormData(defaultFormData);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box className="tm-loading-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress sx={{ color: 'var(--tm-primary)' }} />
      </Box>
    );
  }

  return (
    <Box className="tm-tab-content tm-fade-in">
      {/* Header Section */}
      <Box className="tm-section-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box className="tm-icon-badge tm-icon-badge-error">
            <AlertTriangle size={24} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Lateness Rules
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Configure lateness tracking and penalty rules
            </Typography>
          </Box>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={openCreateDialog}
            className="tm-btn-primary"
            sx={{
              background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.25,
              boxShadow: 'var(--tm-shadow-md)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 'var(--tm-shadow-lg)',
              },
            }}
          >
            Add Lateness Rule
          </Button>
        )}
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        <Paper className="tm-stat-card" sx={{ p: 2.5, borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '10px', background: 'linear-gradient(135deg, #EF444420 0%, #F9731620 100%)' }}>
              <AlertTriangle size={20} style={{ color: '#EF4444' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>{rules.length}</Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Total Rules</Typography>
            </Box>
          </Box>
        </Paper>
        <Paper className="tm-stat-card" sx={{ p: 2.5, borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '10px', background: 'linear-gradient(135deg, #10B98120 0%, #14B8A620 100%)' }}>
              <Clock size={20} style={{ color: '#10B981' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>{rules.filter(r => r.active).length}</Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Active</Typography>
            </Box>
          </Box>
        </Paper>
        <Paper className="tm-stat-card" sx={{ p: 2.5, borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B20 0%, #F9731620 100%)' }}>
              <Timer size={20} style={{ color: '#F59E0B' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>{rules.filter(r => r.autoDeduct).length}</Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Auto-Deduct</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} className="tm-table-container" sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Grace Period</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Thresholds</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <AlertTriangle size={48} style={{ color: '#cbd5e1' }} />
                    <Typography sx={{ color: '#94a3b8' }}>No lateness rules found</Typography>
                    {canCreate && (
                      <Button variant="outlined" onClick={openCreateDialog} sx={{ mt: 1 }}>
                        Create First Rule
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule, index) => (
                <TableRow 
                  key={rule._id} 
                  className="tm-table-row"
                  sx={{ 
                    '&:hover': { background: 'rgba(239, 68, 68, 0.04)' },
                    animation: `slideUp 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#EF4444' }}>{rule.code}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>{rule.name}</Typography>
                      {rule.description && (
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                          {rule.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${rule.gracePeriodMinutes} min`}
                      size="small"
                      sx={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`Warn: ${rule.warningThreshold}`} 
                        size="small" 
                        sx={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }} 
                      />
                      <Chip 
                        label={`Esc: ${rule.escalationThreshold}`} 
                        size="small" 
                        sx={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }} 
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip 
                        label={rule.active ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{ 
                          background: rule.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: rule.active ? '#10B981' : '#EF4444',
                          fontWeight: 600
                        }}
                      />
                      {rule.autoDeduct && (
                        <Chip 
                          label="Auto-Deduct"
                          size="small"
                          sx={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      {canEdit && (
                        <IconButton 
                          onClick={() => handleEdit(rule)}
                          size="small"
                          sx={{ color: '#6366F1', '&:hover': { background: 'rgba(99, 102, 241, 0.1)' } }}
                        >
                          <Edit size={18} />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton 
                          onClick={() => handleDelete(rule._id)}
                          size="small"
                          sx={{ color: '#EF4444', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)', color: 'white', fontWeight: 700 }}>
          {editingRule ? 'Edit Lateness Rule' : 'Create New Lateness Rule'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Rule Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., LR-001"
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Rule Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Lateness Policy"
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Grace Period"
                  value={formData.gracePeriodMinutes}
                  onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
                  InputProps={{ endAdornment: <InputAdornment position="end">minutes</InputAdornment> }}
                  helperText="Time before marking as late"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Deduction Per Minute"
                  value={formData.deductionPerMinute}
                  onChange={(e) => setFormData({ ...formData, deductionPerMinute: Number(e.target.value) })}
                  inputProps={{ step: 0.01, min: 0 }}
                  InputProps={{ endAdornment: <InputAdornment position="end">{formData.isPercentage ? '%' : '$'}</InputAdornment> }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Deduction Minutes"
                  value={formData.maxDeductionMinutes}
                  onChange={(e) => setFormData({ ...formData, maxDeductionMinutes: Number(e.target.value) })}
                  InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
                  helperText="0 = unlimited"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Warning Threshold"
                  value={formData.warningThreshold}
                  onChange={(e) => setFormData({ ...formData, warningThreshold: Number(e.target.value) })}
                  inputProps={{ min: 1 }}
                  helperText="Late arrivals before warning"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Escalation Threshold"
                  value={formData.escalationThreshold}
                  onChange={(e) => setFormData({ ...formData, escalationThreshold: Number(e.target.value) })}
                  inputProps={{ min: 1 }}
                  helperText="Late arrivals before escalation"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Period Days"
                  value={formData.periodDays}
                  onChange={(e) => setFormData({ ...formData, periodDays: Number(e.target.value) })}
                  inputProps={{ min: 1 }}
                  helperText="Rolling window for threshold counting"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isPercentage}
                        onChange={(e) => setFormData({ ...formData, isPercentage: e.target.checked })}
                        color="info"
                      />
                    }
                    label="Deduction is Percentage"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.autoDeduct}
                        onChange={(e) => setFormData({ ...formData, autoDeduct: e.target.checked })}
                        color="warning"
                      />
                    }
                    label="Auto-Deduct from Payroll"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        color="success"
                      />
                    }
                    label="Active"
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ color: '#64748b' }}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ 
                background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
