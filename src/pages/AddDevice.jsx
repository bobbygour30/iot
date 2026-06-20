import React, { useState, useEffect } from 'react';
import { 
  FaCog, 
  FaPlus, 
  FaTrash,
  FaSpinner,
  FaIndustry,
  FaMicrochip,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AddDevice = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [validating, setValidating] = useState(false);
  
  // Plants and Zones
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  
  // Devices
  const [devices, setDevices] = useState([]);
  
  // Device Input - SIMPLIFIED: only device ID
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [validatedDevice, setValidatedDevice] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [existingDeviceInfo, setExistingDeviceInfo] = useState(null);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch plants on load
  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    setFetching(true);
    try {
      const response = await api.getPlants();
      const plantsData = response.data || response;
      if (Array.isArray(plantsData)) {
        setPlants(plantsData);
      } else {
        setPlants([]);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
      setMessage({ type: 'error', text: 'Failed to fetch plants' });
    } finally {
      setFetching(false);
    }
  };

  const fetchZones = async (plantId) => {
    try {
      const response = await api.getZonesByPlant(plantId);
      const zonesData = response.data || response;
      if (Array.isArray(zonesData)) {
        setZones(zonesData);
      } else {
        setZones([]);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      setMessage({ type: 'error', text: 'Failed to fetch zones' });
    }
  };

  const fetchDevices = async (zoneId) => {
    try {
      const response = await api.getDevicesByZone(zoneId);
      const devicesData = response.data || response;
      if (Array.isArray(devicesData)) {
        setDevices(devicesData);
      } else {
        setDevices([]);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      setMessage({ type: 'error', text: 'Failed to fetch devices' });
    }
  };

  // Check if device exists in external API
  const checkDeviceInExternalAPI = async (deviceId) => {
    try {
      // Updated API endpoint
      const response = await fetch('https://new-sensor-api-9mub.vercel.app/api/device');
      if (!response.ok) throw new Error('Failed to fetch external devices');
      const result = await response.json();
      const data = result.data || [];
      
      // Find the device with matching ID
      const device = data.find(d => d.device_id === deviceId);
      return device;
    } catch (error) {
      console.error('Error checking external API:', error);
      return null;
    }
  };

  // Check if device already exists in ANY zone for this user
  const checkDeviceExistsInAnyZone = async (deviceId) => {
    try {
      const response = await api.get(`/devices/validate/${deviceId}`);
      const result = response.data || response;
      return result.data;
    } catch (error) {
      console.error('Error checking device existence:', error);
      return { exists: false, device: null, zoneName: null };
    }
  };

  // Validate Device ID against external API and check for duplicates
  const validateDeviceId = async () => {
    if (!deviceIdInput.trim()) {
      setValidationError('Please enter a Device ID');
      return false;
    }

    setValidating(true);
    setValidationError('');
    setValidationSuccess(false);
    setExistingDeviceInfo(null);
    
    try {
      // FIRST: Check if device already exists in ANY zone for this user
      const existingCheck = await checkDeviceExistsInAnyZone(deviceIdInput.trim());
      
      if (existingCheck.exists && existingCheck.device) {
        const zoneName = existingCheck.zoneName || existingCheck.device.zoneId?.name || 'another zone';
        const plantName = existingCheck.device.plantId?.name || 'another plant';
        
        setValidationError(`❌ This device is already assigned to Zone: "${zoneName}" in Plant: "${plantName}". Please remove it from that zone first or use a different device.`);
        setExistingDeviceInfo({
          zoneName: zoneName,
          plantName: plantName,
          deviceId: deviceIdInput.trim()
        });
        setValidating(false);
        return false;
      }
      
      // SECOND: Check against external API
      const externalDevice = await checkDeviceInExternalAPI(deviceIdInput.trim());
      
      if (!externalDevice) {
        setValidationError('❌ Device ID not found in external sensor API. Please check the ID and try again.');
        setValidating(false);
        return false;
      }

      // Device is valid - store all device info
      setValidatedDevice({
        deviceId: externalDevice.device_id,
        lastReading: {
          temperature: externalDevice.temperature,
          humidity: externalDevice.relative_humidity,
          voc: externalDevice.tvoc,
          timestamp: externalDevice.created_at
        }
      });
      setValidationSuccess(true);
      setValidating(false);
      return true;
    } catch (error) {
      setValidationError('Failed to validate device');
      setValidating(false);
      return false;
    }
  };

  const handleAddDevice = async () => {
    if (!validatedDevice) {
      setMessage({ type: 'error', text: 'Please validate device ID first' });
      return;
    }
    
    setLoading(true);
    try {
      const deviceData = {
        deviceId: validatedDevice.deviceId,
        type: 'Multi-Sensor',
        plantId: selectedPlant._id,
        zoneId: selectedZone._id
      };
      
      const response = await api.registerDevice(deviceData);
      const newDevice = response.data || response;
      setDevices([newDevice, ...devices]);
      setMessage({ type: 'success', text: 'Device added successfully!' });
      
      // Reset form
      setValidatedDevice(null);
      setDeviceIdInput('');
      setValidationSuccess(false);
      setValidationError('');
      setExistingDeviceInfo(null);
      setShowForm(false);
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Add device error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add device';
      
      // Check if it's a duplicate device error
      if (errorMessage.includes('already assigned') || errorMessage.includes('already exists')) {
        setMessage({ 
          type: 'error', 
          text: errorMessage 
        });
        // Reset validation to force re-validation
        setValidationSuccess(false);
        setValidatedDevice(null);
      } else {
        setMessage({ type: 'error', text: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (window.confirm('Are you sure you want to delete this device? This will allow it to be added to another zone.')) {
      try {
        await api.deleteDevice(id);
        setDevices(devices.filter(d => d._id !== id));
        setMessage({ type: 'success', text: 'Device deleted successfully! You can now add it to another zone.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete device' });
      }
    }
  };

  const resetForm = () => {
    setValidatedDevice(null);
    setDeviceIdInput('');
    setValidationSuccess(false);
    setValidationError('');
    setExistingDeviceInfo(null);
    setShowForm(false);
  };

  const handlePlantSelect = async (plant) => {
    setSelectedPlant(plant);
    setSelectedZone(null);
    setDevices([]);
    setValidatedDevice(null);
    setDeviceIdInput('');
    setValidationSuccess(false);
    setValidationError('');
    setExistingDeviceInfo(null);
    await fetchZones(plant._id);
  };

  const handleZoneSelect = async (zone) => {
    setSelectedZone(zone);
    await fetchDevices(zone._id);
    setValidatedDevice(null);
    setDeviceIdInput('');
    setValidationSuccess(false);
    setValidationError('');
    setExistingDeviceInfo(null);
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
                {(plant.city || plant.state) && (
                  <p className="text-sm text-gray-500">📍 {plant.city}{plant.city && plant.state ? ', ' : ''}{plant.state}</p>
                )}
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
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ Note: Each device can only be assigned to ONE zone. If a device is already assigned elsewhere, you'll need to delete it first.
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
            <FaPlus /> Add New Device
          </button>
        )}

        {/* Device Form - SIMPLIFIED */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Add New Device</h2>
              <p className="text-green-100 text-sm mt-1">Enter the Device ID from your sensor hardware</p>
            </div>
            <div className="p-6">
              {/* Device ID Input with Validation */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Device ID *</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={deviceIdInput}
                    onChange={(e) => {
                      setDeviceIdInput(e.target.value);
                      setValidationSuccess(false);
                      setValidationError('');
                      setValidatedDevice(null);
                      setExistingDeviceInfo(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 font-mono"
                    placeholder="Enter Device ID (e.g., FACTORY-FLOOR-1-DEV-01)"
                  />
                  <button
                    onClick={validateDeviceId}
                    disabled={validating || !deviceIdInput.trim()}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {validating ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                    Validate
                  </button>
                </div>
                
                {/* Validation Result - Success */}
                {validationSuccess && validatedDevice && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <FaCheckCircle />
                      <span className="font-medium">✓ Device Found! Ready to add to {selectedZone.name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Temperature:</span>
                        <span className="ml-1 font-semibold">{validatedDevice.lastReading.temperature}°C</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Humidity:</span>
                        <span className="ml-1 font-semibold">{validatedDevice.lastReading.humidity}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">VOC:</span>
                        <span className="ml-1 font-semibold">{validatedDevice.lastReading.voc} ppb</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Validation Result - Error (Device already assigned) */}
                {validationError && existingDeviceInfo && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                      <FaExclamationTriangle />
                      <span className="font-medium">⚠️ Device Already Assigned!</span>
                    </div>
                    <p className="text-sm text-red-600 mb-2">
                      This device is already assigned to:
                    </p>
                    <div className="bg-red-100 rounded-lg p-2 mb-2">
                      <p className="text-sm font-mono text-red-800">
                        📍 Zone: {existingDeviceInfo.zoneName}
                      </p>
                      <p className="text-sm font-mono text-red-800">
                        🏭 Plant: {existingDeviceInfo.plantName}
                      </p>
                    </div>
                    <p className="text-xs text-red-600">
                      Each device can only be assigned to ONE zone. Please delete the device from its current zone first, or use a different device ID.
                    </p>
                  </div>
                )}
                
                {/* Validation Result - Error (Not found in API) */}
                {validationError && !existingDeviceInfo && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <FaTimesCircle />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              {/* Only show add button after validation success */}
              {validationSuccess && (
                <div className="flex justify-end gap-3">
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
                    Add Device to {selectedZone.name}
                  </button>
                </div>
              )}
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
              <p className="text-gray-400">Click "Add New Device" to get started</p>
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
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Multi-Sensor</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Added on: {new Date(device.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteDevice(device._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete device (allows re-assigning to another zone)"
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