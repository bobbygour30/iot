import React, { useState } from 'react';
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
  FaChartBar
} from 'react-icons/fa';

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

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const chartData = {
    labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    temp: [22, 21, 20, 19, 21, 24, 28, 30, 29, 27, 25, 23],
    aqi: [45, 42, 40, 38, 42, 55, 68, 72, 70, 65, 58, 50]
  };

  const thresholdTemp = 28;
  const thresholdAQI = 65;

  const tabs = [
    { id: 'thermal', label: 'Thermal', icon: <FaThermometerHalf /> },
    { id: 'aqi', label: 'AQI', icon: <FaLeaf /> },
    { id: 'acoustic', label: 'Acoustic', icon: <FaVolumeUp /> },
    { id: 'visual', label: 'Visual', icon: <FaEye /> },
    { id: 'hpi', label: 'HPI', icon: <FaHeartbeat /> },
  ];

  const getTabContent = () => {
    switch(activeTab) {
      case 'thermal': return { value: '42°C', status: 'Alert', trend: '+2.3°C', history: [38, 39, 40, 41, 42, 43, 42] };
      case 'aqi': return { value: '156', status: 'Moderate', trend: '-5 pts', history: [165, 160, 158, 155, 156, 154, 152] };
      case 'acoustic': return { value: '68 dB', status: 'Safe', trend: '-2 dB', history: [72, 70, 69, 68, 67, 66, 68] };
      case 'visual': return { value: '92%', status: 'Safe', trend: '+1%', history: [90, 91, 91, 92, 92, 93, 92] };
      case 'hpi': return { value: '78', status: 'Good', trend: '+3 pts', history: [72, 74, 75, 76, 77, 78, 79] };
      default: return {};
    }
  };

  const tabContent = getTabContent();

  return (
    <div className="p-4 sm:p-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 sm:p-6 mb-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold">Welcome back, John! 👋</h2>
        <p className="text-purple-100 mt-1">Here's what's happening with your zones today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Zones</p>
          <p className="text-2xl font-bold text-gray-800">12</p>
          <p className="text-green-500 text-xs mt-1">+2 this month</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Active Alerts</p>
          <p className="text-2xl font-bold text-orange-500">3</p>
          <p className="text-red-500 text-xs mt-1">Requires attention</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Equipment Online</p>
          <p className="text-2xl font-bold text-green-500">94%</p>
          <p className="text-gray-500 text-xs mt-1">42/45 devices</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Avg. HPI Score</p>
          <p className="text-2xl font-bold text-purple-500">78.5</p>
          <p className="text-green-500 text-xs mt-1">↑ 5.2%</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-5 mb-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaMapMarkerAlt className="text-xs" /> State
            </label>
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm">
              <option value="">All States</option>
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaCity className="text-xs" /> City
            </label>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm" disabled={!selectedState}>
              <option value="">All Cities</option>
              {selectedState && cities[selectedState]?.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaIndustry className="text-xs" /> Plant
            </label>
            <select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm">
              <option value="">All Plants</option>
              {plants.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaChartBar className="text-xs" /> Zone
            </label>
            <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm">
              <option value="">All Zones</option>
              {zones.map(z => <option key={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaCalendarAlt className="text-xs" /> From
            </label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaCalendarAlt className="text-xs" /> To
            </label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <FaChartBar className="text-xs" /> Zone Filter
            </label>
            <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm">
              <option value="all">All Zones</option>
              <option value="zone1">Zone 1</option>
              <option value="zone2">Zone 2</option>
              <option value="zone3">Zone 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-5 border-b border-gray-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">ZONE LIVE DATA</h3>
            <p className="text-xs sm:text-sm text-gray-500">Real-time monitoring • Last 24 hours</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><FaFileDownload /></button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><FaExpand /></button>
          </div>
        </div>

        <div className="p-3 sm:p-5 overflow-x-auto">
          <div className="flex flex-wrap gap-3 sm:gap-6 mb-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-xs sm:text-sm">Temperature (°C)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-xs sm:text-sm">AQI</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-xs sm:text-sm">Threshold</span></div>
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <div className="flex items-center gap-1"><FaCheckCircle className="text-green-500 text-xs" /><span className="text-xs">Safe</span></div>
              <div className="flex items-center gap-1"><FaExclamationTriangle className="text-red-500 text-xs" /><span className="text-xs">Alert</span></div>
            </div>
          </div>

          <div className="relative min-w-[600px]">
            <svg viewBox="0 0 900 400" className="w-full h-auto">
              {[0, 1, 2, 3, 4].map(i => (
                <line key={i} x1="40" y1={80 + i * 80} x2="860" y2={80 + i * 80} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4" />
              ))}
              <line x1="40" y1="180" x2="860" y2="180" stroke="#ef4444" strokeWidth="2" strokeDasharray="6" />
              <text x="865" y="184" fill="#ef4444" fontSize="10">Temp Threshold (28°C)</text>
              <line x1="40" y1="240" x2="860" y2="240" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4" />
              <text x="865" y="244" fill="#ef4444" fontSize="10">AQI Threshold (65)</text>

              <polyline points={chartData.temp.map((t, i) => `${40 + (i * (820 / 11))},${400 - (t * 6)}`).join(' ')} fill="none" stroke="#f97316" strokeWidth="3" />
              {chartData.temp.map((t, i) => {
                const x = 40 + (i * (820 / 11));
                const y = 400 - (t * 6);
                return <circle key={`temp-${i}`} cx={x} cy={y} r="4" fill={t >= thresholdTemp ? '#ef4444' : '#f97316'} stroke="white" strokeWidth="2" />;
              })}

              <polyline points={chartData.aqi.map((a, i) => `${40 + (i * (820 / 11))},${400 - (a * 2.5)}`).join(' ')} fill="none" stroke="#22c55e" strokeWidth="3" />
              {chartData.aqi.map((a, i) => {
                const x = 40 + (i * (820 / 11));
                const y = 400 - (a * 2.5);
                return <circle key={`aqi-${i}`} cx={x} cy={y} r="4" fill={a >= thresholdAQI ? '#ef4444' : '#22c55e'} stroke="white" strokeWidth="2" />;
              })}

              {chartData.labels.map((label, i) => (
                <text key={i} x={40 + (i * (820 / 11))} y="380" textAnchor="middle" fill="#9ca3af" fontSize="9">{label}</text>
              ))}
              <text x="35" y="100" textAnchor="end" fill="#9ca3af" fontSize="9">40°C</text>
              <text x="35" y="180" textAnchor="end" fill="#9ca3af" fontSize="9">28°C</text>
              <text x="35" y="260" textAnchor="end" fill="#9ca3af" fontSize="9">20°C</text>
              <text x="35" y="340" textAnchor="end" fill="#9ca3af" fontSize="9">10°C</text>
              <text x="35" y="380" textAnchor="end" fill="#9ca3af" fontSize="9">0°C</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/50 overflow-x-auto">
          <div className="flex min-w-max sm:min-w-0">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-purple-500 text-purple-600 bg-white' : 'text-gray-500'}`}>
                <span className={activeTab === tab.id ? 'text-purple-500' : 'text-gray-400'}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-5">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Current Value</p>
                <p className="text-2xl sm:text-4xl font-bold text-gray-800">{tabContent.value}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${tabContent.status === 'Alert' ? 'bg-red-100 text-red-600' : tabContent.status === 'Moderate' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                    {tabContent.status}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">Trend: {tabContent.trend}</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-3">7-Day Trend</p>
              <div className="flex items-end gap-2 sm:gap-3 h-28 sm:h-32">
                {tabContent.history?.map((value, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                    <div className="w-full bg-gradient-to-t from-purple-400 to-pink-400 rounded-lg transition-all hover:opacity-80" style={{ height: `${(value / 100) * (isMobile ? 100 : 120)}px` }}></div>
                    <span className="text-[10px] sm:text-xs text-gray-500">D{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;