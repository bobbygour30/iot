// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaFileDownload, 
  FaExpand, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaThermometerHalf,
  FaLeaf,
  FaVolumeUp,
  FaEye,
  FaHeartbeat,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCity,
  FaIndustry,
  FaChartBar,
  FaSpinner,
  FaTachometerAlt,
  FaMicrochip,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaCompress,
  FaFilter,
  FaTint,
  FaFlask,
  FaWind,
  FaMoon,
  FaFire,
  FaSmog
} from 'react-icons/fa';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as XLSX from 'xlsx';
import api from '../services/api';

const Dashboard = () => {
  // Filter states
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Dynamic filter data
  const [plantsList, setPlantsList] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [devicesList, setDevicesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesByStateMap, setCitiesByStateMap] = useState({});
  
  // Device readings data
  const [deviceReadings, setDeviceReadings] = useState({});
  
  // Multi-select parameters
  const parameters = [
    { id: 'temperature', name: 'Temperature', icon: <FaThermometerHalf />, color: 'orange', dataKey: 'temperature', unit: '°C', comingSoon: false },
    { id: 'humidity', name: 'Relative Humidity', icon: <FaTint />, color: 'blue', dataKey: 'humidity', unit: '%', comingSoon: false },
    { id: 'voc', name: 'TVOC', icon: <FaFlask />, color: 'green', dataKey: 'voc', unit: 'ppb', comingSoon: false },
    { id: 'airVelocity', name: 'Air Velocity', icon: <FaWind />, color: 'cyan', dataKey: 'airVelocity', unit: 'm/s', comingSoon: true },
    { id: 'pm', name: 'PM - 2.5/10', icon: <FaSmog />, color: 'red', dataKey: 'pm', unit: 'µg/m³', comingSoon: true },
    { id: 'co2', name: 'CO2', icon: <FaFire />, color: 'purple', dataKey: 'co2', unit: 'ppm', comingSoon: true },
    { id: 'lux', name: 'LUX', icon: <FaMoon />, color: 'yellow', dataKey: 'lux', unit: 'lx', comingSoon: true },
    { id: 'noise', name: 'Noise (AV/PEAK)', icon: <FaVolumeUp />, color: 'pink', dataKey: 'noise', unit: 'dB', comingSoon: true }
  ];

  const [selectedParameters, setSelectedParameters] = useState(['temperature', 'humidity', 'voc']);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch all dynamic data
  const fetchDynamicData = async () => {
    try {
      // Fetch plants
      const plantsResponse = await api.getPlants();
      let plantsData = [];
      if (plantsResponse.data && Array.isArray(plantsResponse.data)) {
        plantsData = plantsResponse.data;
      } else if (Array.isArray(plantsResponse)) {
        plantsData = plantsResponse;
      }
      
      setPlantsList(plantsData);
      
      // Extract unique states and cities from plants
      const states = new Set();
      const citiesByState = {};
      
      plantsData.forEach(plant => {
        if (plant.state && plant.state.trim()) {
          states.add(plant.state);
          if (!citiesByState[plant.state]) {
            citiesByState[plant.state] = new Set();
          }
          if (plant.city && plant.city.trim()) {
            citiesByState[plant.state].add(plant.city);
          }
        }
      });
      
      setStatesList(Array.from(states));
      
      const citiesMap = {};
      Object.keys(citiesByState).forEach(state => {
        citiesMap[state] = Array.from(citiesByState[state]);
      });
      setCitiesByStateMap(citiesMap);
      
      // Fetch all zones for the user
      const allZones = [];
      for (const plant of plantsData) {
        try {
          const zonesResponse = await api.getZonesByPlant(plant._id);
          let zonesData = [];
          if (zonesResponse.data && Array.isArray(zonesResponse.data)) {
            zonesData = zonesResponse.data;
          } else if (Array.isArray(zonesResponse)) {
            zonesData = zonesResponse;
          }
          const zonesWithPlant = zonesData.map(zone => ({
            ...zone,
            plantId: plant._id,
            plantName: plant.name
          }));
          allZones.push(...zonesWithPlant);
        } catch (err) {
          console.error(`Error fetching zones for plant ${plant.name}:`, err);
        }
      }
      setZonesList(allZones);
      
      // Fetch all devices for the user (through zones)
      const allDevices = [];
      for (const zone of allZones) {
        try {
          const devicesResponse = await api.getDevicesByZone(zone._id);
          let devicesData = [];
          if (devicesResponse.data && Array.isArray(devicesResponse.data)) {
            devicesData = devicesResponse.data;
          } else if (Array.isArray(devicesResponse)) {
            devicesData = devicesResponse;
          }
          const devicesWithZone = devicesData.map(device => ({
            ...device,
            zoneId: zone._id,
            zoneName: zone.name,
            plantId: zone.plantId,
            plantName: zone.plantName
          }));
          allDevices.push(...devicesWithZone);
        } catch (err) {
          console.error(`Error fetching devices for zone ${zone.name}:`, err);
        }
      }
      setDevicesList(allDevices);
      
    } catch (err) {
      console.error('Error fetching dynamic data:', err);
    }
  };

  // Fetch sensor data from external API
  const fetchSensorData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://sensor-six-iota.vercel.app/api/sensors');
      if (!response.ok) throw new Error('Failed to fetch sensor data');
      const data = await response.json();
      
      // Group readings by device_id
      const readingsByDevice = {};
      data.forEach(reading => {
        if (!readingsByDevice[reading.device_id]) {
          readingsByDevice[reading.device_id] = [];
        }
        readingsByDevice[reading.device_id].push({
          temperature: reading.temperature,
          humidity: reading.relative_humidity,
          voc: reading.tvoc,
          timestamp: reading.created_at
        });
      });
      
      // Sort readings by timestamp for each device and keep last 100
      Object.keys(readingsByDevice).forEach(deviceId => {
        readingsByDevice[deviceId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        readingsByDevice[deviceId] = readingsByDevice[deviceId].slice(-100);
      });
      
      setDeviceReadings(readingsByDevice);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDynamicData();
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get filtered devices based on plant and zone selection
  const getFilteredDevices = () => {
    let filtered = [...devicesList];
    
    if (selectedPlant) {
      filtered = filtered.filter(device => device.plantId === selectedPlant);
    }
    if (selectedZone) {
      filtered = filtered.filter(device => device.zoneId === selectedZone);
    }
    if (selectedDevice) {
      filtered = filtered.filter(device => device._id === selectedDevice || device.deviceId === selectedDevice);
    }
    
    return filtered;
  };

  const filteredDevices = getFilteredDevices();
  const filteredDataCount = sensorData.length;

  const getDeviceReadings = (deviceId) => {
    return deviceReadings[deviceId] || [];
  };

  const getParameterValues = (deviceId, paramKey) => {
    const readings = getDeviceReadings(deviceId);
    return readings.map(reading => ({
      time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: reading[paramKey],
      fullTime: new Date(reading.timestamp)
    }));
  };

  const getCurrentValue = (deviceId, paramKey) => {
    const readings = getDeviceReadings(deviceId);
    if (readings.length === 0) return null;
    return readings[readings.length - 1][paramKey];
  };

  const getAverageValue = (deviceId, paramKey) => {
    const readings = getDeviceReadings(deviceId);
    if (readings.length === 0) return null;
    const values = readings.map(r => r[paramKey]).filter(v => v !== undefined && v !== null);
    if (values.length === 0) return null;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const getParameterColorClass = (color) => {
    const colors = {
      orange: 'text-orange-500',
      blue: 'text-blue-500',
      green: 'text-green-500',
      cyan: 'text-cyan-500',
      red: 'text-red-500',
      purple: 'text-purple-500',
      yellow: 'text-yellow-500',
      pink: 'text-pink-500'
    };
    return colors[color] || 'text-gray-500';
  };

  const handleParameterToggle = (parameterId) => {
    if (selectedParameters.includes(parameterId)) {
      setSelectedParameters(selectedParameters.filter(p => p !== parameterId));
    } else {
      setSelectedParameters([...selectedParameters, parameterId]);
    }
  };

  const getAlertStatus = (value, type) => {
    if (type === 'temperature') return value > 34;
    if (type === 'voc') return value > 35000;
    return false;
  };

  const handleDownload = () => {
    try {
      // Prepare export data for all devices
      const exportData = [];
      filteredDevices.forEach(device => {
        const readings = getDeviceReadings(device.deviceId);
        readings.forEach(reading => {
          exportData.push({
            'Device ID': device.deviceId,
            'Device Name': device.deviceId,
            'Plant': device.plantName,
            'Zone': device.zoneName,
            'Temperature (°C)': reading.temperature,
            'Humidity (%)': reading.humidity,
            'VOC (ppb)': reading.voc,
            'Timestamp': new Date(reading.timestamp).toLocaleString()
          });
        });
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sensor Data');
      const filename = `sensor_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);
      
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMsg.innerHTML = '✅ Data downloaded successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const toggleFullscreen = () => {
    const chartElement = document.getElementById('chart-container');
    if (!chartElement) return;
    if (!isFullscreen) {
      if (chartElement.requestFullscreen) chartElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleResetFilters = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedPlant('');
    setSelectedZone('');
    setSelectedDevice('');
  };

  if (loading && !sensorData.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading sensor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sensor Monitoring Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time environmental data from your registered devices</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span><FaClock className="inline mr-1" /> Last update: {lastUpdate.toLocaleTimeString()}</span>
            <span>• {filteredDevices.length} devices</span>
            <span>• {filteredDataCount} total readings</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSensorData} disabled={loading} className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50">
            <FaSpinner className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={handleDownload} className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all">
            <FaFileDownload /> Export
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FaFilter className="text-purple-500" />
            Filters
          </h2>
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Plant Filter */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs text-gray-500 mb-1">Plant</label>
              <select
                value={selectedPlant}
                onChange={(e) => {
                  setSelectedPlant(e.target.value);
                  setSelectedZone('');
                  setSelectedDevice('');
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
              >
                <option value="">All Plants</option>
                {plantsList.map(plant => (
                  <option key={plant._id} value={plant._id}>{plant.name}</option>
                ))}
              </select>
            </div>

            {/* Zone Filter - depends on selected plant */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs text-gray-500 mb-1">Zone</label>
              <select
                value={selectedZone}
                onChange={(e) => {
                  setSelectedZone(e.target.value);
                  setSelectedDevice('');
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
                disabled={!selectedPlant && zonesList.length === 0}
              >
                <option value="">All Zones</option>
                {zonesList
                  .filter(zone => !selectedPlant || zone.plantId === selectedPlant)
                  .map(zone => (
                    <option key={zone._id} value={zone._id}>{zone.name}</option>
                  ))}
              </select>
            </div>

            {/* Device Filter - depends on selected zone */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs text-gray-500 mb-1">Device</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
                disabled={!selectedZone && filteredDevices.length === 0}
              >
                <option value="">All Devices</option>
                {filteredDevices.map(device => (
                  <option key={device._id} value={device._id}>{device.deviceId}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium border border-purple-200 rounded-lg hover:bg-purple-50 transition-all whitespace-nowrap"
            >
              Reset
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="">All States</option>
                    {statesList.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                    disabled={!selectedState}
                  >
                    <option value="">All Cities</option>
                    {selectedState && citiesByStateMap[selectedState]?.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(selectedPlant || selectedZone || selectedDevice || selectedState || selectedCity) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {selectedPlant && plantsList.find(p => p._id === selectedPlant) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    Plant: {plantsList.find(p => p._id === selectedPlant)?.name}
                    <button onClick={() => setSelectedPlant('')} className="hover:text-purple-900">×</button>
                  </span>
                )}
                {selectedZone && zonesList.find(z => z._id === selectedZone) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    Zone: {zonesList.find(z => z._id === selectedZone)?.name}
                    <button onClick={() => setSelectedZone('')} className="hover:text-blue-900">×</button>
                  </span>
                )}
                {selectedDevice && filteredDevices.find(d => d._id === selectedDevice) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    Device: {filteredDevices.find(d => d._id === selectedDevice)?.deviceId}
                    <button onClick={() => setSelectedDevice('')} className="hover:text-green-900">×</button>
                  </span>
                )}
                {selectedState && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                    State: {selectedState}
                    <button onClick={() => setSelectedState('')} className="hover:text-orange-900">×</button>
                  </span>
                )}
                {selectedCity && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                    City: {selectedCity}
                    <button onClick={() => setSelectedCity('')} className="hover:text-pink-900">×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Parameters Selection Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <FaChartBar className="text-purple-500" />
          Select Parameters to Display
        </label>
        <div className="flex flex-wrap gap-2">
          {parameters.map((param) => (
            <label 
              key={param.id} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all text-sm ${
                selectedParameters.includes(param.id)
                  ? 'bg-purple-100 border border-purple-300 shadow-sm'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <input 
                type="checkbox" 
                checked={selectedParameters.includes(param.id)}
                onChange={() => handleParameterToggle(param.id)}
                className="rounded text-purple-500 focus:ring-purple-500 w-3.5 h-3.5" 
                disabled={param.comingSoon}
              />
              <span className={getParameterColorClass(param.color)}>
                {param.icon}
              </span>
              <span className={`text-sm ${param.comingSoon ? 'text-gray-400' : 'text-gray-700'}`}>
                {param.name}
              </span>
              {param.comingSoon && (
                <span className="text-xs bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full ml-0.5">
                  Soon
                </span>
              )}
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Selected: {selectedParameters.length} parameters
        </p>
      </div>

      {/* Device-wise Charts */}
      <div id="chart-container" className="space-y-12 mb-6">
        {filteredDevices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <FaMicrochip className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No devices found</h3>
            <p className="text-gray-400">
              {selectedPlant || selectedZone 
                ? "No devices registered in the selected plant/zone. Please add devices first."
                : "Please select a plant and zone to view devices"}
            </p>
          </div>
        ) : (
          filteredDevices.map((device) => {
            const readings = getDeviceReadings(device.deviceId);
            const hasData = readings.length > 0;
            
            return (
              <div key={device._id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaMicrochip className="text-purple-500" />
                        {device.deviceId}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {device.plantName} → {device.zoneName} • {readings.length} readings
                      </p>
                    </div>
                    {hasData && readings[readings.length - 1] && (
                      <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                        <FaCheckCircle className="text-xs" /> Live
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 space-y-8">
                  {selectedParameters.map((paramId) => {
                    const param = parameters.find(p => p.id === paramId);
                    if (param.comingSoon) {
                      return (
                        <div key={paramId} className="bg-gray-50 rounded-xl p-8 text-center">
                          <div className="text-4xl mb-3">{param.icon}</div>
                          <h4 className="text-lg font-semibold text-gray-700">{param.name}</h4>
                          <p className="text-gray-500">Coming soon</p>
                        </div>
                      );
                    }
                    
                    const chartData = getParameterValues(device.deviceId, param.dataKey);
                    const currentValue = getCurrentValue(device.deviceId, param.dataKey);
                    const avgValue = getAverageValue(device.deviceId, param.dataKey);
                    const isAlert = getAlertStatus(currentValue, paramId);
                    
                    if (!chartData || chartData.length === 0) {
                      return (
                        <div key={paramId} className="bg-gray-50 rounded-xl p-8 text-center">
                          <h4 className="text-lg font-semibold text-gray-700">{param.name}</h4>
                          <p className="text-gray-500">No data available for this device</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={paramId} className="space-y-3">
                        <div className="flex justify-between items-center flex-wrap gap-3">
                          <div className="flex items-center gap-2">
                            <span className={getParameterColorClass(param.color)}>
                              {param.icon}
                            </span>
                            <h4 className="font-semibold text-gray-800">{param.name} Trend</h4>
                            {isAlert && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <FaExclamationTriangle className="text-xs" /> Alert
                              </span>
                            )}
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Current:</span>
                              <span className="font-semibold ml-1 text-gray-800">
                                {currentValue !== null ? `${currentValue}${param.unit}` : '--'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Average:</span>
                              <span className="font-semibold ml-1 text-gray-800">
                                {avgValue !== null ? `${avgValue}${param.unit}` : '--'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 11 }} 
                              interval="preserveStartEnd"
                              label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis 
                              tick={{ fontSize: 11 }}
                              label={{ value: param.unit, angle: -90, position: 'insideLeft' }}
                              domain={['auto', 'auto']}
                            />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={param.color === 'orange' ? '#f97316' : param.color === 'blue' ? '#3b82f6' : '#10b981'} 
                              strokeWidth={2.5} 
                              dot={{ r: 2 }} 
                              activeDot={{ r: 6 }} 
                              name={param.name} 
                              unit={param.unit} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recent Readings Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <FaMicrochip className="text-purple-500" />
            Recent Sensor Readings
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Latest records from {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Device ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Plant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Temperature</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Humidity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">VOC</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDevices.slice(0, 10).map((device) => {
                const readings = getDeviceReadings(device.deviceId);
                const latestReading = readings[readings.length - 1];
                
                return (
                  <tr key={device._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{device.deviceId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{device.plantName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{device.zoneName}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={latestReading?.temperature > 34 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                        {latestReading?.temperature || '--'}°C
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{latestReading?.humidity || '--'}%</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={latestReading?.voc > 35000 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                        {latestReading?.voc || '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {latestReading?.timestamp ? new Date(latestReading.timestamp).toLocaleString() : 'No data'}
                    </td>
                  </tr>
                );
              })}
              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No devices found. Please add devices from the "Add Device" page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {error && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <p className="text-red-600 text-sm flex items-center gap-2">
              <FaExclamationTriangle /> Error: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;