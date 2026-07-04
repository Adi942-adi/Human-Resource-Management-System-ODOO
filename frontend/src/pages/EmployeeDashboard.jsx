import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Calendar, FileText, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { attendanceService, leaveService, payrollService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await attendanceService.getMyAttendance(today, today);
      setTodayAttendance(response.data[0] || null);
    } catch (err) {
      console.error('Error fetching attendance:', err);
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
      await fetchTodayAttendance();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action === 'checkin' ? 'check in' : 'check out'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const canCheckIn = !todayAttendance?.checkIn;
  const canCheckOut = Boolean(todayAttendance?.checkIn && !todayAttendance?.checkOut);
  const statusColor = todayAttendance?.status === 'present' ? 'bg-green-500' : 'bg-slate-400';

  const userName = user?.personalDetails 
    ? `${user.personalDetails.firstName} ${user.personalDetails.lastName}`
    : 'User';

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
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-lg">
              {userName.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome, {userName}!</h1>
              <p className="text-slate-500 text-lg mb-6">{user?.employeeId}</p>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full ${statusColor} border-2 border-white shadow`}></div>
                    <span className="font-semibold text-slate-700">
                      {todayAttendance?.status === 'present' ? 'Checked In' : 'Not Checked In'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleAction('checkin')}
                    disabled={!canCheckIn || actionLoading}
                    className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
                      canCheckIn 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg' 
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {actionLoading && canCheckIn ? 'Checking In...' : 'Check In'}
                  </button>
                  
                  <button
                    onClick={() => handleAction('checkout')}
                    disabled={!canCheckOut || actionLoading}
                    className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
                      canCheckOut 
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg' 
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {actionLoading && canCheckOut ? 'Checking Out...' : 'Check Out'}
                  </button>
                </div>
              </div>

              {message && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {message}
                </div>
              )}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Attendance</p>
                <p className="text-2xl font-bold text-slate-800">This Month</p>
              </div>
            </div>
            <div className="text-4xl font-bold text-blue-600">18</div>
            <p className="text-sm text-slate-500 mt-1">Working days</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Leave Balance</p>
                <p className="text-2xl font-bold text-slate-800">Remaining</p>
              </div>
            </div>
            <div className="text-4xl font-bold text-purple-600">12</div>
            <p className="text-sm text-slate-500 mt-1">Paid leaves</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Payroll</p>
                <p className="text-2xl font-bold text-slate-800">This Month</p>
              </div>
            </div>
            <div className="text-4xl font-bold text-green-600">$5,650</div>
            <p className="text-sm text-slate-500 mt-1">Net salary</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
