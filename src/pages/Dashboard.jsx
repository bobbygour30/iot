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
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-12-31');
  const [isMobile, setIsMobile] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [activeGraph, setActiveGraph] = useState('temperature');

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

  // Graph configurations - only showing data from API
  const graphs = [
    { 
      id: 'temperature', 
      label: 'TEMPERATURE', 
      icon: <FaThermometerHalf />, 
      color: '#f97316', 
      dataKey: 'temperature', 
      unit: '°C',
      description: 'Temperature readings in degrees Celsius'
    },
    { 
      id: 'humidity', 
      label: 'RELATIVE HUMIDITY', 
      icon: <FaTint />, 
      color: '#3b82f6', 
      dataKey: 'humidity', 
      unit: '%',
      description: 'Relative humidity percentage'
    },
    { 
      id: 'voc', 
      label: 'TVOC', 
      icon: <FaFlask />, 
      color: '#10b981', 
      dataKey: 'voc', 
      unit: 'ppb',
      description: 'Total Volatile Organic Compounds'
    },
    { 
      id: 'airVelocity', 
      label: 'AIR VELOCITY', 
      icon: <FaWind />, 
      color: '#06b6d4', 
      dataKey: 'airVelocity', 
      unit: 'm/s',
      description: 'Air velocity in meters per second',
      comingSoon: true
    },
    { 
      id: 'pm', 
      label: 'PM - 2.5/10', 
      icon: <FaSmog />, 
      color: '#ef4444', 
      dataKey: 'pm', 
      unit: 'µg/m³',
      description: 'Particulate Matter 2.5 and 10',
      comingSoon: true
    },
    { 
      id: 'co2', 
      label: 'CO2', 
      icon: <FaFire />, 
      color: '#8b5cf6', 
      dataKey: 'co2', 
      unit: 'ppm',
      description: 'Carbon Dioxide levels',
      comingSoon: true
    },
    { 
      id: 'lux', 
      label: 'LUX', 
      icon: <FaMoon />, 
      color: '#f59e0b', 
      dataKey: 'lux', 
      unit: 'lx',
      description: 'Light intensity',
      comingSoon: true
    },
    { 
      id: 'noise', 
      label: 'NOISE - AV/PEAK', 
      icon: <FaVolumeUp />, 
      color: '#ec4899', 
      dataKey: 'noise', 
      unit: 'dB',
      description: 'Average and Peak noise levels',
      comingSoon: true
    }
  ];

  // Calculate current value for the active graph
  const getCurrentValue = () => {
    if (!chartData.length) return '--';
    const latest = chartData[chartData.length - 1];
    const activeGraphConfig = graphs.find(g => g.id === activeGraph);
    
    if (activeGraphConfig?.comingSoon) {
      return 'Coming Soon';
    }
    
    const value = latest[activeGraphConfig?.dataKey];
    if (value === undefined || value === null) return '--';
    return `${value} ${activeGraphConfig?.unit || ''}`;
  };

  // Calculate average for the active graph
  const getAverageValue = () => {
    if (!chartData.length) return '--';
    const activeGraphConfig = graphs.find(g => g.id === activeGraph);
    
    if (activeGraphConfig?.comingSoon) {
      return '--';
    }
    
    const values = chartData.map(d => d[activeGraphConfig?.dataKey]).filter(v => v !== undefined && v !== null);
    if (values.length === 0) return '--';
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return `${avg.toFixed(1)} ${activeGraphConfig?.unit || ''}`;
  };

  // Get trend
  const getTrend = () => {
    if (chartData.length < 2) return { value: 0, direction: 'stable' };
    const activeGraphConfig = graphs.find(g => g.id === activeGraph);
    
    if (activeGraphConfig?.comingSoon) {
      return { value: 0, direction: 'stable' };
    }
    
    const latest = chartData[chartData.length - 1][activeGraphConfig?.dataKey];
    const previous = chartData[chartData.length - 2][activeGraphConfig?.dataKey];
    
    if (latest === undefined || previous === undefined) return { value: 0, direction: 'stable' };
    
    const change = latest - previous;
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
    return { value: Math.abs(change).toFixed(1), direction };
  };

  const trend = getTrend();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const activeGraphConfig = graphs.find(g => g.id === activeGraph);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-sm font-semibold" style={{ color: activeGraphConfig?.color }}>
            {activeGraphConfig?.label}: {payload[0].value} {activeGraphConfig?.unit}
          </p>
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
      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 mb-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaFilter className="text-purple-500" />
              Filter Options
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Hide Filters
              </button>
              <button
                onClick={handleResetFilters}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Reset All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <FaMapMarkerAlt className="text-xs" /> State
              </label>
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All States</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <FaCity className="text-xs" /> City
              </label>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Bengaluru">Bengaluru</option>
              </select>
            </div>

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
                <option value="Plant A">Plant A</option>
                <option value="Plant B">Plant B</option>
                <option value="Plant C">Plant C</option>
              </select>
            </div>

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
                <option value="Zone 1">Zone 1</option>
                <option value="Zone 2">Zone 2</option>
                <option value="Zone 3">Zone 3</option>
              </select>
            </div>

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
                <option value="Device 1">Device 1</option>
                <option value="Device 2">Device 2</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
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
              <div className="flex-1">
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
          </div>
        </div>
      )}

      {/* Graph Selector Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {graphs.map((graph) => (
          <button
            key={graph.id}
            onClick={() => setActiveGraph(graph.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeGraph === graph.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span className={activeGraph === graph.id ? 'text-white' : `text-${graph.color}`}>
              {graph.icon}
            </span>
            {graph.label}
            {graph.comingSoon && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full ml-1">
                Soon
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Current Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <p className="text-gray-500 text-sm flex items-center gap-2">
            {graphs.find(g => g.id === activeGraph)?.icon}
            Current {graphs.find(g => g.id === activeGraph)?.label}
          </p>
          <p className="text-2xl font-bold text-gray-800">{getCurrentValue()}</p>
          <div className="flex items-center gap-2 mt-2">
            {trend.direction === 'up' && <FaArrowUp className="text-red-500" />}
            {trend.direction === 'down' && <FaArrowDown className="text-green-500" />}
            {trend.direction === 'stable' && <FaMinus className="text-yellow-500" />}
            <span className="text-xs text-gray-500">Trend: {trend.value} {graphs.find(g => g.id === activeGraph)?.unit}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <p className="text-gray-500 text-sm">Average Value (24h)</p>
          <p className="text-2xl font-bold text-gray-800">{getAverageValue()}</p>
          <p className="text-xs text-gray-500 mt-2">Based on last 24 readings</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <p className="text-gray-500 text-sm">Data Points</p>
          <p className="text-2xl font-bold text-gray-800">{chartData.length}</p>
          <p className="text-xs text-gray-500 mt-2">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Main Chart Area */}
      <div id="chart-container" className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              {graphs.find(g => g.id === activeGraph)?.icon}
              {graphs.find(g => g.id === activeGraph)?.label} TREND
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">{graphs.find(g => g.id === activeGraph)?.description}</p>
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
            {!showFilters && (
              <button 
                onClick={() => setShowFilters(true)} 
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" 
                title="Show Filters"
              >
                <FaFilter />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {graphs.find(g => g.id === activeGraph)?.comingSoon ? (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  {graphs.find(g => g.id === activeGraph)?.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Coming Soon</h3>
                <p className="text-gray-500">Support for {graphs.find(g => g.id === activeGraph)?.label} will be available in the next update.</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={graphs.find(g => g.id === activeGraph)?.dataKey} 
                  stroke={graphs.find(g => g.id === activeGraph)?.color} 
                  strokeWidth={2.5} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 6 }} 
                  name={graphs.find(g => g.id === activeGraph)?.label} 
                  unit={graphs.find(g => g.id === activeGraph)?.unit} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
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