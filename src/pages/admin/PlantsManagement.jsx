// src/pages/admin/PlantsManagement.jsx
import React, { useState } from 'react';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaIndustry,
  FaMapMarkerAlt,
  FaMicrochip,
  FaBuilding,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

const PlantsManagement = () => {
  const [plants, setPlants] = useState([
    { id: 1, name: 'Mumbai Plant', type: 'Manufacturing', zone: 'Zone A', location: 'Mumbai, India', devices: 145, status: 'active', lastMaintenance: '2024-03-01' },
    { id: 2, name: 'Pune Plant', type: 'Processing', zone: 'Zone B', location: 'Pune, India', devices: 98, status: 'active', lastMaintenance: '2024-02-15' },
    { id: 3, name: 'Bengaluru Plant', type: 'Assembly', zone: 'Zone C', location: 'Bengaluru, India', devices: 210, status: 'active', lastMaintenance: '2024-03-10' },
    { id: 4, name: 'Chennai Plant', type: 'Warehouse', zone: 'Zone D', location: 'Chennai, India', devices: 67, status: 'inactive', lastMaintenance: '2024-01-20' },
    { id: 5, name: 'Delhi Plant', type: 'R&D', zone: 'Zone E', location: 'Delhi, India', devices: 45, status: 'active', lastMaintenance: '2024-03-05' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlant, setNewPlant] = useState({
    name: '', type: '', zone: '', location: '', status: 'active'
  });

  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];
  const plantTypes = ['Manufacturing', 'Processing', 'Assembly', 'Warehouse', 'R&D'];

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'all' || plant.zone === selectedZone;
    return matchesSearch && matchesZone;
  });

  const handleAddPlant = () => {
    const plant = {
      id: plants.length + 1,
      ...newPlant,
      devices: 0,
      lastMaintenance: new Date().toISOString().split('T')[0]
    };
    setPlants([plant, ...plants]);
    setShowAddModal(false);
    setNewPlant({ name: '', type: '', zone: '', location: '', status: 'active' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Plant Management</h1>
          <p className="text-gray-500 mt-1">Manage all industrial plants across zones</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg"
        >
          <FaPlus /> Add New Plant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Plants</p>
          <p className="text-2xl font-bold text-gray-800">{plants.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Active Plants</p>
          <p className="text-2xl font-bold text-green-600">{plants.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Devices</p>
          <p className="text-2xl font-bold text-blue-600">{plants.reduce((sum, p) => sum + p.devices, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Avg Devices/Plant</p>
          <p className="text-2xl font-bold text-purple-600">{(plants.reduce((sum, p) => sum + p.devices, 0) / plants.length).toFixed(0)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Zones</option>
            {zones.map(zone => <option key={zone} value={zone}>{zone}</option>)}
          </select>
          <button className="px-4 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200">
            Export Data
          </button>
        </div>
      </div>

      {/* Plants Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plant Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Devices</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Maintenance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPlants.map((plant) => (
                <tr key={plant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FaIndustry className="text-purple-500" />
                      <span className="font-medium text-gray-800">{plant.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{plant.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{plant.zone}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FaMapMarkerAlt className="text-xs" />
                      {plant.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-800">{plant.devices}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      plant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {plant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{plant.lastMaintenance}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                        <FaEye />
                      </button>
                      <button className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-lg">
                        <FaEdit />
                      </button>
                      <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                        <FaTrash />
                      </button>
                    </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Plant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Add New Plant</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plant Name *</label>
                    <input
                      type="text"
                      value={newPlant.name}
                      onChange={(e) => setNewPlant({...newPlant, name: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plant Type *</label>
                    <select
                      value={newPlant.type}
                      onChange={(e) => setNewPlant({...newPlant, type: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Type</option>
                      {plantTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
                    <select
                      value={newPlant.zone}
                      onChange={(e) => setNewPlant({...newPlant, zone: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Zone</option>
                      {zones.map(zone => <option key={zone} value={zone}>{zone}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={newPlant.location}
                      onChange={(e) => setNewPlant({...newPlant, location: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleAddPlant} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Add Plant
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

export default PlantsManagement;