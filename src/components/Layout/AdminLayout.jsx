// src/components/Layout/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { FaBars, FaBell, FaSearch, FaUserCircle, FaEnvelope, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New user registered', time: '5 min ago', read: false },
    { id: 2, message: 'Device alert: High temperature', time: '10 min ago', read: false },
    { id: 3, message: 'Zone created successfully', time: '1 hour ago', read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/overview')) return 'Dashboard Overview';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/zones')) return 'Zone Management';
    if (path.includes('/plants')) return 'Plant Management';
    if (path.includes('/devices')) return 'Device Management';
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/alerts')) return 'Alerts';
    if (path.includes('/settings')) return 'Settings';
    return 'Super Admin Panel';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className={`
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <FaBars className="text-gray-600 text-xl" />
              </button>
              
              {/* Page Title */}
              <div>
                <h1 className="text-xl font-bold text-gray-800">{getPageTitle()}</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Welcome back, {user?.firstName || 'Admin'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* User Menu */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">{user?.firstName || 'Admin'} {user?.lastName || ''}</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
                <div className="relative group">
                  <button className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                    {user?.firstName?.charAt(0) || 'A'}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 hidden group-hover:block">
                    <button
                      onClick={() => navigate('/admin-dashboard/profile')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      <FaUserCircle className="inline mr-2" /> Profile
                    </button>
                    <button
                      onClick={() => navigate('/admin-dashboard/settings')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FaCog className="inline mr-2" /> Settings
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
};

export default AdminLayout;