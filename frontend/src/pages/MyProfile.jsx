import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === '') return '-';
  return `$${Number(value).toLocaleString()}`;
};

export const MyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ phone: '', address: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getUserById(user.id);
      setProfile(response.data);
      setFormData({
        phone: response.data.personalDetails?.phone || '',
        address: response.data.personalDetails?.address || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      setError('');
      const response = await userService.updateUser(user.id, {
        personalDetails: {
          phone: formData.phone,
          address: formData.address,
        },
      });
      setProfile(response.data);
      setEditing(false);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout isAdmin={false}>
        <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
          Loading profile...
        </div>
      </Layout>
    );
  }

  const fullName = `${profile?.personalDetails?.firstName || ''} ${profile?.personalDetails?.lastName || ''}`.trim();
  const salary = profile?.salaryStructure || {};

  return (
    <Layout isAdmin={false}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">Review your employment record and keep contact details current.</p>
          </div>
          <Button variant={editing ? 'secondary' : 'primary'} onClick={() => setEditing((value) => !value)}>
            {editing ? 'Cancel' : 'Edit Contact'}
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
                  {(profile?.personalDetails?.firstName || profile?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{fullName || 'Employee'}</h2>
                <p className="text-sm text-gray-500">{profile?.employeeId}</p>
                <span className="mt-3 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase text-gray-700">
                  {profile?.role}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-gray-900">{profile?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="mt-1 text-gray-900">{formatDate(profile?.personalDetails?.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    {editing ? (
                      <Input
                        value={formData.phone}
                        onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{profile?.personalDetails?.phone || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                    <p className="mt-1 text-gray-900">{profile?.personalDetails?.emergencyContact || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    {editing ? (
                      <textarea
                        value={formData.address}
                        onChange={(event) => setFormData((current) => ({ ...current, address: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{profile?.personalDetails?.address || '-'}</p>
                    )}
                  </div>
                  {editing && (
                    <div className="md:col-span-2">
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <p className="mt-1 text-gray-900">{profile?.jobDetails?.department || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Designation</label>
                    <p className="mt-1 text-gray-900">{profile?.jobDetails?.designation || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Employment Type</label>
                    <p className="mt-1 text-gray-900">{profile?.jobDetails?.employmentType || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Join Date</label>
                    <p className="mt-1 text-gray-900">{formatDate(profile?.jobDetails?.joinDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Salary Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Basic Salary</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(salary.basicSalary)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Allowances</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency((salary.hra || 0) + (salary.da || 0) + (salary.otherAllowances || 0))}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4 md:col-span-2">
                    <p className="text-sm text-blue-700">Total Salary</p>
                    <p className="text-xl font-bold text-blue-900">{formatCurrency(salary.totalSalary)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
