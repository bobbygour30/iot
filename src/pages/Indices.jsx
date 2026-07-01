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
  const [chunkSize] = useState(100);
  const [updateInterval] = useState(5 * 60 * 1000);
  const [progress, setProgress] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [timeWindow, setTimeWindow] = useState({ start: '', end: '', entries: 0 });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
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

  // Save data to localStorage
  const saveDataToStorage = (data) => {
    try {
      localStorage.setItem('indicesData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  };

  // Load data from localStorage
  const loadDataFromStorage = () => {
    try {
      const storedData = localStorage.getItem('indicesData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.length > 0) {
          return parsedData;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      return null;
    }
  };

  // Save state to localStorage
  const saveStateToStorage = (state) => {
    try {
      localStorage.setItem('indicesState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  };

  // Load state from localStorage
  const loadStateFromStorage = () => {
    try {
      const storedState = localStorage.getItem('indicesState');
      if (storedState) {
        return JSON.parse(storedState);
      }
      return null;
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
      return null;
    }
  };

  // Load data on component mount
  useEffect(() => {
    const storedData = loadDataFromStorage();
    if (storedData) {
      setAllData(storedData);
      setIsDataLoaded(true);
      
      const chunks = Math.ceil(storedData.length / chunkSize);
      setTotalChunks(chunks);
      
      // Load saved state or start from beginning
      const savedState = loadStateFromStorage();
      if (savedState && savedState.currentChunk !== undefined) {
        const chunkIndex = savedState.currentChunk;
        const startIndex = chunkIndex * chunkSize;
        const chunk = storedData.slice(startIndex, startIndex + chunkSize);
        
        if (chunk.length > 0) {
          setDisplayData(chunk);
          setFilteredData(chunk);
          setCurrentChunk(chunkIndex);
          setCurrentStartIndex(startIndex);
          setProgress((startIndex / storedData.length) * 100);
          setTimeWindow({
            start: new Date(chunk[0].Timestamp).toLocaleString(),
            end: new Date(chunk[chunk.length - 1].Timestamp).toLocaleString(),
            entries: chunk.length
          });
          setIsStreaming(savedState.isStreaming || false);
        }
      } else {
        // Start with first chunk
        const firstChunk = storedData.slice(0, chunkSize);
        setDisplayData(firstChunk);
        setFilteredData(firstChunk);
        setCurrentChunk(0);
        setCurrentStartIndex(0);
        setProgress(0);
        if (firstChunk.length > 0) {
          setTimeWindow({
            start: new Date(firstChunk[0].Timestamp).toLocaleString(),
            end: new Date(firstChunk[firstChunk.length - 1].Timestamp).toLocaleString(),
            entries: firstChunk.length
          });
        }
        setIsStreaming(storedData.length > chunkSize);
      }
      
      setLoading(false);
    }
  }, []);

  // Save state when it changes
  useEffect(() => {
    if (isDataLoaded) {
      saveStateToStorage({
        currentChunk,
        isStreaming,
        currentStartIndex,
        progress
      });
    }
  }, [currentChunk, isStreaming, currentStartIndex, progress, isDataLoaded]);

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
        setIsDataLoaded(true);
        
        // Save to localStorage
        saveDataToStorage(mappedData);
        
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

  // Clear stored data (optional - for debugging)
  const clearStoredData = () => {
    localStorage.removeItem('indicesData');
    localStorage.removeItem('indicesState');
    setAllData([]);
    setDisplayData([]);
    setFilteredData([]);
    setIsDataLoaded(false);
    setTimeWindow({ start: '', end: '', entries: 0 });
    setCurrentChunk(0);
    setCurrentStartIndex(0);
    setProgress(0);
    setIsStreaming(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4">
      {/* Compact Header */}
      <div className="flex flex-col gap-2 mb-3">
        {/* Title Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaChartLine className="text-purple-500" />
              Environmental Indices
            </h1>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">100-Entry Window</span>
            {isDataLoaded && (
              <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <FaCheckCircle className="text-[8px]" /> Saved
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5">
            <label className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg flex items-center gap-1 hover:bg-gray-50 transition-all cursor-pointer text-[11px]">
              <FaUpload className="text-[10px]" />
              <span>{isDataLoaded ? 'Replace' : 'Upload'}</span>
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
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all text-[11px] ${
                    isStreaming 
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                  }`}
                >
                  {isStreaming ? <FaPause className="text-[10px]" /> : <FaPlay className="text-[10px]" />}
                  {isStreaming ? 'Pause' : 'Resume'}
                </button>
                
                <button
                  onClick={skipToNextChunk}
                  className="px-2.5 py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg flex items-center gap-1 hover:bg-blue-200 transition-all text-[11px]"
                >
                  <FaStepForward className="text-[10px]" /> Next
                </button>
                
                <button
                  onClick={resetStreaming}
                  className="px-2.5 py-1 bg-purple-100 text-purple-700 border border-purple-300 rounded-lg flex items-center gap-1 hover:bg-purple-200 transition-all text-[11px]"
                >
                  <FaSync className="text-[10px]" /> Reset
                </button>
                
                <button
                  onClick={downloadData}
                  className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg flex items-center gap-1 hover:bg-gray-50 transition-all text-[11px]"
                >
                  <FaDownload className="text-[10px]" /> Download
                </button>

                <button
                  onClick={clearStoredData}
                  className="px-2.5 py-1 bg-red-100 text-red-700 border border-red-300 rounded-lg flex items-center gap-1 hover:bg-red-200 transition-all text-[11px]"
                >
                  <FaSync className="text-[10px]" /> Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info Row */}
        {displayData.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-100 shadow-sm">
            <span className="flex items-center gap-1">
              <FaClock className="text-purple-500 text-[10px]" />
              {timeWindow.start} - {timeWindow.end}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">{timeWindow.entries}</span> entries
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              Window <span className="font-semibold text-gray-700">{currentChunk + 1}</span>/{totalChunks}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              Progress: <span className="font-semibold text-purple-600">{Math.round(progress)}%</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className={`flex items-center gap-1 ${isStreaming ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {isStreaming ? 'Live' : 'Paused'}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar - Compact */}
      {allData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-1.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex justify-between text-[9px] text-gray-500 mb-0.5">
                <span>Streaming Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[9px] text-gray-500 whitespace-nowrap">
                Speed: 
                <select 
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                  className="ml-1 px-1 py-0.5 border rounded text-[9px] bg-white"
                >
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={5}>5x</option>
                  <option value={10}>10x</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards - Compact */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-3">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-2">
            <div className="text-[8px] text-gray-500">Avg TCI</div>
            <div className="text-base font-bold text-purple-600">{stats.avgTCI}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-2">
            <div className="text-[8px] text-gray-500">Avg IAQI</div>
            <div className="text-base font-bold text-blue-600">{stats.avgIAQI}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-2">
            <div className="text-[8px] text-gray-500">Avg VCI</div>
            <div className="text-base font-bold text-green-600">{stats.avgVCI}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-2 hidden sm:block">
            <div className="text-[8px] text-gray-500">Avg ACI</div>
            <div className="text-base font-bold text-orange-600">{stats.avgACI}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-2 hidden sm:block">
            <div className="text-[8px] text-gray-500">Avg HPI</div>
            <div className="text-base font-bold text-red-600">{stats.avgHPI}</div>
          </div>
        </div>
      )}

      {/* Filters Section - Compact */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 mb-3 overflow-hidden">
        <div className="px-2.5 py-1.5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
            <FaFilter className="text-purple-500 text-[10px]" />
            Filters
          </h2>
          <button
            onClick={resetFilters}
            className="text-[10px] text-purple-600 hover:text-purple-700 font-medium"
          >
            Reset
          </button>
        </div>
        
        <div className="p-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-[8px] text-gray-500 mb-0.5">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[9px]" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-[11px] rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[100px]">
              <label className="block text-[8px] text-gray-500 mb-0.5">Zone</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-2 py-1 text-[11px] rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
              >
                <option value="">All Zones</option>
                {zones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[100px]">
              <label className="block text-[8px] text-gray-500 mb-0.5">Alert Level</label>
              <select
                value={selectedAlertLevel}
                onChange={(e) => setSelectedAlertLevel(e.target.value)}
                className="w-full px-2 py-1 text-[11px] rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
              >
                <option value="">All Levels</option>
                {alertLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[100px]">
              <label className="block text-[8px] text-gray-500 mb-0.5">Date From</label>
              <input
                type="datetime-local"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-2 py-1 text-[11px] rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
              />
            </div>

            <div className="flex-1 min-w-[100px]">
              <label className="block text-[8px] text-gray-500 mb-0.5">Date To</label>
              <input
                type="datetime-local"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-2 py-1 text-[11px] rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Type Selector & Indices Selection - Compact */}
      {displayData.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 via-white to-pink-50 rounded-lg shadow-lg border border-purple-100 p-2.5 mb-3">
          <div className="flex flex-wrap items-center justify-center gap-20">
            {/* Chart Type - Left */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                <FaChartLine className="text-purple-500 text-[10px]" />
                Type:
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    chartType === 'line' 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md shadow-purple-200' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-purple-300'
                  }`}
                >
                  <FaChartLine className="inline mr-0.5 text-[9px]" /> Line
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    chartType === 'bar' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                  }`}
                >
                  <FaChartBar className="inline mr-0.5 text-[9px]" /> Bar
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    chartType === 'area' 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-200' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-green-300'
                  }`}
                >
                  <FaChartArea className="inline mr-0.5 text-[9px]" /> Area
                </button>
              </div>
            </div>

            {/* Indices - Center */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                <FaChartBar className="text-purple-500 text-[10px]" />
                Indices:
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {['TCI', 'IAQI', 'VCI', 'ACI', 'HPI'].map(indice => (
                  <label 
                    key={indice} 
                    className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition-all text-[10px] font-medium ${
                      selectedIndices.includes(indice)
                        ? 'shadow-sm scale-105'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: selectedIndices.includes(indice) ? `${getLineColor(indice)}20` : 'transparent',
                      border: selectedIndices.includes(indice) ? `1.5px solid ${getLineColor(indice)}` : '1.5px solid transparent'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIndices.includes(indice)}
                      onChange={() => handleIndiceToggle(indice)}
                      className="rounded w-2.5 h-2.5"
                      style={{ 
                        accentColor: getLineColor(indice),
                        backgroundColor: getLineColor(indice)
                      }}
                    />
                    <span style={{ color: getLineColor(indice), fontWeight: selectedIndices.includes(indice) ? 'bold' : 'normal' }}>
                      {indice}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Entry Count - Right */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-lg shadow-inner">
              <FaClock className="text-purple-600 text-[10px]" />
              <span className="text-[10px] font-semibold text-gray-700">
                {timeWindow.entries} entries
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {displayData.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-3">
          {/* Main Trend Chart - Full Width */}
          <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <FaChartLine className="text-purple-500 text-[11px]" />
              100-Entry Indices Trends ({timeWindow.entries} Entries)
            </h4>
            <div className="text-[9px] text-gray-400 mb-1.5">
              Window: {timeWindow.start} - {timeWindow.end}
            </div>
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'line' && (
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="Timestamp" 
                    tick={{ fontSize: 8 }} 
                    interval={Math.floor(chartData.length / 15)} 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                  {selectedIndices.map(indice => (
                    <Line
                      key={indice}
                      type="monotone"
                      dataKey={indice}
                      stroke={getLineColor(indice)}
                      strokeWidth={2}
                      dot={{ r: 1.5 }}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              )}

              {chartType === 'bar' && (
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="Timestamp" 
                    tick={{ fontSize: 8 }} 
                    interval={Math.floor(chartData.length / 15)}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                  {selectedIndices.map((indice, index) => (
                    <Bar key={indice} dataKey={indice} fill={getLineColor(indice)} />
                  ))}
                </BarChart>
              )}

              {chartType === 'area' && (
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="Timestamp" 
                    tick={{ fontSize: 8 }} 
                    interval={Math.floor(chartData.length / 15)}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Zone Averages Chart */}
            <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-3">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <FaChartBar className="text-purple-500 text-[11px]" />
                Avg Indices by Zone
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={zoneAverages} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="Zone" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} width={40} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                  {selectedIndices.map(indice => (
                    <Bar key={indice} dataKey={indice} fill={getLineColor(indice)} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Alert Level Distribution - Pie Chart */}
            <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-3">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <FaChartPie className="text-purple-500 text-[11px]" />
                Alert Level Distribution
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={alertDistribution}
                    cx="50%"
                    cy="45%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {alertDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Combined Chart - Full Width */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-xl border border-gray-100 p-3">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <FaChartArea className="text-purple-500 text-[11px]" />
                Combined Analysis (Last 20 Entries)
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData.slice(-20)} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="Timestamp" 
                    tick={{ fontSize: 8 }} 
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
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
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden mt-4">
        <div className="px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <FaChartLine className="text-purple-500 text-[11px]" />
              100-Entry Window Data ({timeWindow.entries} Entries)
            </h3>
            <p className="text-[9px] text-gray-500 mt-0.5">
              Showing {currentItems.length} of {filteredData.length} records
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-6">
            <FaSpinner className="animate-spin text-2xl text-purple-500" />
          </div>
        ) : allData.length === 0 ? (
          <div className="p-6 text-center">
            <FaFileExcel className="text-4xl text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-gray-600 mb-1">No Data Loaded</h3>
            <p className="text-xs text-gray-400">
              Upload an Excel file to view environmental indices data with 100-entry windows
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-gray-600">#</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-gray-600">Timestamp</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-gray-600">Zone</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-gray-600">TCI</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-gray-600">IAQI</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-gray-600">VCI</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-gray-600">ACI</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-gray-600">HPI</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-gray-600">Alert Level</th>
                  <th className="px-2 py-1.5 text-left text-[9px] font-semibold text-gray-600">AI Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-1.5 text-[10px] text-gray-500">{indexOfFirstItem + index + 1}</td>
                    <td className="px-2 py-1.5 text-[10px] text-gray-700">
                      {new Date(item.Timestamp).toLocaleString()}
                    </td>
                    <td className="px-2 py-1.5 text-[10px] font-medium text-gray-700">{item.Zone}</td>
                    <td className="px-2 py-1.5 text-[10px] text-purple-600 font-semibold">{item.TCI}</td>
                    <td className="px-2 py-1.5 text-[10px] text-blue-600 font-semibold">{item.IAQI}</td>
                    <td className="px-2 py-1.5 text-[10px] text-green-600 font-semibold">{item.VCI}</td>
                    <td className="px-2 py-1.5 text-[10px] text-orange-600 font-semibold">{item.ACI}</td>
                    <td className="px-2 py-1.5 text-[10px] text-red-600 font-semibold">{item.HPI}</td>
                    <td className="px-2 py-1.5 text-[10px]">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${getAlertColor(item.Alert_Level)} text-[9px]`}>
                        {getAlertIcon(item.Alert_Level)}
                        {item.Alert_Level}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-[10px] text-gray-600 max-w-[150px] truncate" title={item.AI_Insight}>
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
          <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
            <div className="text-[9px] text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-[10px] border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 text-[10px] border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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