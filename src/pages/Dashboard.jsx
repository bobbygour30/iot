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
  FaMinus
} from 'react-icons/fa';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('thermal');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-12-31');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch sensor data
  const fetchSensorData = async () => {
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
    const interval = setInterval(fetchSensorData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Process sensor data for charts
  const processChartData = () => {
    if (!sensorData.length) return [];
    const sorted = [...sensorData].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return sorted.slice(-24).map(item => ({
      time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: item.temperature,
      humidity: item.humidity,
      voc: item.voc > 50000 ? 50000 : item.voc, // Cap VOC for better visualization
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

  const states = ['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Delhi'];
  const cities = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
    'Karnataka': ['Bengaluru', 'Mysore', 'Hubli'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Delhi': ['New Delhi', 'Noida', 'Gurugram']
  };
  const plants = ['Plant A', 'Plant B', 'Plant C', 'Plant D'];
  const zones = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];

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

  // Custom Tooltip
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
      {/* Welcome Banner with Live Status */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-2xl p-4 sm:p-6 mb-6 text-white shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Welcome back, John! 👋</h2>
            <p className="text-purple-100 mt-1">Real-time sensor monitoring dashboard</p>
            <div className="flex items-center gap-2 mt-3 text-xs bg-white/20 rounded-full px-3 py-1 w-fit">
              <FaClock className="text-xs" />
              <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs">
              Live Data
            </div>
            <div className="text-xs mt-2 opacity-75">
              Auto-refresh: 30s
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards with Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Temperature (Avg)</p>
            <FaThermometerHalf className="text-orange-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.avgTemp}°C</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">Max: {stats.maxTemp}°C</span>
            <span className="text-xs text-gray-500">Min: {stats.minTemp}°C</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Humidity (Avg)</p>
            <FaLeaf className="text-blue-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.avgHumidity}%</p>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(stats.avgHumidity / 100) * 100}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">VOC (Avg)</p>
            <FaIndustry className="text-green-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.avgVOC}</p>
          <p className="text-green-500 text-xs mt-1">ppb</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-sm">Active Alerts</p>
            <FaExclamationTriangle className="text-red-500 text-xl" />
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.alertCount}</p>
          <p className="text-red-500 text-xs mt-1">Requires attention</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 mb-6 shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaMapMarkerAlt className="text-xs" /> State
            </label>
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500">
              <option value="">All States</option>
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaCity className="text-xs" /> City
            </label>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500" disabled={!selectedState}>
              <option value="">All Cities</option>
              {selectedState && cities[selectedState]?.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaIndustry className="text-xs" /> Plant
            </label>
            <select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500">
              <option value="">All Plants</option>
              {plants.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaChartBar className="text-xs" /> Zone
            </label>
            <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500">
              <option value="">All Zones</option>
              {zones.map(z => <option key={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaCalendarAlt className="text-xs" /> From
            </label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaCalendarAlt className="text-xs" /> To
            </label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaChartBar className="text-xs" /> Zone Filter
            </label>
            <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-purple-500">
              <option value="all">All Zones</option>
              <option value="zone1">Zone 1</option>
              <option value="zone2">Zone 2</option>
              <option value="zone3">Zone 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Chart Area with Recharts */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaTachometerAlt className="text-purple-500" />
              REAL-TIME SENSOR DATA
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">Live monitoring • {sensorData.length} readings collected</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchSensorData} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
              <FaSpinner className={loading ? "animate-spin" : ""} />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><FaFileDownload /></button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"><FaExpand /></button>
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

      {/* Analytics Tabs with Real Data */}
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