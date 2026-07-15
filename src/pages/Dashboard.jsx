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

// Skeleton Loader Components
const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  if (type === 'device') {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-48 bg-gray-200 rounded mt-1"></div>
            </div>
            <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
        <div className="p-4 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-[300px] bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-[300px] bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                {[1, 2, 3, 4].map((i) => (
                  <th key={i} className="px-3 py-2">
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-3 py-2"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                  <td className="px-3 py-2"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                  <td className="px-3 py-2"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                  <td className="px-3 py-2"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};

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
  const [isDynamicDataLoading, setIsDynamicDataLoading] = useState(true);
  const [isSensorDataLoading, setIsSensorDataLoading] = useState(true);
  
  // Dynamic filter data
  const [plantsList, setPlantsList] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [devicesList, setDevicesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesByStateMap, setCitiesByStateMap] = useState({});
  
  // Device readings data
  const [deviceReadings, setDeviceReadings] = useState({});
  
  // Pagination state for sensor data
  const [paginationInfo, setPaginationInfo] = useState({});
  
  // Multi-select parameters
  const parameters = [
    { id: 'temperature', name: 'Temperature', icon: <FaThermometerHalf />, color: 'orange', dataKey: 'temperature', unit: '°C', comingSoon: false, yAxisDomain: [0, 100] },
    { id: 'humidity', name: 'Relative Humidity', icon: <FaTint />, color: 'blue', dataKey: 'humidity', unit: '%', comingSoon: false, yAxisDomain: [0, 100] },
    { id: 'voc', name: 'TVOC', icon: <FaFlask />, color: 'green', dataKey: 'voc', unit: 'ppb', comingSoon: false, yAxisDomain: [0, 50000] },
    { id: 'pm_2_5', name: 'PM 2.5', icon: <FaSmog />, color: 'red', dataKey: 'pm_2_5', unit: 'µg/m³', comingSoon: false, yAxisDomain: [0, 500] },
    { id: 'pm_10', name: 'PM 10', icon: <FaSmog />, color: 'orange', dataKey: 'pm_10', unit: 'µg/m³', comingSoon: false, yAxisDomain: [0, 500] },
    { id: 'co2', name: 'CO2', icon: <FaFire />, color: 'purple', dataKey: 'co2', unit: 'ppm', comingSoon: false, yAxisDomain: [0, 5000] },
    { id: 'lux', name: 'LUX', icon: <FaMoon />, color: 'yellow', dataKey: 'lux', unit: 'lx', comingSoon: false, yAxisDomain: [0, 1000] },
    { id: 'noise_av', name: 'Noise AV', icon: <FaVolumeUp />, color: 'pink', dataKey: 'noise_av', unit: 'dB', comingSoon: false, yAxisDomain: [0, 100] },
    { id: 'noise_peak', name: 'Noise Peak', icon: <FaVolumeUp />, color: 'red', dataKey: 'noise_peak', unit: 'dB', comingSoon: false, yAxisDomain: [0, 100] }
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
    setIsDynamicDataLoading(true);
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
    } finally {
      setIsDynamicDataLoading(false);
    }
  };

  // Fetch sensor data from ScanMyZone API via backend proxy
  const fetchSensorData = async () => {
    setIsSensorDataLoading(true);
    try {
      // Use your backend proxy
      const BACKEND_URL = 'https://new-sensor-api-snxk.vercel.app'; // ← CHANGE THIS TO YOUR BACKEND URL
      let url = `${BACKEND_URL}/api/scanmyzone?include_data=true&limit=100&hours=8`;
      
      // If a specific device is selected, filter by device_id
      if (selectedDevice) {
        const device = devicesList.find(d => d._id === selectedDevice);
        if (device && device.deviceId) {
          url += `&device_id=${encodeURIComponent(device.deviceId)}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sensor data');
      }
      
      const data = result.data || [];
      
      if (result.pagination) {
        setPaginationInfo(result.pagination);
        console.log('📊 ScanMyZone API Response:', {
          recordsReceived: data.length,
          limit: result.pagination.limit,
          total: result.pagination.total,
          hasMore: result.pagination.hasMore,
          filters: result.filters
        });
      } else {
        console.log('📊 ScanMyZone API Response:', {
          recordsReceived: data.length
        });
      }
      
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
          pm_2_5: reading.pm_2_5,
          pm_10: reading.pm_10,
          co2: reading.co2,
          lux: reading.lux,
          noise_av: reading.noise_av,
          noise_peak: reading.noise_peak,
          timestamp: reading.created_at || reading.last_seen
        });
      });
      
      // Sort each device's readings by timestamp
      Object.keys(readingsByDevice).forEach(deviceId => {
        readingsByDevice[deviceId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        // Keep only the last 100 readings
        readingsByDevice[deviceId] = readingsByDevice[deviceId].slice(-100);
      });
      
      setDeviceReadings(readingsByDevice);
      setSensorData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setIsSensorDataLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDynamicData();
      await fetchSensorData();
      setLoading(false);
    };
    
    loadData();
    
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refetch sensor data when selected device changes
  useEffect(() => {
    if (!loading && !isDynamicDataLoading) {
      fetchSensorData();
    }
  }, [selectedDevice]);

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
  
  // Calculate total readings across all filtered devices
  const totalReadings = filteredDevices.reduce((total, device) => {
    return total + (deviceReadings[device.deviceId]?.length || 0);
  }, 0);

  const getDeviceReadings = (deviceId) => {
    return deviceReadings[deviceId] || [];
  };

  const getParameterValues = (deviceId, paramKey) => {
    const readings = getDeviceReadings(deviceId);
    return readings.map(reading => ({
      time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTime: new Date(reading.timestamp),
      value: reading[paramKey]
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
    if (type === 'pm_2_5') return value > 100;
    if (type === 'pm_10') return value > 150;
    if (type === 'co2') return value > 2000;
    return false;
  };

  const handleDownload = () => {
    try {
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
            'PM 2.5 (µg/m³)': reading.pm_2_5,
            'PM 10 (µg/m³)': reading.pm_10,
            'CO2 (ppm)': reading.co2,
            'LUX (lx)': reading.lux,
            'Noise AV (dB)': reading.noise_av,
            'Noise Peak (dB)': reading.noise_peak,
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
    setDateFrom('');
    setDateTo('');
  };

  const CustomTooltip = ({ active, payload, label, deviceInfo }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-[180px]">
          <div className="text-xs text-gray-500 mb-1">{deviceInfo?.plantName} → {deviceInfo?.zoneName}</div>
          <div className="text-sm font-semibold text-gray-800 mb-1">{deviceInfo?.deviceId}</div>
          <div className="text-xs text-gray-500 mb-2">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600">{entry.name}:</span>
              </span>
              <span className="font-semibold text-gray-800">{entry.value} {entry.unit || ''}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Show loading spinner while initial data is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading sensor data from ScanMyZone API...</p>
          {paginationInfo.total && (
            <p className="text-xs text-gray-400 mt-2">Fetching up to 100 records</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <p className="text-gray-500 text-sm mt-0.5">Real-time environmental data from ScanMyZone API</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span><FaClock className="inline mr-1" /> Last update: {lastUpdate.toLocaleTimeString()}</span>
            <span>• {filteredDevices.length} devices</span>
            <span>• {totalReadings} total readings</span>
            {paginationInfo.limit && (
              <span>• Showing up to {paginationInfo.limit} records per device</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSensorData} disabled={isSensorDataLoading} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-all disabled:opacity-50 text-sm">
            <FaSpinner className={isSensorDataLoading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={handleDownload} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-all text-sm">
            <FaFileDownload /> Export
          </button>
        </div>
      </div>

      {/* Filters Section - Show skeleton while loading */}
      {isDynamicDataLoading ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-4 overflow-hidden animate-pulse">
          <div className="px-3 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 min-w-[160px]">
                  <div className="h-3 w-10 bg-gray-200 rounded mb-0.5"></div>
                  <div className="h-8 w-full bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-4 overflow-hidden">
          <div className="px-3 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
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
          
          <div className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] text-gray-500 mb-0.5">Plant</label>
                <select
                  value={selectedPlant}
                  onChange={(e) => {
                    setSelectedPlant(e.target.value);
                    setSelectedZone('');
                    setSelectedDevice('');
                  }}
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
                >
                  <option value="">All Plants</option>
                  {plantsList.map(plant => (
                    <option key={plant._id} value={plant._id}>{plant.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] text-gray-500 mb-0.5">Zone</label>
                <select
                  value={selectedZone}
                  onChange={(e) => {
                    setSelectedZone(e.target.value);
                    setSelectedDevice('');
                  }}
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
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

              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] text-gray-500 mb-0.5">Device</label>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
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
                className="px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium border border-purple-200 rounded-lg hover:bg-purple-50 transition-all whitespace-nowrap mt-1"
              >
                Reset
              </button>
            </div>

            {showAdvancedFilters && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); }}
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                    >
                      <option value="">All States</option>
                      {statesList.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">City</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                      disabled={!selectedState}
                    >
                      <option value="">All Cities</option>
                      {selectedState && citiesByStateMap[selectedState]?.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Date From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Date To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  Note: Data is fetched from ScanMyZone API via backend proxy
                </p>
              </div>
            )}

            {(selectedPlant || selectedZone || selectedDevice || selectedState || selectedCity) && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex flex-wrap gap-1.5">
                  {selectedPlant && plantsList.find(p => p._id === selectedPlant) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px]">
                      Plant: {plantsList.find(p => p._id === selectedPlant)?.name}
                      <button onClick={() => setSelectedPlant('')} className="hover:text-purple-900">×</button>
                    </span>
                  )}
                  {selectedZone && zonesList.find(z => z._id === selectedZone) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px]">
                      Zone: {zonesList.find(z => z._id === selectedZone)?.name}
                      <button onClick={() => setSelectedZone('')} className="hover:text-blue-900">×</button>
                    </span>
                  )}
                  {selectedDevice && filteredDevices.find(d => d._id === selectedDevice) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px]">
                      Device: {filteredDevices.find(d => d._id === selectedDevice)?.deviceId}
                      <button onClick={() => setSelectedDevice('')} className="hover:text-green-900">×</button>
                    </span>
                  )}
                  {selectedState && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px]">
                      State: {selectedState}
                      <button onClick={() => setSelectedState('')} className="hover:text-orange-900">×</button>
                    </span>
                  )}
                  {selectedCity && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-[10px]">
                      City: {selectedCity}
                      <button onClick={() => setSelectedCity('')} className="hover:text-pink-900">×</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parameters Selection Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1.5">
          <FaChartBar className="text-purple-500" />
          Select Parameters to Display
        </label>
        <div className="flex flex-wrap gap-1.5">
          {parameters.map((param) => (
            <label 
              key={param.id} 
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer transition-all text-xs ${
                selectedParameters.includes(param.id)
                  ? 'bg-purple-100 border border-purple-300 shadow-sm'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <input 
                type="checkbox" 
                checked={selectedParameters.includes(param.id)}
                onChange={() => handleParameterToggle(param.id)}
                className="rounded text-purple-500 focus:ring-purple-500 w-3 h-3" 
                disabled={param.comingSoon}
              />
              <span className={getParameterColorClass(param.color)}>
                {param.icon}
              </span>
              <span className={`text-xs ${param.comingSoon ? 'text-gray-400' : 'text-gray-700'}`}>
                {param.name}
              </span>
              {param.comingSoon && (
                <span className="text-[10px] bg-yellow-100 text-yellow-600 px-1 py-0.5 rounded-full ml-0.5">
                  Soon
                </span>
              )}
            </label>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-2">
          Selected: {selectedParameters.length} parameters
        </p>
      </div>

      {/* Device-wise Charts - Show skeletons while loading */}
      <div id="chart-container" className="space-y-6 mb-4">
        {isDynamicDataLoading || isSensorDataLoading ? (
          // Show skeleton loaders
          <>
            <SkeletonLoader type="device" />
            <SkeletonLoader type="device" />
          </>
        ) : filteredDevices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 text-center">
            <FaMicrochip className="text-5xl text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-600 mb-1">No devices found</h3>
            <p className="text-sm text-gray-400">
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
              <div key={device._id} className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <FaMicrochip className="text-purple-500" />
                        {device.deviceId}
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {device.plantName} → {device.zoneName} • {readings.length} readings
                      </p>
                    </div>
                    {hasData && readings[readings.length - 1] && (
                      <div className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FaCheckCircle className="text-[10px]" /> Live
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 space-y-6">
                  {selectedParameters.map((paramId) => {
                    const param = parameters.find(p => p.id === paramId);
                    if (param.comingSoon) {
                      return (
                        <div key={paramId} className="bg-gray-50 rounded-xl p-6 text-center">
                          <div className="text-3xl mb-2">{param.icon}</div>
                          <h4 className="text-base font-semibold text-gray-700">{param.name}</h4>
                          <p className="text-sm text-gray-500">Coming soon</p>
                        </div>
                      );
                    }
                    
                    const chartData = getParameterValues(device.deviceId, param.dataKey);
                    const currentValue = getCurrentValue(device.deviceId, param.dataKey);
                    const avgValue = getAverageValue(device.deviceId, param.dataKey);
                    const isAlert = getAlertStatus(currentValue, paramId);
                    
                    if (!chartData || chartData.length === 0) {
                      return (
                        <div key={paramId} className="bg-gray-50 rounded-xl p-6 text-center">
                          <h4 className="text-base font-semibold text-gray-700">{param.name}</h4>
                          <p className="text-sm text-gray-500">No data available for this device</p>
                        </div>
                      );
                    }
                    
                    const yAxisDomain = param.yAxisDomain || ['auto', 'auto'];
                    
                    const getLineColor = (color) => {
                      const colorMap = {
                        'orange': '#f97316',
                        'blue': '#3b82f6',
                        'green': '#10b981',
                        'cyan': '#06b6d4',
                        'red': '#ef4444',
                        'purple': '#8b5cf6',
                        'yellow': '#eab308',
                        'pink': '#ec4899'
                      };
                      return colorMap[color] || '#6b7280';
                    };
                    
                    const deviceInfo = {
                      deviceId: device.deviceId,
                      plantName: device.plantName,
                      zoneName: device.zoneName
                    };
                    
                    return (
                      <div key={paramId} className="space-y-2">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={getParameterColorClass(param.color)}>
                              {param.icon}
                            </span>
                            <h4 className="font-semibold text-gray-800 text-sm">{param.name} Trend</h4>
                            {isAlert && (
                              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <FaExclamationTriangle className="text-[10px]" /> Alert
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3 text-xs">
                            <div>
                              <span className="text-gray-500">Current:</span>
                              <span className="font-semibold ml-1 text-gray-800">
                                {currentValue !== null && currentValue !== undefined ? `${currentValue}${param.unit}` : '--'}
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
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 10 }} 
                              interval="preserveStartEnd"
                              angle={-45}
                              textAnchor="end"
                              height={50}
                              label={{ value: 'Time', position: 'insideBottom', offset: -5, fontSize: 10 }}
                            />
                            <YAxis 
                              tick={{ fontSize: 10 }}
                              label={{ value: param.unit, angle: -90, position: 'insideLeft', fontSize: 10 }}
                              domain={yAxisDomain}
                            />
                            <Tooltip 
                              content={<CustomTooltip deviceInfo={deviceInfo} />}
                              formatter={(value, name) => [`${value} ${param.unit}`, name]}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={getLineColor(param.color)} 
                              strokeWidth={2} 
                              dot={{ r: 1.5 }} 
                              activeDot={{ r: 5 }} 
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

      {/* Recent Readings Table - Show skeleton while loading */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <FaMicrochip className="text-purple-500" />
            Recent Sensor Readings
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {isDynamicDataLoading || isSensorDataLoading ? 'Loading...' : 
              `Latest records from ${filteredDevices.length} device${filteredDevices.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        
        {isDynamicDataLoading || isSensorDataLoading ? (
          <SkeletonLoader type="table" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">Device ID</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">Plant</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">Zone</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDevices.slice(0, 10).map((device) => {
                  const readings = getDeviceReadings(device.deviceId);
                  const latestReading = readings[readings.length - 1];
                  
                  return (
                    <tr key={device._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-[11px] font-mono text-gray-700">{device.deviceId}</td>
                      <td className="px-3 py-2 text-[11px] text-gray-600">{device.plantName}</td>
                      <td className="px-3 py-2 text-[11px] text-gray-600">{device.zoneName}</td>
                      <td className="px-3 py-2 text-[10px] text-gray-500">
                        {latestReading?.timestamp ? new Date(latestReading.timestamp).toLocaleString() : 'No data'}
                      </td>
                    </tr>
                  );
                })}
                {filteredDevices.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-3 py-4 text-center text-gray-500 text-sm">
                      No devices found. Please add devices from the "Add Device" page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border-t border-red-200">
            <p className="text-red-600 text-xs flex items-center gap-1.5">
              <FaExclamationTriangle /> Error: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;