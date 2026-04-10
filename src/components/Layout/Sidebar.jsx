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
  FaChartBar
} from 'react-icons/fa';

const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed, isMobile, mobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { 
      id: 'dashboard',
      name: 'Dashboard',
      path: '/',
      icon: <FaTachometerAlt />
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      path: '/settings', 
      icon: <FaCog /> 
    },
    { 
      id: 'equipment', 
      name: 'Equipment', 
      path: '/equipment', 
      icon: <FaMicrochip /> 
    },
    { 
      id: 'indices', 
      name: 'Indices', 
      path: '/indices', 
      icon: <FaChartLine /> 
    },
    { 
      id: 'downloadReports', 
      name: 'Download Reports', 
      path: '/download-reports', 
      icon: <FaDownload /> 
    },
    { 
      id: 'addEquipment', 
      name: 'Add Equipment', 
      path: '/add-equipment', 
      icon: <FaPlusCircle /> 
    },
    { 
      id: 'support', 
      name: 'Support', 
      path: '/support', 
      icon: <FaHeadset /> 
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