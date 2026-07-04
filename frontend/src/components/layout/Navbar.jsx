import React, { useState } from 'react';
import { Search, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const employeeTabs = [
  { label: 'Dashboard', path: '/employee/dashboard' },
  { label: 'Attendance', path: '/employee/attendance' },
  { label: 'Time OFF', path: '/employee/leaves' },
  { label: 'Payroll', path: '/employee/payroll' },
];

const adminTabs = [
  { label: 'Employees', path: '/admin/dashboard' },
  { label: 'Attendance', path: '/admin/attendance' },
  { label: 'Time OFF', path: '/admin/leaves' },
  { label: 'Payroll', path: '/admin/payroll' },
];

export const Navbar = ({ user, isAdmin = true }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenuOpen, setShowProfileMenuOpen] = useState(false);

  const tabs = isAdmin ? adminTabs : employeeTabs;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenuOpen(false);
  };

  const userName = user?.personalDetails
    ? `${user.personalDetails.firstName} ${user.personalDetails.lastName}`
    : user?.name || 'User';

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-20 bg-gradient-to-r from-slate-800 to-slate-700 px-6 flex items-center justify-between shadow-xl">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-lg font-bold text-white">HR</span>
          </div>
          <h1 className="text-white text-xl font-bold tracking-wide">HRMS</h1>
        </div>

        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {!isAdmin && (
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setShowProfileMenuOpen(!showProfileMenuOpen)}
            className="flex items-center gap-3 p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center border-2 border-white">
              <span className="text-lg font-bold text-white">{userInitial}</span>
            </div>
          </button>

          {showProfileMenuOpen && (
            <div className="absolute right-0 top-14 bg-white rounded-xl shadow-2xl w-64 border border-slate-200 overflow-hidden z-50">
              <button
                onClick={() => {
                  navigate(isAdmin ? '/admin/employees' : '/employee/profile');
                  setShowProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700"
              >
                <User className="w-5 h-5" />
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700"
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
