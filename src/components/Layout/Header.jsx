import React from 'react';
import { FaBars, FaFileDownload, FaUserCircle, FaBuilding, FaBell, FaSearch } from 'react-icons/fa';

const Header = ({ setMobileMenuOpen, activeMenu }) => {
  const getTitle = () => {
    switch(activeMenu) {
      case 'dashboard': return 'Dashboard Overview';
      case 'settings': return 'Settings';
      case 'equipment': return 'Equipment Management';
      case 'indices': return 'Performance Indices';
      case 'downloadReports': return 'Download Reports';
      case 'addEquipment': return 'Add Equipment';
      case 'support': return 'Support Center';
      default: return 'Dashboard Overview';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            <FaBars className="text-gray-600 text-xl" />
          </button>
          
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{getTitle()}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <FaUserCircle className="text-base" />
                <span>John Doe</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <FaBuilding />
                <span>Acme Corp</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
            <FaSearch className="text-gray-400 text-sm" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm px-2 w-48" />
          </div>
          
          {/* Notification */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-all">
            <FaBell className="text-gray-600 text-lg" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Export Button */}
          <button className="px-3 py-1.5 text-xs sm:text-sm bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-1">
            <FaFileDownload className="text-sm" /> 
            <span className="hidden sm:inline">Export</span>
          </button>
          
          {/* User Avatar */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
            JD
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;