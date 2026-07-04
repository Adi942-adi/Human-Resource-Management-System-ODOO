import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { attendanceService } from '../../services/api';
import { format } from 'date-fns';
import { 
  Sun, 
  Moon, 
  Bell, 
  LogOut, 
  User, 
  Calendar, 
  ChevronDown, 
  Clock, 
  Check, 
  Briefcase,
  FileText,
  Sliders,
  Users
} from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount] = useState(8);

  const isAdminOrHr = user?.role === 'admin' || user?.role === 'hr';

  // Fetch check-in status on mount
  const fetchTodayAttendance = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await attendanceService.getMyAttendance(today, today);
      setTodayAttendance(response.data[0] || null);
    } catch (err) {
      console.error('Failed to load check-in status', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTodayAttendance();
    }
  }, [user]);

  const handleCheckInOut = async () => {
    try {
      setAttendanceLoading(true);
      if (!todayAttendance?.checkIn) {
        await attendanceService.checkIn();
      } else {
        await attendanceService.checkOut();
      }
      await fetchTodayAttendance();
    } catch (err) {
      console.error('Attendance action failed', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getFormattedDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const userName = user?.personalDetails 
    ? `${user.personalDetails.firstName} ${user.personalDetails.lastName}`
    : user?.name || 'Omkar Satpute';

  const userRole = user?.role === 'admin' ? 'Administrator' : user?.role === 'hr' ? 'HR Officer' : 'Employee';

  // Navigation Links based on role
  const navLinks = [
    {
      name: 'Workspace',
      path: isAdminOrHr ? '/admin/dashboard' : '/employee/dashboard',
      icon: Users
    },
    {
      name: 'Attendance',
      path: isAdminOrHr ? '/admin/attendance' : '/employee/attendance',
      icon: Clock
    },
    {
      name: 'Leaves',
      path: isAdminOrHr ? '/admin/leaves' : '/employee/leaves',
      icon: Calendar
    },
    {
      name: 'Payroll',
      path: isAdminOrHr ? '/admin/payroll' : '/employee/payroll',
      icon: Briefcase
    }
  ];

  if (isAdminOrHr) {
    navLinks.push(
      {
        name: 'Reports',
        path: '/admin/reports',
        icon: FileText
      },
      {
        name: 'Settings',
        path: '/admin/settings',
        icon: Sliders
      }
    );
  }

  // Determine button state
  const isCheckedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const isCheckedOut = todayAttendance?.checkIn && todayAttendance?.checkOut;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09070f] overflow-x-hidden relative transition-colors duration-300">
      
      {/* Aurora and blob background animations */}
      <div className="absolute top-[-100px] left-[15%] w-[550px] h-[550px] bg-[#7C3AED]/5 dark:bg-[#7C3AED]/4 rounded-full blur-[140px] blob-animate-1 pointer-events-none z-0"></div>
      <div className="absolute bottom-[-150px] right-[15%] w-[600px] h-[600px] bg-[#6366F1]/5 dark:bg-[#6366F1]/4 rounded-full blur-[150px] blob-animate-2 pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(rgba(124,58,237,0.015)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(124,58,237,0.03)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none z-0"></div>

      {/* FIXED TOP NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/75 dark:bg-[#131129]/75 backdrop-blur-xl border-b border-gray-200/50 dark:border-[#2d225c]/45 transition-colors duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <NavLink to={isAdminOrHr ? '/admin/dashboard' : '/employee/dashboard'} className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-650 to-violet-650 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-black text-lg tracking-tight select-none">W</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-extrabold text-gray-900 dark:text-white leading-none tracking-tight">WorkPulse</span>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">Workspace</span>
              </div>
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1c183c]/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right Section Controls */}
          <div className="flex items-center gap-4">
            {/* Today's Date Display */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 dark:bg-[#1c183c]/40 border border-gray-200/50 dark:border-[#2d225c]/30 rounded-xl text-[11px] font-bold text-gray-500 dark:text-gray-300">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{getFormattedDate()}</span>
            </div>

            {/* Check In / Out Button */}
            {!isCheckedOut ? (
              <button
                onClick={handleCheckInOut}
                disabled={attendanceLoading}
                className={`relative px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all duration-300 border cursor-pointer active:scale-95 ${
                  isCheckedIn
                    ? 'bg-red-50/20 dark:bg-red-950/20 border-red-500/40 text-red-650 dark:text-red-400 hover:bg-red-50/40'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-650 text-white border-transparent hover:brightness-110 shadow-md shadow-indigo-500/10'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCheckedIn ? 'bg-red-500 animate-pulse' : 'bg-green-400 animate-ping'}`} />
                <span>{attendanceLoading ? 'Processing...' : isCheckedIn ? 'Check Out' : 'Check In'}</span>
              </button>
            ) : (
              <div className="px-4 py-1.5 rounded-xl bg-gray-100/50 dark:bg-[#1c183c]/20 border border-gray-250/20 dark:border-[#2d225c]/25 text-gray-400 dark:text-gray-500 font-bold text-xs flex items-center gap-1.5 select-none">
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span>Checked Out</span>
              </div>
            )}

            {/* Notifications Button */}
            <button className="relative p-2 bg-gray-50/50 dark:bg-[#1c183c]/30 hover:bg-gray-100/70 dark:hover:bg-[#1c183c]/60 border border-gray-200/50 dark:border-[#2d225c]/30 rounded-xl transition-all">
              <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white dark:border-[#131129]">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-gray-50/50 dark:bg-[#1c183c]/30 hover:bg-gray-100/70 dark:hover:bg-[#1c183c]/60 border border-gray-200/50 dark:border-[#2d225c]/30 rounded-xl transition-all text-gray-600 dark:text-gray-300"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-455" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 p-1 bg-gray-50/50 dark:bg-[#1c183c]/30 hover:bg-gray-100/70 dark:hover:bg-[#1c183c]/60 border border-gray-200/50 dark:border-[#2d225c]/30 rounded-xl transition-all cursor-pointer"
              >
                <div className="w-7.5 h-7.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-550/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-250 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Glassmorphic Dropdown Menu */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/90 dark:bg-[#131129]/95 backdrop-blur-2xl border border-gray-250/50 dark:border-[#2d225c]/55 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-gray-150/40 dark:border-[#2d225c]/40 text-left">
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{userName}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium truncate mt-1">{user?.email}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/45 text-[9px] font-bold text-indigo-650 dark:text-indigo-400 capitalize">
                        {userRole}
                      </span>
                    </div>
                    <div className="py-1">
                      <NavLink
                        to="/employee/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1c183c]/50 rounded-xl transition-all text-left w-full"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span>My Profile</span>
                      </NavLink>
                    </div>
                    <div className="border-t border-gray-150/40 dark:border-[#2d225c]/40 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all text-left w-full cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* MOBILE NAVIGATION LINKS PANEL */}
      <div className="md:hidden flex items-center justify-around bg-white/70 dark:bg-[#131129]/75 backdrop-blur-xl border-t border-gray-200/50 dark:border-[#2d225c]/45 fixed bottom-0 left-0 right-0 h-14 z-40 px-4">
        {navLinks.slice(0, 4).map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[9px] font-semibold">{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* MAIN VIEWPORT LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12 relative z-10">
        {children}
      </main>

    </div>
  );
};

export default Layout;
