// src/pages/CreateZone.jsx
import React, { useState } from 'react';
import { 
  FaIndustry, 
  FaMicrochip, 
  FaPlus, 
  FaCheck, 
  FaArrowLeft, 
  FaArrowRight,
  FaTrash,
  FaSave,
  FaEdit,
  FaChartLine,
  FaThermometerHalf,
  FaTint,
  FaFlask,
  FaCog
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CreateZone = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Plant Data
  const [plants, setPlants] = useState([]);
  const [currentPlant, setCurrentPlant] = useState({
    name: '',
    location: '',
    type: '',
    description: ''
  });
  const [showPlantForm, setShowPlantForm] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState(null);
  
  // Zone Data
  const [zones, setZones] = useState([]);
  const [currentZone, setCurrentZone] = useState({
    name: '',
    area: '',
    purpose: '',
    equipment: []
  });
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  
  // Device Data
  const [devices, setDevices] = useState([]);
  const [currentDevice, setCurrentDevice] = useState({
    deviceId: '',
    type: 'sensor',
    model: '',
    location: '',
    thresholds: {
      temperature: 34,
      humidity: 70,
      voc: 35000
    }
  });
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  
  // Success/Error Messages
  const [message, setMessage] = useState({ type: '', text: '' });

  const plantTypes = ['Manufacturing', 'Processing', 'Assembly', 'Warehouse', 'R&D'];
  const deviceTypes = ['Temperature Sensor', 'Humidity Sensor', 'VOC Sensor', 'Multi-Sensor'];

  const handleAddPlant = () => {
    if (!currentPlant.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter plant name' });
      return;
    }
    
    const newPlant = {
      id: Date.now(),
      ...currentPlant,
      createdAt: new Date().toISOString()
    };
    
    setPlants([...plants, newPlant]);
    setCurrentPlant({ name: '', location: '', type: '', description: '' });
    setMessage({ type: 'success', text: 'Plant created successfully!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSelectPlant = (plant) => {
    setSelectedPlant(plant);
    setShowPlantForm(false);
    setShowZoneForm(true);
    setCurrentStep(2);
  };

  const handleAddZone = () => {
    if (!currentZone.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter zone name' });
      return;
    }
    
    const newZone = {
      id: Date.now(),
      ...currentZone,
      plantId: selectedPlant.id,
      createdAt: new Date().toISOString()
    };
    
    setZones([...zones, newZone]);
    setCurrentZone({ name: '', area: '', purpose: '', equipment: [] });
    setMessage({ type: 'success', text: 'Zone created successfully!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
    setShowZoneForm(false);
    setShowDeviceForm(true);
    setCurrentStep(3);
  };

  const handleAddDevice = async () => {
    if (!currentDevice.deviceId.trim()) {
      setMessage({ type: 'error', text: 'Please enter device ID' });
      return;
    }
    
    const newDevice = {
      id: currentDevice.deviceId,
      type: currentDevice.type,
      model: currentDevice.model,
      location: currentDevice.location,
      thresholds: currentDevice.thresholds,
      plantId: selectedPlant.id,
      zoneId: selectedZone.id,
      plantName: selectedPlant.name,
      zoneName: selectedZone.name,
      createdAt: new Date().toISOString()
    };
    
    setDevices([...devices, newDevice]);
    
    // Here you would make API call to register device
    try {
      setLoading(true);
      // const response = await api.registerDevice({
      //   deviceId: currentDevice.deviceId,
      //   zoneId: selectedZone.id,
      //   plantId: selectedPlant.id,
      //   thresholds: currentDevice.thresholds
      // });
      
      setMessage({ type: 'success', text: 'Device added successfully!' });
      setCurrentDevice({
        deviceId: '',
        type: 'sensor',
        model: '',
        location: '',
        thresholds: { temperature: 34, humidity: 70, voc: 35000 }
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add device' });
    } finally {
      setLoading(false);
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleRemoveDevice = (deviceId) => {
    setDevices(devices.filter(d => d.id !== deviceId));
  };

  const handleReset = () => {
    setCurrentStep(1);
    setPlants([]);
    setZones([]);
    setDevices([]);
    setSelectedPlant(null);
    setSelectedZone(null);
    setShowPlantForm(true);
    setShowZoneForm(false);
    setShowDeviceForm(false);
    setCurrentPlant({ name: '', location: '', type: '', description: '' });
    setCurrentZone({ name: '', area: '', purpose: '', equipment: [] });
    setCurrentDevice({ deviceId: '', type: 'sensor', model: '', location: '', thresholds: { temperature: 34, humidity: 70, voc: 35000 } });
  };

  const getStepClass = (step) => {
    if (currentStep === step) return 'bg-purple-500 text-white';
    if (currentStep > step) return 'bg-green-500 text-white';
    return 'bg-gray-300 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Zone Structure</h1>
          <p className="text-gray-500">Set up your plant, zones, and devices in three simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all
                  ${getStepClass(step)}
                `}>
                  {currentStep > step ? <FaCheck /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 mx-2 ${currentStep > step ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <div className="w-32 text-center text-sm font-medium text-gray-600">Create Plant</div>
            <div className="w-32 text-center text-sm font-medium text-gray-600">Create Zone</div>
            <div className="w-32 text-center text-sm font-medium text-gray-600">Add Devices</div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Step 1: Create Plant */}
        {showPlantForm && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <FaIndustry className="text-white text-2xl" />
                <h2 className="text-xl font-bold text-white">Step 1: Create Plant</h2>
              </div>
              <p className="text-purple-100 text-sm mt-1">Add your industrial facility information</p>
            </div>
            
            <div className="p-6">
              {/* Plant Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plant Name *</label>
                  <input
                    type="text"
                    value={currentPlant.name}
                    onChange={(e) => setCurrentPlant({ ...currentPlant, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              
              <div className="flex justify-end">
                <button
                  onClick={handleAddPlant}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <FaPlus /> Create Plant
                </button>
              </div>

              {/* Existing Plants */}
              {plants.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Plants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plants.map((plant) => (
                      <div
                        key={plant.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-gray-50 to-white"
                        onClick={() => handleSelectPlant(plant)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FaIndustry className="text-purple-500" />
                              <h4 className="font-semibold text-gray-800">{plant.name}</h4>
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">{plant.type}</span>
                            </div>
                            {plant.location && <p className="text-sm text-gray-500">📍 {plant.location}</p>}
                            {plant.description && <p className="text-sm text-gray-500 text-xs mt-1">{plant.description}</p>}
                          </div>
                          <button className="text-green-500 hover:text-green-600">
                            <FaArrowRight />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Create Zone */}
        {showZoneForm && selectedPlant && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowZoneForm(false);
                      setShowPlantForm(true);
                      setCurrentStep(1);
                    }}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                  >
                    <FaArrowLeft />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <FaIndustry className="text-white text-xl" />
                      <span className="text-white/80 text-sm">{selectedPlant.name}</span>
                      <FaArrowRight className="text-white/60 text-xs" />
                      <FaMicrochip className="text-white text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">Step 2: Create Zone</h2>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
              
              <div className="flex justify-end">
                <button
                  onClick={handleAddZone}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <FaPlus /> Create Zone
                </button>
              </div>

              {/* Existing Zones */}
              {zones.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Zones in {selectedPlant.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {zones.map((zone) => (
                      <div
                        key={zone.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-gray-50 to-white"
                        onClick={() => handleSelectZone(zone)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FaMicrochip className="text-blue-500" />
                              <h4 className="font-semibold text-gray-800">{zone.name}</h4>
                            </div>
                            {zone.area && <p className="text-sm text-gray-500">📍 {zone.area}</p>}
                            {zone.purpose && <p className="text-sm text-gray-500 text-xs mt-1">🎯 {zone.purpose}</p>}
                          </div>
                          <button className="text-green-500 hover:text-green-600">
                            <FaArrowRight />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Add Devices */}
        {showDeviceForm && selectedZone && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowDeviceForm(false);
                      setShowZoneForm(true);
                      setCurrentStep(2);
                    }}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                  >
                    <FaArrowLeft />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <FaIndustry className="text-white/80 text-sm" />
                      <span className="text-white/60 text-xs">{selectedPlant.name}</span>
                      <FaArrowRight className="text-white/40 text-xs" />
                      <FaMicrochip className="text-white/80 text-sm" />
                      <span className="text-white/60 text-xs">{selectedZone.name}</span>
                      <FaArrowRight className="text-white/40 text-xs" />
                      <FaCog className="text-white text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">Step 3: Add Devices</h2>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Device Form */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaPlus className="text-green-500" />
                  Add New Device
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Device ID *</label>
                    <input
                      type="text"
                      value={currentDevice.deviceId}
                      onChange={(e) => setCurrentDevice({ ...currentDevice, deviceId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 font-mono"
                      placeholder="e.g., SENSOR-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
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
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleAddDevice}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <FaPlus /> Add Device
                  </button>
                </div>
              </div>

              {/* Existing Devices */}
              {devices.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Devices in {selectedZone.name} ({devices.length})
                  </h3>
                  <div className="space-y-3">
                    {devices.map((device) => (
                      <div key={device.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <FaCog className="text-green-500" />
                              <span className="font-mono font-semibold text-gray-800">{device.id}</span>
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
                          <button
                            onClick={() => handleRemoveDevice(device.id)}
                            className="text-red-500 hover:text-red-600 p-2"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Complete Button */}
              {devices.length > 0 && (
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={() => {
                      setMessage({ type: 'success', text: 'Zone structure created successfully!' });
                      setTimeout(() => {
                        // Navigate to dashboard or reset
                        window.location.href = '/dashboard';
                      }, 2000);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <FaCheck /> Complete Setup
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateZone;