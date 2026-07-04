import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings, Save, Shield, Bell, DollarSign, Clock } from 'lucide-react';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const [settingsData, setSettingsData] = useState({
    companyName: 'WorkPulse AI Org',
    allowEmployeeSelfRegister: true,
    autoCheckOut: true,
    autoCheckOutTime: '18:00',
    payrollCycle: 'monthly',
    currency: 'INR',
    enableNotifications: true,
  });

  const handleToggle = (key) => {
    setSettingsData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (key, val) => {
    setSettingsData(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setTimeout(() => {
      setLoading(false);
      setSuccess('Settings saved successfully!');
    }, 1000);
  };

  return (
    <Layout isAdmin={true}>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure global rules, system preferences, and compliance settings.</p>
          </div>
        </div>

        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-2xl text-green-700 dark:text-green-300 text-xs font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* General & Security Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white dark:bg-[#131129] border border-gray-100 dark:border-[#201d3a]/60">
              <CardHeader className="flex flex-row items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-500" />
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">General & Access Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Company Name</label>
                  <input
                    type="text"
                    value={settingsData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e1a3d]/50 border border-gray-200 dark:border-[#2d285c]/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-[#1c193c]/30 rounded-2xl border border-gray-100/40 dark:border-[#201d3a]/40">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Employee Self-Registration</h4>
                    <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5">Allow new employees to create accounts via register page.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsData.allowEmployeeSelfRegister}
                      onChange={() => handleToggle('allowEmployeeSelfRegister')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-650"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#131129] border border-gray-100 dark:border-[#201d3a]/60">
              <CardHeader className="flex flex-row items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-500" />
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Attendance Tracking Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-[#1c193c]/30 rounded-2xl border border-gray-100/40 dark:border-[#201d3a]/40">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Automatic Check-Out</h4>
                    <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5">Automatically mark unchecked employees as checked out at standard end-time.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsData.autoCheckOut}
                      onChange={() => handleToggle('autoCheckOut')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-650"></div>
                  </label>
                </div>

                {settingsData.autoCheckOut && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Check-Out Execution Time</label>
                    <input
                      type="time"
                      value={settingsData.autoCheckOutTime}
                      onChange={(e) => handleInputChange('autoCheckOutTime', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e1a3d]/50 border border-gray-200 dark:border-[#2d285c]/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:text-white"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Finance & Notify Settings */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-[#131129] border border-gray-100 dark:border-[#201d3a]/60">
              <CardHeader className="flex flex-row items-center gap-3">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Finance & Payroll</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Payroll Cycle</label>
                  <select
                    value={settingsData.payrollCycle}
                    onChange={(e) => handleInputChange('payrollCycle', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e1a3d]/50 border border-gray-200 dark:border-[#2d285c]/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:text-white"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Currency Symbol</label>
                  <select
                    value={settingsData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1e1a3d]/50 border border-gray-200 dark:border-[#2d285c]/60 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:text-white"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#131129] border border-gray-100 dark:border-[#201d3a]/60">
              <CardHeader className="flex flex-row items-center gap-3">
                <Bell className="w-5 h-5 text-pink-500" />
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-[#1c193c]/30 rounded-2xl border border-gray-100/40 dark:border-[#201d3a]/40">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">System Email Alerts</h4>
                    <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5">Send daily check-in alerts and leave approval emails.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsData.enableNotifications}
                      onChange={() => handleToggle('enableNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-305 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-650"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={loading}>
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

        </form>

      </div>
    </Layout>
  );
};
