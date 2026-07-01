// src/components/Layout/Sidebar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaIndustry,
  FaMicrochip,
  FaCog,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import assets from '../../assets/assets';

const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed, isMobile, mobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const menuItems = [
    { 
      id: 'dashboard',
      name: 'Dashboard',
      path: '/dashboard',
      icon: <FaTachometerAlt />,
    },
  ];

  const configItems = [
    { 
      id: 'createPlant', 
      name: 'Create Plant', 
      path: '/dashboard/create-plant', 
      icon: <FaIndustry />,
    },
    { 
      id: 'createZone', 
      name: 'Create Zone', 
      path: '/dashboard/create-zone', 
      icon: <FaMicrochip />,
    },
    { 
      id: 'addDevice', 
      name: 'Add Device', 
      path: '/dashboard/add-device', 
      icon: <FaCog />,
    },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
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

  const isConfigActive = () => {
    return configItems.some(item => location.pathname.startsWith(item.path));
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
      ${sidebarCollapsed ? 'w-16' : 'w-56'} 
      ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
      fixed lg:fixed
      z-30 h-screen
      bg-gradient-to-b from-slate-50 to-white shadow-xl transition-all duration-300 flex flex-col border-r border-slate-200/80
    `}>
      {/* Logo Section */}
      <div className="px-3 py-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <img 
            src={assets.logo} 
            alt="ZoneMonitor Logo" 
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-sm"
          />
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-slate-800 text-sm leading-tight">Five Star</h1>
              <span className="text-[10px] font-medium text-slate-500">Technologies</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-2">
          {/* Dashboard */}
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.path)}
              className={`
                w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200
                ${isActive(item.path) 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? item.name : ''}
            >
              <span className={`text-base flex-shrink-0 ${isActive(item.path) ? 'text-white' : 'text-slate-500'}`}>
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <span className="text-sm font-medium truncate">{item.name}</span>
              )}
            </button>
          ))}

          {/* Configuration Dropdown */}
          <div className="mt-1">
            <button
              onClick={() => !sidebarCollapsed && setIsConfigOpen(!isConfigOpen)}
              className={`
                w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200
                ${isConfigActive() 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? 'Configuration' : ''}
            >
              <span className={`text-base flex-shrink-0 ${isConfigActive() ? 'text-white' : 'text-slate-500'}`}>
                <FaCog />
              </span>
              {!sidebarCollapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">Configuration</span>
                  <span className="text-xs">
                    {isConfigOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </>
              )}
            </button>

            {/* Dropdown Items */}
            {!sidebarCollapsed && isConfigOpen && (
              <div className="mt-1 ml-2 space-y-0.5 border-l-2 border-purple-200/50 pl-2">
                {configItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.path)}
                    className={`
                      w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 text-sm
                      ${isActive(item.path) 
                        ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 font-medium' 
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }
                    `}
                  >
                    <span className={`text-sm flex-shrink-0 ${isActive(item.path) ? 'text-purple-500' : 'text-slate-400'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reports */}
          <button
            onClick={() => handleMenuClick('/dashboard/reports')}
            className={`
              w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 mt-1
              ${isActive('/dashboard/reports') 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
            title={sidebarCollapsed ? 'Reports' : ''}
          >
            <span className={`text-base flex-shrink-0 ${isActive('/dashboard/reports') ? 'text-white' : 'text-slate-500'}`}>
              <FaFileAlt />
            </span>
            {!sidebarCollapsed && (
              <span className="text-sm font-medium truncate">Reports</span>
            )}
          </button>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="px-2 py-3 border-t border-slate-200/80">
        {/* User Profile */}
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-slate-50/80">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{getUserName()}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`
            w-full flex items-center gap-2.5 px-2.5 py-2 text-slate-600 hover:bg-slate-100/80 rounded-lg transition-all
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}
        >
          {sidebarCollapsed ? <FaChevronRight className="text-sm" /> : <FaChevronLeft className="text-sm" />}
          {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;