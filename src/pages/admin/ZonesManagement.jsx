// src/pages/admin/ZonesManagement.jsx
import React, { useState } from 'react';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaBuilding,
  FaMapMarkerAlt,
  FaChartLine,
  FaMicrochip,
  FaUsers,
  FaTimes,
  FaCheck,
  FaGlobe
} from 'react-icons/fa';

const ZonesManagement = () => {
  const [zones, setZones] = useState([
    { id: 1, name: 'Zone A', company: 'Tech Corp', location: 'Mumbai, India', plants: 42, devices: 580, users: 234, status: 'active', createdAt: '2024-01-01' },
    { id: 2, name: 'Zone B', company: 'Industries Ltd', location: 'Pune, India', plants: 31, devices: 420, users: 156, status: 'active', createdAt: '2024-01-15' },
    { id: 3, name: 'Zone C', company: 'Manufacturing Co', location: 'Bengaluru, India', plants: 48, devices: 680, users: 312, status: 'active', createdAt: '2024-02-01' },
    { id: 4, name: 'Zone D', company: 'Tech Solutions', location: 'Chennai, India', plants: 25, devices: 350, users: 98, status: 'inactive', createdAt: '2024-02-15' },
    { id: 5, name: 'Zone E', company: 'Green Energy', location: 'Delhi, India', plants: 10, devices: 311, users: 67, status: 'active', createdAt: '2024-03-01' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '', company: '', location: '', status: 'active'
  });

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddZone = () => {
    const zone = {
      id: zones.length + 1,
      ...newZone,
      plants: 0,
      devices: 0,
      users: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setZones([zone, ...zones]);
    setShowAddModal(false);
    setNewZone({ name: '', company: '', location: '', status: 'active' });
  };

  const handleDeleteZone = (id) => {
    if (window.confirm('Are you sure? This will delete all plants and devices in this zone!')) {
      setZones(zones.filter(zone => zone.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Zone Management</h1>
          <p className="text-gray-500 mt-1">Manage all zones and their configurations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg"
        >
          <FaPlus /> Create New Zone
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Total Zones</p>
          <p className="text-2xl font-bold">{zones.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Active Zones</p>
          <p className="text-2xl font-bold">{zones.filter(z => z.status === 'active').length}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Total Plants</p>
          <p className="text-2xl font-bold">{zones.reduce((sum, z) => sum + z.plants, 0)}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Total Devices</p>
          <p className="text-2xl font-bold">{zones.reduce((sum, z) => sum + z.devices, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search zones by name, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredZones.map((zone) => (
          <div key={zone.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className={`p-4 ${zone.status === 'active' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{zone.name}</h3>
                  <p className="text-sm opacity-90">{zone.company}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-white/20`}>
                  {zone.status}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaMapMarkerAlt className="text-sm" />
                  <span className="text-sm">{zone.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaBuilding className="text-sm" />
                  <span className="text-sm">{zone.plants} Plants</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaMicrochip className="text-sm" />
                  <span className="text-sm">{zone.devices.toLocaleString()} Devices</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaUsers className="text-sm" />
                  <span className="text-sm">{zone.users} Users</span>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-all flex items-center justify-center gap-1">
                  <FaEye /> View
                </button>
                <button className="flex-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-sm hover:bg-yellow-100 transition-all flex items-center justify-center gap-1">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDeleteZone(zone.id)} className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-1">
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Create New Zone</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name *</label>
                    <input
                      type="text"
                      value={newZone.name}
                      onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter zone name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={newZone.company}
                      onChange={(e) => setNewZone({...newZone, company: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={newZone.location}
                      onChange={(e) => setNewZone({...newZone, location: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newZone.status}
                      onChange={(e) => setNewZone({...newZone, status: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleAddZone} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Create Zone
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

export default ZonesManagement;