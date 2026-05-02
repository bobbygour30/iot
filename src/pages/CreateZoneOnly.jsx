// src/pages/CreateZoneOnly.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaMicrochip, 
  FaPlus, 
  FaCheck, 
  FaTrash,
  FaSpinner,
  FaEdit,
  FaIndustry
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CreateZoneOnly = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [zones, setZones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [currentZone, setCurrentZone] = useState({
    name: '',
    area: '',
    purpose: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    setFetching(true);
    try {
      const response = await api.getPlants();
      setPlants(response.data || []);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setFetching(false);
    }
  };

  const fetchZones = async (plantId) => {
    try {
      const response = await api.getZonesByPlant(plantId);
      setZones(response.data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const handlePlantSelect = async (plant) => {
    setSelectedPlant(plant);
    await fetchZones(plant._id);
  };

  const handleAddZone = async () => {
    if (!currentZone.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter zone name' });
      return;
    }
    
    setLoading(true);
    try {
      if (editingZone) {
        const response = await api.updateZone(editingZone._id, currentZone);
        setZones(zones.map(z => z._id === editingZone._id ? response.data : z));
        setMessage({ type: 'success', text: 'Zone updated successfully!' });
      } else {
        const response = await api.createZone({
          ...currentZone,
          plantId: selectedPlant._id
        });
        setZones([response.data, ...zones]);
        setMessage({ type: 'success', text: 'Zone created successfully!' });
      }
      resetForm();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save zone' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteZone = async (id) => {
    if (window.confirm('Are you sure you want to delete this zone? This will also delete all devices in it.')) {
      try {
        await api.deleteZone(id);
        setZones(zones.filter(z => z._id !== id));
        setMessage({ type: 'success', text: 'Zone deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete zone' });
      }
    }
  };

  const handleEditZone = (zone) => {
    setEditingZone(zone);
    setCurrentZone({
      name: zone.name,
      area: zone.area || '',
      purpose: zone.purpose || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setCurrentZone({ name: '', area: '', purpose: '' });
    setEditingZone(null);
    setShowForm(false);
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading plants...</p>
        </div>
      </div>
    );
  }

  if (!selectedPlant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Zone</h1>
          <p className="text-gray-500 mb-6">Select a plant to create zones under it</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <div
                key={plant._id}
                onClick={() => handlePlantSelect(plant)}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer bg-white"
              >
                <div className="flex items-center gap-3 mb-3">
                  <FaIndustry className="text-purple-500 text-2xl" />
                  <h3 className="font-semibold text-gray-800 text-lg">{plant.name}</h3>
                </div>
                {plant.location && <p className="text-sm text-gray-500">📍 {plant.location}</p>}
                <p className="text-sm text-gray-500 mt-2">Click to add zones →</p>
              </div>
            ))}
          </div>
          
          {plants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No plants found. Please create a plant first.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setSelectedPlant(null)}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
          >
            ← Back to Plants
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Zone Management</h1>
          <p className="text-gray-500 mt-2">Creating zones for: <span className="font-semibold">{selectedPlant.name}</span></p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Add Zone Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FaPlus /> Create New Zone
          </button>
        )}

        {/* Zone Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingZone ? 'Edit Zone' : 'Create New Zone'}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zone Name *</label>
                  <input
                    type="text"
                    value={currentZone.name}
                    onChange={(e) => setCurrentZone({ ...currentZone, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Production Zone A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area/Section</label>
                  <input
                    type="text"
                    value={currentZone.area}
                    onChange={(e) => setCurrentZone({ ...currentZone, area: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., North Section"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                  <input
                    type="text"
                    value={currentZone.purpose}
                    onChange={(e) => setCurrentZone({ ...currentZone, purpose: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Assembly Line"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddZone}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                  {editingZone ? 'Update Zone' : 'Create Zone'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Zones List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Zones in {selectedPlant.name}</h2>
            <p className="text-sm text-gray-500">{zones.length} zones total</p>
          </div>
          
          {zones.length === 0 ? (
            <div className="p-12 text-center">
              <FaMicrochip className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Zones Yet</h3>
              <p className="text-gray-400">Click "Create New Zone" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {zones.map((zone) => (
                <div key={zone._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FaMicrochip className="text-blue-500 text-xl" />
                      <h3 className="font-semibold text-gray-800">{zone.name}</h3>
                    </div>
                  </div>
                  {zone.area && <p className="text-sm text-gray-500">📍 Area: {zone.area}</p>}
                  {zone.purpose && <p className="text-sm text-gray-500">🎯 Purpose: {zone.purpose}</p>}
                  <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEditZone(zone)}
                      className="flex-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-sm hover:bg-yellow-100 flex items-center justify-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone._id)}
                      className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 flex items-center justify-center gap-1"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateZoneOnly;