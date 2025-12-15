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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Avatar,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { Plus, CheckCircle, XCircle, Clock, Eye, FileEdit, Send, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface RequestedPunch {
  type: 'IN' | 'OUT';
  time: string;
}

interface CorrectionRequest {
  _id: string;
  employeeId: { _id: string; firstName: string; lastName: string; fullName: string; employeeNumber: string };
  date: string;
  requestedPunches: RequestedPunch[];
  reason: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewedBy?: { firstName: string; lastName: string; fullName: string };
  reviewComment?: string;
  reviewedAt?: string;
  createdAt: string;
}

export default function CorrectionRequestsTab() {
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [myRequests, setMyRequests] = useState<CorrectionRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CorrectionRequest | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  const [newRequest, setNewRequest] = useState({
    date: '',
    requestedPunches: [{ type: 'IN' as 'IN' | 'OUT', time: '' }],
    reason: '',
  });

  const [reviewForm, setReviewForm] = useState({
    action: 'APPROVE' as 'APPROVE' | 'REJECT',
    comment: '',
  });

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

  // Role-based permissions - matches backend controller @Roles decorators
  const isSystemAdmin = userRole === 'System Admin';
  const isHRAdmin = userRole === 'HR Admin';
  const isHRManager = userRole === 'HR Manager';
  const isAdmin = isSystemAdmin || isHRAdmin;
  const isManager = userRole === 'Department Head';
  const isEmployee = !isAdmin && !isHRManager && !isManager;

  // Who can do what - based on backend controller
  const canReview = isAdmin || isHRManager || isManager; // PATCH review: SYSTEM_ADMIN, HR_ADMIN, HR_MANAGER, DEPARTMENT_HEAD
  const canViewAllRequests = isAdmin || isHRManager || isManager; // GET all: SYSTEM_ADMIN, HR_ADMIN, HR_MANAGER, DEPARTMENT_HEAD
  const canViewPendingTab = canReview;

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [myRes, pendingRes, allRes] = await Promise.all([
        fetch(`${API_BASE_URL}/time-management/corrections/my-requests`, { headers }),
        fetch(`${API_BASE_URL}/time-management/corrections/pending`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/time-management/corrections`, { headers }).catch(() => null),
      ]);

      if (myRes.ok) {
        const data = await myRes.json();
        setMyRequests(Array.isArray(data) ? data : []);
      }

      if (pendingRes?.ok) {
        const data = await pendingRes.json();
        setPendingRequests(Array.isArray(data) ? data : []);
      }

      if (allRes?.ok) {
        const data = await allRes.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.date || !newRequest.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    const validPunches = newRequest.requestedPunches.filter(p => p.time);
    if (validPunches.length === 0) {
      toast.error('Please add at least one punch with time');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/time-management/corrections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: userId,
          date: newRequest.date,
          requestedPunches: validPunches,
          reason: newRequest.reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create request');
      }

      toast.success('Correction request submitted successfully!');
      setCreateDialogOpen(false);
      setNewRequest({ date: '', requestedPunches: [{ type: 'IN', time: '' }], reason: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create request');
    }
  };

  const handleReview = async () => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/time-management/corrections/${selectedRequest._id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: reviewForm.action,
          reviewedBy: userId,
          comment: reviewForm.comment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to review request');
      }

      toast.success(`Request ${reviewForm.action.toLowerCase()}d successfully!`);
      setReviewDialogOpen(false);
      setReviewForm({ action: 'APPROVE', comment: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to review request');
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { bgcolor: string; color: string; icon: React.ReactNode; gradient?: string }> = {
      SUBMITTED: { bgcolor: '#DBEAFE', color: '#2563EB', icon: <Clock size={14} />, gradient: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' },
      IN_REVIEW: { bgcolor: '#FEF3C7', color: '#D97706', icon: <AlertCircle size={14} />, gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)' },
      APPROVED: { bgcolor: '#DCFCE7', color: '#059669', icon: <CheckCircle size={14} />, gradient: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)' },
      REJECTED: { bgcolor: '#FEE2E2', color: '#DC2626', icon: <XCircle size={14} />, gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)' },
    };

    const config = statusConfig[status] || statusConfig.SUBMITTED;

    return (
      <Chip
        size="small"
        icon={config.icon as any}
        label={status}
        className="tm-chip"
        sx={{ 
          bgcolor: config.bgcolor, 
          color: config.color,
          fontWeight: 600,
          fontSize: '0.7rem',
          border: `1px solid ${config.color}20`,
        }}
      />
    );
  };

  const renderRequestsTable = (data: CorrectionRequest[], showActions: boolean = false) => (
    <TableContainer className="tm-scrollbar">
      <Table>
        <TableHead sx={{ bgcolor: 'rgba(20, 184, 166, 0.04)' }}>
          <TableRow>
            {canReview && <TableCell sx={{ fontWeight: 600, color: '#0D9488', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee</TableCell>}
            <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requested Punches</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submitted</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={canReview ? 7 : 6} align="center" sx={{ py: 8 }}>
                <Box className="tm-empty-state">
                  <Box className="tm-empty-state-icon" sx={{ mb: 2 }}>
                    <FileEdit size={48} color="#CBD5E1" />
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: '#64748B' }}>
                    No correction requests found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
                    Requests will appear here when submitted
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            data.map((request, index) => (
              <TableRow 
                key={request._id} 
                className="tm-table-row tm-table-highlight"
                sx={{
                  animation: 'fadeInUp 0.4s ease-out',
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                  '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.04)' },
                }}
              >
                {canReview && (
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
                          boxShadow: '0 3px 10px rgba(20, 184, 166, 0.3)',
                        }}
                      >
                        {request.employeeId?.fullName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                          {request.employeeId?.fullName || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          {request.employeeId?.employeeNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                )}
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatDate(request.date)}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {request.requestedPunches.map((punch, idx) => (
                      <Chip
                        key={idx}
                        size="small"
                        label={`${punch.type} ${formatTime(punch.time)}`}
                        className="tm-chip"
                        sx={{
                          bgcolor: punch.type === 'IN' ? '#DCFCE7' : '#FEE2E2',
                          color: punch.type === 'IN' ? '#059669' : '#DC2626',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          border: punch.type === 'IN' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(220, 38, 38, 0.2)',
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title={request.reason} placement="top">
                    <Typography variant="body2" sx={{ 
                      maxWidth: 180, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: '#64748B',
                    }}>
                      {request.reason}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>{getStatusChip(request.status)}</TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    {formatDate(request.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedRequest(request);
                        setDetailDialogOpen(true);
                      }}
                      className="tm-icon-btn"
                      sx={{ color: '#8B5CF6', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' } }}
                    >
                      <Eye size={18} />
                    </IconButton>
                    {showActions && request.status === 'SUBMITTED' && canReview && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedRequest(request);
                          setReviewDialogOpen(true);
                        }}
                        className="tm-icon-btn"
                        sx={{ color: '#10B981', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}
                      >
                        <CheckCircle size={18} />
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
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400, gap: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <CircularProgress size={48} sx={{ color: '#14B8A6' }} />
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <FileEdit size={20} color="#14B8A6" />
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>Loading correction requests...</Typography>
      </Box>
    );
  }

  return (
    <Box className="tm-fade-in-up">
        {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            className="tm-float"
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(20, 184, 166, 0.35)',
            }}
          >
            <FileEdit size={24} color="white" />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', letterSpacing: '-0.02em' }}>
              Correction Requests
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Submit and manage attendance corrections
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setCreateDialogOpen(true)}
          className="tm-btn"
          sx={{
            background: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)',
              boxShadow: '0 8px 28px rgba(20, 184, 166, 0.45)',
            },
            borderRadius: 2.5,
            px: 3,
            py: 1.25,
            fontWeight: 600,
            boxShadow: '0 6px 20px rgba(20, 184, 166, 0.35)',
          }}
        >
          New Request
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper 
          elevation={0}
          className="tm-stat-card tm-hover-lift"
          sx={{ 
            flex: 1, 
            minWidth: 150,
            p: 2.5, 
            borderRadius: 3, 
            border: '1px solid rgba(59, 130, 246, 0.15)',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem' }}>
                My Requests
              </Typography>
              <Typography variant="h4" className="tm-stat-value" sx={{ fontWeight: 700, color: '#3B82F6' }}>
                {myRequests.length}
              </Typography>
            </Box>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: 2, 
              bgcolor: '#DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Send size={18} color="#3B82F6" />
            </Box>
          </Box>
        </Paper>
        {canViewPendingTab && (
          <Paper 
            elevation={0}
            className="tm-stat-card tm-hover-lift"
            sx={{ 
              flex: 1, 
              minWidth: 150,
              p: 2.5, 
              borderRadius: 3, 
              border: '1px solid rgba(245, 158, 11, 0.15)',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(249, 115, 22, 0.02) 100%)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem' }}>
                  Pending Approval
                </Typography>
                <Typography variant="h4" className="tm-stat-value" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                  {pendingRequests.length}
                </Typography>
              </Box>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                bgcolor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Clock size={18} color="#F59E0B" />
              </Box>
            </Box>
          </Paper>
        )}
        {canViewAllRequests && (
          <Paper 
            elevation={0}
            className="tm-stat-card tm-hover-lift"
            sx={{ 
              flex: 1, 
              minWidth: 150,
              p: 2.5, 
              borderRadius: 3, 
              border: '1px solid rgba(139, 92, 246, 0.15)',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(168, 85, 247, 0.02) 100%)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem' }}>
                  Total Requests
                </Typography>
                <Typography variant="h4" className="tm-stat-value" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                  {requests.length}
                </Typography>
              </Box>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: 2, 
                bgcolor: '#EDE9FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={18} color="#8B5CF6" />
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ 
        borderRadius: 3, 
        overflow: 'hidden', 
        border: '1px solid rgba(20, 184, 166, 0.2)',
        boxShadow: '0 2px 12px rgba(20, 184, 166, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(20, 184, 166, 0.15)',
        },
      }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            borderBottom: '1px solid rgba(20, 184, 166, 0.15)',
            bgcolor: 'rgba(20, 184, 166, 0.04)',
            '& .MuiTab-root': { 
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: 'rgba(20, 184, 166, 0.06)',
              },
            },
            '& .Mui-selected': { color: '#0D9488 !important' },
            '& .MuiTabs-indicator': { 
              background: 'linear-gradient(90deg, #14B8A6 0%, #06B6D4 100%)', 
              borderRadius: '3px 3px 0 0',
              height: 3,
              boxShadow: '0 -2px 10px rgba(20, 184, 166, 0.4)',
            },
          }}
        >
          <Tab label={`My Requests (${myRequests.length})`} />
          {canViewPendingTab && <Tab label={`Pending Approval (${pendingRequests.length})`} />}
          {canViewAllRequests && <Tab label={`All Requests (${requests.length})`} />}
        </Tabs>

        <Box sx={{ p: 0 }}>
          {tabValue === 0 && renderRequestsTable(myRequests, false)}
          {tabValue === 1 && canViewPendingTab && renderRequestsTable(pendingRequests, true)}
          {tabValue === 2 && canViewAllRequests && renderRequestsTable(requests, true)}
        </Box>
      </Paper>

      {/* Create Request Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(20, 184, 166, 0.25)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', 
          color: 'white',
          borderRadius: '12px 12px 0 0',
        }}>
          <Send style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Submit Correction Request
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            type="date"
            label="Date"
            value={newRequest.date}
            onChange={(e) => setNewRequest({ ...newRequest, date: e.target.value })}
            sx={{ mb: 3 }}
            InputLabelProps={{ shrink: true }}
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Requested Punches:</Typography>
          {newRequest.requestedPunches.map((punch, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={punch.type}
                  label="Type"
                  onChange={(e) => {
                    const newPunches = [...newRequest.requestedPunches];
                    newPunches[idx].type = e.target.value as 'IN' | 'OUT';
                    setNewRequest({ ...newRequest, requestedPunches: newPunches });
                  }}
                >
                  <MenuItem value="IN">IN</MenuItem>
                  <MenuItem value="OUT">OUT</MenuItem>
                </Select>
              </FormControl>
              <TextField
                type="datetime-local"
                size="small"
                label="Time"
                value={punch.time}
                onChange={(e) => {
                  const newPunches = [...newRequest.requestedPunches];
                  newPunches[idx].time = e.target.value;
                  setNewRequest({ ...newRequest, requestedPunches: newPunches });
                }}
                sx={{ flex: 1 }}
                InputLabelProps={{ shrink: true }}
              />
              {newRequest.requestedPunches.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => {
                    const newPunches = newRequest.requestedPunches.filter((_, i) => i !== idx);
                    setNewRequest({ ...newRequest, requestedPunches: newPunches });
                  }}
                  sx={{ color: '#d32f2f' }}
                >
                  ×
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            size="small"
            onClick={() => setNewRequest({
              ...newRequest,
              requestedPunches: [...newRequest.requestedPunches, { type: 'OUT', time: '' }]
            })}
            sx={{ mb: 2, color: '#14B8A6' }}
          >
            + Add Punch
          </Button>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Correction"
            value={newRequest.reason}
            onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
            placeholder="Explain why you need this correction..."
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'rgba(20, 184, 166, 0.03)' }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: '#666' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateRequest}
            disabled={!newRequest.date || !newRequest.reason}
            sx={{ 
              background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
              },
            }}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(20, 184, 166, 0.25)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', 
          color: 'white',
          borderRadius: '12px 12px 0 0',
        }}>
          Request Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRequest && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Employee</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedRequest.employeeId?.fullName}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">{formatDate(selectedRequest.date)}</Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Requested Punches:</Typography>
              <Box sx={{ mb: 2 }}>
                {selectedRequest.requestedPunches.map((punch, idx) => (
                  <Chip
                    key={idx}
                    size="small"
                    label={`${punch.type} at ${formatTime(punch.time)}`}
                    sx={{
                      mr: 1,
                      mb: 1,
                      bgcolor: punch.type === 'IN' ? '#e8f5e9' : '#ffebee',
                      color: punch.type === 'IN' ? '#2e7d32' : '#c62828',
                    }}
                  />
                ))}
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Reason:</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{selectedRequest.reason}</Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Status:</Typography>
                {getStatusChip(selectedRequest.status)}
              </Box>

              {selectedRequest.reviewedBy && (
                <Alert severity={selectedRequest.status === 'APPROVED' ? 'success' : 'error'} sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Reviewed by:</strong> {selectedRequest.reviewedBy.fullName}
                  </Typography>
                  {selectedRequest.reviewComment && (
                    <Typography variant="body2">
                      <strong>Comment:</strong> {selectedRequest.reviewComment}
                    </Typography>
                  )}
                  {selectedRequest.reviewedAt && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {formatDate(selectedRequest.reviewedAt)}
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'rgba(20, 184, 166, 0.03)' }}>
          <Button onClick={() => setDetailDialogOpen(false)} sx={{ color: '#666' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog 
        open={reviewDialogOpen} 
        onClose={() => setReviewDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(16, 185, 129, 0.25)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
          color: 'white',
          borderRadius: '12px 12px 0 0',
        }}>
          <CheckCircle style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Review Request
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRequest && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Employee:</strong> {selectedRequest.employeeId?.fullName}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {formatDate(selectedRequest.date)}
                </Typography>
                <Typography variant="body2">
                  <strong>Reason:</strong> {selectedRequest.reason}
                </Typography>
              </Alert>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Decision</InputLabel>
                <Select
                  value={reviewForm.action}
                  label="Decision"
                  onChange={(e) => setReviewForm({ ...reviewForm, action: e.target.value as 'APPROVE' | 'REJECT' })}
                >
                  <MenuItem value="APPROVE">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={18} color="#4caf50" />
                      Approve
                    </Box>
                  </MenuItem>
                  <MenuItem value="REJECT">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <XCircle size={18} color="#f44336" />
                      Reject
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Comment (optional)"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Add a comment for the employee..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.03)' }}>
          <Button onClick={() => setReviewDialogOpen(false)} sx={{ color: '#666' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReview}
            sx={{
              bgcolor: reviewForm.action === 'APPROVE' ? '#10B981' : '#EF4444',
              '&:hover': { 
                bgcolor: reviewForm.action === 'APPROVE' ? '#059669' : '#DC2626',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease',
              borderRadius: 2,
            }}
          >
            {reviewForm.action === 'APPROVE' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
