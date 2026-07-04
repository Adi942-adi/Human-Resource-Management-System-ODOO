import React from 'react';
import { Bell, Search, Menu, LogOut, Calendar, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ user, onMenuToggle }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userName = user?.personalDetails 
    ? `${user.personalDetails.firstName} ${user.personalDetails.lastName}`
    : user?.name || 'Omkar Satpute';

  const userRole = user?.role === 'admin' ? 'Administrator' : user?.role === 'hr' ? 'HR Officer' : 'Employee';

  // Format today's date like "Friday, 4 July 2025"
  const getFormattedDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <header className="h-16 bg-white dark:bg-[#131129] border-b border-gray-100 dark:border-[#201d3a]/60 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-gray-500/5 transition-colors duration-200">
      {/* Search and Mobile Menu toggle */}
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuToggle} className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1738] rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden md:block max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search employees, documents, etc..."
            className="w-full pl-10 pr-12 py-2 bg-gray-50/55 dark:bg-[#1e1a3d]/40 border border-gray-200/80 dark:border-[#2d285c]/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:text-white transition-all placeholder-gray-400"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-white dark:bg-[#131129] border border-gray-200 dark:border-[#2d285c]/60 px-1.5 py-0.5 rounded shadow-sm">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        {/* Date Display Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#1e1a3d]/50 border border-gray-100 dark:border-[#201d3a]/60 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span>{getFormattedDate()}</span>
        </div>

        {/* Notifications Icon */}
        <button className="relative p-2 text-gray-600 dark:text-gray-350 hover:bg-gray-50 dark:hover:bg-[#1a1738] rounded-xl transition-colors">
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center rounded-full border-2 border-white dark:border-[#131129]">
            8
          </span>
        </button>

        {/* Theme Toggle Icon */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a1738] rounded-xl transition-colors"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-450 fill-amber-400/20" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700" />
          )}
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-gray-200 dark:bg-[#201d3a]"></div>

        {/* Profile Pill and Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{userName}</p>
              <p className="text-[10px] text-gray-400 font-medium capitalize">{userRole}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
