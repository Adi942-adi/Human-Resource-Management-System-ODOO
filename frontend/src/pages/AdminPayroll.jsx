import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { payrollService, userService } from '../services/api';
import { format } from 'date-fns';

const emptyForm = {
  employee: '',
  month: '',
  year: new Date().getFullYear(),
  basicSalary: '',
  hra: '',
  da: '',
  otherAllowances: '',
  deductions: '',
  paidDays: '',
  unpaidDays: '',
};

export const AdminPayroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payrollResponse, employeesResponse] = await Promise.all([
        payrollService.getAllPayroll(selectedMonth, selectedYear),
        userService.getAllUsers(),
      ]);
      setPayroll(payrollResponse.data);
      setEmployees(employeesResponse.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payroll data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingPayroll(null);
    setFormData({ ...emptyForm, month: selectedMonth, year: selectedYear });
    setShowForm(true);
  };

  const openEditForm = (record) => {
    setEditingPayroll(record);
    setFormData({
      employee: record.employee?._id || '',
      month: selectedMonth,
      year: selectedYear,
      basicSalary: record.basicSalary || '',
      hra: record.hra || '',
      da: record.da || '',
      otherAllowances: record.otherAllowances || '',
      deductions: record.deductions || '',
      paidDays: record.paidDays || '',
      unpaidDays: record.unpaidDays || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPayroll) {
        // Don't send month/year when editing (they're unique)
        const { month, year, ...updateData } = formData;
        await payrollService.updatePayroll(editingPayroll._id, updateData);
      } else {
        await payrollService.createPayroll(formData);
      }
      setShowForm(false);
      setEditingPayroll(null);
      setFormData(emptyForm);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save payroll');
      console.error('Error saving payroll:', err);
    }
  };

  const handleProcessPayroll = async (id) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await payrollService.processPayroll(id);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payroll');
      console.error('Error processing payroll:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await payrollService.markAsPaid(id);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as paid');
      console.error('Error marking as paid:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeletePayroll = async (id) => {
    if (!window.confirm('Delete this payroll record?')) return;
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await payrollService.deletePayroll(id);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete payroll');
      console.error('Error deleting payroll:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  if (loading) {
    return (
      <Layout isAdmin={true}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading payroll data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={true}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-xl border border-gray-200 px-4 py-2 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{new Date(2000, m-1, 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-xl border border-gray-200 px-4 py-2 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              {[2023,2024,2025,2026,2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <Button onClick={openCreateForm}>Create Payroll</Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingPayroll ? 'Edit Payroll' : 'Create Payroll'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Employee</label>
                  <select
                    value={formData.employee}
                    onChange={(e) => updateField('employee', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingPayroll}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.personalDetails?.firstName} {emp.personalDetails?.lastName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Basic Salary</label>
                  <Input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => updateField('basicSalary', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">HRA</label>
                  <Input
                    type="number"
                    value={formData.hra}
                    onChange={(e) => updateField('hra', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">DA</label>
                  <Input
                    type="number"
                    value={formData.da}
                    onChange={(e) => updateField('da', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Other Allowances</label>
                  <Input
                    type="number"
                    value={formData.otherAllowances}
                    onChange={(e) => updateField('otherAllowances', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Deductions</label>
                  <Input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => updateField('deductions', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Paid Days</label>
                  <Input
                    type="number"
                    value={formData.paidDays}
                    onChange={(e) => updateField('paidDays', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Unpaid Days</label>
                  <Input
                    type="number"
                    value={formData.unpaidDays}
                    onChange={(e) => updateField('unpaidDays', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                  <Button type="submit">Save Payroll</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Payroll Records</CardTitle>
          </CardHeader>
          <CardContent>
            {payroll.length === 0 ? (
              <p className="py-6 text-center text-gray-500">No payroll records found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Month/Year</TableHead>
                    <TableHead>Basic</TableHead>
                    <TableHead>HRA</TableHead>
                    <TableHead>DA</TableHead>
                    <TableHead>Other Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payroll.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>
                        {record.employee?.personalDetails?.firstName} {record.employee?.personalDetails?.lastName}
                      </TableCell>
                      <TableCell>
                        {record.month} {record.year}
                      </TableCell>
                      <TableCell>${Number(record.basicSalary || 0).toFixed(2)}</TableCell>
                      <TableCell>${Number(record.hra || 0).toFixed(2)}</TableCell>
                      <TableCell>${Number(record.da || 0).toFixed(2)}</TableCell>
                      <TableCell>${Number(record.otherAllowances || 0).toFixed(2)}</TableCell>
                      <TableCell>${Number(record.deductions || 0).toFixed(2)}</TableCell>
                      <TableCell>${Number(record.netSalary || 0).toFixed(2)}</TableCell>
                      <TableCell><StatusBadge status={record.status} /></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => openEditForm(record)}>Edit</Button>
                          {record.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleProcessPayroll(record._id)}
                              disabled={actionLoading[record._id]}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Process
                            </Button>
                          )}
                          {record.status === 'processed' && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsPaid(record._id)}
                              disabled={actionLoading[record._id]}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleDeletePayroll(record._id)}
                            disabled={actionLoading[record._id]}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
