// src/pages/admin/DevicesManagement.jsx
import React, { useState } from 'react';
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
  FaChartLine
} from 'react-icons/fa';

const DevicesManagement = () => {
  const [devices, setDevices] = useState([
    { id: 1, deviceId: 'SENSOR-001', type: 'Multi-Sensor', plant: 'Mumbai Plant', zone: 'Zone A', location: 'Machine #3', status: 'online', temperature: 34.2, humidity: 65, voc: 32000, lastReading: '2024-03-15 10:30:00' },
    { id: 2, deviceId: 'SENSOR-002', type: 'Temperature Sensor', plant: 'Pune Plant', zone: 'Zone B', location: 'Assembly Line', status: 'online', temperature: 28.5, humidity: 55, voc: 28000, lastReading: '2024-03-15 10:28:00' },
    { id: 3, deviceId: 'SENSOR-003', type: 'Humidity Sensor', plant: 'Bengaluru Plant', zone: 'Zone C', location: 'Storage', status: 'offline', temperature: 0, humidity: 0, voc: 0, lastReading: '2024-03-14 15:20:00' },
    { id: 4, deviceId: 'SENSOR-004', type: 'VOC Sensor', plant: 'Chennai Plant', zone: 'Zone D', location: 'Processing Unit', status: 'maintenance', temperature: 0, humidity: 0, voc: 0, lastReading: '2024-03-13 12:00:00' },
    { id: 5, deviceId: 'SENSOR-005', type: 'Multi-Sensor', plant: 'Delhi Plant', zone: 'Zone E', location: 'R&D Lab', status: 'online', temperature: 23.5, humidity: 45, voc: 15000, lastReading: '2024-03-15 10:32:00' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    deviceId: '', type: 'Multi-Sensor', plant: '', zone: '', location: ''
  });

  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];
  const plants = ['Mumbai Plant', 'Pune Plant', 'Bengaluru Plant', 'Chennai Plant', 'Delhi Plant'];
  const deviceTypes = ['Multi-Sensor', 'Temperature Sensor', 'Humidity Sensor', 'VOC Sensor'];

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.plant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || device.status === selectedStatus;
    const matchesZone = selectedZone === 'all' || device.zone === selectedZone;
    return matchesSearch && matchesStatus && matchesZone;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'online': return { color: 'bg-green-100 text-green-700', icon: <FaCheckCircle /> };
      case 'offline': return { color: 'bg-red-100 text-red-700', icon: <FaPowerOff /> };
      case 'maintenance': return { color: 'bg-orange-100 text-orange-700', icon: <FaExclamationTriangle /> };
      default: return { color: 'bg-gray-100 text-gray-700', icon: null };
    }
  };

  const handleAddDevice = () => {
    const device = {
      id: devices.length + 1,
      ...newDevice,
      status: 'offline',
      temperature: 0,
      humidity: 0,
      voc: 0,
      lastReading: new Date().toLocaleString()
    };
    setDevices([device, ...devices]);
    setShowAddModal(false);
    setNewDevice({ deviceId: '', type: 'Multi-Sensor', plant: '', zone: '', location: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Devices</p>
          <p className="text-2xl font-bold text-gray-800">{devices.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Online Devices</p>
          <p className="text-2xl font-bold text-green-600">{devices.filter(d => d.status === 'online').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Offline Devices</p>
          <p className="text-2xl font-bold text-red-600">{devices.filter(d => d.status === 'offline').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">In Maintenance</p>
          <p className="text-2xl font-bold text-orange-600">{devices.filter(d => d.status === 'maintenance').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Device ID or Plant..."
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
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Zones</option>
            {zones.map(zone => <option key={zone} value={zone}>{zone}</option>)}
          </select>
          <button className="px-4 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200">
            Export Device List
          </button>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDevices.map((device) => {
          const statusBadge = getStatusBadge(device.status);
          return (
            <div key={device.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <FaMicrochip className="text-purple-500 text-xl" />
                    <div>
                      <h3 className="font-semibold text-gray-800">{device.deviceId}</h3>
                      <p className="text-xs text-gray-500">{device.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
                    {statusBadge.icon}
                    {device.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">📍 {device.location}</p>
                  <p className="text-gray-600">🏭 {device.plant}</p>
                  <p className="text-gray-600">📡 {device.zone}</p>
                </div>
              </div>
              {device.status === 'online' && (
                <div className="p-4 bg-gray-50">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <FaThermometerHalf className="text-orange-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Temperature</p>
                      <p className="text-lg font-bold text-gray-800">{device.temperature}°C</p>
                    </div>
                    <div className="text-center">
                      <FaTint className="text-blue-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Humidity</p>
                      <p className="text-lg font-bold text-gray-800">{device.humidity}%</p>
                    </div>
                    <div className="text-center">
                      <FaFlask className="text-green-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">VOC</p>
                      <p className="text-lg font-bold text-gray-800">{device.voc.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-4 flex gap-2">
                <button className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 flex items-center justify-center gap-1">
                  <FaEye /> View
                </button>
                <button className="flex-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-sm hover:bg-yellow-100 flex items-center justify-center gap-1">
                  <FaEdit /> Edit
                </button>
                <button className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 flex items-center justify-center gap-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
                    <select
                      value={newDevice.zone}
                      onChange={(e) => setNewDevice({...newDevice, zone: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Zone</option>
                      {zones.map(zone => <option key={zone} value={zone}>{zone}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plant *</label>
                    <select
                      value={newDevice.plant}
                      onChange={(e) => setNewDevice({...newDevice, plant: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Plant</option>
                      {plants.map(plant => <option key={plant} value={plant}>{plant}</option>)}
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
    </div>
  );
};

export default DevicesManagement;