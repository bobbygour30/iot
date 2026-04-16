import React, { useState } from 'react';
import { 
  FaHistory, 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt,
  FaDownload,
  FaEye,
  FaChartLine,
  FaThermometerHalf,
  FaLeaf,
  FaVolumeUp,
  FaEye as FaEyeIcon,
  FaHeartbeat,
  FaMicrochip,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaFileAlt,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaBell,
  FaWrench,
  FaPlus,
  FaCog
} from 'react-icons/fa';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [startDate, setStartDate] = useState('2024-03-01');
  const [endDate, setEndDate] = useState('2024-03-15');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const itemsPerPage = 10;

  // Sample History Data - Direct array without useState since we don't need to modify it
  const historyEvents = [
    {
      id: 1,
      type: 'alert',
      title: 'Critical Temperature Spike',
      description: 'Temperature in Zone A exceeded safe threshold',
      severity: 'critical',
      zone: 'Zone A',
      plant: 'Plant 1',
      equipment: 'Thermal Scanner T-1000',
      user: 'System',
      timestamp: '2024-03-15 14:30:00',
      details: {
        oldValue: 38,
        newValue: 52,
        threshold: 38,
        resolution: 'Cooling system activated automatically',
        duration: '15 minutes'
      },
      icon: <FaExclamationTriangle />,
      color: 'red'
    },
    {
      id: 2,
      type: 'alert',
      title: 'AQI Warning',
      description: 'Air Quality Index reached moderate levels',
      severity: 'warning',
      zone: 'Zone B',
      plant: 'Plant 1',
      equipment: 'AQI Monitor Pro',
      user: 'System',
      timestamp: '2024-03-15 13:45:00',
      details: {
        oldValue: 95,
        newValue: 156,
        threshold: 100,
        resolution: 'Ventilation increased',
        duration: '30 minutes'
      },
      icon: <FaInfoCircle />,
      color: 'yellow'
    },
    {
      id: 3,
      type: 'maintenance',
      title: 'Scheduled Maintenance Completed',
      description: 'Acoustic Sensor AS-200 maintenance completed successfully',
      severity: 'info',
      zone: 'Zone C',
      plant: 'Plant 2',
      equipment: 'Acoustic Sensor AS-200',
      user: 'John Doe',
      timestamp: '2024-03-15 11:00:00',
      details: {
        maintenanceType: 'Preventive',
        duration: '2 hours',
        technician: 'Mike Smith',
        notes: 'Calibrated and tested successfully'
      },
      icon: <FaWrench />,
      color: 'blue'
    },
    {
      id: 4,
      type: 'configuration',
      title: 'Threshold Settings Updated',
      description: 'Temperature threshold changed for Zone A',
      severity: 'info',
      zone: 'Zone A',
      plant: 'Plant 1',
      equipment: 'Thermal Scanner T-1000',
      user: 'Admin',
      timestamp: '2024-03-15 09:30:00',
      details: {
        oldValue: 35,
        newValue: 38,
        parameter: 'Temperature Threshold',
        reason: 'Seasonal adjustment'
      },
      icon: <FaCog />,
      color: 'purple'
    },
    {
      id: 5,
      type: 'alert',
      title: 'Equipment Offline',
      description: 'Visual Camera System went offline unexpectedly',
      severity: 'critical',
      zone: 'Zone A',
      plant: 'Plant 1',
      equipment: 'Visual Camera System',
      user: 'System',
      timestamp: '2024-03-14 22:15:00',
      details: {
        downtime: '45 minutes',
        resolution: 'System rebooted automatically',
        rootCause: 'Network interruption'
      },
      icon: <FaExclamationTriangle />,
      color: 'red'
    },
    {
      id: 6,
      type: 'maintenance',
      title: 'Emergency Maintenance',
      description: 'HPI Monitor required urgent calibration',
      severity: 'warning',
      zone: 'Zone D',
      plant: 'Plant 3',
      equipment: 'HPI Monitor H-500',
      user: 'Sarah Johnson',
      timestamp: '2024-03-14 16:20:00',
      details: {
        maintenanceType: 'Corrective',
        duration: '1.5 hours',
        technician: 'Sarah Johnson',
        notes: 'Calibration completed, readings normalized'
      },
      icon: <FaWrench />,
      color: 'orange'
    },
    {
      id: 7,
      type: 'configuration',
      title: 'Zone Assignment Changed',
      description: 'Equipment reassigned to different zone',
      severity: 'info',
      zone: 'Zone B',
      plant: 'Plant 2',
      equipment: 'AQI Monitor Pro',
      user: 'Manager',
      timestamp: '2024-03-14 14:00:00',
      details: {
        oldZone: 'Zone C',
        newZone: 'Zone B',
        reason: 'Operational optimization'
      },
      icon: <FaCog />,
      color: 'purple'
    },
    {
      id: 8,
      type: 'alert',
      title: 'Performance Degradation',
      description: 'Efficiency dropped below acceptable level',
      severity: 'warning',
      zone: 'Zone C',
      plant: 'Plant 2',
      equipment: 'Acoustic Sensor AS-200',
      user: 'System',
      timestamp: '2024-03-14 10:30:00',
      details: {
        oldValue: 92,
        newValue: 78,
        threshold: 85,
        resolution: 'Maintenance scheduled',
        duration: 'Ongoing'
      },
      icon: <FaInfoCircle />,
      color: 'yellow'
    },
    {
      id: 9,
      type: 'maintenance',
      title: 'Firmware Update',
      description: 'Thermal Scanner firmware updated to v2.1',
      severity: 'info',
      zone: 'Zone B',
      plant: 'Plant 2',
      equipment: 'Thermal Scanner T-2000',
      user: 'Tech Team',
      timestamp: '2024-03-13 15:45:00',
      details: {
        oldVersion: 'v2.0',
        newVersion: 'v2.1',
        duration: '30 minutes',
        notes: 'Bug fixes and performance improvements'
      },
      icon: <FaWrench />,
      color: 'blue'
    },
    {
      id: 10,
      type: 'alert',
      title: 'Alert Resolved',
      description: 'Temperature returned to normal range',
      severity: 'info',
      zone: 'Zone A',
      plant: 'Plant 1',
      equipment: 'Thermal Scanner T-1000',
      user: 'System',
      timestamp: '2024-03-13 14:50:00',
      details: {
        oldValue: 52,
        newValue: 36,
        resolution: 'Automatic recovery',
        duration: '2 hours'
      },
      icon: <FaCheckCircle />,
      color: 'green'
    },
    {
      id: 11,
      type: 'configuration',
      title: 'Alert Thresholds Updated',
      description: 'Multiple threshold values adjusted',
      severity: 'info',
      zone: 'All Zones',
      plant: 'All Plants',
      equipment: 'System Configuration',
      user: 'Admin',
      timestamp: '2024-03-13 09:00:00',
      details: {
        changes: [
          { parameter: 'Temperature', oldValue: 35, newValue: 38 },
          { parameter: 'AQI', oldValue: 90, newValue: 100 }
        ],
        reason: 'Seasonal adjustment'
      },
      icon: <FaCog />,
      color: 'purple'
    },
    {
      id: 12,
      type: 'maintenance',
      title: 'Preventive Maintenance',
      description: 'Quarterly maintenance completed for all sensors',
      severity: 'info',
      zone: 'All Zones',
      plant: 'All Plants',
      equipment: 'Multiple',
      user: 'Maintenance Team',
      timestamp: '2024-03-12 08:00:00',
      details: {
        maintenanceType: 'Preventive',
        duration: '4 hours',
        technician: 'Team Lead',
        notes: 'All sensors calibrated and tested'
      },
      icon: <FaWrench />,
      color: 'blue'
    }
  ];

  const eventTypes = [
    { id: 'all', name: 'All Events', icon: <FaHistory />, color: 'gray' },
    { id: 'alert', name: 'Alerts', icon: <FaBell />, color: 'red' },
    { id: 'maintenance', name: 'Maintenance', icon: <FaWrench />, color: 'blue' },
    { id: 'configuration', name: 'Configuration', icon: <FaCog />, color: 'purple' }
  ];

  const zones = ['all', 'Zone A', 'Zone B', 'Zone C', 'Zone D', 'All Zones'];

  const getTypeColor = (type) => {
    const colors = {
      alert: 'text-red-500 bg-red-50',
      maintenance: 'text-blue-500 bg-blue-50',
      configuration: 'text-purple-500 bg-purple-50'
    };
    return colors[type] || 'text-gray-500 bg-gray-50';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-600',
      warning: 'bg-yellow-100 text-yellow-600',
      info: 'bg-blue-100 text-blue-600'
    };
    return colors[severity] || 'bg-gray-100 text-gray-600';
  };

  const filteredEvents = historyEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || event.type === selectedType;
    const matchesZone = selectedZone === 'all' || event.zone === selectedZone || 
                        (selectedZone === 'All Zones' && event.zone === 'All Zones');
    const eventDate = event.timestamp.split(' ')[0];
    const matchesDate = eventDate >= startDate && eventDate <= endDate;
    return matchesSearch && matchesType && matchesZone && matchesDate;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'timestamp') {
      aValue = new Date(a.timestamp);
      bValue = new Date(b.timestamp);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = sortedEvents.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-300" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-purple-500" /> : <FaSortDown className="text-purple-500" />;
  };

  const handleExportHistory = () => {
    alert('Exporting history data...');
  };

  const stats = {
    total: historyEvents.length,
    alerts: historyEvents.filter(e => e.type === 'alert').length,
    maintenance: historyEvents.filter(e => e.type === 'maintenance').length,
    configuration: historyEvents.filter(e => e.type === 'configuration').length,
    criticalAlerts: historyEvents.filter(e => e.severity === 'critical').length
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Event History</h1>
          <p className="text-gray-500 mt-1">View and analyze all system events and activities</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportHistory}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all"
          >
            <FaDownload /> <span className="hidden sm:inline">Export History</span>
          </button>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Events</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Alerts</p>
          <p className="text-2xl font-bold text-red-500">{stats.alerts}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Maintenance</p>
          <p className="text-2xl font-bold text-blue-500">{stats.maintenance}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Configurations</p>
          <p className="text-2xl font-bold text-purple-500">{stats.configuration}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Critical Alerts</p>
          <p className="text-2xl font-bold text-red-500">{stats.criticalAlerts}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by title, description, equipment, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-purple-300"
          >
            {eventTypes.map(type => (
              <option key={type.id} value={type.id}>Type: {type.name}</option>
            ))}
          </select>
          
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-purple-300"
          >
            {zones.map(zone => (
              <option key={zone} value={zone}>Zone: {zone === 'all' ? 'All' : zone}</option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            />
            <span className="self-center text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>
      </div>

      {/* Events List/Grid View */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1">Event {getSortIcon('title')}</div>
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('type')}>
                    <div className="flex items-center gap-1">Type {getSortIcon('type')}</div>
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Zone/Equipment</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('user')}>
                    <div className="flex items-center gap-1">User {getSortIcon('user')}</div>
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('timestamp')}>
                    <div className="flex items-center gap-1">Timestamp {getSortIcon('timestamp')}</div>
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${getTypeColor(event.type)} flex items-center justify-center`}>
                          {event.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{event.title}</p>
                          <p className="text-xs text-gray-500">{event.description.substring(0, 50)}...</p>
                        </div>
                      </div>
                     </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getSeverityColor(event.severity)}`}>
                        {event.type}
                      </span>
                     </td>
                    <td className="px-4 sm:px-6 py-4">
                      <p className="text-sm text-gray-700">{event.zone}</p>
                      <p className="text-xs text-gray-500">{event.equipment}</p>
                     </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">{event.user}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                     </td>
                    <td className="px-4 sm:px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(event)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all cursor-pointer"
              onClick={() => handleViewDetails(event)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${getTypeColor(event.type)} flex items-center justify-center`}>
                  {event.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{event.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityColor(event.severity)}`}>
                      {event.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{event.description.substring(0, 80)}...</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaMapMarkerAlt className="text-purple-400" />
                  <span>{event.zone} | {event.plant}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaMicrochip className="text-purple-400" />
                  <span>{event.equipment}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaUser className="text-purple-400" />
                  <span>{event.user}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaClock className="text-purple-400" />
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedEvents.length)} of {sortedEvents.length} events
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft />
            </button>
            <span className="px-4 py-2 bg-purple-500 text-white rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Events Found</h3>
          <p className="text-gray-400">No events match your search criteria</p>
        </div>
      )}

      {/* Event Details Modal */}
      {showDetails && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetails(false)}></div>
            
            <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Event Details</h2>
                <button onClick={() => setShowDetails(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className={`p-4 rounded-xl mb-6 ${
                  selectedEvent.severity === 'critical' ? 'bg-red-50' :
                  selectedEvent.severity === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center ${getTypeColor(selectedEvent.type)}`}>
                      {selectedEvent.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{selectedEvent.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityColor(selectedEvent.severity)}`}>
                          {selectedEvent.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedEvent.severity)}`}>
                          {selectedEvent.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{selectedEvent.description}</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FaMapMarkerAlt className="text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium">{selectedEvent.zone} | {selectedEvent.plant}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FaMicrochip className="text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Equipment</p>
                        <p className="text-sm font-medium">{selectedEvent.equipment}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FaUser className="text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">User / System</p>
                        <p className="text-sm font-medium">{selectedEvent.user}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FaClock className="text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Timestamp</p>
                        <p className="text-sm font-medium">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedEvent.details && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FaFileAlt className="text-purple-500" />
                        Additional Details
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(selectedEvent.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1 border-b border-gray-200 last:border-0">
                            <span className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="text-sm font-medium text-gray-700">
                              {typeof value === 'object' ? JSON.stringify(value) : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;