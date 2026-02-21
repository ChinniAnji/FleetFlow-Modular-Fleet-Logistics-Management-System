import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiTruck, FiMail, FiLock, FiLoader } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    const credentials = {
      admin: { email: 'admin@fleetflow.com', password: 'admin123' },
      manager: { email: 'manager@fleetflow.com', password: 'manager123' },
      driver: { email: 'john@fleetflow.com', password: 'driver123' },
    };

    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-2xl">
              <FiTruck className="text-5xl text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">FleetFlow</h1>
          <p className="text-primary-100 text-lg">Fleet & Logistics Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg font-semibold flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 text-center">Quick Login (Demo)</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => quickLogin('admin')}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-medium transition"
              >
                Admin
              </button>
              <button
                onClick={() => quickLogin('manager')}
                className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs font-medium transition"
              >
                Manager
              </button>
              <button
                onClick={() => quickLogin('driver')}
                className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-xs font-medium transition"
              >
                Driver
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-white text-sm">
          <p>&copy; 2026 FleetFlow. Built for Odoo Hackathon</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
