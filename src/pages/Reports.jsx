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
  FaSpinner,
  FaSearch,
  FaFilter,
  FaTimes,
  FaEye,
  FaDatabase,
  FaMicrochip,
  FaThermometerHalf,
  FaTint,
  FaFlask,
  FaExclamationTriangle,
  FaIndustry,
  FaCity,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  
  // Data states
  const [sensorData, setSensorData] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Filter states - For data filtering before report generation
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Reports list filters and pagination
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Dynamic filter data
  const [plantsList, setPlantsList] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [devicesList, setDevicesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesByStateMap, setCitiesByStateMap] = useState({});
  
  // Device readings data
  const [deviceReadings, setDeviceReadings] = useState({});
  
  // Parameter definitions
  const parameters = [
    { id: 'temperature', name: 'Temperature', icon: <FaThermometerHalf />, color: 'orange', dataKey: 'temperature', unit: '°C' },
    { id: 'humidity', name: 'Relative Humidity', icon: <FaTint />, color: 'blue', dataKey: 'humidity', unit: '%' },
    { id: 'voc', name: 'TVOC', icon: <FaFlask />, color: 'green', dataKey: 'voc', unit: 'ppb' }
  ];

  const [selectedParameters, setSelectedParameters] = useState(['temperature', 'humidity', 'voc']);

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

  // Fetch all dynamic data (plants, zones, devices)
  const fetchDynamicData = async () => {
    try {
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
    }
  };

  // Fetch sensor data from external API
  const fetchSensorData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://sensor-six-iota.vercel.app/api/sensors?limit=100&hours=168');
      if (!response.ok) throw new Error('Failed to fetch sensor data');
      const result = await response.json();
      
      // Handle API response structure
      let data = [];
      if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (Array.isArray(result)) {
        data = result;
      } else {
        data = [];
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
          timestamp: reading.created_at
        });
      });
      
      // Sort readings by timestamp for each device
      Object.keys(readingsByDevice).forEach(deviceId => {
        readingsByDevice[deviceId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
      
      setDeviceReadings(readingsByDevice);
      setLastUpdate(new Date());
      setError(null);
      
      // Set default date range based on available data
      if (data.length > 0 && !dateFrom && !dateTo) {
        const dates = data.map(d => new Date(d.created_at));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        setDateFrom(minDate.toISOString().split('T')[0]);
        setDateTo(maxDate.toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
    fetchDynamicData();
    fetchSensorData();
    loadSavedReports();
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // Get device readings for a specific device
  const getDeviceReadingsForDevice = (deviceId) => {
    return deviceReadings[deviceId] || [];
  };

  // Get filtered data based on all filters
  const getFilteredData = () => {
    const filteredDevices = getFilteredDevices();
    let allReadings = [];
    
    filteredDevices.forEach(device => {
      const readings = getDeviceReadingsForDevice(device.deviceId);
      readings.forEach(reading => {
        allReadings.push({
          device_id: device.deviceId,
          device_name: device.deviceId,
          plant: device.plantName,
          zone: device.zoneName,
          temperature: reading.temperature,
          humidity: reading.humidity,
          voc: reading.voc,
          timestamp: reading.timestamp,
          created_at: reading.timestamp
        });
      });
    });
    
    // Apply date range filters
    if (dateFrom) {
      allReadings = allReadings.filter(item => new Date(item.timestamp) >= new Date(dateFrom));
    }
    if (dateTo) {
      const endDateTime = new Date(dateTo);
      endDateTime.setHours(23, 59, 59, 999);
      allReadings = allReadings.filter(item => new Date(item.timestamp) <= endDateTime);
    }
    
    // Apply state/city filters (based on plant)
    if (selectedState || selectedCity) {
      allReadings = allReadings.filter(item => {
        const plant = plantsList.find(p => p.name === item.plant);
        if (!plant) return true;
        if (selectedState && plant.state !== selectedState) return false;
        if (selectedCity && plant.city !== selectedCity) return false;
        return true;
      });
    }
    
    // Sort by timestamp
    allReadings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return allReadings;
  };

  // Generate report data based on filters
  const generateReportData = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      throw new Error('No data available for the selected filters');
    }
    
    // Calculate statistics for each selected parameter
    const statistics = {};
    selectedParameters.forEach(paramId => {
      const param = parameters.find(p => p.id === paramId);
      if (param) {
        const values = filteredData.map(d => d[param.dataKey]).filter(v => v !== undefined && v !== null);
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
    filteredData.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      if (!dataByDate[date]) {
        dataByDate[date] = [];
      }
      dataByDate[date].push(item);
    });
    
    // Calculate daily averages
    const dailyAverages = Object.keys(dataByDate).map(date => {
      const dayData = dataByDate[date];
      const dailyStats = {};
      selectedParameters.forEach(paramId => {
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
    
    // Group by device
    const dataByDevice = {};
    filteredData.forEach(item => {
      if (!dataByDevice[item.device_id]) {
        dataByDevice[item.device_id] = [];
      }
      dataByDevice[item.device_id].push(item);
    });
    
    return {
      metadata: {
        reportType: selectedReportType,
        dateRange: { 
          start: dateFrom || new Date(Math.min(...filteredData.map(d => new Date(d.timestamp)))).toISOString().split('T')[0],
          end: dateTo || new Date(Math.max(...filteredData.map(d => new Date(d.timestamp)))).toISOString().split('T')[0]
        },
        generatedAt: new Date().toISOString(),
        totalRecords: filteredData.length,
        devices: [...new Set(filteredData.map(d => d.device_id))],
        selectedParameters: selectedParameters,
        filters: {
          device: selectedDevice || 'All Devices',
          zone: selectedZone ? zonesList.find(z => z._id === selectedZone)?.name || 'All' : 'All',
          plant: selectedPlant ? plantsList.find(p => p._id === selectedPlant)?.name || 'All' : 'All',
          state: selectedState || 'All',
          city: selectedCity || 'All'
        }
      },
      statistics,
      dailyAverages,
      dataByDevice,
      rawData: filteredData
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
    doc.text(`Filters: Plant=${reportData.metadata.filters.plant}, Zone=${reportData.metadata.filters.zone}, Device=${reportData.metadata.filters.device}`, 14, 70);
    
    // Statistics Table
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Parameter Statistics', 14, 85);
    
    const statsData = selectedParameters.map(paramId => {
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
      startY: 92,
      head: [['Parameter', 'Current', 'Average', 'Min', 'Max']],
      body: statsData,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234], textColor: 255 },
      margin: { left: 14, right: 14 }
    });
    
    // Daily Averages
    let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 120;
    doc.text('Daily Averages', 14, finalY);
    
    const dailyData = reportData.dailyAverages.map(day => {
      const row = [day.date];
      selectedParameters.forEach(paramId => {
        const param = parameters.find(p => p.id === paramId);
        row.push(day[paramId] ? `${day[paramId]}${param.unit}` : 'N/A');
      });
      return row;
    });
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Date', ...selectedParameters.map(id => parameters.find(p => p.id === id)?.name)]],
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
      'Plant': item.plant,
      'Zone': item.zone,
      'Temperature (°C)': item.temperature,
      'Humidity (%)': item.humidity,
      'VOC (ppb)': item.voc,
      'Timestamp': new Date(item.timestamp).toLocaleString()
    }));
    return exportData;
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      const reportData = generateReportData();
      const reportName = `${reportTypes.find(r => r.id === selectedReportType)?.name} - ${new Date().toLocaleDateString()}`;
      
      let blob;
      let fileExtension;
      
      if (selectedFormat === 'pdf') {
        const doc = await generatePDF(reportData, reportName);
        blob = doc.output('blob');
        fileExtension = 'pdf';
      } else if (selectedFormat === 'excel') {
        const exportData = generateExcelData(reportData);
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report Data');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fileExtension = 'xlsx';
      } else if (selectedFormat === 'csv') {
        const exportData = generateExcelData(reportData);
        const ws = XLSX.utils.json_to_sheet(exportData);
        const csvContent = XLSX.utils.sheet_to_csv(ws);
        blob = new Blob([csvContent], { type: 'text/csv' });
        fileExtension = 'csv';
      }
      
      // Save report metadata
      const newReport = {
        id: Date.now(),
        name: reportName,
        type: selectedReportType,
        format: selectedFormat,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        size: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
        status: 'completed',
        devices: reportData.metadata.devices,
        generatedBy: 'System',
        generatedAt: new Date().toLocaleString(),
        data: reportData,
        blob: URL.createObjectURL(blob)
      };
      
      const updatedReports = [newReport, ...reports];
      setReports(updatedReports);
      saveReports(updatedReports);
      
      alert('Report generated successfully!');
      
      // Auto-download
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
      // Reset to first page if current page becomes empty
      const newTotalPages = Math.ceil(filteredAndSearchedReports.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (newTotalPages === 0) {
        setCurrentPage(1);
      }
    }
  };

  const handlePreview = (report) => {
    setSelectedReport(report);
    setShowPreview(true);
  };

  const handleResetFilters = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedPlant('');
    setSelectedZone('');
    setSelectedDevice('');
    setDateFrom('');
    setDateTo('');
    setSelectedParameters(['temperature', 'humidity', 'voc']);
  };

  const handleResetReportFilters = () => {
    setReportDateFrom('');
    setReportDateTo('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const filteredDevices = getFilteredDevices();
  const filteredDataCount = getFilteredData().length;
  
  // Filter reports by search term and date range
  const filteredAndSearchedReports = reports.filter(report => {
    // Search term filter
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.devices && report.devices.some(device => device.toLowerCase().includes(searchTerm.toLowerCase())));
    
    // Date range filter for reports
    let matchesDateRange = true;
    if (reportDateFrom && report.date) {
      matchesDateRange = matchesDateRange && report.date >= reportDateFrom;
    }
    if (reportDateTo && report.date) {
      matchesDateRange = matchesDateRange && report.date <= reportDateTo;
    }
    
    return matchesSearch && matchesDateRange;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSearchedReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = filteredAndSearchedReports.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getFormatIcon = (format) => {
    const f = formats.find(fmt => fmt.id === format);
    return f ? f.icon : <FaFileAlt />;
  };

  const getFormatColor = (format) => {
    const f = formats.find(fmt => fmt.id === format);
    return f ? f.color : 'text-gray-500';
  };

  const getParameterColorClass = (color) => {
    const colors = {
      orange: 'text-orange-500',
      blue: 'text-blue-500',
      green: 'text-green-500',
    };
    return colors[color] || 'text-gray-500';
  };

  if (loading && Object.keys(deviceReadings).length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-800">Download Reports</h1>
          <p className="text-gray-500 mt-1">Generate and download detailed analytics reports from live sensor data</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span><FaClock className="inline mr-1" /> Last update: {lastUpdate.toLocaleTimeString()}</span>
            <span>• {filteredDevices.length} devices</span>
            <span>• {filteredDataCount} filtered readings</span>
            <span>• {reports.length} total reports</span>
          </div>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all"
        >
          <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Data Filters Section - For filtering data before report generation */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaFilter className="text-purple-500" />
              Data Filters (Apply before generating report)
            </h2>
          </div>
          
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Plant Filter */}
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs text-gray-500 mb-1">Plant</label>
                <select
                  value={selectedPlant}
                  onChange={(e) => {
                    setSelectedPlant(e.target.value);
                    setSelectedZone('');
                    setSelectedDevice('');
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
                >
                  <option value="">All Plants</option>
                  {plantsList.map(plant => (
                    <option key={plant._id} value={plant._id}>{plant.name}</option>
                  ))}
                </select>
              </div>

              {/* Zone Filter */}
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs text-gray-500 mb-1">Zone</label>
                <select
                  value={selectedZone}
                  onChange={(e) => {
                    setSelectedZone(e.target.value);
                    setSelectedDevice('');
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
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

              {/* Device Filter */}
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs text-gray-500 mb-1">Device</label>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300 bg-white"
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
                className="px-3 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium border border-purple-200 rounded-lg hover:bg-purple-50 transition-all whitespace-nowrap"
              >
                Reset
              </button>
            </div>

            {/* Advanced Filters */}
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
                    {statesList.map(s => <option key={s}>{s}</option>)}
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
                    {selectedState && citiesByStateMap[selectedState]?.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedPlant || selectedZone || selectedDevice || selectedState || selectedCity || dateFrom || dateTo) && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {selectedPlant && plantsList.find(p => p._id === selectedPlant) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      Plant: {plantsList.find(p => p._id === selectedPlant)?.name}
                      <button onClick={() => setSelectedPlant('')} className="hover:text-purple-900">×</button>
                    </span>
                  )}
                  {selectedZone && zonesList.find(z => z._id === selectedZone) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      Zone: {zonesList.find(z => z._id === selectedZone)?.name}
                      <button onClick={() => setSelectedZone('')} className="hover:text-blue-900">×</button>
                    </span>
                  )}
                  {selectedDevice && filteredDevices.find(d => d._id === selectedDevice) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      Device: {filteredDevices.find(d => d._id === selectedDevice)?.deviceId}
                      <button onClick={() => setSelectedDevice('')} className="hover:text-green-900">×</button>
                    </span>
                  )}
                  {selectedState && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                      State: {selectedState}
                      <button onClick={() => setSelectedState('')} className="hover:text-orange-900">×</button>
                    </span>
                  )}
                  {selectedCity && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                      City: {selectedCity}
                      <button onClick={() => setSelectedCity('')} className="hover:text-pink-900">×</button>
                    </span>
                  )}
                  {dateFrom && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">
                      Data From: {dateFrom}
                      <button onClick={() => setDateFrom('')} className="hover:text-teal-900">×</button>
                    </span>
                  )}
                  {dateTo && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">
                      Data To: {dateTo}
                      <button onClick={() => setDateTo('')} className="hover:text-teal-900">×</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parameters Selection Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <FaChartBar className="text-purple-500" />
          Select Parameters to Include in Report
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
                onChange={() => {
                  if (selectedParameters.includes(param.id)) {
                    setSelectedParameters(selectedParameters.filter(p => p !== param.id));
                  } else {
                    setSelectedParameters([...selectedParameters, param.id]);
                  }
                }}
                className="rounded text-purple-500 focus:ring-purple-500 w-3.5 h-3.5"
              />
              <span className={getParameterColorClass(param.color)}>
                {param.icon}
              </span>
              <span className="text-sm text-gray-700">
                {param.name}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Selected: {selectedParameters.length} parameters
        </p>
      </div>

      {/* Report Generator Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileAlt className="text-purple-500" />
          Generate New Report
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

      

    
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Generated Reports</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredAndSearchedReports.length} reports available</p>
        </div>

        {/* Reports Filters - Search and Date Range */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           

            {/* Report Date From Filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Report Date From</label>
              <input
                type="date"
                value={reportDateFrom}
                onChange={(e) => {
                  setReportDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
              />
            </div>

            {/* Report Date To Filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Report Date To</label>
              <input
                type="date"
                value={reportDateTo}
                onChange={(e) => {
                  setReportDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>
          
          {/* Reset Reports Filters Button */}
          {(searchTerm || reportDateFrom || reportDateTo) && (
            <div className="mt-3">
              <button
                onClick={handleResetReportFilters}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear all report filters
              </button>
            </div>
          )}
        </div>

        {/* Reports Table */}
        {filteredAndSearchedReports.length === 0 ? (
          <div className="p-12 text-center">
            <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reports Found</h3>
            <p className="text-gray-400">Generate your first report using the form above</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Report Name</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Type</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Format</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Devices</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Date</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Size</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentReports.map((report) => (
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
                          {report.devices?.slice(0, 2).map(device => (
                            <span key={device} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded truncate max-w-[100px]">{device}</span>
                          ))}
                          {report.devices?.length > 2 && (
                            <span className="text-xs text-gray-400">+{report.devices.length - 2}</span>
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSearchedReports.length)} of {filteredAndSearchedReports.length} reports
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all"
                    title="First Page"
                  >
                    <FaAngleDoubleLeft className="text-sm" />
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all"
                    title="Previous Page"
                  >
                    <FaChevronLeft className="text-sm" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm transition-all ${
                            currentPage === pageNum
                              ? 'bg-purple-500 text-white'
                              : 'border border-gray-300 hover:bg-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all"
                    title="Next Page"
                  >
                    <FaChevronRight className="text-sm" />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all"
                    title="Last Page"
                  >
                    <FaAngleDoubleRight className="text-sm" />
                  </button>
                  
                  {/* Items per page selector */}
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="ml-2 px-2 py-1 rounded-lg border border-gray-300 text-sm"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
              </div>
            )}
          </>
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
                    <span className="text-gray-500">Devices Covered:</span>
                    <span className="font-medium">{selectedReport.devices?.length || 0} devices</span>
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
                    {selectedParameters.map(paramId => {
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