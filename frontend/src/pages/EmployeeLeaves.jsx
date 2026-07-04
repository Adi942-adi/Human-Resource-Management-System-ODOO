import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { leaveService } from '../services/api';
import { differenceInCalendarDays, format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  leaveType: 'paid',
  startDate: '',
  endDate: '',
  reason: '',
  remarks: '',
};

export const EmployeeLeaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await leaveService.getMyLeaves();
      setLeaves(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const leaveDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    return differenceInCalendarDays(new Date(formData.endDate), new Date(formData.startDate)) + 1;
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (leaveDays <= 0) {
      setError('End date must be after start date');
      return;
    }

    try {
      setSubmitting(true);
      await leaveService.applyLeave(formData);
      setMessage('Leave request submitted successfully');
      setFormData(initialForm);
      setShowForm(false);
      await fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (leaveId) => {
    if (!window.confirm('Cancel this leave request?')) return;

    try {
      setMessage('');
      setError('');
      await leaveService.cancelLeave(leaveId);
      setMessage('Leave request cancelled');
      await fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel leave request');
    }
  };

  if (loading) {
    return (
      <Layout isAdmin={user?.role === 'admin' || user?.role === 'hr'}>
        <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
          Loading leave data...
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={user?.role === 'admin' || user?.role === 'hr'}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-sm text-gray-500">Apply for leave and track approval status.</p>
          </div>
          <Button onClick={() => setShowForm((value) => !value)}>
            {showForm ? 'Close Form' : 'Apply for Leave'}
          </Button>
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

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>New Leave Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Leave Type</label>
                  <select
                    value={formData.leaveType}
                    onChange={(event) => setFormData((current) => ({ ...current, leaveType: event.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="paid">Paid Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Total Days</label>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-semibold text-gray-900">
                    {leaveDays > 0 ? leaveDays : 0}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(event) => setFormData((current) => ({ ...current, startDate: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(event) => setFormData((current) => ({ ...current, endDate: event.target.value }))}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(event) => setFormData((current) => ({ ...current, reason: event.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Remarks</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(event) => setFormData((current) => ({ ...current, remarks: event.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            {leaves.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell className="capitalize">{leave.leaveType}</TableCell>
                      <TableCell>{format(new Date(leave.startDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{leave.totalDays}</TableCell>
                      <TableCell><StatusBadge status={leave.status} /></TableCell>
                      <TableCell>
                        {leave.status === 'pending' ? (
                          <Button size="sm" variant="danger" onClick={() => handleCancel(leave._id)}>
                            Cancel
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-6 text-center text-gray-500">No leave requests found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
