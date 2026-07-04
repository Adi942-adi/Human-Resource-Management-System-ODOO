import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { attendanceService } from '../services/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAttendance = async () => {
    try {
      console.log('📅 Fetching attendance data...');
      setLoading(true);
      setError('');
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      const today = format(now, 'yyyy-MM-dd');

      console.log('📅 Date range:', format(start, 'yyyy-MM-dd'), 'to', format(end, 'yyyy-MM-dd'));

      const [monthResponse, todayResponse] = await Promise.all([
        attendanceService.getMyAttendance(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd')),
        attendanceService.getMyAttendance(today, today),
      ]);

      console.log('📅 Month response:', monthResponse.data);
      console.log('📅 Today response:', todayResponse.data);

      setAttendance(monthResponse.data);
      setTodayAttendance(todayResponse.data[0] || null);
      console.log('✅ Attendance data loaded');
    } catch (err) {
      console.error('❌ Error fetching attendance:', err);
      setError(err.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const summary = useMemo(() => {
    const presentDays = attendance.filter((record) => record.status === 'present').length;
    const totalHours = attendance.reduce((sum, record) => sum + (record.workHours || 0), 0);
    const averageHours = attendance.length ? (totalHours / attendance.length).toFixed(1) : '0.0';
    return { presentDays, totalHours: totalHours.toFixed(1), averageHours };
  }, [attendance]);

  const handleAction = async (action) => {
    console.log('🔘 Clicked button:', action);
    try {
      setActionLoading(true);
      setMessage('');
      setError('');
      if (action === 'checkin') {
        console.log('🟢 Calling checkIn service...');
        const response = await attendanceService.checkIn();
        console.log('🟢 CheckIn response:', response.data);
        setMessage('Checked in successfully');
      } else {
        console.log('🔴 Calling checkOut service...');
        const response = await attendanceService.checkOut();
        console.log('🔴 CheckOut response:', response.data);
        setMessage('Checked out successfully');
      }
      await fetchAttendance();
    } catch (err) {
      console.error('❌ Error in handleAction:', err);
      setError(err.response?.data?.message || `Failed to ${action === 'checkin' ? 'check in' : 'check out'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const canCheckIn = !todayAttendance?.checkIn;
  const canCheckOut = Boolean(todayAttendance?.checkIn && !todayAttendance?.checkOut);

  console.log('🔘 canCheckIn:', canCheckIn, 'canCheckOut:', canCheckOut);
  console.log('🔘 todayAttendance:', todayAttendance);

  if (loading) {
    return (
      <Layout isAdmin={false}>
        <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
          Loading attendance data...
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={false}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-sm text-gray-500">Track today’s attendance and review this month’s records.</p>
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
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Today</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {todayAttendance?.status ? <StatusBadge status={todayAttendance.status} /> : 'Not checked in'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Check In</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {todayAttendance?.checkIn ? format(new Date(todayAttendance.checkIn), 'hh:mm a') : '-'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Check Out</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {todayAttendance?.checkOut ? format(new Date(todayAttendance.checkOut), 'hh:mm a') : '-'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500">Monthly Hours</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{summary.totalHours}h</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{record.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : '-'}</TableCell>
                      <TableCell>{record.checkOut ? format(new Date(record.checkOut), 'hh:mm a') : '-'}</TableCell>
                      <TableCell>{record.workHours ? `${record.workHours}h` : '-'}</TableCell>
                      <TableCell><StatusBadge status={record.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-6 text-center text-gray-500">No attendance records for this month</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
