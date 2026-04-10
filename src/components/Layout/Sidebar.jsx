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
  FaCalendarAlt
} from 'react-icons/fa';

const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed, isMobile, mobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

const menuItems = [
    { 
      id: 'dashboard',
      name: 'Dashboard',
      path: '/',
      icon: <FaTachometerAlt />,
      description: 'Overview & Analytics',
      category: 'Main',
      roles: ['admin', 'manager', 'user', 'viewer'],
      permissions: ['view_dashboard'],
      badge: null,
      isNew: false,
      order: 1,
      subItems: [
        { name: 'Main Dashboard', path: '/', icon: <FaChartPie /> },
        { name: 'Analytics', path: '/analytics', icon: <FaChartLine /> },
        { name: 'Real-time Monitor', path: '/realtime', icon: <FaBell /> }
      ]
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
      subItems: [
        { name: 'All Equipment', path: '/equipment/list' },
        { name: 'Categories', path: '/equipment/categories' },
        { name: 'Maintenance Schedule', path: '/equipment/maintenance' },
        { name: 'Equipment Status', path: '/equipment/status' }
      ]
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
      subItems: [
        { name: 'Thermal Index', path: '/indices/thermal' },
        { name: 'AQI Index', path: '/indices/aqi' },
        { name: 'Acoustic Index', path: '/indices/acoustic' },
        { name: 'Visual Index', path: '/indices/visual' },
        { name: 'HPI Score', path: '/indices/hpi' }
      ]
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
      subItems: [
        { name: 'Daily Reports', path: '/reports/daily' },
        { name: 'Weekly Reports', path: '/reports/weekly' },
        { name: 'Monthly Reports', path: '/reports/monthly' },
        { name: 'Custom Reports', path: '/reports/custom' }
      ]
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
      subItems: [
        { name: 'Active Alerts', path: '/alerts/active' },
        { name: 'Alert History', path: '/alerts/history' },
        { name: 'Alert Settings', path: '/alerts/settings' }
      ]
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
      subItems: [
        { name: 'Activity Log', path: '/history/activity' },
        { name: 'Equipment Log', path: '/history/equipment' },
        { name: 'User Log', path: '/history/users' }
      ]
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
      subItems: [
        { name: 'All Users', path: '/users/list' },
        { name: 'Roles & Permissions', path: '/users/roles' },
        { name: 'Activity Log', path: '/users/activity' }
      ]
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
      subItems: [
        { name: 'General Settings', path: '/settings/general' },
        { name: 'Profile Settings', path: '/settings/profile' },
        { name: 'Security', path: '/settings/security' },
        { name: 'Notifications', path: '/settings/notifications' },
        { name: 'API Keys', path: '/settings/api' }
      ]
    },
    { 
      id: 'backup', 
      name: 'Backup', 
      path: '/dashboard/backup', 
      icon: <FaDatabase />,
      description: 'Data Backup',
      category: 'Administration',
      roles: ['admin'],
      permissions: ['manage_backup'],
      badge: null,
      isNew: false,
      order: 9,
      subItems: [
        { name: 'Create Backup', path: '/backup/create' },
        { name: 'Restore Backup', path: '/backup/restore' },
        { name: 'Backup History', path: '/backup/history' }
      ]
    },
    { 
      id: 'integrations', 
      name: 'Integrations', 
      path: '/dashboard/integrations', 
      icon: <FaRobot />,
      description: 'Third-party Apps',
      category: 'Extensions',
      roles: ['admin'],
      permissions: ['manage_integrations'],
      badge: { count: 2, type: 'success', color: 'green' },
      isNew: true,
      order: 10,
      subItems: [
        { name: 'API Connections', path: '/integrations/api' },
        { name: 'Webhooks', path: '/integrations/webhooks' },
        { name: 'External Services', path: '/integrations/services' }
      ]
    },
    { 
      id: 'support', 
      name: 'Support', 
      path: '/dashboard/support', 
      icon: <FaHeadset />,
      description: 'Help & Resources',
      category: 'Support',
      roles: ['admin', 'manager', 'user'],
      permissions: ['view_support'],
      badge: null,
      isNew: false,
      order: 11,
      subItems: [
        { name: 'FAQ', path: '/support/faq' },
        { name: 'Contact Support', path: '/support/contact' },
        { name: 'Documentation', path: '/support/docs' },
        { name: 'System Status', path: '/support/status' }
      ]
    },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    if (isMobile && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`
      ${sidebarCollapsed ? 'w-20' : 'w-64'} 
      ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
      fixed lg:relative
      z-30 h-full
      bg-white/95 backdrop-blur-sm shadow-xl transition-all duration-300 flex flex-col border-r border-gray-200
    `}>
      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center flex-shrink-0">
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

      {/* Menu Items */}
      <nav className="flex-1 py-6 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.path)}
            className={`w-full flex items-center gap-3 px-5 py-3 transition-all duration-200 hover:bg-purple-50 hover:text-purple-600 ${
              isActive(item.path) 
                ? 'bg-purple-50 text-purple-600 border-r-4 border-purple-500' 
                : 'text-gray-600'
            }`}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {!sidebarCollapsed && <span className="text-sm font-medium truncate">{item.name}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-gray-200 hidden lg:block">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
        >
          {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;