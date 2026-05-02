// src/components/Layout/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaPlusCircle, 
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaChartBar,
  FaSignOutAlt,
  FaIndustry,
  FaMicrochip,
  FaCog
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import assets from '../../assets/assets';

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
      description: 'Overview & Analytics'
    },
    { 
      id: 'createPlant', 
      name: 'Create Plant', 
      path: '/dashboard/create-plant', 
      icon: <FaIndustry />,
      description: 'Add New Plant'
    },
    { 
      id: 'createZone', 
      name: 'Create Zone', 
      path: '/dashboard/create-zone', 
      icon: <FaMicrochip />,
      description: 'Add New Zone'
    },
    { 
      id: 'addDevice', 
      name: 'Add Device', 
      path: '/dashboard/add-device', 
      icon: <FaCog />,
      description: 'Register New Device'
    },
    { 
      id: 'reports', 
      name: 'Reports', 
      path: '/dashboard/reports', 
      icon: <FaFileAlt />,
      description: 'Generate & Download'
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

  const getUserInitials = () => {
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
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
      bg-gradient-to-b from-gray-50 to-white shadow-xl transition-all duration-300 flex flex-col border-r border-gray-200
    `}>
      {/* Logo Section with Image */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img 
            src={assets.logo} 
            alt="ZoneMonitor Logo" 
            className="w-15 h-15 rounded-xl object-cover flex-shrink-0 shadow-sm"
          />
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-gray-800 text-lg">Five Star Technologies</h1>
            </div>
          )}
        </div>
      </div>

     

      {/* Menu Items */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <div className="px-3">
          {!sidebarCollapsed && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Main Menu</p>
          )}
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-all duration-200
                ${isActive(item.path) 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? item.name : ''}
            >
              <span className={`text-xl flex-shrink-0 ${isActive(item.path) ? 'text-white' : 'text-gray-500'}`}>
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium truncate block">{item.name}</span>
                  <span className="text-xs text-gray-500 truncate block">{item.description}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-2 px-3 py-2 mb-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all
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
            w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all
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