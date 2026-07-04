import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Valid email is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e, field) => {
    const value = e.target.value;
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      
      if (user.role === 'admin' || user.role === 'hr') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Human Resource Management System</CardTitle>
          <p className="text-slate-400 mt-4 text-lg">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => handleChange(e, 'email')}
                  className={`pl-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500 ${formErrors.email ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
              </div>
              {formErrors.email && (
                <p className="text-xs text-red-400 mt-2">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handleChange(e, 'password')}
                  className={`pl-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500 ${formErrors.password ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
              </div>
              {formErrors.password && (
                <p className="text-xs text-red-400 mt-2">{formErrors.password}</p>
              )}
            </div>

            <div className="bg-slate-700/50 p-4 rounded-xl text-sm text-slate-300 border border-slate-600">
              <p className="font-semibold mb-3 text-purple-300">Demo Credentials:</p>
              <p className="mb-1"><span className="font-bold">Admin:</span> admin@example.com / password123</p>
              <p><span className="font-bold">Employee:</span> employee@example.com / password123</p>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-4 text-lg font-bold rounded-xl shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? 'Signing In...' : (
                <>
                  Sign In <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-slate-400 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 hover:underline font-semibold">
                Register here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
