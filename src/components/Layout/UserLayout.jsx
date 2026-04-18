// src/components/Layout/UserLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaBars, FaBell, FaSearch, FaUserCircle, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const UserLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications] = useState([
    { id: 1, message: 'Temperature alert in Zone A', time: '5 min ago', read: false },
    { id: 2, message: 'New device registered', time: '1 hour ago', read: false },
    { id: 3, message: 'Report generated successfully', time: '2 hours ago', read: true },
  ]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar
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
                <h1 className="text-xl font-bold text-gray-800">Zone Monitor</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'User'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar - Desktop */}
              <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-3 py-2 min-w-[250px]">
                <FaSearch className="text-gray-400 mr-2 text-sm" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaBell className="text-gray-600 text-xl" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-30">
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`p-3 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}>
                          <p className="text-sm text-gray-800">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-gray-200">
                      <button className="text-xs text-purple-600 hover:text-purple-700 w-full text-center">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">{user?.firstName || user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-gray-500">Zone User</p>
                </div>
                <div className="relative group">
                  <button className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 hidden group-hover:block">
                    <button
                      onClick={() => navigate('/dashboard/profile')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      <FaUserCircle className="inline mr-2" /> Profile
                    </button>
                    <button
                      onClick={() => navigate('/dashboard/settings')}
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

export default UserLayout;