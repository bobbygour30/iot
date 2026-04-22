// src/pages/admin/DevicesManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaMicrochip,
  FaThermometerHalf,
  FaTint,
  FaFlask,
  FaWifi,
  FaPowerOff,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaChartLine,
  FaSpinner
} from 'react-icons/fa';
import api from '../../services/api';

const DevicesManagement = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [zones, setZones] = useState([]);
  const [plants, setPlants] = useState([]);
  const [error, setError] = useState('');
  const [newDevice, setNewDevice] = useState({
    deviceId: '', type: 'Multi-Sensor', model: '', location: '', plantId: '', zoneId: ''
  });

  const deviceTypes = ['Multi-Sensor', 'Temperature Sensor', 'Humidity Sensor', 'VOC Sensor'];

  useEffect(() => {
    fetchDevices();
    fetchZones();
    fetchPlants();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await api.getAdminDevices();
      setDevices(response.data);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await api.getAdminZones();
      setZones(response.data);
    } catch (err) {
      console.error('Error fetching zones:', err);
    }
  };

  const fetchPlants = async () => {
    try {
      const response = await api.getAdminPlants();
      setPlants(response.data);
    } catch (err) {
      console.error('Error fetching plants:', err);
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.deviceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || device.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'online': return { color: 'bg-green-100 text-green-700', icon: <FaCheckCircle /> };
      case 'offline': return { color: 'bg-red-100 text-red-700', icon: <FaPowerOff /> };
      case 'maintenance': return { color: 'bg-orange-100 text-orange-700', icon: <FaExclamationTriangle /> };
      default: return { color: 'bg-gray-100 text-gray-700', icon: null };
    }
  };

  const handleAddDevice = async () => {
    try {
      const response = await api.registerAdminDevice(newDevice);
      setDevices([response.data, ...devices]);
      setShowAddModal(false);
      setNewDevice({ deviceId: '', type: 'Multi-Sensor', model: '', location: '', plantId: '', zoneId: '' });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateDevice = async () => {
    try {
      const response = await api.updateAdminDevice(selectedDevice._id, selectedDevice);
      setDevices(devices.map(d => d._id === selectedDevice._id ? response.data : d));
      setShowEditModal(false);
      setSelectedDevice(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await api.deleteAdminDevice(id);
        setDevices(devices.filter(device => device._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await api.updateAdminDeviceStatus(id, newStatus);
      setDevices(devices.map(device => device._id === id ? response.data : device));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="animate-spin text-5xl text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Device Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage all IoT devices</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg"
        >
          <FaPlus /> Register Device
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total Devices</p>
          <p className="text-2xl font-bold text-gray-800">{devices.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Online Devices</p>
          <p className="text-2xl font-bold text-green-600">{devices.filter(d => d.status === 'online').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Offline Devices</p>
          <p className="text-2xl font-bold text-red-600">{devices.filter(d => d.status === 'offline').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">In Maintenance</p>
          <p className="text-2xl font-bold text-orange-600">{devices.filter(d => d.status === 'maintenance').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Device ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200">
            Export Device List
          </button>
          <button onClick={fetchDevices} className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-200">
            <FaSpinner className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDevices.map((device) => {
          const statusBadge = getStatusBadge(device.status);
          return (
            <div key={device._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <FaMicrochip className="text-purple-500 text-xl" />
                    <div>
                      <h3 className="font-semibold text-gray-800">{device.deviceId}</h3>
                      <p className="text-xs text-gray-500">{device.type}</p>
                    </div>
                  </div>
                  <select
                    value={device.status}
                    onChange={(e) => handleUpdateStatus(device._id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">📍 {device.location || 'Not specified'}</p>
                  <p className="text-gray-600">🏭 {device.plantId?.name || 'N/A'}</p>
                </div>
              </div>
              {device.status === 'online' && device.lastReading?.temperature && (
                <div className="p-4 bg-gray-50">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <FaThermometerHalf className="text-orange-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Temperature</p>
                      <p className="text-lg font-bold text-gray-800">{device.lastReading.temperature}°C</p>
                    </div>
                    <div className="text-center">
                      <FaTint className="text-blue-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Humidity</p>
                      <p className="text-lg font-bold text-gray-800">{device.lastReading.humidity}%</p>
                    </div>
                    <div className="text-center">
                      <FaFlask className="text-green-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">VOC</p>
                      <p className="text-lg font-bold text-gray-800">{device.lastReading.voc?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-4 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedDevice(device);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-sm hover:bg-yellow-100 flex items-center justify-center gap-1"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDeleteDevice(device._id)}
                  className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 flex items-center justify-center gap-1"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Register New Device</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              <div className="p-6">
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device ID *</label>
                    <input
                      type="text"
                      value={newDevice.deviceId}
                      onChange={(e) => setNewDevice({...newDevice, deviceId: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., SENSOR-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device Type *</label>
                    <select
                      value={newDevice.type}
                      onChange={(e) => setNewDevice({...newDevice, type: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    >
                      {deviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      value={newDevice.model}
                      onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., SHT-30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
                    <select
                      value={newDevice.zoneId}
                      onChange={(e) => setNewDevice({...newDevice, zoneId: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Zone</option>
                      {zones.map(zone => <option key={zone._id} value={zone._id}>{zone.zoneName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plant *</label>
                    <select
                      value={newDevice.plantId}
                      onChange={(e) => setNewDevice({...newDevice, plantId: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Plant</option>
                      {plants.map(plant => <option key={plant._id} value={plant._id}>{plant.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Installation Location</label>
                    <input
                      type="text"
                      value={newDevice.location}
                      onChange={(e) => setNewDevice({...newDevice, location: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Machine #3"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleAddDevice} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Register Device
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Device Modal */}
      {showEditModal && selectedDevice && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Edit Device</h2>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device ID</label>
                    <input
                      type="text"
                      value={selectedDevice.deviceId}
                      onChange={(e) => setSelectedDevice({...selectedDevice, deviceId: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                    <select
                      value={selectedDevice.type}
                      onChange={(e) => setSelectedDevice({...selectedDevice, type: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    >
                      {deviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input
                      type="text"
                      value={selectedDevice.model || ''}
                      onChange={(e) => setSelectedDevice({...selectedDevice, model: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={selectedDevice.location || ''}
                      onChange={(e) => setSelectedDevice({...selectedDevice, location: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleUpdateDevice} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Update Device
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

export default DevicesManagement;