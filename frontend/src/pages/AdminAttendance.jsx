import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { attendanceService } from '../services/api';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const month = now.getMonth() + 1; // 1-12
        const year = now.getFullYear();
        
        const response = await attendanceService.getMonthlyAttendance(year, month);
        setAttendance(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance data');
        console.error('Error fetching attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const handleStatusChange = async (recordId, status) => {
    try {
      setUpdatingId(recordId);
      setError('');
      const response = await attendanceService.updateAttendance(recordId, { status });
      setAttendance((records) => records.map((record) => (
        record._id === recordId ? { ...record, ...response.data } : record
      )));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update attendance');
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) {
    return (
      <Layout isAdmin={true}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading attendance data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={true}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>All Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      <span>
                        {record.employee?.personalDetails?.firstName} {record.employee?.personalDetails?.lastName}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{record.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : '-'}</TableCell>
                    <TableCell>{record.checkOut ? format(new Date(record.checkOut), 'hh:mm a') : '-'}</TableCell>
                    <TableCell>{record.workHours ? `${record.workHours}h` : '-'}</TableCell>
                    <TableCell>
                      <select
                        value={record.status}
                        onChange={(event) => handleStatusChange(record._id, event.target.value)}
                        disabled={updatingId === record._id}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="half-day">Half-day</option>
                        <option value="leave">Leave</option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
