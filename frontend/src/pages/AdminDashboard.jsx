import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { userService, attendanceService, leaveService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase, 
  Calendar, 
  User, 
  DollarSign, 
  Clock, 
  FileText, 
  X,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Plus,
  ArrowUpRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Profile Drawer state
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const isAdminOrHr = user?.role === 'admin' || user?.role === 'hr';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersResponse, attendanceResponse] = await Promise.all([
        userService.getAllUsers(),
        attendanceService.getDailyAttendance(new Date().toISOString().split('T')[0]).catch(() => ({ data: [] }))
      ]);

      // Filter to show only active employees/admins in the directory
      const allUsers = usersResponse.data || [];
      setEmployees(allUsers);
      setAttendanceToday(attendanceResponse.data || []);
    } catch (err) {
      console.error('Failed to load workspace data', err);
      setError('Could not retrieve employee list. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute unique departments dynamically from employee list
  const departments = useMemo(() => {
    const depts = new Set();
    employees.forEach(emp => {
      const dept = emp.jobDetails?.department || emp.department;
      if (dept) depts.add(dept);
    });
    return ['All', ...Array.from(depts)];
  }, [employees]);

  // Map employee ID to attendance status
  const checkedInUserIds = useMemo(() => {
    return new Set(
      attendanceToday
        .filter(record => record.status === 'present' && !record.checkOut)
        .map(record => record.employeeId?._id || record.employeeId)
    );
  }, [attendanceToday]);

  // Filter employees in real-time
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const firstName = emp.personalDetails?.firstName || '';
      const lastName = emp.personalDetails?.lastName || '';
      const fullName = `${firstName} ${lastName} ${emp.name || ''}`.toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const empId = (emp.employeeId || '').toLowerCase();
      
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) || 
        email.includes(searchTerm.toLowerCase()) || 
        empId.includes(searchTerm.toLowerCase());

      const empDept = emp.jobDetails?.department || emp.department || 'Unassigned';
      const matchesDept = selectedDept === 'All' || empDept.toLowerCase() === selectedDept.toLowerCase();

      // Status can be determined from account active status or attendance
      const isOnline = checkedInUserIds.has(emp._id);
      const matchesStatus = 
        selectedStatus === 'All' || 
        (selectedStatus === 'Online' && isOnline) || 
        (selectedStatus === 'Offline' && !isOnline);

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, selectedDept, selectedStatus, checkedInUserIds]);

  // Compute Stats Card data
  const stats = useMemo(() => {
    const total = employees.length;
    const online = employees.filter(emp => checkedInUserIds.has(emp._id)).length;
    const offline = total - online;
    const attendanceRate = total ? Math.round((online / total) * 100) : 100;
    
    return {
      total,
      online,
      offline,
      attendanceRate
    };
  }, [employees, checkedInUserIds]);

  const getInitials = (emp) => {
    const first = emp.personalDetails?.firstName || emp.name || 'E';
    const last = emp.personalDetails?.lastName || '';
    return (first.charAt(0) + (last.charAt(0) || '')).toUpperCase();
  };

  const getFullName = (emp) => {
    const first = emp.personalDetails?.firstName || '';
    const last = emp.personalDetails?.lastName || '';
    return first || last ? `${first} ${last}` : emp.name || emp.email;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-650"></div>
            <p className="text-sm font-semibold text-gray-500">Loading Workspace Directory...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Header Title with + Add Employee Button */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Employee Workspace
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              View employee profiles, check online status, and access management shortcuts.
            </p>
          </div>
          {isAdminOrHr && (
            <button
              onClick={() => navigate('/admin/employees')}
              className="bg-gradient-to-r from-indigo-600 to-violet-650 text-white font-bold py-2.5 px-5 rounded-2xl flex items-center gap-2 text-xs shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Members', value: stats.total, color: 'text-indigo-600 dark:text-indigo-400', desc: 'Active team directory' },
            { label: 'Active check-ins', value: stats.online, color: 'text-green-550 dark:text-green-455', desc: 'Checked in today' },
            { label: 'Not Checked In', value: stats.offline, color: 'text-amber-500', desc: 'Away or checked out' },
            { label: 'Workspace Presence', value: `${stats.attendanceRate}%`, color: 'text-violet-600 dark:text-violet-400', desc: 'Overall active rate' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/60 dark:bg-[#131129]/65 backdrop-blur-xl border border-gray-200/50 dark:border-[#2d225c]/35 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">{item.label}</span>
              <div className="my-2">
                <span className={`text-2xl font-black ${item.color}`}>{item.value}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{item.desc}</span>
            </div>
          ))}
        </div>

        {/* Filters and Search Bar Container */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white/60 dark:bg-[#131129]/65 backdrop-blur-xl border border-gray-200/50 dark:border-[#2d225c]/35 rounded-[24px] p-4 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or employee ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-[#1c183c]/30 border border-gray-200/60 dark:border-[#2d225c]/40 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white transition-all placeholder-gray-400"
            />
          </div>

          {/* Quick Filters - Online / Offline */}
          <div className="flex items-center gap-2 border-l border-gray-200/40 dark:border-[#2d225c]/40 pl-0 lg:pl-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase hidden xl:inline-block">Status:</span>
            {['All', 'Online', 'Offline'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100/60 dark:bg-[#1c183c]/30 text-gray-500 dark:text-gray-400 hover:bg-gray-200/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Department Pills Container */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex gap-1.5">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider shrink-0 transition-all cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 shadow-sm'
                    : 'bg-white/70 dark:bg-[#131129]/70 text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-[#2d225c]/35 hover:bg-gray-50 dark:hover:bg-[#1c183c]/50'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid & Sidebar profile detail container */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Grid Area */}
          <div className={`grid grid-cols-1 md:grid-cols-2 ${selectedEmployee ? 'lg:grid-cols-2 lg:w-2/3' : 'lg:grid-cols-3 lg:w-full'} gap-4 transition-all duration-300 w-full`}>
            {filteredEmployees.map((emp) => {
              const isOnline = checkedInUserIds.has(emp._id);
              const isSelected = selectedEmployee?._id === emp._id;
              
              return (
                <div
                  key={emp._id}
                  onClick={() => setSelectedEmployee(isSelected ? null : emp)}
                  className={`premium-glow-card rounded-[22px] p-5 relative overflow-hidden transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-600 dark:border-indigo-500 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500' 
                      : 'border-gray-200/50 dark:border-[#2d225c]/35'
                  }`}
                >
                  {/* Left Side Highlight Color Border */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                    emp.role === 'admin' 
                      ? 'bg-indigo-500' 
                      : emp.role === 'hr' 
                      ? 'bg-violet-500' 
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`} />

                  {/* Header Row */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/15 border border-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm relative">
                        {getInitials(emp)}
                        {/* Online Indicator Badge */}
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#131129] ${
                          isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                      </div>

                      <div className="text-left">
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                          {getFullName(emp)}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          {emp.jobDetails?.designation || emp.designation || 'Specialist'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Role Badge */}
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-gray-50 dark:bg-indigo-950/20 text-gray-400 dark:text-indigo-400 border border-gray-150/40 dark:border-indigo-900/35">
                      {emp.role === 'admin' ? 'Admin' : emp.role === 'hr' ? 'HR' : 'Staff'}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div className="mt-4 pt-4 border-t border-gray-150/40 dark:border-[#2d225c]/35 grid grid-cols-2 gap-2 text-left text-[10px] text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{emp.personalDetails?.phone || 'No Phone'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{emp.jobDetails?.department || emp.department || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{emp.jobDetails?.joinDate ? new Date(emp.jobDetails.joinDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'Joined Recently'}</span>
                    </div>
                  </div>

                  {/* Glow accent hovering in bottom corner */}
                  <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
                </div>
              );
            })}

            {filteredEmployees.length === 0 && (
              <div className="col-span-full py-16 bg-white/60 dark:bg-[#131129]/65 backdrop-blur-xl border border-gray-200/50 dark:border-[#2d225c]/35 rounded-[24px] text-center text-gray-500">
                <p className="text-sm font-semibold">No employees found matching filters</p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedDept('All'); setSelectedStatus('All'); }}
                  className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 underline cursor-pointer"
                >
                  Clear all search filters
                </button>
              </div>
            )}
          </div>

          {/* Sliding View-only Profile Panel */}
          {selectedEmployee && (
            <div className="w-full lg:w-1/3 bg-white/70 dark:bg-[#131129]/75 backdrop-blur-2xl border border-indigo-500/20 dark:border-[#2d225c]/45 rounded-[24px] p-6 shadow-xl sticky top-24 z-20 animate-in slide-in-from-right duration-300">
              
              {/* Profile Close Button */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-550 dark:text-indigo-400">Employee Details</span>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1c183c]/50 rounded-lg transition-all text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Card Face */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-[22px] bg-gradient-to-tr from-indigo-500/10 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-650 dark:text-indigo-400 font-black text-2xl relative shadow-md">
                  {getInitials(selectedEmployee)}
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#131129] ${
                    checkedInUserIds.has(selectedEmployee._id) ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                </div>

                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mt-4 tracking-tight leading-tight">
                  {getFullName(selectedEmployee)}
                </h2>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  {selectedEmployee.jobDetails?.designation || selectedEmployee.designation || 'Specialist'}
                </p>
                <span className="mt-2.5 px-3 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-gray-100 dark:bg-[#1c183c]/50 text-gray-500 dark:text-gray-400 border border-gray-250/20 dark:border-[#2d225c]/35 capitalize">
                  {selectedEmployee.jobDetails?.employmentType || 'Full-time'} Employee
                </span>
              </div>

              {/* Grid Information details */}
              <div className="mt-6 pt-6 border-t border-gray-150/40 dark:border-[#2d225c]/35 space-y-4 text-left">
                {[
                  { label: 'Employee ID', value: selectedEmployee.employeeId || 'Not assigned', icon: User },
                  { label: 'Email Address', value: selectedEmployee.email, icon: Mail, isLink: `mailto:${selectedEmployee.email}` },
                  { label: 'Contact Phone', value: selectedEmployee.personalDetails?.phone || 'No phone record', icon: Phone, isLink: selectedEmployee.personalDetails?.phone ? `tel:${selectedEmployee.personalDetails?.phone}` : null },
                  { label: 'Department', value: selectedEmployee.jobDetails?.department || selectedEmployee.department || 'Unassigned', icon: Briefcase },
                  { label: 'Date of Joining', value: selectedEmployee.jobDetails?.joinDate ? new Date(selectedEmployee.jobDetails.joinDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Unknown', icon: Calendar },
                  { label: 'Home Address', value: selectedEmployee.personalDetails?.address || 'No address logged', icon: MapPin }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="p-1.5 bg-gray-50 dark:bg-[#1c183c]/30 rounded-lg border border-gray-150/30 dark:border-[#2d225c]/30">
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">{item.label}</p>
                        {item.isLink ? (
                          <a href={item.isLink} className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:underline mt-1 inline-block">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-250 mt-1">{item.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Admin Shortcuts / Employee Personal Actions */}
              <div className="mt-8 pt-6 border-t border-gray-150/40 dark:border-[#2d225c]/35">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Workspace Shortcuts</span>
                <div className="grid grid-cols-1 gap-2 mt-3">
                  {isAdminOrHr ? (
                    <>
                      <button
                        onClick={() => navigate('/admin/attendance')}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/50 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl text-xs font-bold text-indigo-750 dark:text-indigo-400 transition-all cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Manage Attendance Log</span>
                        </span>
                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-all" />
                      </button>
                      <button
                        onClick={() => navigate('/admin/leaves')}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/50 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl text-xs font-bold text-indigo-750 dark:text-indigo-400 transition-all cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Manage Leave Requests</span>
                        </span>
                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-all" />
                      </button>
                      <button
                        onClick={() => navigate('/admin/payroll')}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/50 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl text-xs font-bold text-indigo-750 dark:text-indigo-400 transition-all cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>Manage Payroll Records</span>
                        </span>
                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-all" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate('/employee/attendance')}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/50 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl text-xs font-bold text-indigo-750 dark:text-indigo-400 transition-all cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>My Attendance Card</span>
                        </span>
                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-all" />
                      </button>
                      <button
                        onClick={() => navigate('/employee/leaves')}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/50 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl text-xs font-bold text-indigo-750 dark:text-indigo-400 transition-all cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Apply or View Leaves</span>
                        </span>
                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-all" />
                      </button>
                      <button
                        onClick={() => navigate('/employee/payroll')}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/50 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl text-xs font-bold text-indigo-750 dark:text-indigo-400 transition-all cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>My Salary Payslips</span>
                        </span>
                        <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-all" />
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </Layout>
  );
};

export default AdminDashboard;
