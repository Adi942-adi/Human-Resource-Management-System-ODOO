import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DollarSign, ArrowLeft, Download, Calendar, TrendingUp, FileText, Plus, Edit, Check, X } from 'lucide-react';
import api, { userService, payrollService } from '../services/api';

const Payroll = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Mock user data for demo purposes when not authenticated
  const mockUser = user || { id: 'demo-id', role: 'employee' };

  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    employee: '',
    month: selectedMonth,
    year: selectedYear,
    basicSalary: 0,
    hra: 0,
    da: 0,
    otherAllowances: 0,
    deductions: 0,
    paidDays: 22,
    unpaidDays: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      if (user?.role === 'admin' || user?.role === 'hr') {
        fetchEmployees();
      }
      fetchPayroll();
    } else {
      // Mock data for demo
      setPayroll([
        {
          _id: '1',
          month: selectedMonth,
          year: selectedYear,
          basicSalary: 5000,
          hra: 2000,
          da: 1000,
          otherAllowances: 500,
          deductions: 500,
          netSalary: 8000,
          paidDays: 22,
          unpaidDays: 0,
          status: 'processed',
          processedAt: new Date()
        }
      ]);
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, user]);

  const fetchEmployees = async () => {
    try {
      const response = await userService.getAllUsers();
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchPayroll = async () => {
    try {
      let response;
      if (user?.role === 'admin' || user?.role === 'hr') {
        response = await payrollService.getAllPayroll(selectedMonth, selectedYear);
      } else {
        response = await payrollService.getMyPayroll(selectedMonth, selectedYear);
      }
      setPayroll(response.data);
    } catch (error) {
      console.error('Failed to fetch payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = (payrollRecord) => {
    const payslipData = {
      employee: user.role === 'employee' ? user.personalDetails : payrollRecord.employee?.personalDetails,
      payroll: payrollRecord,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(payslipData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${selectedMonth}_${selectedYear}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreatePayroll = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await payrollService.createPayroll({
        ...formData,
        month: selectedMonth,
        year: selectedYear
      });
      setMessage('Payroll record created successfully');
      setShowCreateForm(false);
      setFormData({
        employee: '',
        month: selectedMonth,
        year: selectedYear,
        basicSalary: 0,
        hra: 0,
        da: 0,
        otherAllowances: 0,
        deductions: 0,
        paidDays: 22,
        unpaidDays: 0
      });
      fetchPayroll();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create payroll record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePayroll = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await payrollService.updatePayroll(editingRecord._id, formData);
      setMessage('Payroll record updated successfully');
      setEditingRecord(null);
      setFormData({
        employee: '',
        month: selectedMonth,
        year: selectedYear,
        basicSalary: 0,
        hra: 0,
        da: 0,
        otherAllowances: 0,
        deductions: 0,
        paidDays: 22,
        unpaidDays: 0
      });
      fetchPayroll();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update payroll record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessPayroll = async (recordId) => {
    try {
      await payrollService.processPayroll(recordId);
      setMessage('Payroll processed successfully');
      fetchPayroll();
    } catch (error) {
      setMessage('Failed to process payroll');
    }
  };

  const handleMarkAsPaid = async (recordId) => {
    try {
      await payrollService.markAsPaid(recordId);
      setMessage('Payroll marked as paid');
      fetchPayroll();
    } catch (error) {
      setMessage('Failed to mark payroll as paid');
    }
  };

  const handleDeletePayroll = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this payroll record?')) return;

    try {
      await payrollService.deletePayroll(recordId);
      setMessage('Payroll record deleted successfully');
      fetchPayroll();
    } catch (error) {
      setMessage('Failed to delete payroll record');
    }
  };

  const openEditForm = (record) => {
    setEditingRecord(record);
    setFormData({
      employee: record.employee._id,
      month: record.month,
      year: record.year,
      basicSalary: record.basicSalary,
      hra: record.hra || 0,
      da: record.da || 0,
      otherAllowances: record.otherAllowances || 0,
      deductions: record.deductions || 0,
      paidDays: record.paidDays || 22,
      unpaidDays: record.unpaidDays || 0
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'processed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
            </div>
            <div className="flex items-center space-x-4">
              {(user?.role === 'admin' || user?.role === 'hr') && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Payroll</span>
                </button>
              )}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Create/Edit Payroll Modal */}
        {(showCreateForm || editingRecord) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingRecord ? 'Edit Payroll' : 'Create Payroll'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingRecord(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <form onSubmit={editingRecord ? handleUpdatePayroll : handleCreatePayroll} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee
                  </label>
                  <select
                    value={formData.employee}
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    required
                    disabled={!!editingRecord}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.personalDetails?.firstName} {emp.personalDetails?.lastName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Basic Salary
                    </label>
                    <input
                      type="number"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HRA
                    </label>
                    <input
                      type="number"
                      value={formData.hra}
                      onChange={(e) => setFormData({ ...formData, hra: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DA
                    </label>
                    <input
                      type="number"
                      value={formData.da}
                      onChange={(e) => setFormData({ ...formData, da: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Allowances
                    </label>
                    <input
                      type="number"
                      value={formData.otherAllowances}
                      onChange={(e) => setFormData({ ...formData, otherAllowances: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deductions
                    </label>
                    <input
                      type="number"
                      value={formData.deductions}
                      onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Net Salary
                    </label>
                    <input
                      type="text"
                      value={`$${(formData.basicSalary + formData.hra + formData.da + formData.otherAllowances - formData.deductions).toLocaleString()}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-bold"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paid Days
                    </label>
                    <input
                      type="number"
                      value={formData.paidDays}
                      onChange={(e) => setFormData({ ...formData, paidDays: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unpaid Days
                    </label>
                    <input
                      type="number"
                      value={formData.unpaidDays}
                      onChange={(e) => setFormData({ ...formData, unpaidDays: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingRecord(null);
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : (editingRecord ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : payroll.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No payroll records found for the selected period</p>
          </div>
        ) : (
          <div className="space-y-6">
            {payroll.map((record) => (
              <div key={record._id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    {(user?.role === 'admin' || user?.role === 'hr') && (
                      <p className="text-sm text-gray-600 mb-1">
                        {record.employee?.personalDetails?.firstName} {record.employee?.personalDetails?.lastName} ({record.employee?.employeeId})
                      </p>
                    )}
                    <h3 className="text-xl font-bold text-gray-900">
                      {months[parseInt(record.month) - 1]} {record.year}
                    </h3>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                      {record.processedAt && (
                        <span className="text-sm text-gray-600">
                          Processed on {new Date(record.processedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(user?.role === 'admin' || user?.role === 'hr') && (
                      <>
                        {record.status === 'pending' && (
                          <button
                            onClick={() => handleProcessPayroll(record._id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                          >
                            <Check className="w-4 h-4" />
                            <span>Process</span>
                          </button>
                        )}
                        {record.status === 'processed' && (
                          <button
                            onClick={() => handleMarkAsPaid(record._id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                          >
                            <Check className="w-4 h-4" />
                            <span>Mark as Paid</span>
                          </button>
                        )}
                        <button
                          onClick={() => openEditForm(record)}
                          className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeletePayroll(record._id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                          >
                            <X className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        )}
                      </>
                    )}
                    {(record.status === 'processed' || record.status === 'paid') && (
                      <button
                        onClick={() => handleDownloadPayslip(record)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Payslip</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Earnings */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span>Earnings</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Basic Salary</span>
                        <span className="font-semibold text-gray-900">${record.basicSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">HRA</span>
                        <span className="font-semibold text-gray-900">${record.hra?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">DA</span>
                        <span className="font-semibold text-gray-900">${record.da?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Other Allowances</span>
                        <span className="font-semibold text-gray-900">${record.otherAllowances?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between py-2 bg-green-50 rounded-lg px-3">
                        <span className="text-green-900 font-semibold">Total Earnings</span>
                        <span className="font-bold text-green-900">
                          ${(record.basicSalary + (record.hra || 0) + (record.da || 0) + (record.otherAllowances || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions & Net */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-red-600" />
                      <span>Deductions</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Total Deductions</span>
                        <span className="font-semibold text-red-600">-${record.deductions?.toLocaleString() || 0}</span>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2 mt-6">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span>Attendance</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Paid Days</span>
                        <span className="font-semibold text-gray-900">{record.paidDays}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Unpaid Days</span>
                        <span className="font-semibold text-gray-900">{record.unpaidDays}</span>
                      </div>
                    </div>

                    <div className="flex justify-between py-4 bg-primary-50 rounded-lg px-3 mt-4">
                      <span className="text-primary-900 font-bold text-lg">Net Salary</span>
                      <span className="font-bold text-primary-900 text-lg">${record.netSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        {payroll.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Earnings (YTD)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${payroll.reduce((sum, p) => sum + p.basicSalary + (p.hra || 0) + (p.da || 0) + (p.otherAllowances || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Deductions (YTD)</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${payroll.reduce((sum, p) => sum + (p.deductions || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Net Salary (YTD)</p>
                  <p className="text-2xl font-bold text-primary-600">
                    ${payroll.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Payroll;
