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
  FaFilter
} from 'react-icons/fa';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('thermal');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-12-31');
  const [isMobile, setIsMobile] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

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
      setSensorData(data);
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

  // Download data as Excel/CSV
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
      const colWidths = [
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }
      ];
      ws['!cols'] = colWidths;

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
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMsg.innerHTML = '❌ Failed to download data';
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 3000);
    }
  };

  // Toggle fullscreen for chart
  const toggleFullscreen = () => {
    const chartElement = document.getElementById('chart-container');
    if (!chartElement) return;

    if (!isFullscreen) {
      if (chartElement.requestFullscreen) {
        chartElement.requestFullscreen();
      } else if (chartElement.webkitRequestFullscreen) {
        chartElement.webkitRequestFullscreen();
      } else if (chartElement.msRequestFullscreen) {
        chartElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Process sensor data for charts
  const processChartData = () => {
    if (!sensorData.length) return [];
    const sorted = [...sensorData].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return sorted.slice(-24).map(item => ({
      time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: item.temperature,
      humidity: item.humidity,
      voc: item.voc > 50000 ? 50000 : item.voc,
      rawTime: new Date(item.created_at)
    }));
  };

  const chartData = processChartData();
  
  // Calculate statistics
  const calculateStats = () => {
    if (!sensorData.length) return { avgTemp: 0, maxTemp: 0, minTemp: 0, avgHumidity: 0, avgVOC: 0, alertCount: 0 };
    
    const temps = sensorData.map(d => d.temperature);
    const humidities = sensorData.map(d => d.humidity);
    const vocs = sensorData.map(d => d.voc).filter(v => v < 60000);
    
    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const avgHumidity = (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1);
    const avgVOC = (vocs.reduce((a, b) => a + b, 0) / vocs.length).toFixed(0);
    const alertCount = sensorData.filter(d => d.temperature > 34 || d.voc > 35000).length;
    
    return { avgTemp, maxTemp, minTemp, avgHumidity, avgVOC, alertCount, totalReadings: sensorData.length };
  };

  const stats = calculateStats();
  const latestReading = sensorData[0];
  const thresholdTemp = 34;
  const thresholdVOC = 35000;

  // Get trend indicator
  const getTrendIcon = (value, threshold) => {
    if (value > threshold) return <FaArrowUp className="text-red-500 text-xs" />;
    if (value < threshold) return <FaArrowDown className="text-green-500 text-xs" />;
    return <FaMinus className="text-yellow-500 text-xs" />;
  };

  // Extended data for filters
  const states = ['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Delhi', 'West Bengal', 'Telangana', 'Rajasthan'];
  const cities = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
    'Karnataka': ['Bengaluru', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
    'Delhi': ['New Delhi', 'Noida', 'Gurugram', 'Faridabad', 'Ghaziabad'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
    'Telangana': ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer']
  };
  const plants = ['Plant A', 'Plant B', 'Plant C', 'Plant D', 'Plant E', 'Plant F', 'Plant G', 'Plant H'];
  const zones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6'];
  const devices = ['Device 1', 'Device 2', 'Device 3', 'Device 4', 'Device 5', 'Device 6', 'Device 7', 'Device 8'];

  const tabs = [
    { id: 'thermal', label: 'Temperature', icon: <FaThermometerHalf />, color: '#f97316', dataKey: 'temperature', unit: '°C' },
    { id: 'humidity', label: 'Humidity', icon: <FaLeaf />, color: '#3b82f6', dataKey: 'humidity', unit: '%' },
    { id: 'voc', label: 'VOC', icon: <FaIndustry />, color: '#10b981', dataKey: 'voc', unit: 'ppb' },
    { id: 'acoustic', label: 'Acoustic', icon: <FaVolumeUp />, color: '#8b5cf6', dataKey: 'acoustic', unit: 'dB' },
    { id: 'hpi', label: 'HPI', icon: <FaHeartbeat />, color: '#ec4899', dataKey: 'hpi', unit: '' },
  ];

  const getTabContent = () => {
    if (!latestReading) return { value: '--', status: 'No Data', trend: '--', history: [0,0,0,0,0,0,0] };
    
    switch(activeTab) {
      case 'thermal': 
        const tempHistory = sensorData.slice(-7).map(d => d.temperature);
        return { 
          value: `${latestReading.temperature}°C`, 
          status: latestReading.temperature > thresholdTemp ? 'Alert' : 'Normal',
          trend: tempHistory.length > 1 ? (tempHistory[tempHistory.length-1] - tempHistory[0]).toFixed(1) : '0',
          history: tempHistory,
          color: '#f97316'
        };
      case 'humidity':
        const humidityHistory = sensorData.slice(-7).map(d => d.humidity);
        return { 
          value: `${latestReading.humidity}%`, 
          status: latestReading.humidity > 60 ? 'High' : latestReading.humidity < 30 ? 'Low' : 'Normal',
          trend: humidityHistory.length > 1 ? (humidityHistory[humidityHistory.length-1] - humidityHistory[0]).toFixed(1) : '0',
          history: humidityHistory,
          color: '#3b82f6'
        };
      case 'voc':
        const vocHistory = sensorData.slice(-7).map(d => d.voc > 50000 ? 50000 : d.voc);
        return { 
          value: latestReading.voc > 50000 ? '>50k' : `${latestReading.voc}`, 
          status: latestReading.voc > thresholdVOC ? 'Alert' : 'Normal',
          trend: vocHistory.length > 1 ? (vocHistory[vocHistory.length-1] - vocHistory[0]).toFixed(0) : '0',
          history: vocHistory,
          color: '#10b981'
        };
      default: return { value: '--', status: 'Normal', trend: '0', history: [0,0,0,0,0,0,0], color: '#8b5cf6' };
    }
  };

  const tabContent = getTabContent();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
              {p.name}: {p.value} {p.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleResetFilters = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedPlant('');
    setSelectedZone('');
    setSelectedDevice('');
    setDateFrom('2024-01-01');
    setDateTo('2024-12-31');
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
      

      {/* Filters Section - Reorganized */}
      {showFilters && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 mb-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaFilter className="text-purple-500" />
              Filter Options
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Reset All Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {/* States */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <FaMapMarkerAlt className="text-xs" /> State
              </label>
              <select 
                value={selectedState} 
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity(''); // Reset city when state changes
                }} 
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All States</option>
                {states.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Cities */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <FaCity className="text-xs" /> City
              </label>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500" 
                disabled={!selectedState}
              >
                <option value="">All Cities</option>
                {selectedState && cities[selectedState]?.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Plants */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <FaIndustry className="text-xs" /> Plant
              </label>
              <select 
                value={selectedPlant} 
                onChange={(e) => setSelectedPlant(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Plants</option>
                {plants.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Zones */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <FaChartBar className="text-xs" /> Zone
              </label>
              <select 
                value={selectedZone} 
                onChange={(e) => setSelectedZone(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Zones</option>
                {zones.map(z => <option key={z}>{z}</option>)}
              </select>
            </div>

            {/* Devices */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <FaMicrochip className="text-xs" /> Device
              </label>
              <select 
                value={selectedDevice} 
                onChange={(e) => setSelectedDevice(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Devices</option>
                {devices.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <FaCalendarAlt className="text-xs" /> From
              </label>
              <input 
                type="date" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500" 
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <FaCalendarAlt className="text-xs" /> To
              </label>
              <input 
                type="date" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500" 
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedState || selectedCity || selectedPlant || selectedZone || selectedDevice || (dateFrom !== '2024-01-01') || (dateTo !== '2024-12-31')) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {selectedState && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    State: {selectedState}
                    <button onClick={() => setSelectedState('')} className="hover:text-purple-900">×</button>
                  </span>
                )}
                {selectedCity && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    City: {selectedCity}
                    <button onClick={() => setSelectedCity('')} className="hover:text-blue-900">×</button>
                  </span>
                )}
                {selectedPlant && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    Plant: {selectedPlant}
                    <button onClick={() => setSelectedPlant('')} className="hover:text-green-900">×</button>
                  </span>
                )}
                {selectedZone && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                    Zone: {selectedZone}
                    <button onClick={() => setSelectedZone('')} className="hover:text-orange-900">×</button>
                  </span>
                )}
                {selectedDevice && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                    Device: {selectedDevice}
                    <button onClick={() => setSelectedDevice('')} className="hover:text-yellow-900">×</button>
                  </span>
                )}
                {dateFrom !== '2024-01-01' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    From: {dateFrom}
                    <button onClick={() => setDateFrom('2024-01-01')} className="hover:text-gray-900">×</button>
                  </span>
                )}
                {dateTo !== '2024-12-31' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    To: {dateTo}
                    <button onClick={() => setDateTo('2024-12-31')} className="hover:text-gray-900">×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Chart Area */}
      <div id="chart-container" className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaTachometerAlt className="text-purple-500" />
              REAL-TIME SENSOR DATA
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">Live monitoring • {sensorData.length} readings collected</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchSensorData} 
              disabled={loading}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50" 
              title="Refresh Data"
            >
              <FaSpinner className={loading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={handleDownload} 
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" 
              title="Download Data as Excel"
            >
              <FaFileDownload />
            </button>
            <button 
              onClick={toggleFullscreen} 
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" 
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs sm:text-sm font-medium">Temperature (°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs sm:text-sm font-medium">Humidity (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs sm:text-sm font-medium">VOC (ppb)</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Temperature" unit="°C" />
              <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Humidity" unit="%" />
              <Line yAxisId="left" type="monotone" dataKey="voc" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} name="VOC" unit="ppb" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/50 overflow-x-auto">
          <div className="flex min-w-max sm:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-purple-500 text-purple-600 bg-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-purple-500' : 'text-gray-400'}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 rounded-xl p-4 sm:p-5 shadow-inner">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Current Value</p>
                <p className="text-2xl sm:text-4xl font-bold text-gray-800">{tabContent.value}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tabContent.status === 'Alert' ? 'bg-red-100 text-red-600 animate-pulse' : 
                    tabContent.status === 'High' ? 'bg-orange-100 text-orange-600' :
                    tabContent.status === 'Low' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {tabContent.status}
                  </span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(parseFloat(tabContent.trend), 0)}
                    <span className="text-xs sm:text-sm text-gray-500">Trend: {tabContent.trend > 0 ? '+' : ''}{tabContent.trend}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-3">7-Day Trend History</p>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={tabContent.history.map((val, idx) => ({ day: `D${idx + 1}`, value: val }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill={tabContent.color}>
                    {tabContent.history.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry > (activeTab === 'thermal' ? thresholdTemp : activeTab === 'voc' ? thresholdVOC : 50) ? '#ef4444' : tabContent.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Readings Table */}
      <div className="mt-6 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaMicrochip className="text-purple-500" />
            Recent Sensor Readings
          </h3>
          <p className="text-xs text-gray-500 mt-1">Latest {Math.min(10, sensorData.length)} records</p>
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
              {sensorData.slice(0, 10).map((reading, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{reading.device_id}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-semibold ${reading.temperature > thresholdTemp ? 'text-red-600' : 'text-gray-700'}`}>
                      {reading.temperature}°C
                    </span>
                   </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{reading.humidity}%</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`${reading.voc > thresholdVOC ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                      {reading.voc > 50000 ? '>50k' : reading.voc}
                    </span>
                    </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(reading.created_at).toLocaleString()}</td>
                </tr>
              ))}
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