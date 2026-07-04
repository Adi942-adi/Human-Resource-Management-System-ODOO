import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { userService } from '../services/api';
import { Edit2, Trash2 } from 'lucide-react';

const emptyForm = {
  employeeId: '',
  email: '',
  password: '',
  role: 'employee',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  department: '',
  designation: '',
  joinDate: '',
  employmentType: 'Full-time',
  basicSalary: '',
  hra: '',
  da: '',
  otherAllowances: '',
};

const buildPayload = (formData, editing) => {
  const payload = {
    email: formData.email,
    role: formData.role,
    personalDetails: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      address: formData.address,
    },
    jobDetails: {
      department: formData.department,
      designation: formData.designation,
      joinDate: formData.joinDate || undefined,
      employmentType: formData.employmentType,
    },
    salaryStructure: {
      basicSalary: Number(formData.basicSalary || 0),
      hra: Number(formData.hra || 0),
      da: Number(formData.da || 0),
      otherAllowances: Number(formData.otherAllowances || 0),
    },
  };

  if (!editing) {
    payload.employeeId = formData.employeeId;
    payload.password = formData.password;
  }

  return payload;
};

export const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getAllUsers({
        role: 'employee',
        search: searchTerm || undefined,
      });
      setEmployees(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchEmployees, 250);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const openCreateForm = () => {
    setEditingEmployee(null);
    setFormData(emptyForm);
    setShowForm(true);
    setMessage('');
    setError('');
  };

  const openEditForm = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employeeId: employee.employeeId || '',
      email: employee.email || '',
      password: '',
      role: employee.role || 'employee',
      firstName: employee.personalDetails?.firstName || '',
      lastName: employee.personalDetails?.lastName || '',
      phone: employee.personalDetails?.phone || '',
      address: employee.personalDetails?.address || '',
      department: employee.jobDetails?.department || '',
      designation: employee.jobDetails?.designation || '',
      joinDate: employee.jobDetails?.joinDate ? employee.jobDetails.joinDate.slice(0, 10) : '',
      employmentType: employee.jobDetails?.employmentType || 'Full-time',
      basicSalary: employee.salaryStructure?.basicSalary || '',
      hra: employee.salaryStructure?.hra || '',
      da: employee.salaryStructure?.da || '',
      otherAllowances: employee.salaryStructure?.otherAllowances || '',
    });
    setShowForm(true);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      if (editingEmployee) {
        await userService.updateUser(editingEmployee._id, buildPayload(formData, true));
        setMessage('Employee updated successfully');
      } else {
        await userService.createUser(buildPayload(formData, false));
        setMessage('Employee created successfully');
      }
      setShowForm(false);
      setEditingEmployee(null);
      setFormData(emptyForm);
      await fetchEmployees();
    } catch (err) {
      const errorMsg = err.response?.data?.errors && Array.isArray(err.response.data.errors)
        ? err.response.data.errors.map(e => e.msg).join(', ')
        : (err.response?.data?.message || 'Failed to save employee');
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee account?')) return;

    try {
      setMessage('');
      setError('');
      await userService.deleteUser(id);
      setMessage('Employee deleted successfully');
      await fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  return (
    <Layout isAdmin={true}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-sm text-gray-500">Create employee records and maintain job and salary details.</p>
          </div>
          <Button onClick={openCreateForm}>Add Employee</Button>
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
              <CardTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Employee ID</label>
                  <Input
                    value={formData.employeeId}
                    onChange={(event) => updateField('employeeId', event.target.value)}
                    disabled={Boolean(editingEmployee)}
                    required={!editingEmployee}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    required
                  />
                </div>
                {!editingEmployee && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Temporary Password</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(event) => updateField('password', event.target.value)}
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                  <Input value={formData.firstName} onChange={(event) => updateField('firstName', event.target.value)} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                  <Input value={formData.lastName} onChange={(event) => updateField('lastName', event.target.value)} required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <Input value={formData.phone} onChange={(event) => updateField('phone', event.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                  <Input value={formData.department} onChange={(event) => updateField('department', event.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Designation</label>
                  <Input value={formData.designation} onChange={(event) => updateField('designation', event.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Join Date</label>
                  <Input type="date" value={formData.joinDate} onChange={(event) => updateField('joinDate', event.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(event) => updateField('employmentType', event.target.value)}
                    className="w-full bg-white/70 dark:bg-[#131129]/70 border border-gray-200 dark:border-[#2d225c]/55 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all duration-300"
                  >
                    <option value="Full-time" className="bg-white dark:bg-[#131129]">Full-time</option>
                    <option value="Part-time" className="bg-white dark:bg-[#131129]">Part-time</option>
                    <option value="Contract" className="bg-white dark:bg-[#131129]">Contract</option>
                    <option value="Intern" className="bg-white dark:bg-[#131129]">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Basic Salary</label>
                  <Input type="number" min="0" value={formData.basicSalary} onChange={(event) => updateField('basicSalary', event.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">HRA</label>
                  <Input type="number" min="0" value={formData.hra} onChange={(event) => updateField('hra', event.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">DA</label>
                  <Input type="number" min="0" value={formData.da} onChange={(event) => updateField('da', event.target.value)} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Other Allowances</label>
                  <Input type="number" min="0" value={formData.otherAllowances} onChange={(event) => updateField('otherAllowances', event.target.value)} />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(event) => updateField('address', event.target.value)}
                    className="w-full bg-white/70 dark:bg-[#131129]/70 border border-gray-200 dark:border-[#2d225c]/55 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-450 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all duration-300"
                    rows="2"
                  />
                </div>
                <div className="flex gap-2 md:col-span-2 lg:col-span-3">
                  <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Employee'}</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>All Employees ({employees.length})</CardTitle>
              <div className="w-full sm:w-80">
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search employees"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-6 text-center text-gray-500">Loading employees...</p>
            ) : employees.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                            {employee.personalDetails?.firstName?.charAt(0).toUpperCase() || 'E'}
                          </div>
                          <span>{employee.personalDetails?.firstName} {employee.personalDetails?.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.employeeId}</TableCell>
                      <TableCell>{employee.jobDetails?.department || '-'}</TableCell>
                      <TableCell>{employee.jobDetails?.designation || '-'}</TableCell>
                      <TableCell>
                        {employee.jobDetails?.joinDate
                          ? new Date(employee.jobDetails.joinDate).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(employee)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50"
                            title="Edit employee"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(employee._id)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            title="Delete employee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-6 text-center text-gray-500">No employees found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
