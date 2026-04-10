import React, { useState } from 'react';
import { 
  FaThermometerHalf, 
  FaLeaf, 
  FaVolumeUp, 
  FaEye, 
  FaHeartbeat,
  FaChartLine,
  FaCalendarAlt,
  FaDownload,
  FaInfoCircle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaMapMarkerAlt,
  FaIndustry,
  FaSearch,
  FaFilter,
  FaChartBar,
  FaTachometerAlt,
  FaSignal,
  FaMicrophone,
  FaCamera,
  FaMedkit
} from 'react-icons/fa';

const Indices = () => {
  const [selectedIndex, setSelectedIndex] = useState('thermal');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Indices Data
  const indices = [
    {
      id: 'thermal',
      name: 'Thermal Index',
      icon: <FaThermometerHalf />,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-600',
      currentValue: 42,
      unit: '°C',
      status: 'alert',
      trend: '+2.3',
      trendDirection: 'up',
      threshold: 28,
      description: 'Temperature monitoring across all zones',
      history: [38, 39, 41, 42, 43, 42, 41, 40, 42, 44, 43, 42],
      zones: {
        'Zone A': 38,
        'Zone B': 42,
        'Zone C': 35,
        'Zone D': 45
      },
      recommendations: 'Critical temperature detected in Zone D. Immediate attention required.',
      lastUpdated: '2024-03-15 14:30:00'
    },
    {
      id: 'aqi',
      name: 'AQI Index',
      icon: <FaLeaf />,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600',
      currentValue: 156,
      unit: 'AQI',
      status: 'moderate',
      trend: '-5.2',
      trendDirection: 'down',
      threshold: 100,
      description: 'Air Quality Index monitoring',
      history: [165, 162, 158, 155, 156, 154, 152, 150, 148, 145, 147, 156],
      zones: {
        'Zone A': 145,
        'Zone B': 156,
        'Zone C': 128,
        'Zone D': 168
      },
      recommendations: 'Air quality is moderate. Consider ventilation improvements in Zone D.',
      lastUpdated: '2024-03-15 14:30:00'
    },
    {
      id: 'acoustic',
      name: 'Acoustic Index',
      icon: <FaVolumeUp />,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      currentValue: 68,
      unit: 'dB',
      status: 'safe',
      trend: '-2.1',
      trendDirection: 'down',
      threshold: 85,
      description: 'Noise level monitoring',
      history: [72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 65, 68],
      zones: {
        'Zone A': 65,
        'Zone B': 68,
        'Zone C': 72,
        'Zone D': 62
      },
      recommendations: 'Noise levels are within safe limits. Continue monitoring.',
      lastUpdated: '2024-03-15 14:30:00'
    },
    {
      id: 'visual',
      name: 'Visual Index',
      icon: <FaEye />,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      currentValue: 92,
      unit: '%',
      status: 'safe',
      trend: '+1.2',
      trendDirection: 'up',
      threshold: 80,
      description: 'Visual clarity and camera feed quality',
      history: [88, 89, 90, 91, 92, 92, 93, 93, 94, 94, 93, 92],
      zones: {
        'Zone A': 94,
        'Zone B': 92,
        'Zone C': 89,
        'Zone D': 93
      },
      recommendations: 'Visual systems operating optimally. Zone C may need camera adjustment.',
      lastUpdated: '2024-03-15 14:30:00'
    },
    {
      id: 'hpi',
      name: 'HPI',
      icon: <FaHeartbeat />,
      color: 'pink',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-600',
      currentValue: 78,
      unit: 'HPI',
      status: 'good',
      trend: '+3.4',
      trendDirection: 'up',
      threshold: 70,
      description: 'Health Performance Index',
      history: [72, 73, 74, 75, 76, 77, 78, 79, 80, 79, 78, 78],
      zones: {
        'Zone A': 82,
        'Zone B': 78,
        'Zone C': 72,
        'Zone D': 76
      },
      recommendations: 'Overall health performance is good. Zone C needs improvement.',
      lastUpdated: '2024-03-15 14:30:00'
    }
  ];

  const currentIndex = indices.find(i => i.id === selectedIndex);
  const periods = [
    { id: 'day', label: 'Last 24 Hours', days: 1 },
    { id: 'week', label: 'Last 7 Days', days: 7 },
    { id: 'month', label: 'Last 30 Days', days: 30 },
    { id: 'year', label: 'Last Year', days: 365 }
  ];

  // Filter zones based on selectedZone
  const getFilteredZones = () => {
    if (selectedZone === 'all') {
      return Object.entries(currentIndex.zones);
    }
    return Object.entries(currentIndex.zones).filter(([zone]) => zone === selectedZone);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'alert': return 'bg-red-100 text-red-600';
      case 'moderate': return 'bg-yellow-100 text-yellow-600';
      case 'safe': return 'bg-green-100 text-green-600';
      case 'good': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'alert': return <FaExclamationTriangle />;
      case 'moderate': return <FaInfoCircle />;
      case 'safe': return <FaCheckCircle />;
      case 'good': return <FaCheckCircle />;
      default: return <FaInfoCircle />;
    }
  };

  const getTrendIcon = (direction) => {
    if (direction === 'up') return <FaArrowUp className="text-red-500" />;
    if (direction === 'down') return <FaArrowDown className="text-green-500" />;
    return <FaMinus className="text-gray-500" />;
  };

  const getMaxValue = (history) => {
    return Math.max(...history) + 10;
  };

  // Zone options for filter
  const zoneOptions = ['all', 'Zone A', 'Zone B', 'Zone C', 'Zone D'];

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Performance Indices</h1>
          <p className="text-gray-500 mt-1">Real-time monitoring of all performance metrics</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all">
            <FaCalendarAlt /> <span className="hidden sm:inline">Select Date</span>
          </button>
          <button className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all">
            <FaDownload /> <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar - Using searchTerm */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search indices, zones, or metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-purple-300"
            >
              {zoneOptions.map(zone => (
                <option key={zone} value={zone}>
                  {zone === 'all' ? 'All Zones' : zone}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-2 bg-gray-100 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-all"
            >
              <FaInfoCircle />
              <span className="hidden sm:inline">{showDetails ? 'Hide' : 'Show'} Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Indices Cards - Horizontal Scroll on Mobile */}
      <div className="overflow-x-auto pb-4 mb-6 -mx-4 px-4">
        <div className="flex gap-4 min-w-max sm:min-w-0">
          {indices.map((index) => (
            <button
              key={index.id}
              onClick={() => setSelectedIndex(index.id)}
              className={`p-4 rounded-2xl transition-all min-w-[160px] text-left ${
                selectedIndex === index.id 
                  ? `${index.bgColor} border-2 ${index.borderColor} shadow-lg` 
                  : 'bg-white border border-gray-200 hover:shadow-md'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${index.bgColor} flex items-center justify-center ${index.textColor} mb-3`}>
                {index.icon}
              </div>
              <h3 className="font-semibold text-gray-800">{index.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-gray-800">{index.currentValue}</span>
                <span className="text-sm text-gray-500">{index.unit}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(index.trendDirection)}
                <span className={`text-xs ${index.trendDirection === 'up' ? 'text-red-500' : index.trendDirection === 'down' ? 'text-green-500' : 'text-gray-500'}`}>
                  {index.trend}%
                </span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(index.status)}`}>
                  {index.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Chart and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${currentIndex.bgColor} flex items-center justify-center ${currentIndex.textColor}`}>
                    {currentIndex.icon}
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">{currentIndex.name} Trend</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">{currentIndex.description}</p>
              </div>
              <div className="flex gap-2">
                {periods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      selectedPeriod === period.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="relative">
              <div className="h-64 sm:h-80">
                <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="40"
                      y1={40 + i * 65}
                      x2="760"
                      y2={40 + i * 65}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="4"
                    />
                  ))}
                  
                  {/* Threshold Line */}
                  <line
                    x1="40"
                    y1={40 + ((currentIndex.threshold / getMaxValue(currentIndex.history)) * 260)}
                    x2="760"
                    y2={40 + ((currentIndex.threshold / getMaxValue(currentIndex.history)) * 260)}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="6"
                  />
                  <text x="765" y={40 + ((currentIndex.threshold / getMaxValue(currentIndex.history)) * 260)} fill="#ef4444" fontSize="10">
                    Threshold: {currentIndex.threshold}{currentIndex.unit}
                  </text>

                  {/* Data Line */}
                  <polyline
                    points={currentIndex.history.map((value, i) => {
                      const x = 40 + (i * (720 / (currentIndex.history.length - 1)));
                      const y = 40 + ((1 - (value / getMaxValue(currentIndex.history))) * 260);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke={currentIndex.color === 'orange' ? '#f97316' : 
                            currentIndex.color === 'green' ? '#22c55e' :
                            currentIndex.color === 'blue' ? '#3b82f6' :
                            currentIndex.color === 'purple' ? '#a855f7' : '#ec4899'}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  {currentIndex.history.map((value, i) => {
                    const x = 40 + (i * (720 / (currentIndex.history.length - 1)));
                    const y = 40 + ((1 - (value / getMaxValue(currentIndex.history))) * 260);
                    const isAboveThreshold = value >= currentIndex.threshold;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3"
                        fill={isAboveThreshold ? '#ef4444' : 
                              currentIndex.color === 'orange' ? '#f97316' :
                              currentIndex.color === 'green' ? '#22c55e' :
                              currentIndex.color === 'blue' ? '#3b82f6' :
                              currentIndex.color === 'purple' ? '#a855f7' : '#ec4899'}
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-4 text-xs text-gray-400">
              {currentIndex.history.map((_, i) => (
                <span key={i}>Day {i + 1}</span>
              ))}
            </div>
          </div>

          {/* Zone-wise Distribution - Using selectedZone filter */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FaMapMarkerAlt className="text-purple-500" />
                Zone-wise Distribution
              </h3>
              <div className="text-sm text-gray-500">
                {selectedZone === 'all' ? 'All Zones' : `Showing: ${selectedZone}`}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {getFilteredZones().map(([zone, value]) => {
                const isAboveThreshold = value >= currentIndex.threshold;
                const percentage = (value / getMaxValue(currentIndex.history)) * 100;
                return (
                  <div key={zone} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{zone}</span>
                      <span className={`text-sm font-bold ${isAboveThreshold ? 'text-red-600' : 'text-green-600'}`}>
                        {value}{currentIndex.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`rounded-full h-2 transition-all ${
                          currentIndex.color === 'orange' ? 'bg-orange-500' :
                          currentIndex.color === 'green' ? 'bg-green-500' :
                          currentIndex.color === 'blue' ? 'bg-blue-500' :
                          currentIndex.color === 'purple' ? 'bg-purple-500' : 'bg-pink-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    {isAboveThreshold && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <FaExclamationTriangle className="text-xs" />
                        Above threshold
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Section - Details and Recommendations */}
        <div className="space-y-6">
          {/* Current Status Card */}
          <div className={`${currentIndex.bgColor} rounded-2xl shadow-lg border ${currentIndex.borderColor} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center ${currentIndex.textColor}`}>
                  {currentIndex.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Value</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {currentIndex.currentValue}{currentIndex.unit}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(currentIndex.status)}`}>
                {getStatusIcon(currentIndex.status)}
                {currentIndex.status.toUpperCase()}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Threshold</span>
                <span className="text-sm font-medium">{currentIndex.threshold}{currentIndex.unit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">24h Trend</span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(currentIndex.trendDirection)}
                  <span className={`text-sm font-medium ${
                    currentIndex.trendDirection === 'up' ? 'text-red-500' : 
                    currentIndex.trendDirection === 'down' ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {currentIndex.trend}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <FaClock className="text-xs" />
                  {new Date(currentIndex.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Progress to Threshold */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress to Threshold</span>
                <span>{Math.min(100, Math.round((currentIndex.currentValue / currentIndex.threshold) * 100))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`rounded-full h-2 transition-all ${
                    currentIndex.currentValue >= currentIndex.threshold ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (currentIndex.currentValue / currentIndex.threshold) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaInfoCircle className="text-purple-500" />
              Recommendations
            </h3>
            <div className={`p-3 rounded-xl ${
              currentIndex.status === 'alert' ? 'bg-red-50' :
              currentIndex.status === 'moderate' ? 'bg-yellow-50' : 'bg-green-50'
            }`}>
              <p className="text-sm text-gray-700">{currentIndex.recommendations}</p>
            </div>
          </div>

          {/* Historical Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaChartLine className="text-purple-500" />
              Historical Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Highest (30d)</span>
                <span className="text-sm font-medium text-red-600">
                  {Math.max(...currentIndex.history)}{currentIndex.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Lowest (30d)</span>
                <span className="text-sm font-medium text-green-600">
                  {Math.min(...currentIndex.history)}{currentIndex.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Average (30d)</span>
                <span className="text-sm font-medium text-gray-800">
                  {Math.round(currentIndex.history.reduce((a, b) => a + b, 0) / currentIndex.history.length)}{currentIndex.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Days Above Threshold</span>
                <span className="text-sm font-medium text-orange-600">
                  {currentIndex.history.filter(v => v >= currentIndex.threshold).length} days
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Card - Using showDetails toggle */}
          {showDetails && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-5 text-white animate-fadeIn">
              <h3 className="font-semibold mb-3">Detailed Analysis</h3>
              <div className="space-y-2 text-sm">
                <p>• Peak hours detected between 2 PM - 4 PM</p>
                <p>• Weekend values show 15% lower readings</p>
                <p>• Zone D requires immediate attention</p>
                <p>• Maintenance scheduled for next week</p>
              </div>
            </div>
          )}

          {/* Overall Health Score */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg p-5 text-white">
            <h3 className="font-semibold mb-3">Overall Health Score</h3>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {Math.round(indices.reduce((acc, i) => {
                  const percentage = (i.currentValue / i.threshold) * 100;
                  return acc + (percentage <= 100 ? 100 - percentage : 0);
                }, 0) / indices.length)}
              </div>
              <p className="text-purple-100">out of 100</p>
              <div className="mt-4 pt-4 border-t border-purple-300">
                <p className="text-sm text-purple-100">System Performance Rating</p>
                <p className="text-lg font-semibold">Good</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Indices;