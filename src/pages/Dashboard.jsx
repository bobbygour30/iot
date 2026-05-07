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
  const [devices, setDevices] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
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

  // Data for filters
  const states = ['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Delhi', 'West Bengal', 'Telangana'];
  const citiesByState = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
    'Karnataka': ['Bengaluru', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
    'Delhi': ['New Delhi', 'Noida', 'Gurugram', 'Faridabad', 'Ghaziabad'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
    'Telangana': ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar']
  };
  const plants = ['Plant A', 'Plant B', 'Plant C', 'Plant D', 'Plant E', 'Plant F'];
  const zones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6'];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch sensor data
  const fetchSensorData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://sensor-six-iota.vercel.app/api/sensors');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      
      const mappedData = data.map(item => ({
        ...item,
        humidity: item.relative_humidity,
        voc: item.tvoc,
        device_id: item.device_id,
        created_at: item.created_at
      }));
      
      setSensorData(mappedData);
      
      const uniqueDevices = [...new Set(mappedData.map(item => item.device_id))];
      setDevices(uniqueDevices);
      
      // Set default date range based on data
      if (mappedData.length > 0 && !dateFrom && !dateTo) {
        const dates = mappedData.map(d => new Date(d.created_at));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        setDateFrom(minDate.toISOString().split('T')[0]);
        setDateTo(maxDate.toISOString().split('T')[0]);
      }
      
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getFilteredData = () => {
    let filtered = [...sensorData];
    if (selectedDevice) {
      filtered = filtered.filter(item => item.device_id === selectedDevice);
    }
    if (dateFrom) {
      filtered = filtered.filter(item => new Date(item.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item.created_at) <= endDate);
    }
    return filtered;
  };

  const processChartData = (dataKey) => {
    const filteredData = getFilteredData();
    if (!filteredData.length) return [];
    const sorted = [...filteredData].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return sorted.map(item => ({
      time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: item[dataKey],
      deviceId: item.device_id
    }));
  };

  const temperatureData = processChartData('temperature');
  const humidityData = processChartData('humidity');
  const vocData = processChartData('voc');

  const getParameterValue = (paramId) => {
    const filteredData = getFilteredData();
    if (!filteredData.length) return null;
    const param = parameters.find(p => p.id === paramId);
    if (!param || param.comingSoon) return null;
    const latest = filteredData[filteredData.length - 1];
    return latest[param.dataKey];
  };

  const getParameterAverage = (paramId) => {
    const filteredData = getFilteredData();
    if (!filteredData.length) return null;
    const param = parameters.find(p => p.id === paramId);
    if (!param || param.comingSoon) return null;
    const values = filteredData.map(d => d[param.dataKey]).filter(v => v !== undefined && v !== null);
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

  const getCurrentValue = (dataArray) => {
    if (!dataArray.length) return null;
    return dataArray[dataArray.length - 1]?.value;
  };

  const getAverageValue = (dataArray) => {
    if (!dataArray.length) return null;
    const values = dataArray.map(d => d.value).filter(v => v !== undefined && v !== null);
    if (values.length === 0) return null;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const getAlertStatus = (value, type) => {
    if (type === 'temperature') return value > 34;
    if (type === 'voc') return value > 35000;
    return false;
  };

  const handleDownload = () => {
    try {
      const exportData = sensorData.map(item => ({
        'Device ID': item.device_id,
        'Temperature (°C)': item.temperature,
        'Humidity (%)': item.humidity,
        'VOC (ppb)': item.voc,
        'Timestamp': new Date(item.created_at).toLocaleString()
      }));

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
    if (sensorData.length > 0) {
      const dates = sensorData.map(d => new Date(d.created_at));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      setDateFrom(minDate.toISOString().split('T')[0]);
      setDateTo(maxDate.toISOString().split('T')[0]);
    }
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

  const filteredDataCount = getFilteredData().length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sensor Monitoring Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time environmental data from your devices</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span><FaClock className="inline mr-1" /> Last update: {lastUpdate.toLocaleTimeString()}</span>
            <span>• {sensorData.length} total readings</span>
            <span>• {filteredDataCount} filtered readings</span>
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
          {/* Basic Filters Row */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex-1 min-w-[180px]">
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
              >
                <option value="">All Devices ({devices.length})</option>
                {devices.map(device => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                style={{ width: '140px' }}
              />
              <span className="text-gray-400 text-sm">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                style={{ width: '140px' }}
              />
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
                    {states.map(s => <option key={s}>{s}</option>)}
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
                    {selectedState && citiesByState[selectedState]?.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Plant</label>
                  <select
                    value={selectedPlant}
                    onChange={(e) => setSelectedPlant(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="">All Plants</option>
                    {plants.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Zone</label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="">All Zones</option>
                    {zones.map(z => <option key={z}>{z}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(selectedDevice || selectedState || selectedCity || selectedPlant || selectedZone) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {selectedDevice && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    Device: {selectedDevice}
                    <button onClick={() => setSelectedDevice('')} className="hover:text-purple-900">×</button>
                  </span>
                )}
                {selectedState && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    State: {selectedState}
                    <button onClick={() => setSelectedState('')} className="hover:text-blue-900">×</button>
                  </span>
                )}
                {selectedCity && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    City: {selectedCity}
                    <button onClick={() => setSelectedCity('')} className="hover:text-green-900">×</button>
                  </span>
                )}
                {selectedPlant && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                    Plant: {selectedPlant}
                    <button onClick={() => setSelectedPlant('')} className="hover:text-orange-900">×</button>
                  </span>
                )}
                {selectedZone && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                    Zone: {selectedZone}
                    <button onClick={() => setSelectedZone('')} className="hover:text-pink-900">×</button>
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

      {/* Current Values Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {selectedParameters.map((paramId) => {
          const param = parameters.find(p => p.id === paramId);
          if (param.comingSoon) {
            return (
              <div key={param.id} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <span className={getParameterColorClass(param.color)}>{param.icon}</span>
                    {param.name}
                  </p>
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">Coming Soon</span>
                </div>
                <p className="text-2xl font-bold text-gray-400">--</p>
                <p className="text-xs text-gray-400 mt-2">Data coming soon</p>
              </div>
            );
          }
          
          const currentValue = getParameterValue(paramId);
          const avgValue = getParameterAverage(paramId);
          const alertThreshold = paramId === 'temperature' ? 34 : paramId === 'voc' ? 35000 : 80;
          const isAlert = currentValue !== null && currentValue > alertThreshold;
          
          return (
            <div key={param.id} className={`bg-white rounded-xl p-4 shadow-lg border transition-all ${isAlert ? 'border-red-300 bg-red-50/30' : 'border-gray-100 hover:shadow-xl'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <span className={getParameterColorClass(param.color)}>{param.icon}</span>
                  {param.name}
                </p>
                {isAlert ? (
                  <FaExclamationTriangle className="text-red-500 text-xs" />
                ) : (
                  <FaCheckCircle className="text-green-500 text-xs" />
                )}
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {currentValue !== null ? `${currentValue}${param.unit}` : '--'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Avg: {avgValue !== null ? `${avgValue}${param.unit}` : '--'} • {filteredDataCount} readings
              </p>
            </div>
          );
        })}
      </div>

      {/* Three Separate Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Temperature Graph */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaThermometerHalf className="text-orange-500 text-lg" />
                <h3 className="font-semibold text-gray-800">Temperature Trend</h3>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-800">
                  {getCurrentValue(temperatureData) !== null ? `${getCurrentValue(temperatureData)}°C` : '--'}
                </p>
                <p className="text-xs text-gray-500">
                  Avg: {getAverageValue(temperatureData) !== null ? `${getAverageValue(temperatureData)}°C` : '--'}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={temperatureData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f97316" 
                  strokeWidth={2} 
                  dot={{ r: 2, fill: '#f97316' }} 
                  name="Temperature" 
                  unit="°C" 
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center">
              {getAlertStatus(getCurrentValue(temperatureData), 'temperature') && (
                <span className="text-xs text-red-500 flex items-center justify-center gap-1">
                  <FaExclamationTriangle /> Alert: High temperature detected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Humidity Graph */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaTint className="text-blue-500 text-lg" />
                <h3 className="font-semibold text-gray-800">Humidity Trend</h3>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-800">
                  {getCurrentValue(humidityData) !== null ? `${getCurrentValue(humidityData)}%` : '--'}
                </p>
                <p className="text-xs text-gray-500">
                  Avg: {getAverageValue(humidityData) !== null ? `${getAverageValue(humidityData)}%` : '--'}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={humidityData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: 2, fill: '#3b82f6' }} 
                  name="Humidity" 
                  unit="%" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* VOC Graph */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaFlask className="text-green-500 text-lg" />
                <h3 className="font-semibold text-gray-800">VOC Trend</h3>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-800">
                  {getCurrentValue(vocData) !== null ? `${getCurrentValue(vocData)} ppb` : '--'}
                </p>
                <p className="text-xs text-gray-500">
                  Avg: {getAverageValue(vocData) !== null ? `${getAverageValue(vocData)} ppb` : '--'}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={vocData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={{ r: 2, fill: '#10b981' }} 
                  name="VOC" 
                  unit="ppb" 
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 text-center">
              {getAlertStatus(getCurrentValue(vocData), 'voc') && (
                <span className="text-xs text-red-500 flex items-center justify-center gap-1">
                  <FaExclamationTriangle /> Alert: High VOC level detected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Readings Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <FaMicrochip className="text-purple-500" />
            Recent Sensor Readings
          </h3>
          <p className="text-xs text-gray-500 mt-1">Latest {Math.min(10, getFilteredData().length)} records {selectedDevice && `for ${selectedDevice}`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Device ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Temperature</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Humidity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">VOC</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getFilteredData().slice(0, 10).map((reading, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{reading.device_id}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={reading.temperature > 34 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                      {reading.temperature}°C
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{reading.humidity}%</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={reading.voc > 35000 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                      {reading.voc > 50000 ? '>50k' : reading.voc}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(reading.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {getFilteredData().length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No data available for selected filters
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