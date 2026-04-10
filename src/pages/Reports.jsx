import React, { useState } from 'react';
import { 
  FaDownload, 
  FaCalendarAlt, 
  FaFileAlt, 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCsv,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaTable,
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
  FaHeartbeat
} from 'react-icons/fa';

const DownloadReports = () => {
  const [selectedReportType, setSelectedReportType] = useState('daily');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [startDate, setStartDate] = useState('2024-03-01');
  const [endDate, setEndDate] = useState('2024-03-15');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedPlant, setSelectedPlant] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState(['thermal', 'aqi', 'acoustic', 'visual', 'hpi']);

  // Sample reports data - using reports state instead of generatedReports
  const sampleReports = [
    {
      id: 1,
      name: 'Daily Performance Report',
      type: 'daily',
      format: 'pdf',
      date: '2024-03-15',
      size: '2.4 MB',
      status: 'completed',
      zones: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
      generatedBy: 'System',
      generatedAt: '2024-03-15 08:00:00'
    },
    {
      id: 2,
      name: 'Weekly Indices Summary',
      type: 'weekly',
      format: 'excel',
      date: '2024-03-10',
      size: '4.2 MB',
      status: 'completed',
      zones: ['Zone A', 'Zone B'],
      generatedBy: 'Admin',
      generatedAt: '2024-03-10 09:30:00'
    },
    {
      id: 3,
      name: 'Monthly Equipment Report',
      type: 'monthly',
      format: 'csv',
      date: '2024-03-01',
      size: '1.8 MB',
      status: 'completed',
      zones: ['Zone C', 'Zone D'],
      generatedBy: 'System',
      generatedAt: '2024-03-01 10:15:00'
    },
    {
      id: 4,
      name: 'Zone A Thermal Analysis',
      type: 'custom',
      format: 'pdf',
      date: '2024-03-14',
      size: '3.1 MB',
      status: 'completed',
      zones: ['Zone A'],
      generatedBy: 'Manager',
      generatedAt: '2024-03-14 14:20:00'
    },
    {
      id: 5,
      name: 'AQI Trend Report',
      type: 'weekly',
      format: 'pdf',
      date: '2024-03-08',
      size: '2.9 MB',
      status: 'completed',
      zones: ['Zone B', 'Zone C'],
      generatedBy: 'System',
      generatedAt: '2024-03-08 11:45:00'
    }
  ];

  const [reports, setReports] = useState(sampleReports);

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

  const zones = ['all', 'Zone A', 'Zone B', 'Zone C', 'Zone D'];
  const plants = ['all', 'Plant 1', 'Plant 2', 'Plant 3'];

  const indices = [
    { id: 'thermal', name: 'Thermal', icon: <FaThermometerHalf />, color: 'orange' },
    { id: 'aqi', name: 'AQI', icon: <FaLeaf />, color: 'green' },
    { id: 'acoustic', name: 'Acoustic', icon: <FaVolumeUp />, color: 'blue' },
    { id: 'visual', name: 'Visual', icon: <FaEyeIcon />, color: 'purple' },
    { id: 'hpi', name: 'HPI', icon: <FaHeartbeat />, color: 'pink' }
  ];

  const handleIndexToggle = (indexId) => {
    if (selectedIndices.includes(indexId)) {
      setSelectedIndices(selectedIndices.filter(i => i !== indexId));
    } else {
      setSelectedIndices([...selectedIndices, indexId]);
    }
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      const newReport = {
        id: reports.length + 1,
        name: `${reportTypes.find(r => r.id === selectedReportType)?.name} - ${new Date().toLocaleDateString()}`,
        type: selectedReportType,
        format: selectedFormat,
        date: new Date().toISOString().split('T')[0],
        size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
        status: 'completed',
        zones: selectedZone === 'all' ? ['Zone A', 'Zone B', 'Zone C', 'Zone D'] : [selectedZone],
        generatedBy: 'John Doe',
        generatedAt: new Date().toLocaleString()
      };
      
      setReports([newReport, ...reports]);
      setIsGenerating(false);
      alert('Report generated successfully!');
    }, 2000);
  };

  const handleDownload = (report) => {
    alert(`Downloading ${report.name} as ${report.format.toUpperCase()} file...`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setReports(reports.filter(r => r.id !== id));
    }
  };

  const handlePreview = (report) => {
    setSelectedReport(report);
    setShowPreview(true);
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

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Download Reports</h1>
          <p className="text-gray-500 mt-1">Generate and download detailed analytics reports</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all">
            <FaDatabase /> <span className="hidden sm:inline">Data Sources</span>
          </button>
        </div>
      </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Zone Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            >
              {zones.map(zone => (
                <option key={zone} value={zone}>
                  {zone === 'all' ? 'All Zones' : zone}
                </option>
              ))}
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
              {plants.map(plant => (
                <option key={plant} value={plant}>
                  {plant === 'all' ? 'All Plants' : plant}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Indices Selection - Using selectedIndices */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Include Indices</label>
          <div className="flex flex-wrap gap-2">
            {indices.map(index => (
              <label key={index.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input 
                  type="checkbox" 
                  checked={selectedIndices.includes(index.id)}
                  onChange={() => handleIndexToggle(index.id)}
                  className="rounded text-purple-500" 
                />
                <span className={`text-${index.color}-500`}>{index.icon}</span>
                <span className="text-sm text-gray-700">{index.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selected: {selectedIndices.length} indices
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-70"
        >
          {isGenerating ? (
            <>
              <FaSpinner className="animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FaDownload />
              Generate Report
            </>
          )}
        </button>
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

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by name, type, or zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <button className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-all">
            <FaFilter /> Filter
          </button>
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
                
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
                  <p className="text-sm text-gray-600">
                    This report contains comprehensive data analysis for the specified period. 
                    Includes performance metrics, zone-wise distribution, trend analysis, 
                    and actionable recommendations.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload(selectedReport)}
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
    </div>
  );
};

export default DownloadReports;