import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { DashboardCard } from '../components/ui/DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, FileText, DollarSign, CheckCircle } from 'lucide-react';
import { attendanceService, leaveService, payrollService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalLeaves: 0,
    pendingLeaves: 0,
    averageHours: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const today = now.toISOString().split('T')[0];

      const [attendanceResponse, todayResponse, leaveResponse] = await Promise.all([
        attendanceService.getMyAttendance(
          monthStart.toISOString().split('T')[0],
          monthEnd.toISOString().split('T')[0]
        ),
        attendanceService.getMyAttendance(today, today),
        leaveService.getMyLeaves(),
      ]);

      const attendanceData = attendanceResponse.data;
      const presentCount = attendanceData.filter(a => a.status === 'present').length;
      const totalHours = attendanceData.reduce((sum, a) => sum + (a.workHours || 0), 0);
      const avgHours = attendanceData.length > 0 ? (totalHours / attendanceData.length).toFixed(1) : 0;

      const leaveData = leaveResponse.data;
      const totalLeavesCount = leaveData.length;
      const pendingLeavesCount = leaveData.filter(l => l.status === 'pending').length;

      setStats({
        totalPresent: presentCount,
        totalLeaves: totalLeavesCount,
        pendingLeaves: pendingLeavesCount,
        averageHours: avgHours,
      });
      setRecentAttendance(attendanceData.slice(0, 5));
      setTodayAttendance(todayResponse.data[0] || null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      setActionLoading(true);
      setMessage('');
      setError('');
      if (action === 'checkin') {
        await attendanceService.checkIn();
        setMessage('Checked in successfully');
      } else {
        await attendanceService.checkOut();
        setMessage('Checked out successfully');
      }
      await fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action === 'checkin' ? 'check in' : 'check out'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const canCheckIn = !todayAttendance?.checkIn;
  const canCheckOut = Boolean(todayAttendance?.checkIn && !todayAttendance?.checkOut);

  if (loading) {
    return (
      <Layout isAdmin={false}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={false}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.personalDetails?.firstName}!</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleAction('checkin')} disabled={!canCheckIn || actionLoading}>
              {actionLoading && canCheckIn ? 'Saving...' : 'Check In'}
            </Button>
            <Button variant="secondary" onClick={() => handleAction('checkout')} disabled={!canCheckOut || actionLoading}>
              {actionLoading && canCheckOut ? 'Saving...' : 'Check Out'}
            </Button>
          </div>
        </div>

        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Present This Month"
            value={stats.totalPresent}
            icon={CheckCircle}
            trend="+2 this week"
            trendUp
          />
          <DashboardCard
            title="Total Leaves"
            value={stats.totalLeaves}
            icon={FileText}
          />
          <DashboardCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon={Calendar}
          />
          <DashboardCard
            title="Avg Hours"
            value={`${stats.averageHours}h`}
            icon={DollarSign}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div key={record._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.checkIn && new Date(record.checkIn).toLocaleTimeString()} - {record.checkOut && new Date(record.checkOut).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{record.workHours || 0}h</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' :
                        record.status === 'absent' ? 'bg-red-100 text-red-700' :
                        record.status === 'half-day' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No attendance records</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
