// src/pages/admin/PlantsManagement.jsx
import React, { useState, useEffect } from 'react';
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
  FaExclamationCircle,
  FaSpinner
} from 'react-icons/fa';
import api from '../../services/api';

const PlantsManagement = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [error, setError] = useState('');
  const [newPlant, setNewPlant] = useState({
    name: '', type: '', location: '', description: '', status: 'active'
  });

  const plantTypes = ['Manufacturing', 'Processing', 'Assembly', 'Warehouse', 'R&D'];

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    setLoading(true);
    try {
      const response = await api.getAdminPlants();
      setPlants(response.data);
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plant.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' ? plant.isActive : !plant.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleAddPlant = async () => {
    try {
      const response = await api.createAdminPlant(newPlant);
      setPlants([response.data, ...plants]);
      setShowAddModal(false);
      setNewPlant({ name: '', type: '', location: '', description: '', status: 'active' });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdatePlant = async () => {
    try {
      const response = await api.updateAdminPlant(selectedPlant._id, selectedPlant);
      setPlants(plants.map(p => p._id === selectedPlant._id ? response.data : p));
      setShowEditModal(false);
      setSelectedPlant(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePlant = async (id) => {
    if (window.confirm('Are you sure? This will delete all devices in this plant!')) {
      try {
        await api.deleteAdminPlant(id);
        setPlants(plants.filter(plant => plant._id !== id));
      } catch (err) {
        setError(err.message);
      }
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
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total Plants</p>
          <p className="text-2xl font-bold text-gray-800">{plants.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Active Plants</p>
          <p className="text-2xl font-bold text-green-600">{plants.filter(p => p.isActive).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total Devices</p>
          <p className="text-2xl font-bold text-blue-600">{plants.reduce((sum, p) => sum + (p.devices || 0), 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Avg Devices/Plant</p>
          <p className="text-2xl font-bold text-purple-600">
            {plants.length ? (plants.reduce((sum, p) => sum + (p.devices || 0), 0) / plants.length).toFixed(0) : 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button onClick={fetchPlants} className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-200">
            <FaSpinner className={loading ? "animate-spin" : ""} /> Refresh
          </button>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Devices</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPlants.map((plant) => (
                <tr key={plant._id} className="hover:bg-gray-50 transition-colors">
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
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FaMapMarkerAlt className="text-xs" />
                      {plant.location || 'N/A'}
                    </div>
                   </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-800">{plant.devices || 0}</span>
                   </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      plant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {plant.isActive ? 'Active' : 'Inactive'}
                    </span>
                   </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(plant.createdAt).toLocaleDateString()}
                   </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPlant(plant);
                          setShowEditModal(true);
                        }}
                        className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-lg"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeletePlant(plant._id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
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
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={newPlant.location}
                      onChange={(e) => setNewPlant({...newPlant, location: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newPlant.description}
                      onChange={(e) => setNewPlant({...newPlant, description: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      rows="2"
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

      {/* Edit Plant Modal */}
      {showEditModal && selectedPlant && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Edit Plant</h2>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plant Name</label>
                    <input
                      type="text"
                      value={selectedPlant.name}
                      onChange={(e) => setSelectedPlant({...selectedPlant, name: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plant Type</label>
                    <select
                      value={selectedPlant.type}
                      onChange={(e) => setSelectedPlant({...selectedPlant, type: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    >
                      {plantTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={selectedPlant.location || ''}
                      onChange={(e) => setSelectedPlant({...selectedPlant, location: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedPlant.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setSelectedPlant({...selectedPlant, isActive: e.target.value === 'active'})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleUpdatePlant} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Update Plant
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