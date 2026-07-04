import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, ArrowLeft, LogIn, LogOut, TrendingUp } from 'lucide-react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

const Attendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Mock user data for demo purposes when not authenticated
  const mockUser = user || { id: 'demo-id', role: 'employee' };

  const [view, setView] = useState('today');
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTodayAttendance();
      fetchAttendanceHistory();
    } else {
      // Mock data for demo
      setTodayAttendance({
        checkIn: new Date(),
        checkOut: null,
        status: 'present',
        workHours: 0
      });
      setAttendanceHistory([
        {
          date: new Date(),
          checkIn: new Date(),
          checkOut: null,
          status: 'present',
          workHours: 0
        }
      ]);
      setLoading(false);
    }
  }, [user]);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`/api/attendance/daily/${today}`);
      const myAttendance = response.data.find(a => a.employee._id === user.id);
      setTodayAttendance(myAttendance || null);
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await axios.get('/api/attendance/my');
      setAttendanceHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await axios.post('/api/attendance/checkin');
      fetchTodayAttendance();
      fetchAttendanceHistory();
    } catch (error) {
      console.error('Check-in failed:', error);
      alert('Check-in failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await axios.post('/api/attendance/checkout');
      fetchTodayAttendance();
      fetchAttendanceHistory();
    } catch (error) {
      console.error('Check-out failed:', error);
      alert('Check-out failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getAttendanceStatus = (date) => {
    const attendance = attendanceHistory.find(a => {
      const attendanceDate = new Date(a.date).toDateString();
      return attendanceDate === date.toDateString();
    });
    return attendance?.status || null;
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const status = getAttendanceStatus(date);
      if (status === 'present') return 'bg-green-100 text-green-700 font-bold';
      if (status === 'absent') return 'bg-red-100 text-red-700 font-bold';
      if (status === 'half-day') return 'bg-yellow-100 text-yellow-700 font-bold';
      if (status === 'leave') return 'bg-blue-100 text-blue-700 font-bold';
    }
    return null;
  };

  const canCheckIn = !todayAttendance || !todayAttendance.checkIn;
  const canCheckOut = todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut;

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
              <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setView('today')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === 'today' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === 'calendar' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setView('history')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === 'history' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                History
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'today' && (
          <div className="space-y-6">
            {/* Check In/Out Card */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="text-center">
                <div className="mb-6">
                  <Clock className="w-16 h-16 text-primary-600 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-gray-600 mb-6">
                  {todayAttendance?.checkIn ? `Checked in at ${new Date(todayAttendance.checkIn).toLocaleTimeString()}` : 'Not checked in yet'}
                </p>

                <div className="flex justify-center space-x-4">
                  {canCheckIn && (
                    <button
                      onClick={handleCheckIn}
                      disabled={actionLoading}
                      className="flex items-center space-x-2 px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>{actionLoading ? 'Checking in...' : 'Check In'}</span>
                    </button>
                  )}
                  {canCheckOut && (
                    <button
                      onClick={handleCheckOut}
                      disabled={actionLoading}
                      className="flex items-center space-x-2 px-8 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{actionLoading ? 'Checking out...' : 'Check Out'}</span>
                    </button>
                  )}
                </div>

                {todayAttendance?.workHours > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-900 font-semibold">Work Hours Today: {todayAttendance.workHours}h</p>
                  </div>
                )}
              </div>
            </div>

            {/* Today's Status */}
            {todayAttendance && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Check In</p>
                    <p className="font-semibold text-gray-900">
                      {todayAttendance.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString() : '--:--'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Check Out</p>
                    <p className="font-semibold text-gray-900">
                      {todayAttendance.checkOut ? new Date(todayAttendance.checkOut).toLocaleTimeString() : '--:--'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`font-semibold ${
                      todayAttendance.status === 'present' ? 'text-green-600' :
                      todayAttendance.status === 'absent' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Work Hours</p>
                    <p className="font-semibold text-gray-900">{todayAttendance.workHours}h</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Calendar</h3>
            <div className="max-w-2xl mx-auto">
              <ReactCalendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileClassName={getTileClassName}
                className="w-full"
              />
              <div className="mt-4 flex justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-sm text-gray-600">Present</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 rounded"></div>
                  <span className="text-sm text-gray-600">Absent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                  <span className="text-sm text-gray-600">Half-day</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-100 rounded"></div>
                  <span className="text-sm text-gray-600">Leave</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : attendanceHistory.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No attendance records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Check In</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Check Out</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Work Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((attendance) => (
                      <tr key={attendance._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(attendance.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {attendance.checkIn ? new Date(attendance.checkIn).toLocaleTimeString() : '--:--'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString() : '--:--'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            attendance.status === 'present' ? 'bg-green-100 text-green-700' :
                            attendance.status === 'absent' ? 'bg-red-100 text-red-700' :
                            attendance.status === 'half-day' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">{attendance.workHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Attendance;
