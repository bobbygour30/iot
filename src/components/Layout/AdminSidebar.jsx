// src/components/Layout/AdminSidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaIndustry, 
  FaMicrochip, 
  FaBuilding,
  FaChartBar, 
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaFileAlt,
  FaBell,
  FaDatabase,
  FaHistory,
  FaExclamationTriangle,
  FaSignOutAlt,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaEye,
  FaUserShield,
  FaMapMarkerAlt,
  FaCalendarAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ sidebarCollapsed, setSidebarCollapsed, isMobile, mobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { 
      id: 'overview',
      name: 'Dashboard',
      path: '/admin-dashboard/overview',
      icon: <FaTachometerAlt />,
      description: 'Overview & Stats'
    },
    { 
      id: 'users', 
      name: 'Users', 
      path: '/admin-dashboard/users', 
      icon: <FaUsers />,
      description: 'Manage Users'
    },
    { 
      id: 'zones', 
      name: 'Zones', 
      path: '/admin-dashboard/zones', 
      icon: <FaBuilding />,
      description: 'Manage Zones'
    },
    { 
      id: 'plants', 
      name: 'Plants', 
      path: '/admin-dashboard/plants', 
      icon: <FaIndustry />,
      description: 'Manage Plants'
    },
    { 
      id: 'devices', 
      name: 'Devices', 
      path: '/admin-dashboard/devices', 
      icon: <FaMicrochip />,
      description: 'Manage Devices'
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
    return location.pathname === path;
  };

  return (
    <div className={`
      ${sidebarCollapsed ? 'w-20' : 'w-64'} 
      ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
      fixed lg:fixed
      z-30 h-screen
      bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl transition-all duration-300 flex flex-col
    `}>
      {/* Logo Section */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
            <FaChartBar className="text-white text-xl" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-white text-lg">SuperAdmin</h1>
              <p className="text-xs text-gray-400">Control Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="px-3">
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
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? item.name : ''}
            >
              <span className={`text-xl flex-shrink-0 ${isActive(item.path) ? 'text-white' : 'text-gray-400'}`}>
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium truncate block">{item.name}</span>
                  <span className="text-xs text-gray-400 truncate block">{item.description}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-2 px-3 py-2 mb-2 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-all
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}
          title={sidebarCollapsed ? 'Logout' : ''}
        >
          <FaSignOutAlt className="text-lg" />
          {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
        
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`
            w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-all
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

export default AdminSidebar;