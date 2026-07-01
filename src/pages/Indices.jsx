// src/pages/Indices.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaFileExcel, 
  FaUpload, 
  FaDownload, 
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaSpinner,
  FaChartBar,
  FaChartArea,
  FaSync,
  FaClock,
  FaPlay,
  FaPause,
  FaStepForward,
  FaChartPie
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';

const Indices = () => {
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  const [chunkSize] = useState(100); // 100 entries per window
  const [updateInterval] = useState(5 * 60 * 1000); // 5 minutes
  const [progress, setProgress] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [timeWindow, setTimeWindow] = useState({ start: '', end: '', entries: 0 });
  
  const streamIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedAlertLevel, setSelectedAlertLevel] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [chartType, setChartType] = useState('line');
  const [selectedIndices, setSelectedIndices] = useState(['TCI', 'IAQI', 'VCI', 'ACI', 'HPI']);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#ef4444', '#ec4899', '#06b6d4', '#eab308'];

  // Load Excel file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const mappedData = jsonData.map((row, index) => ({
          id: index + 1,
          Timestamp: row.Timestamp || row['Timestamp'] || '',
          Zone: row.Zone || row['Zone'] || '',
          TCI: parseFloat(row.TCI) || row['TCI'] || 0,
          IAQI: parseFloat(row.IAQI) || row['IAQI'] || 0,
          VCI: parseFloat(row.VCI) || row['VCI'] || 0,
          ACI: parseFloat(row.ACI) || row['ACI'] || 0,
          HPI: parseFloat(row.HPI) || row['HPI'] || 0,
          Alert_Level: row.Alert_Level || row['Alert_Level'] || 'Normal',
          AI_Insight: row.AI_Insight || row['AI_Insight'] || ''
        }));

        mappedData.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
        
        setAllData(mappedData);
        
        const chunks = Math.ceil(mappedData.length / chunkSize);
        setTotalChunks(chunks);
        setCurrentChunk(0);
        setProgress(0);
        
        const firstChunk = mappedData.slice(0, chunkSize);
        setDisplayData(firstChunk);
        setFilteredData(firstChunk);
        setCurrentStartIndex(0);
        
        if (firstChunk.length > 0) {
          setTimeWindow({
            start: new Date(firstChunk[0].Timestamp).toLocaleString(),
            end: new Date(firstChunk[firstChunk.length - 1].Timestamp).toLocaleString(),
            entries: firstChunk.length
          });
        }
        
        setLoading(false);
        
        if (mappedData.length > chunkSize) {
          setIsStreaming(true);
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error reading the Excel file. Please check the format.');
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Start/Stop streaming
  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      if (currentStartIndex + chunkSize >= allData.length) {
        resetStreaming();
      }
    }
  };

  // Reset streaming to beginning
  const resetStreaming = () => {
    if (allData.length === 0) return;
    const firstChunk = allData.slice(0, chunkSize);
    setDisplayData(firstChunk);
    setFilteredData(firstChunk);
    setCurrentStartIndex(0);
    setCurrentChunk(0);
    setProgress(0);
    if (firstChunk.length > 0) {
      setTimeWindow({
        start: new Date(firstChunk[0].Timestamp).toLocaleString(),
        end: new Date(firstChunk[firstChunk.length - 1].Timestamp).toLocaleString(),
        entries: firstChunk.length
      });
    }
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }
    if (allData.length > chunkSize) {
      setIsStreaming(true);
    }
  };

  // Skip to next chunk
  const skipToNextChunk = () => {
    if (allData.length === 0) return;
    const nextStart = Math.min(currentStartIndex + chunkSize, allData.length - chunkSize);
    const nextChunk = allData.slice(nextStart, nextStart + chunkSize);
    setDisplayData(nextChunk);
    setFilteredData(nextChunk);
    setCurrentStartIndex(nextStart);
    setCurrentChunk(Math.floor(nextStart / chunkSize));
    setProgress((nextStart / allData.length) * 100);
    if (nextChunk.length > 0) {
      setTimeWindow({
        start: new Date(nextChunk[0].Timestamp).toLocaleString(),
        end: new Date(nextChunk[nextChunk.length - 1].Timestamp).toLocaleString(),
        entries: nextChunk.length
      });
    }
  };

  // Streaming effect
  useEffect(() => {
    if (allData.length === 0) return;

    if (isStreaming) {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }

      const interval = updateInterval / simulationSpeed;

      streamIntervalRef.current = setInterval(() => {
        const nextStart = Math.min(currentStartIndex + chunkSize, allData.length - chunkSize);
        
        if (nextStart + chunkSize > allData.length && currentStartIndex + chunkSize >= allData.length) {
          setIsStreaming(false);
          setProgress(100);
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
          }
          return;
        }

        const nextChunk = allData.slice(nextStart, nextStart + chunkSize);
        setDisplayData(nextChunk);
        setFilteredData(nextChunk);
        setCurrentStartIndex(nextStart);
        setCurrentChunk(Math.floor(nextStart / chunkSize));
        setProgress((nextStart / allData.length) * 100);
        
        if (nextChunk.length > 0) {
          setTimeWindow({
            start: new Date(nextChunk[0].Timestamp).toLocaleString(),
            end: new Date(nextChunk[nextChunk.length - 1].Timestamp).toLocaleString(),
            entries: nextChunk.length
          });
        }
      }, interval);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + (0.1 / simulationSpeed), 100);
          return newProgress;
        });
      }, 100);

    } else {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isStreaming, currentStartIndex, allData, chunkSize, simulationSpeed]);

  // Filter data based on search and filters
  useEffect(() => {
    let filtered = [...displayData];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.Zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.AI_Insight.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedZone) {
      filtered = filtered.filter(item => item.Zone === selectedZone);
    }

    if (selectedAlertLevel) {
      filtered = filtered.filter(item => item.Alert_Level === selectedAlertLevel);
    }

    if (dateFrom) {
      filtered = filtered.filter(item => 
        new Date(item.Timestamp) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filtered = filtered.filter(item => 
        new Date(item.Timestamp) <= new Date(dateTo)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedZone, selectedAlertLevel, dateFrom, dateTo, displayData]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedZone('');
    setSelectedAlertLevel('');
    setDateFrom('');
    setDateTo('');
  };

  const downloadData = () => {
    if (filteredData.length === 0) {
      alert('No data to download');
      return;
    }

    const exportData = filteredData.map(({ id, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Indices Data');
    XLSX.writeFile(wb, `indices_data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleIndiceToggle = (indice) => {
    setSelectedIndices(prev => 
      prev.includes(indice) 
        ? prev.filter(i => i !== indice)
        : [...prev, indice]
    );
  };

  // Get paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getAlertColor = (level) => {
    const colors = {
      'Normal': 'bg-green-100 text-green-800',
      'Watch': 'bg-yellow-100 text-yellow-800',
      'Warning': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getAlertIcon = (level) => {
    switch(level) {
      case 'Normal':
        return <FaCheckCircle className="text-green-500" />;
      case 'Watch':
        return <FaInfoCircle className="text-yellow-500" />;
      case 'Warning':
        return <FaExclamationTriangle className="text-orange-500" />;
      case 'Critical':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return null;
    }
  };

  // Prepare chart data
  const getChartData = () => {
    return filteredData.map(item => ({
      Timestamp: new Date(item.Timestamp).toLocaleString(),
      TCI: item.TCI,
      IAQI: item.IAQI,
      VCI: item.VCI,
      ACI: item.ACI,
      HPI: item.HPI,
      Zone: item.Zone,
      Alert_Level: item.Alert_Level
    }));
  };

  // Get average by zone
  const getZoneAverages = () => {
    const zonesMap = {};
    filteredData.forEach(item => {
      if (!zonesMap[item.Zone]) {
        zonesMap[item.Zone] = { TCI: 0, IAQI: 0, VCI: 0, ACI: 0, HPI: 0, count: 0 };
      }
      zonesMap[item.Zone].TCI += item.TCI;
      zonesMap[item.Zone].IAQI += item.IAQI;
      zonesMap[item.Zone].VCI += item.VCI;
      zonesMap[item.Zone].ACI += item.ACI;
      zonesMap[item.Zone].HPI += item.HPI;
      zonesMap[item.Zone].count += 1;
    });

    return Object.keys(zonesMap).map(zone => ({
      Zone: zone,
      TCI: (zonesMap[zone].TCI / zonesMap[zone].count).toFixed(2),
      IAQI: (zonesMap[zone].IAQI / zonesMap[zone].count).toFixed(2),
      VCI: (zonesMap[zone].VCI / zonesMap[zone].count).toFixed(2),
      ACI: (zonesMap[zone].ACI / zonesMap[zone].count).toFixed(2),
      HPI: (zonesMap[zone].HPI / zonesMap[zone].count).toFixed(2),
    }));
  };

  // Get alert level distribution
  const getAlertDistribution = () => {
    const distribution = {};
    filteredData.forEach(item => {
      distribution[item.Alert_Level] = (distribution[item.Alert_Level] || 0) + 1;
    });
    return Object.keys(distribution).map(key => ({
      name: key,
      value: distribution[key]
    }));
  };

  const chartData = getChartData();
  const zoneAverages = getZoneAverages();
  const alertDistribution = getAlertDistribution();

  // Custom Tooltip for charts - Enhanced with Zone and Alert Level
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const firstPayload = payload[0];
      const dataPoint = firstPayload?.payload;
      
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
          <div className="text-xs text-gray-500 mb-2">Timestamp: {label}</div>
          
          {dataPoint && (
            <div className="mb-2 pb-2 border-b border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Zone:</span>
                <span className="font-semibold text-gray-800">{dataPoint.Zone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-600">Alert Level:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAlertColor(dataPoint.Alert_Level || 'Normal')}`}>
                  {dataPoint.Alert_Level || 'Normal'}
                </span>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-gray-600">{entry.name}:</span>
                </span>
                <span className="font-semibold text-gray-800">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const getLineColor = (indice) => {
    const colors = {
      'TCI': '#8b5cf6',
      'IAQI': '#3b82f6',
      'VCI': '#10b981',
      'ACI': '#f97316',
      'HPI': '#ef4444'
    };
    return colors[indice] || '#6b7280';
  };

  // Calculate statistics
  const getStatistics = () => {
    if (filteredData.length === 0) return null;
    
    const avgTCI = (filteredData.reduce((sum, item) => sum + item.TCI, 0) / filteredData.length).toFixed(2);
    const avgIAQI = (filteredData.reduce((sum, item) => sum + item.IAQI, 0) / filteredData.length).toFixed(2);
    const avgVCI = (filteredData.reduce((sum, item) => sum + item.VCI, 0) / filteredData.length).toFixed(2);
    const avgACI = (filteredData.reduce((sum, item) => sum + item.ACI, 0) / filteredData.length).toFixed(2);
    const avgHPI = (filteredData.reduce((sum, item) => sum + item.HPI, 0) / filteredData.length).toFixed(2);
    
    const maxTCI = filteredData.length > 0 ? Math.max(...filteredData.map(item => item.TCI)) : 0;
    const minTCI = filteredData.length > 0 ? Math.min(...filteredData.map(item => item.TCI)) : 0;
    
    return { avgTCI, avgIAQI, avgVCI, avgACI, avgHPI, maxTCI, minTCI };
  };

  const stats = getStatistics();

  // Extract unique zones and alert levels for filters
  const zones = [...new Set(allData.map(item => item.Zone))];
  const alertLevels = [...new Set(allData.map(item => item.Alert_Level))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartLine className="text-purple-500" />
            Environmental Indices
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            100-Entry Window Analysis with Real-time Streaming
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span><FaClock className="inline mr-1" /> 
              {displayData.length > 0 && (
                <>
                  Window: {timeWindow.start} - {timeWindow.end}
                </>
              )}
            </span>
            <span>• {timeWindow.entries} entries in this window</span>
            <span>• Window {currentChunk + 1}/{totalChunks}</span>
            <span>• Progress: {Math.round(progress)}%</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <label className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-all cursor-pointer text-sm">
            <FaUpload />
            <span>Upload Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          
          {allData.length > 0 && (
            <>
              <button
                onClick={toggleStreaming}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-sm ${
                  isStreaming 
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200' 
                    : 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                }`}
              >
                {isStreaming ? <FaPause /> : <FaPlay />}
                {isStreaming ? 'Pause' : 'Resume'}
              </button>
              
              <button
                onClick={skipToNextChunk}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg flex items-center gap-1.5 hover:bg-blue-200 transition-all text-sm"
              >
                <FaStepForward /> Next 100 Entries
              </button>
              
              <button
                onClick={resetStreaming}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 border border-purple-300 rounded-lg flex items-center gap-1.5 hover:bg-purple-200 transition-all text-sm"
              >
                <FaSync /> Reset
              </button>
              
              <button
                onClick={downloadData}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-all text-sm"
              >
                <FaDownload /> Download
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {allData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                <span>100-Entry Window Streaming Progress ({timeWindow.entries} entries in current window)</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 whitespace-nowrap">
              Speed: 
              <select 
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="ml-1 px-1 py-0.5 border rounded text-xs"
              >
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
                <option value={10}>10x</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-[10px] text-gray-500">{isStreaming ? 'Streaming' : 'Paused'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
            <div className="text-[10px] text-gray-500">Avg TCI</div>
            <div className="text-lg font-bold text-purple-600">{stats.avgTCI}</div>
            <div className="text-[8px] text-gray-400">Max: {stats.maxTCI} | Min: {stats.minTCI}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
            <div className="text-[10px] text-gray-500">Avg IAQI</div>
            <div className="text-lg font-bold text-blue-600">{stats.avgIAQI}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
            <div className="text-[10px] text-gray-500">Avg VCI</div>
            <div className="text-lg font-bold text-green-600">{stats.avgVCI}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
            <div className="text-[10px] text-gray-500">Avg ACI</div>
            <div className="text-lg font-bold text-orange-600">{stats.avgACI}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
            <div className="text-[10px] text-gray-500">Avg HPI</div>
            <div className="text-lg font-bold text-red-600">{stats.avgHPI}</div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-4 overflow-hidden">
        <div className="px-3 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <FaFilter className="text-purple-500" />
            Filters
          </h2>
          <button
            onClick={resetFilters}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            Reset Filters
          </button>
        </div>
        
        <div className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] text-gray-500 mb-0.5">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search zones or insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] text-gray-500 mb-0.5">Zone</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
              >
                <option value="">All Zones</option>
                {zones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] text-gray-500 mb-0.5">Alert Level</label>
              <select
                value={selectedAlertLevel}
                onChange={(e) => setSelectedAlertLevel(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
              >
                <option value="">All Levels</option>
                {alertLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] text-gray-500 mb-0.5">Date From</label>
              <input
                type="datetime-local"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
              />
            </div>

            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] text-gray-500 mb-0.5">Date To</label>
              <input
                type="datetime-local"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Type Selector & Indices Selection */}
      {displayData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700">Chart Type:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    chartType === 'line' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FaChartLine className="inline mr-1" /> Line
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    chartType === 'bar' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FaChartBar className="inline mr-1" /> Bar
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    chartType === 'area' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FaChartArea className="inline mr-1" /> Area
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-700">Indices:</span>
              {['TCI', 'IAQI', 'VCI', 'ACI', 'HPI'].map(indice => (
                <label key={indice} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedIndices.includes(indice)}
                    onChange={() => handleIndiceToggle(indice)}
                    className="rounded text-purple-500 focus:ring-purple-500 w-3 h-3"
                  />
                  <span style={{ color: getLineColor(indice) }}>{indice}</span>
                </label>
              ))}
            </div>
            
            <div className="ml-auto text-xs text-gray-400">
              {timeWindow.entries} entries in this window
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {displayData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 mb-4">
          {/* Main Trend Chart - Full Width */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaChartLine className="text-purple-500" />
              100-Entry Indices Trends ({timeWindow.entries} Entries)
            </h4>
            <div className="text-[10px] text-gray-400 mb-2">
              Window: {timeWindow.start} - {timeWindow.end} ({timeWindow.entries} entries)
            </div>
            <ResponsiveContainer width="100%" height={450}>
              {chartType === 'line' && (
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="Timestamp" 
                    tick={{ fontSize: 9 }} 
                    interval={Math.floor(chartData.length / 15)} 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  {selectedIndices.map(indice => (
                    <Line
                      key={indice}
                      type="monotone"
                      dataKey={indice}
                      stroke={getLineColor(indice)}
                      strokeWidth={2}
                      dot={{ r: 1.5 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              )}

              {chartType === 'bar' && (
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="Timestamp" 
                    tick={{ fontSize: 9 }} 
                    interval={Math.floor(chartData.length / 15)}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  {selectedIndices.map((indice, index) => (
                    <Bar key={indice} dataKey={indice} fill={getLineColor(indice)} />
                  ))}
                </BarChart>
              )}

              {chartType === 'area' && (
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="Timestamp" 
                    tick={{ fontSize: 9 }} 
                    interval={Math.floor(chartData.length / 15)}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  {selectedIndices.map(indice => (
                    <Area
                      key={indice}
                      type="monotone"
                      dataKey={indice}
                      stroke={getLineColor(indice)}
                      fill={getLineColor(indice)}
                      fillOpacity={0.2}
                    />
                  ))}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Two Column Layout for secondary charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zone Averages Chart */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaChartBar className="text-purple-500" />
                Average Indices by Zone
              </h4>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={zoneAverages} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="Zone" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} width={50} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  {selectedIndices.map(indice => (
                    <Bar key={indice} dataKey={indice} fill={getLineColor(indice)} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Alert Level Distribution - Pie Chart */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaChartPie className="text-purple-500" />
                Alert Level Distribution
              </h4>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={alertDistribution}
                    cx="50%"
                    cy="45%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {alertDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Combined Chart - Full Width */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaChartArea className="text-purple-500" />
                Combined Analysis (Last 20 Entries)
              </h4>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData.slice(-20)} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="Timestamp" 
                    tick={{ fontSize: 9 }} 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  {selectedIndices.slice(0, 3).map(indice => (
                    <Area
                      key={indice}
                      type="monotone"
                      dataKey={indice}
                      stroke={getLineColor(indice)}
                      fill={getLineColor(indice)}
                      fillOpacity={0.15}
                    />
                  ))}
                  {selectedIndices.slice(3).map(indice => (
                    <Line
                      key={indice}
                      type="monotone"
                      dataKey={indice}
                      stroke={getLineColor(indice)}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden mt-6">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <FaChartLine className="text-purple-500" />
              100-Entry Window Data ({timeWindow.entries} Entries)
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Showing {currentItems.length} of {filteredData.length} records in current window
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <FaSpinner className="animate-spin text-3xl text-purple-500" />
          </div>
        ) : allData.length === 0 ? (
          <div className="p-8 text-center">
            <FaFileExcel className="text-5xl text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-600 mb-1">No Data Loaded</h3>
            <p className="text-sm text-gray-400">
              Upload an Excel file to view environmental indices data with 100-entry windows
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">#</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">Timestamp</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">Zone</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">TCI</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">IAQI</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">VCI</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">ACI</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">HPI</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">Alert Level</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600">AI Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-[11px] text-gray-500">{indexOfFirstItem + index + 1}</td>
                    <td className="px-3 py-2 text-[11px] text-gray-700">
                      {new Date(item.Timestamp).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-[11px] font-medium text-gray-700">{item.Zone}</td>
                    <td className="px-3 py-2 text-[11px] text-purple-600 font-semibold">{item.TCI}</td>
                    <td className="px-3 py-2 text-[11px] text-blue-600 font-semibold">{item.IAQI}</td>
                    <td className="px-3 py-2 text-[11px] text-green-600 font-semibold">{item.VCI}</td>
                    <td className="px-3 py-2 text-[11px] text-orange-600 font-semibold">{item.ACI}</td>
                    <td className="px-3 py-2 text-[11px] text-red-600 font-semibold">{item.HPI}</td>
                    <td className="px-3 py-2 text-[11px]">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${getAlertColor(item.Alert_Level)}`}>
                        {getAlertIcon(item.Alert_Level)}
                        {item.Alert_Level}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-gray-600 max-w-[200px] truncate" title={item.AI_Insight}>
                      {item.AI_Insight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="text-[10px] text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Indices;