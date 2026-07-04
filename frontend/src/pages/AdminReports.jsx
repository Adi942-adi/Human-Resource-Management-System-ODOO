import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { BarChart2, Download, FileText, Calendar, DollarSign, TrendingUp, Check } from 'lucide-react';

export const AdminReports = () => {
  const [downloading, setDownloading] = useState(null);

  const handleExport = (reportType) => {
    setDownloading(reportType);
    setTimeout(() => {
      setDownloading(null);
      // Simulate file download
      const element = document.createElement("a");
      const file = new Blob([`WorkPulse AI - ${reportType} Report\nGenerated on: ${new Date().toLocaleDateString()}\nStatus: Verified\n`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${reportType.toLowerCase()}_report_${Date.now()}.csv`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1200);
  };

  const reportsList = [
    { id: 'R-001', name: 'June Attendance Log', type: 'Attendance', date: 'June 30, 2026', size: '1.2 MB' },
    { id: 'R-002', name: 'Q2 Financial Breakdown', type: 'Payroll', date: 'June 28, 2026', size: '4.8 MB' },
    { id: 'R-003', name: 'H1 Employee Growth Index', type: 'Workforce', date: 'June 15, 2026', size: '2.5 MB' },
    { id: 'R-004', name: 'Department Leave Ratios', type: 'Leaves', date: 'June 10, 2026', size: '940 KB' },
  ];

  return (
    <Layout isAdmin={true}>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Generate, customize, and export workforce data reports.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('Global')} disabled={downloading !== null}>
              {downloading === 'Global' ? 'Generating...' : 'Export All Data'}
            </Button>
          </div>
        </div>

        {/* Analytic Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-[#131129] border border-gray-100 dark:border-[#201d3a]/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-550 dark:text-gray-400">Attendance Reports</CardTitle>
              <Calendar className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">98.2%</span>
                <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-1">Average organization attendance rate this month</p>
              </div>
              <Button 
                onClick={() => handleExport('Attendance')} 
                className="w-full flex justify-center items-center gap-2"
                disabled={downloading !== null}
              >
                <Download className="w-4 h-4" />
                {downloading === 'Attendance' ? 'Downloading...' : 'Download Attendance Report'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#131129] border border-gray-100 dark:border-[#201d3a]/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-550 dark:text-gray-400">Payroll Reports</CardTitle>
              <DollarSign className="w-4 h-4 text-indigo-500" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₹5.64L</span>
                <p className="text-[10px] text-gray-455 dark:text-gray-500 mt-1">Total payroll paid for current billing cycle</p>
              </div>
              <Button 
                onClick={() => handleExport('Payroll')} 
                className="w-full flex justify-center items-center gap-2"
                disabled={downloading !== null}
              >
                <Download className="w-4 h-4" />
                {downloading === 'Payroll' ? 'Downloading...' : 'Download Payroll Report'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#131129] border border-gray-100 dark:border-[#201d3a]/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-550 dark:text-gray-400">Leave Distribution</CardTitle>
              <FileText className="w-4 h-4 text-pink-500" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">14 Pending</span>
                <p className="text-[10px] text-gray-455 dark:text-gray-500 mt-1">Leaves requested requiring admin decision</p>
              </div>
              <Button 
                onClick={() => handleExport('Leaves')} 
                className="w-full flex justify-center items-center gap-2"
                disabled={downloading !== null}
              >
                <Download className="w-4 h-4" />
                {downloading === 'Leaves' ? 'Downloading...' : 'Download Leaves Report'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card className="bg-white dark:bg-[#131129] border border-gray-100 dark:border-[#201d3a]/60">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Recently Generated Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-500 dark:text-gray-400">Report ID</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Report Name</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Category</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Date Generated</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">File Size</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportsList.map((rep) => (
                  <TableRow key={rep.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1c193c]/50">
                    <TableCell className="font-bold text-indigo-600 dark:text-indigo-400">{rep.id}</TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-white">{rep.name}</TableCell>
                    <TableCell className="font-medium text-gray-600 dark:text-gray-300">{rep.type}</TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400">{rep.date}</TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400">{rep.size}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleExport(rep.type)}>
                        <Download className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
};
