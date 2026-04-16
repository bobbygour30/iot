import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaCog, 
  FaMicrochip, 
  FaChartLine, 
  FaDownload, 
  FaPlusCircle, 
  FaHeadset,
  FaChevronLeft,
  FaChevronRight,
  FaChartBar,
  FaFileAlt,
  FaBell,
  FaDatabase,
  FaShieldAlt,
  FaHistory,
  FaClipboardList,
  FaChartPie,
  FaExclamationTriangle,
  FaEnvelope,
  FaQuestionCircle,
  FaStar,
  FaLock,
  FaUsers,
  FaRobot,
  FaCloudUploadAlt,
  FaCalendarAlt,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed, isMobile, mobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { 
      id: 'dashboard',
      name: 'Dashboard',
      path: '/dashboard',
      icon: <FaTachometerAlt />,
      description: 'Overview & Analytics',
      category: 'Main',
      roles: ['admin', 'manager', 'user', 'viewer'],
      permissions: ['view_dashboard'],
      badge: null,
      isNew: false,
      order: 1,
    },
    { 
      id: 'equipment', 
      name: 'Equipment', 
      path: '/dashboard/equipment', 
      icon: <FaMicrochip />,
      description: 'Manage Devices',
      category: 'Assets',
      roles: ['admin', 'manager', 'technician'],
      permissions: ['view_equipment', 'edit_equipment'],
      badge: { count: 3, type: 'alert', color: 'red' },
      isNew: false,
      order: 2,
    },
    { 
      id: 'indices', 
      name: 'Indices', 
      path: '/dashboard/indices', 
      icon: <FaChartLine />,
      description: 'KPIs & Metrics',
      category: 'Analytics',
      roles: ['admin', 'manager'],
      permissions: ['view_indices'],
      badge: { count: 2, type: 'info', color: 'blue' },
      isNew: true,
      order: 3,
    },
    { 
      id: 'reports', 
      name: 'Reports', 
      path: '/dashboard/reports', 
      icon: <FaFileAlt />,
      description: 'Generate & Download',
      category: 'Data',
      roles: ['admin', 'manager', 'user'],
      permissions: ['view_reports', 'download_reports'],
      badge: null,
      isNew: false,
      order: 4,
    },
    { 
      id: 'alerts', 
      name: 'Alerts', 
      path: '/dashboard/alerts', 
      icon: <FaExclamationTriangle />,
      description: 'System Notifications',
      category: 'Monitoring',
      roles: ['admin', 'manager'],
      permissions: ['view_alerts'],
      badge: { count: 5, type: 'warning', color: 'orange' },
      isNew: false,
      order: 5,
    },
    { 
      id: 'history', 
      name: 'History', 
      path: '/dashboard/history', 
      icon: <FaHistory />,
      description: 'Audit Logs',
      category: 'Data',
      roles: ['admin'],
      permissions: ['view_history'],
      badge: null,
      isNew: false,
      order: 6,
    },
    { 
      id: 'users', 
      name: 'Users', 
      path: '/dashboard/users', 
      icon: <FaUsers />,
      description: 'User Management',
      category: 'Administration',
      roles: ['admin'],
      permissions: ['manage_users'],
      badge: null,
      isNew: false,
      order: 7,
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      path: '/dashboard/settings', 
      icon: <FaCog />,
      description: 'System Preferences',
      category: 'Administration',
      roles: ['admin'],
      permissions: ['manage_settings'],
      badge: null,
      isNew: false,
      order: 8,
    },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (isMobile && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Get user initials
  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <div className={`
      ${sidebarCollapsed ? 'w-20' : 'w-64'} 
      ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
      fixed lg:fixed
      z-30 h-screen
      bg-white/95 backdrop-blur-sm shadow-xl transition-all duration-300 flex flex-col border-r border-gray-200
    `}>
      {/* Logo Section */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-md">
            <FaChartBar className="text-white text-xl" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-gray-800 text-lg">ZoneMonitor</h1>
              <p className="text-xs text-gray-500">Industrial IoT</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info Section */}
      {!sidebarCollapsed && (
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-sm">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{getUserName()}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role || 'Zone Admin'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="px-3 mb-2">
          {!sidebarCollapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Main Menu</p>
          )}
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-all duration-200
                ${isActive(item.path) 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? item.name : ''}
            >
              <span className={`text-xl flex-shrink-0 ${isActive(item.path) ? 'text-purple-500' : 'text-gray-400'}`}>
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium truncate block">{item.name}</span>
                  <span className="text-xs text-gray-400 truncate block">{item.description}</span>
                </div>
              )}
              {!sidebarCollapsed && item.badge && (
                <span className={`
                  text-xs px-1.5 py-0.5 rounded-full font-semibold
                  ${item.badge.color === 'red' ? 'bg-red-100 text-red-600' : 
                    item.badge.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    item.badge.color === 'green' ? 'bg-green-100 text-green-600' :
                    'bg-orange-100 text-orange-600'}
                `}>
                  {item.badge.count}
                </span>
              )}
              {!sidebarCollapsed && item.isNew && (
                <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">
                  New
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Section with Logout */}
      <div className="p-4 border-t border-gray-200">
        {!sidebarCollapsed && (
          <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaCloudUploadAlt className="text-purple-500" />
              <span className="text-xs font-semibold text-gray-700">Storage</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">65% used</p>
          </div>
        )}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-2 px-3 py-2 mb-2 text-red-600 hover:bg-red-50 rounded-lg transition-all
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}
          title={sidebarCollapsed ? 'Logout' : ''}
        >
          <FaSignOutAlt className="text-lg" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`
            w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}
        >
          {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          {!sidebarCollapsed && <span className="text-sm">Collapse Menu</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;