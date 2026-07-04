import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { payrollService } from '../services/api';
import { Download } from 'lucide-react';

export const EmployeePayroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setLoading(true);
        // Fetch all payroll records (no filter)
        const response = await payrollService.getMyPayroll();
        setPayroll(Array.isArray(response.data) ? response.data : []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payroll data');
        console.error('Error fetching payroll:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, []);

  const downloadPayslip = (record) => {
    // Simple payslip download simulation
    const payslipContent = `
PAYSLIP
Employee: ${record.employee?.personalDetails?.firstName || 'Employee'} ${record.employee?.personalDetails?.lastName || ''}
Month: ${record.month} ${record.year}
-----------------------------------
Basic Salary: $${record.basicSalary?.toFixed(2) || '0.00'}
HRA: $${record.hra?.toFixed(2) || '0.00'}
DA: $${record.da?.toFixed(2) || '0.00'}
Other Allowances: $${record.otherAllowances?.toFixed(2) || '0.00'}
-----------------------------------
Gross Salary: $${(record.basicSalary + record.hra + record.da + record.otherAllowances).toFixed(2)}
Deductions: $${record.deductions?.toFixed(2) || '0.00'}
-----------------------------------
Net Salary: $${record.netSalary?.toFixed(2) || '0.00'}
Status: ${record.status.toUpperCase()}
    `;
    
    const blob = new Blob([payslipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${record.month}-${record.year}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout isAdmin={false}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading payroll data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAdmin={false}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
          </CardHeader>
          <CardContent>
            {payroll.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No payroll records found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Basic</TableHead>
                    <TableHead>HRA</TableHead>
                    <TableHead>DA</TableHead>
                    <TableHead>Other Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payroll.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>{record.month} {record.year}</TableCell>
                      <TableCell>${record.basicSalary?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>${record.hra?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>${record.da?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>${record.otherAllowances?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>${record.deductions?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>${record.netSalary?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell><StatusBadge status={record.status} /></TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => downloadPayslip(record)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Payslip
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
