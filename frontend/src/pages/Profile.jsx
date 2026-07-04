import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Building2, Mail, Phone, MapPin, Calendar, DollarSign, ArrowLeft, Save } from 'lucide-react';
import { userService } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Mock user data for demo purposes when not authenticated
  const mockUser = user || {
    id: 'demo-id',
    employeeId: 'EMP001',
    email: 'demo@example.com',
    role: 'employee',
    personalDetails: {
      firstName: 'Demo',
      lastName: 'User',
      phone: '+1234567890',
      address: '123 Demo Street, City',
      dateOfBirth: '1990-01-01'
    },
    jobDetails: {
      department: 'Engineering',
      designation: 'Software Developer',
      joinDate: '2020-01-01',
      employmentType: 'Full-time'
    },
    salaryStructure: {
      basicSalary: 5000,
      hra: 2000,
      da: 1000,
      otherAllowances: 500,
      totalSalary: 8500
    }
  };

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(mockUser);
      setEditData({
        address: mockUser.personalDetails?.address || '',
        phone: mockUser.personalDetails?.phone || ''
      });
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await userService.getUserById(user.id);
      setProfile(response.data);
      setEditData({
        address: response.data.personalDetails?.address || '',
        phone: response.data.personalDetails?.phone || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await userService.updateUser(user.id, {
        personalDetails: {
          address: editData.address,
          phone: editData.phone
        }
      });
      setMessage('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-32 h-32 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-16 h-16 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile?.personalDetails?.firstName} {profile?.personalDetails?.lastName}
              </h2>
              <p className="text-gray-600 mt-1">{profile?.employeeId}</p>
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${
                profile?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                profile?.role === 'hr' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }`}>
                {profile?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
                {user?.role === 'employee' && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900 font-medium">{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Phone</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile?.personalDetails?.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Address</p>
                    {isEditing ? (
                      <textarea
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        rows="2"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile?.personalDetails?.address || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                {profile?.personalDetails?.dateOfBirth && (
                  <div className="flex items-start space-x-4">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(profile.personalDetails.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Job Details</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="text-gray-900 font-medium">{profile?.jobDetails?.department || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Designation</p>
                    <p className="text-gray-900 font-medium">{profile?.jobDetails?.designation || 'Not assigned'}</p>
                  </div>
                </div>
                {profile?.jobDetails?.joinDate && (
                  <div className="flex items-start space-x-4">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Join Date</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(profile.jobDetails.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {profile?.jobDetails?.employmentType && (
                  <div className="flex items-start space-x-4">
                    <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Employment Type</p>
                      <p className="text-gray-900 font-medium">{profile.jobDetails.employmentType}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Salary Structure */}
            {profile?.salaryStructure && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Salary Structure</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Basic Salary</span>
                    <span className="font-semibold text-gray-900">${profile.salaryStructure.basicSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">HRA</span>
                    <span className="font-semibold text-gray-900">${profile.salaryStructure.hra?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">DA</span>
                    <span className="font-semibold text-gray-900">${profile.salaryStructure.da?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Other Allowances</span>
                    <span className="font-semibold text-gray-900">${profile.salaryStructure.otherAllowances?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-900 font-semibold">Total Salary</span>
                    <span className="font-bold text-primary-600 text-lg">${profile.salaryStructure.totalSalary?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
