// src/components/DownloadReports.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaDownload, 
  FaCalendarAlt, 
  FaFileAlt, 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCsv,
  FaChartLine,
  FaChartBar,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaTimes,
  FaEye,
  FaPrint,
  FaEnvelope,
  FaDatabase,
  FaMicrochip,
  FaThermometerHalf,
  FaLeaf,
  FaVolumeUp,
  FaEye as FaEyeIcon,
  FaHeartbeat,
  FaTint,
  FaFlask,
  FaExclamationTriangle
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';

const DownloadReports = () => {
  // Report generation states
  const [selectedReportType, setSelectedReportType] = useState('daily');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedPlant, setSelectedPlant] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Data states
  const [sensorData, setSensorData] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedIndices, setSelectedIndices] = useState(['temperature', 'humidity', 'voc']);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [devicesList, setDevicesList] = useState([]);
  
  // Dynamic filter data
  const [plantsList, setPlantsList] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Parameter definitions
  const parameters = [
    { id: 'temperature', name: 'Temperature', icon: <FaThermometerHalf />, color: 'orange', dataKey: 'temperature', unit: '°C' },
    { id: 'humidity', name: 'Humidity', icon: <FaTint />, color: 'blue', dataKey: 'humidity', unit: '%' },
    { id: 'voc', name: 'TVOC', icon: <FaFlask />, color: 'green', dataKey: 'voc', unit: 'ppb' }
  ];

  const reportTypes = [
    { id: 'daily', name: 'Daily Report', icon: <FaClock />, description: '24-hour performance summary' },
    { id: 'weekly', name: 'Weekly Report', icon: <FaCalendarAlt />, description: '7-day comprehensive analysis' },
    { id: 'monthly', name: 'Monthly Report', icon: <FaChartLine />, description: '30-day detailed report' },
    { id: 'custom', name: 'Custom Report', icon: <FaChartBar />, description: 'Select custom date range' }
  ];

  const formats = [
    { id: 'pdf', name: 'PDF', icon: <FaFilePdf />, color: 'text-red-500' },
    { id: 'excel', name: 'Excel', icon: <FaFileExcel />, color: 'text-green-500' },
    { id: 'csv', name: 'CSV', icon: <FaFileCsv />, color: 'text-blue-500' }
  ];

  // Fetch sensor data from API
  const fetchSensorData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://sensor-six-iota.vercel.app/api/sensors');
      if (!response.ok) throw new Error('Failed to fetch sensor data');
      const data = await response.json();
      
      const mappedData = data.map(item => ({
        ...item,
        humidity: item.relative_humidity,
        voc: item.tvoc,
        device_id: item.device_id,
        created_at: item.created_at,
        timestamp: new Date(item.created_at)
      }));
      
      setSensorData(mappedData);
      
      // Extract unique devices
      const uniqueDevices = [...new Set(mappedData.map(item => item.device_id))];
      setDevicesList(uniqueDevices);
      
      // Set default date range based on available data
      if (mappedData.length > 0 && !startDate && !endDate) {
        const dates = mappedData.map(d => new Date(d.created_at));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        setStartDate(minDate.toISOString().split('T')[0]);
        setEndDate(maxDate.toISOString().split('T')[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch plants and zones for filters
  const fetchFilterData = async () => {
    try {
      const plantsResponse = await api.getPlants();
      let plantsData = [];
      if (plantsResponse.data && Array.isArray(plantsResponse.data)) {
        plantsData = plantsResponse.data;
      } else if (Array.isArray(plantsResponse)) {
        plantsData = plantsResponse;
      }
      
      setPlantsList(plantsData);
      
      // Extract states and cities
      const states = new Set();
      const cities = new Set();
      plantsData.forEach(plant => {
        if (plant.state) states.add(plant.state);
        if (plant.city) cities.add(plant.city);
      });
      setStatesList(Array.from(states));
      setCitiesList(Array.from(cities));
      
      // Fetch zones
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
          allZones.push(...zonesData);
        } catch (err) {
          console.error(`Error fetching zones for plant ${plant.name}:`, err);
        }
      }
      setZonesList(allZones);
      
    } catch (err) {
      console.error('Error fetching filter data:', err);
    }
  };

  // Load saved reports from localStorage
  const loadSavedReports = () => {
    const saved = localStorage.getItem('generated_reports');
    if (saved) {
      try {
        setReports(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading saved reports:', err);
      }
    }
  };

  // Save reports to localStorage
  const saveReports = (reportsData) => {
    localStorage.setItem('generated_reports', JSON.stringify(reportsData));
  };

  useEffect(() => {
    fetchSensorData();
    fetchFilterData();
    loadSavedReports();
  }, []);

  // Get filtered data based on all filters
  const getFilteredData = () => {
    let filtered = [...sensorData];
    
    // Filter by device
    if (selectedDevice) {
      filtered = filtered.filter(item => item.device_id === selectedDevice);
    }
    
    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(item => new Date(item.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item.created_at) <= endDateTime);
    }
    
    // Filter by zone (if zones have device mappings)
    if (selectedZone !== 'all' && selectedZone) {
      // This would need proper mapping from zones to devices
      // For now, we'll keep all data if no direct mapping
    }
    
    // Filter by plant (if plants have device mappings)
    if (selectedPlant !== 'all' && selectedPlant) {
      // This would need proper mapping from plants to devices
    }
    
    // Filter by state
    if (selectedState) {
      // This would need proper mapping
    }
    
    // Filter by city
    if (selectedCity) {
      // This would need proper mapping
    }
    
    return filtered;
  };

  // Generate report data based on filters
  const generateReportData = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      throw new Error('No data available for the selected filters');
    }
    
    // Sort by timestamp
    const sortedData = [...filteredData].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    
    // Calculate statistics for each selected parameter
    const statistics = {};
    selectedIndices.forEach(paramId => {
      const param = parameters.find(p => p.id === paramId);
      if (param) {
        const values = sortedData.map(d => d[param.dataKey]).filter(v => v !== undefined && v !== null);
        if (values.length > 0) {
          statistics[paramId] = {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
            current: values[values.length - 1],
            count: values.length
          };
        }
      }
    });
    
    // Group data by date for trend analysis
    const dataByDate = {};
    sortedData.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (!dataByDate[date]) {
        dataByDate[date] = [];
      }
      dataByDate[date].push(item);
    });
    
    // Calculate daily averages
    const dailyAverages = Object.keys(dataByDate).map(date => {
      const dayData = dataByDate[date];
      const dailyStats = {};
      selectedIndices.forEach(paramId => {
        const param = parameters.find(p => p.id === paramId);
        if (param) {
          const values = dayData.map(d => d[param.dataKey]).filter(v => v !== undefined && v !== null);
          if (values.length > 0) {
            dailyStats[paramId] = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
          }
        }
      });
      return { date, ...dailyStats };
    });
    
    return {
      metadata: {
        reportType: selectedReportType,
        dateRange: { start: startDate, end: endDate },
        generatedAt: new Date().toISOString(),
        totalRecords: sortedData.length,
        devices: [...new Set(sortedData.map(d => d.device_id))],
        selectedParameters: selectedIndices,
        filters: {
          device: selectedDevice || 'All',
          zone: selectedZone === 'all' ? 'All' : selectedZone,
          plant: selectedPlant === 'all' ? 'All' : selectedPlant,
          state: selectedState || 'All',
          city: selectedCity || 'All'
        }
      },
      statistics,
      dailyAverages,
      rawData: sortedData
    };
  };

  // Generate PDF report
  const generatePDF = async (reportData, reportName) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(147, 51, 234);
    doc.text(reportName, pageWidth / 2, 20, { align: 'center' });
    
    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date(reportData.metadata.generatedAt).toLocaleString()}`, 14, 35);
    doc.text(`Report Type: ${reportData.metadata.reportType.toUpperCase()}`, 14, 42);
    doc.text(`Date Range: ${reportData.metadata.dateRange.start} to ${reportData.metadata.dateRange.end}`, 14, 49);
    doc.text(`Total Records: ${reportData.metadata.totalRecords}`, 14, 56);
    doc.text(`Devices: ${reportData.metadata.devices.join(', ')}`, 14, 63);
    
    // Statistics Table
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Parameter Statistics', 14, 78);
    
    const statsData = selectedIndices.map(paramId => {
      const param = parameters.find(p => p.id === paramId);
      const stats = reportData.statistics[paramId];
      return [
        param.name,
        stats ? `${stats.current}${param.unit}` : 'N/A',
        stats ? `${stats.avg}${param.unit}` : 'N/A',
        stats ? `${stats.min}${param.unit}` : 'N/A',
        stats ? `${stats.max}${param.unit}` : 'N/A'
      ];
    });
    
    autoTable(doc, {
      startY: 85,
      head: [['Parameter', 'Current', 'Average', 'Min', 'Max']],
      body: statsData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234], textColor: 255 },
      margin: { left: 14, right: 14 }
    });
    
    // Daily Averages
    let finalY = doc.lastAutoTable
  ? doc.lastAutoTable.finalY + 10
  : 120;
    doc.text('Daily Averages', 14, finalY);
    
    const dailyData = reportData.dailyAverages.map(day => {
      const row = [day.date];
      selectedIndices.forEach(paramId => {
        const param = parameters.find(p => p.id === paramId);
        row.push(day[paramId] ? `${day[paramId]}${param.unit}` : 'N/A');
      });
      return row;
    });
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Date', ...selectedIndices.map(id => parameters.find(p => p.id === id)?.name)]],
      body: dailyData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234], textColor: 255 },
      margin: { left: 14, right: 14 }
    });
    
    return doc;
  };

  // Generate Excel/CSV data
  const generateExcelData = (reportData) => {
    const exportData = reportData.rawData.map(item => ({
      'Device ID': item.device_id,
      'Temperature (°C)': item.temperature,
      'Humidity (%)': item.humidity,
      'VOC (ppb)': item.voc,
      'Timestamp': new Date(item.created_at).toLocaleString()
    }));
    return exportData;
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const reportData = generateReportData();
      const reportName = `${reportTypes.find(r => r.id === selectedReportType)?.name} - ${new Date().toLocaleDateString()}`;
      
      let blob;
      let fileExtension;
      let mimeType;
      
      if (selectedFormat === 'pdf') {
        const doc = await generatePDF(reportData, reportName);
        blob = doc.output('blob');
        fileExtension = 'pdf';
        mimeType = 'application/pdf';
      } else if (selectedFormat === 'excel') {
        const exportData = generateExcelData(reportData);
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report Data');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fileExtension = 'xlsx';
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (selectedFormat === 'csv') {
        const exportData = generateExcelData(reportData);
        const ws = XLSX.utils.json_to_sheet(exportData);
        const csvContent = XLSX.utils.sheet_to_csv(ws);
        blob = new Blob([csvContent], { type: 'text/csv' });
        fileExtension = 'csv';
        mimeType = 'text/csv';
      }
      
      // Save report metadata
      const newReport = {
        id: Date.now(),
        name: reportName,
        type: selectedReportType,
        format: selectedFormat,
        date: new Date().toISOString().split('T')[0],
        size: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
        status: 'completed',
        zones: selectedZone === 'all' ? ['All Zones'] : [selectedZone],
        generatedBy: 'System',
        generatedAt: new Date().toLocaleString(),
        data: reportData,
        blob: URL.createObjectURL(blob)
      };
      
      const updatedReports = [newReport, ...reports];
      setReports(updatedReports);
      saveReports(updatedReports);
      
      alert('Report generated successfully!');
      
      // Auto-download if settings allow
      const link = document.createElement('a');
      link.href = newReport.blob;
      link.download = `${reportName.replace(/\s/g, '_')}.${fileExtension}`;
      link.click();
      
    } catch (err) {
      console.error('Error generating report:', err);
      alert(`Error generating report: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (report) => {
    if (report.blob) {
      const link = document.createElement('a');
      link.href = report.blob;
      link.download = `${report.name.replace(/\s/g, '_')}.${report.format}`;
      link.click();
    } else {
      alert('Report file not found. Please regenerate the report.');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      const reportToDelete = reports.find(r => r.id === id);
      if (reportToDelete?.blob) {
        URL.revokeObjectURL(reportToDelete.blob);
      }
      const updatedReports = reports.filter(r => r.id !== id);
      setReports(updatedReports);
      saveReports(updatedReports);
    }
  };

  const handlePreview = (report) => {
    setSelectedReport(report);
    setShowPreview(true);
  };

  const handleResetFilters = () => {
    setSelectedDevice('');
    setSelectedZone('all');
    setSelectedPlant('all');
    setSelectedState('');
    setSelectedCity('');
    setSelectedIndices(['temperature', 'humidity', 'voc']);
    if (sensorData.length > 0) {
      const dates = sensorData.map(d => new Date(d.created_at));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      setStartDate(minDate.toISOString().split('T')[0]);
      setEndDate(maxDate.toISOString().split('T')[0]);
    }
  };

  const filteredReports = reports.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.zones.some(zone => zone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getFormatIcon = (format) => {
    const f = formats.find(fmt => fmt.id === format);
    return f ? f.icon : <FaFileAlt />;
  };

  const getFormatColor = (format) => {
    const f = formats.find(fmt => fmt.id === format);
    return f ? f.color : 'text-gray-500';
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
          <h1 className="text-2xl font-bold text-gray-800">Download Reports</h1>
          <p className="text-gray-500 mt-1">Generate and download detailed analytics reports from live sensor data</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span><FaDatabase className="inline mr-1" /> {sensorData.length} total readings</span>
            <span>• {filteredDataCount} filtered readings</span>
            <span>• {reports.length} saved reports</span>
          </div>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all"
        >
          <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Advanced Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Data Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Device</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
              >
                <option value="">All Devices</option>
                {devicesList.map(device => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Zone</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
              >
                <option value="all">All Zones</option>
                {zonesList.map(zone => (
                  <option key={zone._id} value={zone.name}>{zone.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Plant</label>
              <select
                value={selectedPlant}
                onChange={(e) => setSelectedPlant(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
              >
                <option value="all">All Plants</option>
                {plantsList.map(plant => (
                  <option key={plant._id} value={plant.name}>{plant.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
              >
                <option value="">All States</option>
                {statesList.map(state => <option key={state}>{state}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
              >
                <option value="">All Cities</option>
                {citiesList.map(city => <option key={city}>{city}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={handleResetFilters}
            className="mt-3 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium border border-purple-200 rounded-lg hover:bg-purple-50 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Report Generator Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileAlt className="text-purple-500" />
          Generate New Report
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <div className="flex gap-2">
              {formats.map(format => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    selectedFormat === format.id
                      ? `${format.color} border-current bg-${format.id === 'pdf' ? 'red' : format.id === 'excel' ? 'green' : 'blue'}-50`
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {format.icon}
                  <span className="text-sm hidden sm:inline">{format.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Indices Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Include Parameters</label>
          <div className="flex flex-wrap gap-2">
            {parameters.map(param => (
              <label key={param.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input 
                  type="checkbox" 
                  checked={selectedIndices.includes(param.id)}
                  onChange={() => {
                    if (selectedIndices.includes(param.id)) {
                      setSelectedIndices(selectedIndices.filter(i => i !== param.id));
                    } else {
                      setSelectedIndices([...selectedIndices, param.id]);
                    }
                  }}
                  className="rounded text-purple-500" 
                />
                <span className={`text-${param.color}-500`}>{param.icon}</span>
                <span className="text-sm text-gray-700">{param.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selected: {selectedIndices.length} parameters
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating || filteredDataCount === 0}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <FaSpinner className="animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FaDownload />
              Generate Report ({filteredDataCount} records)
            </>
          )}
        </button>
        
        {filteredDataCount === 0 && !loading && (
          <p className="text-xs text-red-500 text-center mt-2">
            No data available for selected filters. Please adjust your filters.
          </p>
        )}
      </div>

      {/* Report Type Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {reportTypes.map(type => (
          <div key={type.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                {type.icon}
              </div>
              <h3 className="font-semibold text-gray-800">{type.name}</h3>
            </div>
            <p className="text-sm text-gray-500">{type.description}</p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports by name, type, or zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      {/* Generated Reports List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Generated Reports</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredReports.length} reports available</p>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reports Found</h3>
            <p className="text-gray-400">Generate your first report using the form above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Report Name</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Type</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Format</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Zones</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Size</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaFileAlt className="text-purple-500" />
                        <span className="text-sm font-medium text-gray-800">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="capitalize text-sm text-gray-600">{report.type}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className={getFormatColor(report.format)}>
                          {getFormatIcon(report.format)}
                        </span>
                        <span className="text-sm text-gray-600 uppercase">{report.format}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {report.zones.slice(0, 2).map(zone => (
                          <span key={zone} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">{zone}</span>
                        ))}
                        {report.zones.length > 2 && (
                          <span className="text-xs text-gray-400">+{report.zones.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">{report.date}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{report.size}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreview(report)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Preview"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDownload(report)}
                          className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Preview Modal */}
      {showPreview && selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowPreview(false)}></div>
            
            <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Report Preview</h2>
                <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <FaFileAlt className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{selectedReport.name}</h3>
                    <p className="text-sm text-gray-500">Generated on {selectedReport.generatedAt}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Report Type:</span>
                    <span className="font-medium capitalize">{selectedReport.type}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Format:</span>
                    <span className="font-medium uppercase">{selectedReport.format}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Zones Covered:</span>
                    <span className="font-medium">{selectedReport.zones.join(', ')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">File Size:</span>
                    <span className="font-medium">{selectedReport.size}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Generated By:</span>
                    <span className="font-medium">{selectedReport.generatedBy}</span>
                  </div>
                </div>
                
                {selectedReport.data && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">Summary Statistics</h4>
                    {selectedIndices.map(paramId => {
                      const param = parameters.find(p => p.id === paramId);
                      const stats = selectedReport.data.statistics?.[paramId];
                      return stats && (
                        <div key={paramId} className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">{param?.name}:</span> Current: {stats.current}{param?.unit}, 
                          Avg: {stats.avg}{param?.unit}, 
                          Range: {stats.min}{param?.unit} - {stats.max}{param?.unit}
                        </div>
                      );
                    })}
                    <p className="text-sm text-gray-600 mt-2">
                      Total Records: {selectedReport.data.metadata?.totalRecords || 0}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleDownload(selectedReport);
                      setShowPreview(false);
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center gap-2 hover:shadow-lg"
                  >
                    <FaDownload /> Download
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <FaExclamationTriangle />
          {error}
        </div>
      )}
    </div>
  );
};

export default DownloadReports;