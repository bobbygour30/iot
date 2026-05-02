// src/pages/AddDevice.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaCog, 
  FaPlus, 
  FaTrash,
  FaSpinner,
  FaEdit,
  FaIndustry,
  FaMicrochip,
  FaThermometerHalf,
  FaTint,
  FaFlask
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AddDevice = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [devices, setDevices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [currentDevice, setCurrentDevice] = useState({
    deviceId: '',
    type: 'Multi-Sensor',
    model: '',
    location: '',
    thresholds: {
      temperature: 34,
      humidity: 70,
      voc: 35000
    }
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const deviceTypes = ['Temperature Sensor', 'Humidity Sensor', 'VOC Sensor', 'Multi-Sensor'];

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

  const fetchDevices = async (zoneId) => {
    try {
      const response = await api.getDevicesByZone(zoneId);
      setDevices(response.data || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handlePlantSelect = async (plant) => {
    setSelectedPlant(plant);
    setSelectedZone(null);
    setDevices([]);
    await fetchZones(plant._id);
  };

  const handleZoneSelect = async (zone) => {
    setSelectedZone(zone);
    await fetchDevices(zone._id);
  };

  const handleAddDevice = async () => {
    if (!currentDevice.deviceId.trim()) {
      setMessage({ type: 'error', text: 'Please enter device ID' });
      return;
    }
    
    setLoading(true);
    try {
      if (editingDevice) {
        const response = await api.updateDevice(editingDevice._id, currentDevice);
        setDevices(devices.map(d => d._id === editingDevice._id ? response.data : d));
        setMessage({ type: 'success', text: 'Device updated successfully!' });
      } else {
        const response = await api.registerDevice({
          deviceId: currentDevice.deviceId,
          type: currentDevice.type,
          model: currentDevice.model,
          location: currentDevice.location,
          thresholds: currentDevice.thresholds,
          plantId: selectedPlant._id,
          zoneId: selectedZone._id
        });
        setDevices([response.data, ...devices]);
        setMessage({ type: 'success', text: 'Device added successfully!' });
      }
      resetForm();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save device' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await api.deleteDevice(id);
        setDevices(devices.filter(d => d._id !== id));
        setMessage({ type: 'success', text: 'Device deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete device' });
      }
    }
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setCurrentDevice({
      deviceId: device.deviceId,
      type: device.type,
      model: device.model || '',
      location: device.location || '',
      thresholds: device.thresholds || { temperature: 34, humidity: 70, voc: 35000 }
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setCurrentDevice({
      deviceId: '',
      type: 'Multi-Sensor',
      model: '',
      location: '',
      thresholds: { temperature: 34, humidity: 70, voc: 35000 }
    });
    setEditingDevice(null);
    setShowForm(false);
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!selectedPlant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Device</h1>
          <p className="text-gray-500 mb-6">Select a plant to add devices</p>
          
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
                <p className="text-sm text-gray-500 mt-2">Click to select →</p>
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

  if (!selectedZone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setSelectedPlant(null)}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
          >
            ← Back to Plants
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Device</h1>
          <p className="text-gray-500 mb-6">Select a zone in <span className="font-semibold">{selectedPlant.name}</span></p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <div
                key={zone._id}
                onClick={() => handleZoneSelect(zone)}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer bg-white"
              >
                <div className="flex items-center gap-3 mb-3">
                  <FaMicrochip className="text-blue-500 text-2xl" />
                  <h3 className="font-semibold text-gray-800 text-lg">{zone.name}</h3>
                </div>
                {zone.area && <p className="text-sm text-gray-500">📍 Area: {zone.area}</p>}
                <p className="text-sm text-gray-500 mt-2">Click to add devices →</p>
              </div>
            ))}
          </div>
          
          {zones.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No zones found. Please create a zone first.</p>
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
            onClick={() => setSelectedZone(null)}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
          >
            ← Back to Zones
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Device Management</h1>
          <p className="text-gray-500 mt-2">
            Adding devices for: <span className="font-semibold">{selectedPlant.name}</span> → <span className="font-semibold">{selectedZone.name}</span>
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Add Device Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FaPlus /> Register New Device
          </button>
        )}

        {/* Device Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{editingDevice ? 'Edit Device' : 'Register New Device'}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Device ID *</label>
                  <input
                    type="text"
                    value={currentDevice.deviceId}
                    onChange={(e) => setCurrentDevice({ ...currentDevice, deviceId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., SENSOR-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Device Type *</label>
                  <select
                    value={currentDevice.type}
                    onChange={(e) => setCurrentDevice({ ...currentDevice, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                  >
                    {deviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <input
                    type="text"
                    value={currentDevice.model}
                    onChange={(e) => setCurrentDevice({ ...currentDevice, model: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., SHT-30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Installation Location</label>
                  <input
                    type="text"
                    value={currentDevice.location}
                    onChange={(e) => setCurrentDevice({ ...currentDevice, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Machine #3"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Threshold Settings</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Temperature (°C)</label>
                    <input
                      type="number"
                      value={currentDevice.thresholds.temperature}
                      onChange={(e) => setCurrentDevice({
                        ...currentDevice,
                        thresholds: { ...currentDevice.thresholds, temperature: parseFloat(e.target.value) }
                      })}
                      className="w-full px-3 py-1 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Humidity (%)</label>
                    <input
                      type="number"
                      value={currentDevice.thresholds.humidity}
                      onChange={(e) => setCurrentDevice({
                        ...currentDevice,
                        thresholds: { ...currentDevice.thresholds, humidity: parseFloat(e.target.value) }
                      })}
                      className="w-full px-3 py-1 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">VOC (ppb)</label>
                    <input
                      type="number"
                      value={currentDevice.thresholds.voc}
                      onChange={(e) => setCurrentDevice({
                        ...currentDevice,
                        thresholds: { ...currentDevice.thresholds, voc: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-1 rounded border border-gray-300"
                    />
                  </div>
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
                  onClick={handleAddDevice}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                  {editingDevice ? 'Update Device' : 'Register Device'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Devices List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Devices in {selectedZone.name}</h2>
            <p className="text-sm text-gray-500">{devices.length} devices total</p>
          </div>
          
          {devices.length === 0 ? (
            <div className="p-12 text-center">
              <FaCog className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Devices Yet</h3>
              <p className="text-gray-400">Click "Register New Device" to get started</p>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {devices.map((device) => (
                <div key={device._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FaCog className="text-green-500 text-xl" />
                        <span className="font-mono font-semibold text-gray-800">{device.deviceId}</span>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">{device.type}</span>
                        {device.model && <span className="text-xs text-gray-500">{device.model}</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <FaThermometerHalf className="text-orange-500 text-sm" />
                          <span className="text-sm text-gray-600">Temp: {device.thresholds.temperature}°C</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaTint className="text-blue-500 text-sm" />
                          <span className="text-sm text-gray-600">Humidity: {device.thresholds.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaFlask className="text-purple-500 text-sm" />
                          <span className="text-sm text-gray-600">VOC: {device.thresholds.voc} ppb</span>
                        </div>
                      </div>
                      {device.location && <p className="text-xs text-gray-500 mt-2">📍 {device.location}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditDevice(device)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <FaTrash />
                      </button>
                    </div>
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

export default AddDevice;