// src/pages/CreatePlant.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaIndustry, 
  FaPlus, 
  FaCheck, 
  FaTrash,
  FaSpinner,
  FaEdit,
  FaEye
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CreatePlant = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [plants, setPlants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [currentPlant, setCurrentPlant] = useState({
    name: '',
    location: '',
    type: '',
    description: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const plantTypes = ['Manufacturing', 'Processing', 'Assembly', 'Warehouse', 'R&D'];

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    setFetching(true);
    try {
      const response = await api.getPlants();
      if (response.data && response.data.length > 0) {
        setPlants(response.data);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleAddPlant = async () => {
    if (!currentPlant.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter plant name' });
      return;
    }
    
    setLoading(true);
    try {
      if (editingPlant) {
        const response = await api.updatePlant(editingPlant._id, currentPlant);
        setPlants(plants.map(p => p._id === editingPlant._id ? response.data : p));
        setMessage({ type: 'success', text: 'Plant updated successfully!' });
      } else {
        const response = await api.createPlant(currentPlant);
        setPlants([response.data, ...plants]);
        setMessage({ type: 'success', text: 'Plant created successfully!' });
      }
      resetForm();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save plant' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlant = async (id) => {
    if (window.confirm('Are you sure you want to delete this plant? This will also delete all zones and devices under it.')) {
      try {
        await api.deletePlant(id);
        setPlants(plants.filter(p => p._id !== id));
        setMessage({ type: 'success', text: 'Plant deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete plant' });
      }
    }
  };

  const handleEditPlant = (plant) => {
    setEditingPlant(plant);
    setCurrentPlant({
      name: plant.name,
      location: plant.location || '',
      type: plant.type || '',
      description: plant.description || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setCurrentPlant({ name: '', location: '', type: '', description: '' });
    setEditingPlant(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Plant Management</h1>
          <p className="text-gray-500 mt-2">Create and manage your industrial plants</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Add Plant Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FaPlus /> Create New Plant
          </button>
        )}

        {/* Plant Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingPlant ? 'Edit Plant' : 'Create New Plant'}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plant Name *</label>
                  <input
                    type="text"
                    value={currentPlant.name}
                    onChange={(e) => setCurrentPlant({ ...currentPlant, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Mumbai Manufacturing Plant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plant Type *</label>
                  <select
                    value={currentPlant.type}
                    onChange={(e) => setCurrentPlant({ ...currentPlant, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select plant type</option>
                    {plantTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={currentPlant.location}
                    onChange={(e) => setCurrentPlant({ ...currentPlant, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={currentPlant.description}
                    onChange={(e) => setCurrentPlant({ ...currentPlant, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                    rows="1"
                    placeholder="Brief description"
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
                  onClick={handleAddPlant}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                  {editingPlant ? 'Update Plant' : 'Create Plant'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plants List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Your Plants</h2>
            <p className="text-sm text-gray-500">{plants.length} plants total</p>
          </div>
          
          {plants.length === 0 ? (
            <div className="p-12 text-center">
              <FaIndustry className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Plants Yet</h3>
              <p className="text-gray-400">Click "Create New Plant" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {plants.map((plant) => (
                <div key={plant._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FaIndustry className="text-purple-500 text-xl" />
                      <h3 className="font-semibold text-gray-800">{plant.name}</h3>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">{plant.type}</span>
                  </div>
                  {plant.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                      📍 {plant.location}
                    </p>
                  )}
                  {plant.description && (
                    <p className="text-sm text-gray-500 mb-2">{plant.description}</p>
                  )}
                  <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEditPlant(plant)}
                      className="flex-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-sm hover:bg-yellow-100 flex items-center justify-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlant(plant._id)}
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

export default CreatePlant;