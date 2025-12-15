'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/services/api';
import {
  Box,
  Paper,
  Typography,
  Button,
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
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
  Avatar,
} from '@mui/material';
import { Clock, LogIn, LogOut, Calendar, Timer, AlertTriangle, Edit, Eye, Users, UserCheck, UserX, Coffee, History, TrendingUp, Zap, Target, Award } from 'lucide-react';
import { toast } from 'sonner';

interface Punch {
  type: 'IN' | 'OUT';
  time: string;
  location?: string;
}

interface TodayAttendanceStatus {
  employee: Employee;
  status: 'checked-in' | 'checked-out' | 'not-arrived' | 'on-break';
  checkInTime?: string;
  checkOutTime?: string;
  lastPunchTime?: string;
  totalMinutes: number;
}

interface AttendanceRecord {
  _id: string;
  employeeId: { _id: string; firstName: string; lastName: string; fullName: string; employeeNumber: string };
  date: string;
  punches: Punch[];
  totalWorkMinutes: number;
  hasMissedPunch: boolean;
  finalisedForPayroll: boolean;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  employeeNumber: string;
}

export default function AttendanceTab() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [todayAllRecords, setTodayAllRecords] = useState<AttendanceRecord[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [punchPolicy, setPunchPolicy] = useState<string>('MULTIPLE');
  const [userId, setUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'checked-in' | 'checked-out' | 'not-arrived'>('all');
  const [activeTab, setActiveTab] = useState<number>(0); // 0 = Today, 1 = History

  const [correctionForm, setCorrectionForm] = useState({
    punches: [{ type: 'IN', time: '' }],
    reason: '',
  });

  // Role-based permissions - matches backend controller @Roles decorators
  const isSystemAdmin = userRole === 'System Admin';
  const isHRAdmin = userRole === 'HR Admin';
  const isHRManager = userRole === 'HR Manager';
  const isAdmin = isSystemAdmin || isHRAdmin;
  const isManager = ['Department Head', 'Line Manager'].includes(userRole);
  const isEmployee = !isAdmin && !isHRManager && !isManager;

  // Who can do what - based on backend controller
  const canViewAllRecords = isAdmin || isHRManager;
  const canViewTeamRecords = isManager;
  const canCorrectAttendance = isAdmin || isHRManager || isManager; // PATCH: SYSTEM_ADMIN, HR_ADMIN, HR_MANAGER, DEPARTMENT_HEAD
  const canChangePunchPolicy = isSystemAdmin; // PATCH punch-policy: SYSTEM_ADMIN only

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

      // Helper function to safely parse JSON responses
      const safeJsonParse = async (response: Response) => {
        const text = await response.text();
        if (!text || text.trim() === '') return null;
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      };

      const [recordsRes, todayRes, policyRes, employeesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/time-management/attendance`, { headers }),
        fetch(`${API_BASE_URL}/time-management/attendance/my-today`, { headers }),
        fetch(`${API_BASE_URL}/time-management/settings/punch-policy`, { headers }),
        fetch(`${API_BASE_URL}/api/employee-profile`, { headers }),
      ]);

      if (recordsRes.ok) {
        const data = await safeJsonParse(recordsRes);
        const allRecords = Array.isArray(data) ? data : [];
        setRecords(allRecords);

        // Filter today's records for schedule view
        // Use the same formatting as displayDate to ensure consistency
        const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        const todaysRecords = allRecords.filter((r: AttendanceRecord) => {
          if (!r.date) return false;
          const recordFormatted = new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          return recordFormatted === todayFormatted;
        });

        setTodayAllRecords(todaysRecords);
      }

      if (todayRes.ok) {
        const data = await safeJsonParse(todayRes);
        if (data) setTodayRecord(data);
      }

      if (policyRes.ok) {
        const data = await safeJsonParse(policyRes);
        if (data) setPunchPolicy(data.value || 'MULTIPLE');
      }

      if (employeesRes.ok) {
        const data = await safeJsonParse(employeesRes);
        const employeesList = data?.data || (Array.isArray(data) ? data : []);
        setEmployees(employeesList);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token || !userId) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/time-management/attendance/clock-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employeeId: userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to clock in';
        try {
          if (errorText) {
            const error = JSON.parse(errorText);
            errorMessage = error.message || errorMessage;
          }
        } catch { }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      let data: { message?: string } = {};
      try {
        if (responseText) data = JSON.parse(responseText);
      } catch { }
      toast.success(data.message || 'Clocked in successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token || !userId) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/time-management/attendance/clock-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employeeId: userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to clock out';
        try {
          if (errorText) {
            const error = JSON.parse(errorText);
            errorMessage = error.message || errorMessage;
          }
        } catch { }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      let data: { message?: string } = {};
      try {
        if (responseText) data = JSON.parse(responseText);
      } catch { }
      toast.success(data.message || 'Clocked out successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to clock out');
    }
  };

  const handleCorrection = async () => {
    if (!selectedRecord) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/time-management/attendance/${selectedRecord._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          punches: correctionForm.punches.filter(p => p.time),
          reason: correctionForm.reason,
          correctedBy: userId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to correct attendance';
        try {
          if (errorText) {
            const error = JSON.parse(errorText);
            errorMessage = error.message || errorMessage;
          }
        } catch { }
        throw new Error(errorMessage);
      }

      toast.success('Attendance corrected successfully!');
      setCorrectionDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to correct attendance');
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatWorkTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getLastPunchType = (): 'IN' | 'OUT' | null => {
    if (!todayRecord || todayRecord.punches.length === 0) return null;
    return todayRecord.punches[todayRecord.punches.length - 1].type;
  };

  // Get today's attendance status from today's records directly
  const getTodayAttendanceSchedule = (): TodayAttendanceStatus[] => {
    // Build schedule from today's attendance records
    return todayAllRecords.map(record => {
      const employee: Employee = record.employeeId || {
        _id: 'unknown',
        firstName: 'Unknown',
        lastName: 'Employee',
        fullName: 'Unknown Employee',
        employeeNumber: 'N/A'
      };

      if (!record.punches || record.punches.length === 0) {
        return {
          employee,
          status: 'not-arrived' as const,
          totalMinutes: 0,
        };
      }

      const lastPunch = record.punches[record.punches.length - 1];
      const firstPunch = record.punches[0];
      const lastOutPunch = [...record.punches].reverse().find(p => p.type === 'OUT');

      let status: 'checked-in' | 'checked-out' | 'not-arrived' | 'on-break';
      if (lastPunch.type === 'IN') {
        status = 'checked-in';
      } else if (lastPunch.type === 'OUT') {
        status = 'checked-out';
      } else {
        status = 'not-arrived';
      }

      return {
        employee,
        status,
        checkInTime: firstPunch?.time,
        checkOutTime: lastOutPunch?.time,
        lastPunchTime: lastPunch?.time,
        totalMinutes: record.totalWorkMinutes,
      };
    });
  };

  const todaySchedule = getTodayAttendanceSchedule();

  // Count statistics
  const checkedInCount = todaySchedule.filter(s => s.status === 'checked-in').length;
  const checkedOutCount = todaySchedule.filter(s => s.status === 'checked-out').length;
  const notArrivedCount = todaySchedule.filter(s => s.status === 'not-arrived').length;

  // Filter schedule based on selected filter
  const filteredSchedule = scheduleFilter === 'all'
    ? todaySchedule
    : todaySchedule.filter(s => s.status === scheduleFilter);

  // Filter records based on role
  const filteredRecords = isEmployee
    ? records.filter(r => r.employeeId?._id === userId)
    : records;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400, gap: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <CircularProgress size={48} sx={{ color: '#EC4899' }} />
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}>
            <Clock size={20} color="#EC4899" />
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>Loading attendance data...</Typography>
      </Box>
    );
  }

  return (
    <Box className="tm-fade-in">
      {/* Tab Navigation */}
      <Paper elevation={0} sx={{
        borderRadius: 3,
        mb: 3,
        overflow: 'hidden',
        border: '1px solid rgba(236, 72, 153, 0.2)',
        boxShadow: '0 2px 12px rgba(236, 72, 153, 0.08)',
      }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            bgcolor: 'rgba(236, 72, 153, 0.04)',
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'none',
              minHeight: 60,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: 'rgba(236, 72, 153, 0.06)',
              },
            },
            '& .Mui-selected': {
              color: '#EC4899 !important',
              bgcolor: 'rgba(236, 72, 153, 0.08) !important',
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(90deg, #EC4899 0%, #F472B6 100%)',
              height: 3,
              borderRadius: '3px 3px 0 0',
              boxShadow: '0 -2px 10px rgba(236, 72, 153, 0.4)',
            },
          }}
        >
          <Tab
            icon={<Zap size={18} />}
            iconPosition="start"
            label="Today"
          />
          <Tab
            icon={<History size={18} />}
            iconPosition="start"
            label="History"
          />
        </Tabs>
      </Paper>

      {/* TODAY TAB */}
      {activeTab === 0 && (
        <>
          {/* Today's Status Card */}
          <Paper
            elevation={0}
            sx={{
              p: 0,
              mb: 3,
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(236, 72, 153, 0.15)',
            }}
          >
            <Box sx={{
              background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
              p: 3,
              position: 'relative',
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 7 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Box sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Clock size={22} color="white" />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                        Today's Attendance
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Typography>
                    </Box>
                  </Box>

                  {todayRecord && todayRecord.punches.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1.5, px: 2, py: 1 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.65rem' }}>Punches</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>{todayRecord.punches.length}</Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1.5, px: 2, py: 1 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.65rem' }}>First In</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>{formatTime(todayRecord.punches[0].time)}</Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1.5, px: 2, py: 1 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.65rem' }}>Work Time</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>{formatWorkTime(todayRecord.totalWorkMinutes)}</Typography>
                      </Box>
                      {todayRecord.punches.length > 1 && (
                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1.5, px: 2, py: 1 }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.65rem' }}>Last {todayRecord.punches[todayRecord.punches.length - 1].type}</Typography>
                          <Typography sx={{ color: 'white', fontWeight: 600 }}>{formatTime(todayRecord.punches[todayRecord.punches.length - 1].time)}</Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1 }}>
                      No punches yet. Clock in to start your day.
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<LogIn size={18} />}
                    onClick={handleClockIn}
                    disabled={getLastPunchType() === 'IN'}
                    sx={{
                      bgcolor: 'white',
                      color: '#EC4899',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                      '&:disabled': { bgcolor: 'rgba(255,255,255,0.4)', color: 'rgba(0,0,0,0.25)' },
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                    }}
                  >
                    Clock In
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LogOut size={18} />}
                    onClick={handleClockOut}
                    disabled={!todayRecord || todayRecord.punches.length === 0 || getLastPunchType() === 'OUT'}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                      '&:disabled': { color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.2)' },
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                    }}
                  >
                    Clock Out
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {punchPolicy === 'FIRST_LAST' && (
              <Alert
                severity="info"
                icon={<Target size={18} />}
                sx={{
                  borderRadius: 0,
                  bgcolor: 'rgba(236, 72, 153, 0.08)',
                  color: '#EC4899',
                  '& .MuiAlert-icon': { color: '#EC4899' },
                  borderTop: '1px solid rgba(236, 72, 153, 0.2)',
                }}
              >
                <strong>Punch Policy: FIRST_LAST</strong> — Only the first clock-in and last clock-out of the day count.
              </Alert>
            )}
          </Paper>

          {/* Today's Attendance Schedule - Only for managers and above */}
          {(canViewAllRecords || canViewTeamRecords) && (
            <Paper elevation={0} sx={{
              borderRadius: 2.5,
              overflow: 'hidden',
              border: '1px solid rgba(236, 72, 153, 0.12)',
            }}>
              <Box sx={{
                p: 2,
                borderBottom: '1px solid rgba(236, 72, 153, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1.5,
                bgcolor: 'rgba(236, 72, 153, 0.03)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: '#EC4899',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Users size={18} color="white" />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1E293B' }}>
                    Who's Working Today
                  </Typography>
                </Box>

                {/* Statistics Chips */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    icon={<UserCheck size={14} />}
                    label={`Working: ${checkedInCount}`}
                    onClick={() => setScheduleFilter(scheduleFilter === 'checked-in' ? 'all' : 'checked-in')}
                    sx={{
                      bgcolor: scheduleFilter === 'checked-in' ? '#10B981' : '#DCFCE7',
                      color: scheduleFilter === 'checked-in' ? 'white' : '#059669',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  />
                  <Chip
                    size="small"
                    icon={<LogOut size={14} />}
                    label={`Left: ${checkedOutCount}`}
                    onClick={() => setScheduleFilter(scheduleFilter === 'checked-out' ? 'all' : 'checked-out')}
                    sx={{
                      bgcolor: scheduleFilter === 'checked-out' ? '#3B82F6' : '#DBEAFE',
                      color: scheduleFilter === 'checked-out' ? 'white' : '#2563EB',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  />
                </Box>
              </Box>

              <TableContainer sx={{ maxHeight: 450 }} className="tm-scrollbar">
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#F8FAFC', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#F8FAFC', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#F8FAFC', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check In</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#F8FAFC', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check Out</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#F8FAFC', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Work Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSchedule.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <Box className="tm-empty-state">
                            <Users size={48} color="#CBD5E1" style={{ marginBottom: 12 }} className="tm-empty-state-icon" />
                            <Typography sx={{ fontWeight: 600, color: '#64748B' }}>
                              No attendance records for today yet
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
                              Records will appear as employees clock in
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSchedule.map((item) => (
                        <TableRow
                          key={item.employee._id}
                          sx={{
                            '&:hover': { bgcolor: '#F8FAFC' },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  bgcolor: item.status === 'checked-in' ? '#10B981'
                                    : item.status === 'checked-out' ? '#3B82F6' : '#F59E0B',
                                }}
                              >
                                {item.employee.firstName?.charAt(0)}{item.employee.lastName?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                  {item.employee.fullName || `${item.employee.firstName} ${item.employee.lastName}`}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                  {item.employee.employeeNumber}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              icon={
                                item.status === 'checked-in' ? <UserCheck size={14} /> :
                                  item.status === 'checked-out' ? <LogOut size={14} /> :
                                    <UserX size={14} />
                              }
                              label={
                                item.status === 'checked-in' ? 'Working' :
                                  item.status === 'checked-out' ? 'Left' :
                                    'Not Arrived'
                              }
                              sx={{
                                bgcolor: item.status === 'checked-in' ? '#DCFCE7' :
                                  item.status === 'checked-out' ? '#DBEAFE' : '#FEF3C7',
                                color: item.status === 'checked-in' ? '#059669' :
                                  item.status === 'checked-out' ? '#2563EB' : '#D97706',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {item.checkInTime ? (
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                                {formatTime(item.checkInTime)}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">--:--</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.checkOutTime ? (
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                                {formatTime(item.checkOutTime)}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">--:--</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                              {formatWorkTime(item.totalMinutes)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}

      {/* HISTORY TAB */}
      {activeTab === 1 && (
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
              <Calendar style={{ marginRight: 8, verticalAlign: 'middle', color: '#9c27b0' }} />
              Attendance History
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  {!isEmployee && <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>}
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Punches</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Work Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isEmployee ? 5 : 6} align="center" sx={{ py: 4, color: '#666' }}>
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record._id} hover>
                      {!isEmployee && (
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {record.employeeId?.fullName || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {record.employeeId?.employeeNumber}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {record.punches.map((punch, idx) => (
                            <Chip
                              key={idx}
                              size="small"
                              label={`${punch.type} ${formatTime(punch.time)}`}
                              sx={{
                                bgcolor: punch.type === 'IN' ? '#e8f5e9' : '#ffebee',
                                color: punch.type === 'IN' ? '#2e7d32' : '#c62828',
                                fontSize: '0.7rem',
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Timer size={16} color="#9c27b0" />
                          {formatWorkTime(record.totalWorkMinutes)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {record.hasMissedPunch ? (
                          <Chip
                            size="small"
                            icon={<AlertTriangle size={14} />}
                            label="Missed Punch"
                            sx={{ bgcolor: '#fff3e0', color: '#e65100' }}
                          />
                        ) : record.finalisedForPayroll ? (
                          <Chip size="small" label="Complete" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                        ) : (
                          <Chip size="small" label="Pending" sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }} />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedRecord(record);
                            setDetailDialogOpen(true);
                          }}
                          sx={{ color: '#9c27b0' }}
                        >
                          <Eye size={18} />
                        </IconButton>
                        {canCorrectAttendance && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedRecord(record);
                              setCorrectionForm({
                                punches: record.punches.map(p => ({ type: p.type, time: new Date(p.time).toISOString().slice(0, 16) })),
                                reason: '',
                              });
                              setCorrectionDialogOpen(true);
                            }}
                            sx={{ color: '#f57c00' }}
                          >
                            <Edit size={18} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white' }}>
          Attendance Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRecord && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                {selectedRecord.employeeId?.fullName} - {formatDate(selectedRecord.date)}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Punches:</Typography>
              {selectedRecord.punches.map((punch, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Chip
                    size="small"
                    label={punch.type}
                    sx={{
                      bgcolor: punch.type === 'IN' ? '#e8f5e9' : '#ffebee',
                      color: punch.type === 'IN' ? '#2e7d32' : '#c62828',
                      width: 60,
                    }}
                  />
                  <Typography>{new Date(punch.time).toLocaleString()}</Typography>
                  {punch.location && <Typography variant="caption" color="text.secondary">({punch.location})</Typography>}
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Total Work Time</Typography>
                  <Typography variant="h6">{formatWorkTime(selectedRecord.totalWorkMinutes)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  {selectedRecord.hasMissedPunch ? (
                    <Chip size="small" icon={<AlertTriangle size={14} />} label="Missed Punch" sx={{ bgcolor: '#fff3e0', color: '#e65100' }} />
                  ) : selectedRecord.finalisedForPayroll ? (
                    <Chip size="small" label="Complete" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                  ) : (
                    <Chip size="small" label="Pending" sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }} />
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Correction Dialog */}
      <Dialog open={correctionDialogOpen} onClose={() => setCorrectionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f57c00', color: 'white' }}>
          <Edit style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Correct Attendance
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRecord && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                {selectedRecord.employeeId?.fullName} - {formatDate(selectedRecord.date)}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Punches:</Typography>
              {correctionForm.punches.map((punch, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={punch.type}
                      label="Type"
                      onChange={(e) => {
                        const newPunches = [...correctionForm.punches];
                        newPunches[idx].type = e.target.value as 'IN' | 'OUT';
                        setCorrectionForm({ ...correctionForm, punches: newPunches });
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
                      const newPunches = [...correctionForm.punches];
                      newPunches[idx].time = e.target.value;
                      setCorrectionForm({ ...correctionForm, punches: newPunches });
                    }}
                    sx={{ flex: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newPunches = correctionForm.punches.filter((_, i) => i !== idx);
                      setCorrectionForm({ ...correctionForm, punches: newPunches });
                    }}
                    sx={{ color: '#d32f2f' }}
                  >
                    ×
                  </IconButton>
                </Box>
              ))}

              <Button
                size="small"
                onClick={() => setCorrectionForm({
                  ...correctionForm,
                  punches: [...correctionForm.punches, { type: 'OUT', time: '' }]
                })}
                sx={{ mb: 2, color: '#9c27b0' }}
              >
                + Add Punch
              </Button>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason for Correction"
                value={correctionForm.reason}
                onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                required
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCorrectionDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCorrection}
            disabled={!correctionForm.reason || correctionForm.punches.filter(p => p.time).length === 0}
            sx={{ bgcolor: '#f57c00', '&:hover': { bgcolor: '#ef6c00' } }}
          >
            Save Correction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
