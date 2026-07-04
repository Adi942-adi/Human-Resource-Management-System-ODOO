import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { leaveService } from '../services/api';
import { format } from 'date-fns';

export const AdminLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      // Fetch all leaves (both pending and approved)
      const response = await leaveService.getAllLeaves();
      setLeaves(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leaves data');
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      setActionLoading(prev => ({ ...prev, [leaveId]: true }));
      await leaveService.approveLeave(leaveId);
      await fetchLeaves(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve leave');
      console.error('Error approving leave:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  const handleRejectLeave = async (leaveId) => {
    const rejectionReason = window.prompt('Reason for rejecting this leave request:');
    if (!rejectionReason?.trim()) return;

    try {
      setActionLoading(prev => ({ ...prev, [leaveId]: true }));
      await leaveService.rejectLeave(leaveId, rejectionReason.trim());
      await fetchLeaves(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject leave');
      console.error('Error rejecting leave:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  if (loading) {
    return (
      <Layout isAdmin={true}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading leave requests...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={true}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Approval</h1>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>All Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
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
                    <TableCell>
                      <span>
                        {leave.employee?.personalDetails?.firstName} {leave.employee?.personalDetails?.lastName}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">{leave.leaveType}</TableCell>
                    <TableCell>{format(new Date(leave.startDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell><StatusBadge status={leave.status} /></TableCell>
                    <TableCell>
                      {leave.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveLeave(leave._id)}
                            disabled={actionLoading[leave._id]}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRejectLeave(leave._id)}
                            disabled={actionLoading[leave._id]}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
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
