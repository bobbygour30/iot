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
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [dateFrom, setDateFrom] = useState('2024-03-01');
  const [dateTo, setDateTo] = useState('2024-03-15');
  const [isMobile, setIsMobile] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Multi-select parameters - like indices selection in reports
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
    return () => clearInterval(interval); // FIXED: changed from cancelInterval to clearInterval
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

  // Toggle fullscreen for chart
  const toggleFullscreen = () => {
    const chartElement = document.getElementById('chart-container');
    if (!chartElement) return;

    if (!isFullscreen) {
      if (chartElement.requestFullscreen) {
        chartElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
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

  // Handle parameter toggle - like index toggle in reports
  const handleParameterToggle = (parameterId) => {
    if (selectedParameters.includes(parameterId)) {
      setSelectedParameters(selectedParameters.filter(p => p !== parameterId));
    } else {
      setSelectedParameters([...selectedParameters, parameterId]);
    }
  };

  // Get color class for parameter
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

  // Get line color for chart
  const getLineColor = (parameterId) => {
    const colors = {
      temperature: '#f97316',
      humidity: '#3b82f6',
      voc: '#10b981',
      airVelocity: '#06b6d4',
      pm: '#ef4444',
      co2: '#8b5cf6',
      lux: '#f59e0b',
      noise: '#ec4899'
    };
    return colors[parameterId] || '#888888';
  };

  const handleResetFilters = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedPlant('');
    setSelectedZone('');
    setSelectedDevice('');
    setDateFrom('2024-03-01');
    setDateTo('2024-03-15');
  };

  // Custom Tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-2">{label}</p>
          {payload.map((p, index) => (
            <p key={index} className="text-sm font-semibold" style={{ color: p.color }}>
              {p.name}: {p.value} {p.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
          <p className="text-gray-500 mt-1">Real-time environmental data from your zones</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <FaClock className="text-xs" />
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchSensorData} 
            disabled={loading}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all disabled:opacity-50" 
          >
            <FaSpinner className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button 
            onClick={handleDownload} 
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all"
          >
            <FaFileDownload /> Export
          </button>
        </div>
      </div>

      {/* Filters Section - Non-collapsible, styled like reference component */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFilter className="text-purple-500" />
          Filter Options
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* State Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            >
              <option value="">All States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            >
              <option value="">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Chennai">Chennai</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          {/* Plant Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plant</label>
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            >
              <option value="">All Plants</option>
              <option value="Plant A">Plant A</option>
              <option value="Plant B">Plant B</option>
              <option value="Plant C">Plant C</option>
              <option value="Plant D">Plant D</option>
            </select>
          </div>

          {/* Zone Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            >
              <option value="">All Zones</option>
              <option value="Zone 1">Zone 1</option>
              <option value="Zone 2">Zone 2</option>
              <option value="Zone 3">Zone 3</option>
              <option value="Zone 4">Zone 4</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Device Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            >
              <option value="">All Devices</option>
              <option value="Device 1">Device 1</option>
              <option value="Device 2">Device 2</option>
              <option value="Device 3">Device 3</option>
              <option value="Device 4">Device 4</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>

        {/* Reset Filters Button */}
        <div className="flex justify-end">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium border border-purple-200 rounded-lg hover:bg-purple-50 transition-all"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Parameters Selection - Like Indices Selection in Reports */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <FaChartBar className="text-purple-500" />
          Select Parameters to Display
        </label>
        <div className="flex flex-wrap gap-3">
          {parameters.map((param) => (
            <label 
              key={param.id} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                selectedParameters.includes(param.id)
                  ? 'bg-purple-100 border border-purple-300 shadow-sm'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <input 
                type="checkbox" 
                checked={selectedParameters.includes(param.id)}
                onChange={() => handleParameterToggle(param.id)}
                className="rounded text-purple-500 focus:ring-purple-500 w-4 h-4" 
                disabled={param.comingSoon}
              />
              <span className={getParameterColorClass(param.color)}>
                {param.icon}
              </span>
              <span className={`text-sm font-medium ${param.comingSoon ? 'text-gray-400' : 'text-gray-700'}`}>
                {param.name}
              </span>
              {param.comingSoon && (
                <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full ml-1">
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

      {/* Current Values Cards for Selected Parameters */}
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
          
          const latestValue = chartData.length > 0 ? chartData[chartData.length - 1][param.dataKey] : null;
          const values = chartData.map(d => d[param.dataKey]).filter(v => v !== undefined && v !== null);
          const avgValue = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : null;
          
          return (
            <div key={param.id} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <span className={getParameterColorClass(param.color)}>{param.icon}</span>
                  {param.name}
                </p>
                <FaCheckCircle className="text-green-500 text-xs" />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {latestValue !== undefined && latestValue !== null ? `${latestValue}${param.unit}` : '--'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Avg: {avgValue !== null ? `${avgValue}${param.unit}` : '--'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Chart Area - Shows Multiple Lines for Selected Parameters */}
      <div id="chart-container" className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaTachometerAlt className="text-purple-500" />
              REAL-TIME SENSOR TRENDS
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">Live monitoring • {sensorData.length} readings collected</p>
          </div>
          <div className="flex gap-2">
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
          {/* Legend for selected parameters */}
          <div className="mb-4 flex flex-wrap gap-4">
            {selectedParameters.map((paramId) => {
              const param = parameters.find(p => p.id === paramId);
              if (param.comingSoon) return null;
              return (
                <div key={param.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getLineColor(param.id) }}></div>
                  <span className="text-xs sm:text-sm font-medium">{param.name} ({param.unit})</span>
                </div>
              );
            })}
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedParameters.map((paramId) => {
                const param = parameters.find(p => p.id === paramId);
                if (param.comingSoon) return null;
                return (
                  <Line 
                    key={param.id}
                    type="monotone" 
                    dataKey={param.dataKey} 
                    stroke={getLineColor(param.id)} 
                    strokeWidth={2.5} 
                    dot={{ r: 3 }} 
                    activeDot={{ r: 6 }} 
                    name={param.name} 
                    unit={param.unit} 
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Readings Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
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