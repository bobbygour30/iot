// src/pages/admin/ZonesManagement.jsx
import React, { useState, useEffect } from 'react';
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
  FaGlobe,
  FaSpinner
} from 'react-icons/fa';
import api from '../../services/api';

const ZonesManagement = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [error, setError] = useState('');
  const [newZone, setNewZone] = useState({
    zoneName: '', companyName: '', address: '', state: '', city: '', pinCode: '', status: 'active'
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const response = await api.getAdminZones();
      setZones(response.data);
    } catch (err) {
      console.error('Error fetching zones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredZones = zones.filter(zone =>
    zone.zoneName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddZone = async () => {
    try {
      const response = await api.createAdminZone(newZone);
      setZones([response.data, ...zones]);
      setShowAddModal(false);
      setNewZone({ zoneName: '', companyName: '', address: '', state: '', city: '', pinCode: '', status: 'active' });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateZone = async () => {
    try {
      const response = await api.updateAdminZone(selectedZone._id, selectedZone);
      setZones(zones.map(z => z._id === selectedZone._id ? response.data : z));
      setShowEditModal(false);
      setSelectedZone(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteZone = async (id) => {
    if (window.confirm('Are you sure? This will delete all plants and devices in this zone!')) {
      try {
        await api.deleteAdminZone(id);
        setZones(zones.filter(zone => zone._id !== id));
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
          <p className="text-2xl font-bold">{zones.filter(z => z.isActive).length}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Total Plants</p>
          <p className="text-2xl font-bold">{zones.reduce((sum, z) => sum + (z.plants || 0), 0)}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-sm opacity-90">Total Devices</p>
          <p className="text-2xl font-bold">{zones.reduce((sum, z) => sum + (z.devices || 0), 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <button onClick={fetchZones} className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-200">
            <FaSpinner className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button className="px-4 py-2 bg-gray-100 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200">
            Export Zones Data
          </button>
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredZones.map((zone) => (
          <div key={zone._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className={`p-4 ${zone.isActive ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'} text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{zone.zoneName}</h3>
                  <p className="text-sm opacity-90">{zone.companyName}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-white/20`}>
                  {zone.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaMapMarkerAlt className="text-sm" />
                  <span className="text-sm">{zone.city}, {zone.state}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaBuilding className="text-sm" />
                  <span className="text-sm">{zone.plants || 0} Plants</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaMicrochip className="text-sm" />
                  <span className="text-sm">{zone.devices?.toLocaleString() || 0} Devices</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaUsers className="text-sm" />
                  <span className="text-sm">{zone.users || 0} Users</span>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedZone(zone);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-sm hover:bg-yellow-100 transition-all flex items-center justify-center gap-1"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDeleteZone(zone._id)}
                  className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-1"
                >
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
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name *</label>
                    <input
                      type="text"
                      value={newZone.zoneName}
                      onChange={(e) => setNewZone({...newZone, zoneName: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter zone name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={newZone.companyName}
                      onChange={(e) => setNewZone({...newZone, companyName: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={newZone.address}
                      onChange={(e) => setNewZone({...newZone, address: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      rows="2"
                      placeholder="Enter complete address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={newZone.state}
                        onChange={(e) => setNewZone({...newZone, state: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={newZone.city}
                        onChange={(e) => setNewZone({...newZone, city: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={newZone.pinCode}
                      onChange={(e) => setNewZone({...newZone, pinCode: e.target.value})}
                      maxLength={6}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
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

      {/* Edit Zone Modal */}
      {showEditModal && selectedZone && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Edit Zone</h2>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                    <input
                      type="text"
                      value={selectedZone.zoneName}
                      onChange={(e) => setSelectedZone({...selectedZone, zoneName: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={selectedZone.companyName}
                      onChange={(e) => setSelectedZone({...selectedZone, companyName: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedZone.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setSelectedZone({...selectedZone, isActive: e.target.value === 'active'})}
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
                  <button onClick={handleUpdateZone} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Update Zone
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