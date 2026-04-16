import React, { useState } from 'react';
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaInfoCircle,
  FaClock,
  FaMapMarkerAlt,
  FaMicrochip,
  FaThermometerHalf,
  FaLeaf,
  FaVolumeUp,
  FaEye,
  FaHeartbeat,
  FaSearch,
  FaFilter,
  FaTimes,
  FaCheck,
  FaEye as FaViewIcon,
  FaTrash,
  FaArchive,
  FaEnvelope,
  FaPhoneAlt,
  FaChartLine,
  FaWrench,
  FaTools,
  FaShieldAlt,
  FaUserShield
} from 'react-icons/fa';

const Alerts = () => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [alertToAcknowledge, setAlertToAcknowledge] = useState(null);

  // Sample Alerts Data
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: 'Critical Temperature Spike',
      description: 'Temperature in Zone A exceeded safe threshold by 15°C',
      severity: 'critical',
      status: 'active',
      zone: 'Zone A',
      plant: 'Plant 1',
      equipment: 'Thermal Scanner T-1000',
      index: 'thermal',
      value: 52,
      threshold: 38,
      timestamp: '2024-03-15 14:30:00',
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolvedAt: null,
      recommendedAction: 'Immediately inspect cooling system and reduce production load',
      icon: <FaThermometerHalf />,
      color: 'red'
    },
    {
      id: 2,
      title: 'AQI Warning',
      description: 'Air Quality Index in Zone B reached moderate levels',
      severity: 'warning',
      status: 'active',
      zone: 'Zone B',
      plant: 'Plant 1',
      equipment: 'AQI Monitor Pro',
      index: 'aqi',
      value: 156,
      threshold: 100,
      timestamp: '2024-03-15 13:45:00',
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolvedAt: null,
      recommendedAction: 'Increase ventilation and check air filters',
      icon: <FaLeaf />,
      color: 'yellow'
    },
    {
      id: 3,
      title: 'Equipment Maintenance Due',
      description: 'Acoustic Sensor AS-200 requires scheduled maintenance',
      severity: 'info',
      status: 'acknowledged',
      zone: 'Zone C',
      plant: 'Plant 2',
      equipment: 'Acoustic Sensor AS-200',
      index: 'acoustic',
      value: null,
      threshold: null,
      timestamp: '2024-03-15 10:00:00',
      acknowledgedBy: 'John Doe',
      acknowledgedAt: '2024-03-15 10:30:00',
      resolvedAt: null,
      recommendedAction: 'Schedule maintenance within 48 hours',
      icon: <FaVolumeUp />,
      color: 'blue'
    },
    {
      id: 4,
      title: 'Visual Feed Degradation',
      description: 'Camera feed quality dropped below acceptable levels',
      severity: 'warning',
      status: 'resolved',
      zone: 'Zone A',
      plant: 'Plant 1',
      equipment: 'Visual Camera System',
      index: 'visual',
      value: 72,
      threshold: 85,
      timestamp: '2024-03-14 09:15:00',
      acknowledgedBy: 'Admin',
      acknowledgedAt: '2024-03-14 09:45:00',
      resolvedAt: '2024-03-14 11:30:00',
      recommendedAction: 'Check camera lens and connection cables',
      icon: <FaEye />,
      color: 'yellow'
    },
    {
      id: 5,
      title: 'HPI Score Improvement',
      description: 'Health Performance Index showing positive trend',
      severity: 'info',
      status: 'resolved',
      zone: 'Zone D',
      plant: 'Plant 3',
      equipment: 'HPI Monitor H-500',
      index: 'hpi',
      value: 82,
      threshold: 70,
      timestamp: '2024-03-14 08:00:00',
      acknowledgedBy: 'System',
      acknowledgedAt: '2024-03-14 08:05:00',
      resolvedAt: '2024-03-14 08:05:00',
      recommendedAction: 'Continue current maintenance practices',
      icon: <FaHeartbeat />,
      color: 'green'
    },
    {
      id: 6,
      title: 'Critical System Failure',
      description: 'Thermal Scanner in Zone B has stopped responding',
      severity: 'critical',
      status: 'active',
      zone: 'Zone B',
      plant: 'Plant 2',
      equipment: 'Thermal Scanner T-2000',
      index: 'thermal',
      value: null,
      threshold: null,
      timestamp: '2024-03-15 15:20:00',
      acknowledgedBy: null,
      acknowledgedAt: null,
      resolvedAt: null,
      recommendedAction: 'Immediate technical intervention required. Restart system.',
      icon: <FaThermometerHalf />,
      color: 'red'
    }
  ]);

  const severityOptions = [
    { id: 'all', name: 'All Severities', color: 'gray' },
    { id: 'critical', name: 'Critical', color: 'red' },
    { id: 'warning', name: 'Warning', color: 'yellow' },
    { id: 'info', name: 'Info', color: 'blue' }
  ];

  const statusOptions = [
    { id: 'all', name: 'All Status', color: 'gray' },
    { id: 'active', name: 'Active', color: 'red' },
    { id: 'acknowledged', name: 'Acknowledged', color: 'blue' },
    { id: 'resolved', name: 'Resolved', color: 'green' }
  ];

  const zones = ['all', 'Zone A', 'Zone B', 'Zone C', 'Zone D'];

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return <FaExclamationTriangle className="text-red-500" />;
      case 'warning': return <FaInfoCircle className="text-yellow-500" />;
      case 'info': return <FaInfoCircle className="text-blue-500" />;
      default: return <FaBell />;
    }
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      critical: 'bg-red-100 text-red-600',
      warning: 'bg-yellow-100 text-yellow-600',
      info: 'bg-blue-100 text-blue-600'
    };
    return styles[severity] || 'bg-gray-100 text-gray-600';
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-red-100 text-red-600',
      acknowledged: 'bg-blue-100 text-blue-600',
      resolved: 'bg-green-100 text-green-600'
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <FaExclamationTriangle className="text-xs" />;
      case 'acknowledged': return <FaCheckCircle className="text-xs" />;
      case 'resolved': return <FaCheckCircle className="text-xs" />;
      default: return <FaInfoCircle className="text-xs" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alert.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alert.equipment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus;
    const matchesZone = selectedZone === 'all' || alert.zone === selectedZone;
    return matchesSearch && matchesSeverity && matchesStatus && matchesZone;
  });

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length
  };

  const handleAcknowledge = (alert) => {
    setAlertToAcknowledge(alert);
    setShowAcknowledgeModal(true);
  };

  const confirmAcknowledge = () => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertToAcknowledge.id 
        ? { 
            ...alert, 
            status: 'acknowledged',
            acknowledgedBy: 'John Doe',
            acknowledgedAt: new Date().toLocaleString()
          }
        : alert
    );
    setAlerts(updatedAlerts);
    setShowAcknowledgeModal(false);
    setAlertToAcknowledge(null);
  };

  const handleResolve = (id) => {
    if (window.confirm('Mark this alert as resolved?')) {
      const updatedAlerts = alerts.map(alert => 
        alert.id === id 
          ? { ...alert, status: 'resolved', resolvedAt: new Date().toLocaleString() }
          : alert
      );
      setAlerts(updatedAlerts);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      setAlerts(alerts.filter(alert => alert.id !== id));
    }
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setShowDetails(true);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alerts & Notifications</h1>
          <p className="text-gray-500 mt-1">Monitor and manage all system alerts</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all">
            <FaArchive /> <span className="hidden sm:inline">Archive All</span>
          </button>
          <button className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all">
            <FaBell /> <span className="hidden sm:inline">Alert Settings</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">Total Alerts</p>
            <FaBell className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">Active</p>
            <FaExclamationTriangle className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">Acknowledged</p>
            <FaCheckCircle className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-500 mt-1">{stats.acknowledged}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">Resolved</p>
            <FaCheckCircle className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500 mt-1">{stats.resolved}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">Critical Active</p>
            <FaExclamationTriangle className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500 mt-1">{stats.critical}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts by title, description, zone, or equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-purple-300"
            >
              {severityOptions.map(option => (
                <option key={option.id} value={option.id}>Severity: {option.name}</option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-purple-300"
            >
              {statusOptions.map(option => (
                <option key={option.id} value={option.id}>Status: {option.name}</option>
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
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Alerts Found</h3>
            <p className="text-gray-400">No alerts match your search criteria</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl shadow-lg border-l-8 ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
              } border border-gray-100 hover:shadow-xl transition-all overflow-hidden`}
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      alert.severity === 'critical' ? 'bg-red-100' :
                      alert.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{alert.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(alert.status)}`}>
                          {getStatusIcon(alert.status)}
                          {alert.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-xs" />
                          {alert.zone} | {alert.plant}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaMicrochip className="text-xs" />
                          {alert.equipment}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-xs" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {alert.acknowledgedBy && (
                        <p className="text-xs text-gray-400 mt-2">
                          Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt}
                        </p>
                      )}
                      {alert.resolvedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Resolved at {alert.resolvedAt}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(alert)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="View Details"
                    >
                      <FaViewIcon />
                    </button>
                    {alert.status === 'active' && (
                      <button
                        onClick={() => handleAcknowledge(alert)}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                        title="Acknowledge"
                      >
                        <FaCheck />
                      </button>
                    )}
                    {alert.status === 'acknowledged' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-all"
                        title="Mark as Resolved"
                      >
                        <FaCheckCircle />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                  <button className="text-xs px-2 py-1 bg-gray-100 rounded-lg flex items-center gap-1 hover:bg-gray-200">
                    <FaEnvelope /> Notify Team
                  </button>
                  <button className="text-xs px-2 py-1 bg-gray-100 rounded-lg flex items-center gap-1 hover:bg-gray-200">
                    <FaTools /> View Equipment
                  </button>
                  <button className="text-xs px-2 py-1 bg-gray-100 rounded-lg flex items-center gap-1 hover:bg-gray-200">
                    <FaChartLine /> View History
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Details Modal */}
      {showDetails && selectedAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetails(false)}></div>
            
            <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Alert Details</h2>
                <button onClick={() => setShowDetails(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className={`p-4 rounded-xl mb-6 ${
                  selectedAlert.severity === 'critical' ? 'bg-red-50' :
                  selectedAlert.severity === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                      {getSeverityIcon(selectedAlert.severity)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{selectedAlert.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityBadge(selectedAlert.severity)}`}>
                          {selectedAlert.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedAlert.status)}`}>
                          {selectedAlert.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{selectedAlert.description}</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FaMapMarkerAlt className="text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium">{selectedAlert.zone} | {selectedAlert.plant}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FaMicrochip className="text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Equipment</p>
                        <p className="text-sm font-medium">{selectedAlert.equipment}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FaClock className="text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Timestamp</p>
                        <p className="text-sm font-medium">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    {selectedAlert.value && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FaChartLine className="text-purple-500" />
                        <div>
                          <p className="text-xs text-gray-500">Value / Threshold</p>
                          <p className="text-sm font-medium">{selectedAlert.value} / {selectedAlert.threshold}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FaShieldAlt className="text-blue-500" />
                      Recommended Action
                    </h4>
                    <p className="text-sm text-gray-700">{selectedAlert.recommendedAction}</p>
                  </div>
                  
                  {(selectedAlert.acknowledgedBy || selectedAlert.resolvedAt) && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <FaUserShield className="text-purple-500" />
                        Resolution Timeline
                      </h4>
                      {selectedAlert.acknowledgedBy && (
                        <p className="text-sm text-gray-600">✓ Acknowledged by {selectedAlert.acknowledgedBy} at {selectedAlert.acknowledgedAt}</p>
                      )}
                      {selectedAlert.resolvedAt && (
                        <p className="text-sm text-green-600 mt-1">✓ Resolved at {selectedAlert.resolvedAt}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  {selectedAlert.status === 'active' && (
                    <button
                      onClick={() => {
                        handleAcknowledge(selectedAlert);
                        setShowDetails(false);
                      }}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-600"
                    >
                      <FaCheck /> Acknowledge Alert
                    </button>
                  )}
                  {selectedAlert.status === 'acknowledged' && (
                    <button
                      onClick={() => {
                        handleResolve(selectedAlert.id);
                        setShowDetails(false);
                      }}
                      className="flex-1 py-2 bg-purple-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-purple-600"
                    >
                      <FaCheckCircle /> Mark as Resolved
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledge Modal */}
      {showAcknowledgeModal && alertToAcknowledge && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowAcknowledgeModal(false)}></div>
            
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-green-500 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Acknowledge Alert</h3>
                <p className="text-gray-500 mb-4">
                  Are you sure you want to acknowledge this alert? This will mark it as acknowledged.
                </p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">
                  <strong>Alert:</strong> {alertToAcknowledge.title}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAcknowledgeModal(false)}
                    className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAcknowledge}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Acknowledge
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

export default Alerts;