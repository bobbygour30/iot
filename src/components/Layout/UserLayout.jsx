// src/components/Layout/UserLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaBars, FaBell, FaSearch, FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const UserLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
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
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}
      `}>
        {/* Compact Top Bar */}
        <div className="bg-white shadow-sm sticky top-0 z-20 border-b border-slate-200/80">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
              >
                <FaBars className="text-gray-600 text-lg" />
              </button>
              
              {/* Compact Page Title */}
              <div>
                <p className="text-sm font-semibold text-gray-800">Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'User'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-all"
              >
                <FaBell className="text-gray-600 text-base" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-gray-800 leading-tight">{user?.firstName || user?.email?.split('@')[0] || 'User'}</p>
                    <p className="text-[10px] text-gray-500 leading-tight">Zone User</p>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1">
                      <button
                        onClick={() => {
                          navigate('/dashboard/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FaUserCircle className="text-gray-500" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/dashboard/settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <FaCog className="text-gray-500" />
                        Settings
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <FaSignOutAlt className="text-red-500" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-2">
          <Outlet />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Notification Dropdown */}
      {showNotifications && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
          <div className="absolute right-0 top-14 mt-1 mr-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className={`p-3 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-purple-50/50' : ''}`}>
                    <p className="text-sm text-gray-800">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
              )}
            </div>
            <div className="p-2 border-t border-gray-200">
              <button className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium">
                View All
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserLayout;