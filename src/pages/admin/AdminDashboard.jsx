// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaIndustry, 
  FaMicrochip, 
  FaBuilding,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaUserPlus,
  FaCalendarAlt,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeUsers: 1156,
    totalZones: 48,
    activeZones: 45,
    totalPlants: 156,
    activePlants: 148,
    totalDevices: 2341,
    onlineDevices: 2189,
    alerts: 23,
    criticalAlerts: 5
  });

  const [recentUsers, setRecentUsers] = useState([
    { id: 1, name: 'John Smith', email: 'john@example.com', zone: 'Zone A', status: 'active', date: '2024-03-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', zone: 'Zone B', status: 'active', date: '2024-03-14' },
    { id: 3, name: 'Mike Brown', email: 'mike@example.com', zone: 'Zone C', status: 'inactive', date: '2024-03-13' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', zone: 'Zone A', status: 'active', date: '2024-03-12' },
    { id: 5, name: 'David Wilson', email: 'david@example.com', zone: 'Zone D', status: 'active', date: '2024-03-11' },
  ]);

  const [chartData, setChartData] = useState([
    { month: 'Jan', users: 120, zones: 5, plants: 15, devices: 180 },
    { month: 'Feb', users: 135, zones: 8, plants: 22, devices: 210 },
    { month: 'Mar', users: 148, zones: 12, plants: 28, devices: 245 },
    { month: 'Apr', users: 162, zones: 15, plants: 35, devices: 280 },
    { month: 'May', users: 178, zones: 18, plants: 42, devices: 320 },
    { month: 'Jun', users: 195, zones: 22, plants: 48, devices: 365 },
  ]);

  const [deviceStatusData, setDeviceStatusData] = useState([
    { name: 'Online', value: 2189, color: '#10b981' },
    { name: 'Offline', value: 152, color: '#ef4444' },
    { name: 'Maintenance', value: 89, color: '#f59e0b' },
  ]);

  const [zoneDistribution, setZoneDistribution] = useState([
    { name: 'Zone A', devices: 580, plants: 42 },
    { name: 'Zone B', devices: 420, plants: 31 },
    { name: 'Zone C', devices: 680, plants: 48 },
    { name: 'Zone D', devices: 350, plants: 25 },
    { name: 'Zone E', devices: 311, plants: 10 },
  ]);

  const StatCard = ({ title, value, icon, trend, trendValue, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center`}>
          <div className={`text-${color}-500 text-xl`}>{icon}</div>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
          <span>{trendValue}%</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</h3>
      <p className="text-gray-500 text-sm mt-1">{title}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, Super Admin! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50">
            <FaDownload /> Export Report
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg">
            <FaEye /> View Analytics
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<FaUsers />} trend={12.5} trendValue={12.5} color="purple" />
        <StatCard title="Active Zones" value={stats.activeZones} icon={<FaBuilding />} trend={8.3} trendValue={8.3} color="blue" />
        <StatCard title="Total Plants" value={stats.totalPlants} icon={<FaIndustry />} trend={15.2} trendValue={15.2} color="green" />
        <StatCard title="Total Devices" value={stats.totalDevices} icon={<FaMicrochip />} trend={22.8} trendValue={22.8} color="orange" />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <FaCheckCircle className="text-2xl" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+5.2%</span>
          </div>
          <p className="text-2xl font-bold">{stats.onlineDevices}</p>
          <p className="text-sm opacity-90">Devices Online</p>
          <div className="mt-3 w-full bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{ width: `${(stats.onlineDevices / stats.totalDevices) * 100}%` }}></div>
          </div>
          <p className="text-xs mt-2 opacity-75">{((stats.onlineDevices / stats.totalDevices) * 100).toFixed(1)}% Online Rate</p>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <FaExclamationTriangle className="text-2xl" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Critical</span>
          </div>
          <p className="text-2xl font-bold">{stats.criticalAlerts}</p>
          <p className="text-sm opacity-90">Critical Alerts</p>
          <p className="text-xs mt-2 opacity-75">Requires immediate attention</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <FaUserPlus className="text-2xl" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">This Week</span>
          </div>
          <p className="text-2xl font-bold">+28</p>
          <p className="text-sm opacity-90">New Users</p>
          <p className="text-xs mt-2 opacity-75">12 in the last 24 hours</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Platform Growth</h3>
              <p className="text-sm text-gray-500">Monthly user & device addition</p>
            </div>
            <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="users" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Users" />
              <Area type="monotone" dataKey="devices" stackId="2" stroke="#10b981" fill="#10b981" name="Devices" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Device Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Device Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {deviceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Zone Performance Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Zone Performance Overview</h3>
          <p className="text-sm text-gray-500">Devices and plants distribution by zone</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Zone Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Devices</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plants</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {zoneDistribution.map((zone, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{zone.name}</td>
                  <td className="px-6 py-4 text-gray-600">{zone.devices}</td>
                  <td className="px-6 py-4 text-gray-600">{zone.plants}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(zone.devices / 700) * 100}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{((zone.devices / 700) * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Recent User Registrations</h3>
            <p className="text-sm text-gray-500">Latest users joined the platform</p>
          </div>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">{user.zone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{user.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;