import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, FiTruck, FiUsers, FiPackage, FiMap, FiTool, 
  FiDroplet, FiBarChart2, FiMenu, FiX, FiLogOut, FiUser 
} from 'react-icons/fi';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/vehicles', icon: FiTruck, label: 'Vehicles' },
    { path: '/drivers', icon: FiUsers, label: 'Drivers' },
    { path: '/deliveries', icon: FiPackage, label: 'Deliveries' },
    { path: '/routes', icon: FiMap, label: 'Routes' },
    { path: '/maintenance', icon: FiTool, label: 'Maintenance' },
    { path: '/fuel', icon: FiDroplet, label: 'Fuel' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-primary-800 to-primary-900 text-white transition-all duration-300 shadow-2xl`}
      >
        <div className="flex items-center justify-between p-4 border-b border-primary-700">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <FiTruck className="text-3xl" />
              <span className="text-xl font-bold">FleetFlow</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-primary-700 rounded-lg transition"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-700 border-l-4 border-white'
                    : 'hover:bg-primary-700/50'
                }`
              }
            >
              <item.icon size={22} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Fleet Management System
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-100 rounded-lg">
                <FiUser className="text-gray-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <FiLogOut />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
