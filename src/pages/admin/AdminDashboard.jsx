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
  FaEye,
  FaSpinner
} from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalZones: 0,
    activeZones: 0,
    totalPlants: 0,
    activePlants: 0,
    totalDevices: 0,
    onlineDevices: 0,
    alerts: 0,
    criticalAlerts: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [deviceStatusData, setDeviceStatusData] = useState([]);
  const [zoneDistribution, setZoneDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsResponse = await api.getAdminStats();
      setStats(statsResponse.data);

      // Fetch growth data
      const growthResponse = await api.getAdminGrowthData();
      setChartData(growthResponse.data);

      // Fetch recent users
      const usersResponse = await api.getAdminRecentUsers();
      setRecentUsers(usersResponse.data);

      // Fetch zones for distribution
      const zonesResponse = await api.getAdminZones();
      const zones = zonesResponse.data;
      const zoneDist = zones.map(zone => ({
        name: zone.zoneName,
        devices: zone.devices || 0,
        plants: zone.plants || 0
      }));
      setZoneDistribution(zoneDist);

      // Device status distribution
      const devicesResponse = await api.getAdminDevices();
      const devices = devicesResponse.data;
      const online = devices.filter(d => d.status === 'online').length;
      const offline = devices.filter(d => d.status === 'offline').length;
      const maintenance = devices.filter(d => d.status === 'maintenance').length;
      
      setDeviceStatusData([
        { name: 'Online', value: online, color: '#10b981' },
        { name: 'Offline', value: offline, color: '#ef4444' },
        { name: 'Maintenance', value: maintenance, color: '#f59e0b' }
      ]);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, trend, trendValue, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center`}>
          <div className={`text-${color}-500 text-xl`}>{icon}</div>
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
          <span>{Math.abs(trendValue)}%</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</h3>
      <p className="text-gray-500 text-sm mt-1">{title}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, Super Admin! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchDashboardData} className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50">
            <FaSpinner className={loading ? "animate-spin" : ""} /> Refresh
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
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">This Month</span>
          </div>
          <p className="text-2xl font-bold">+{recentUsers.length}</p>
          <p className="text-sm opacity-90">New Users</p>
          <p className="text-xs mt-2 opacity-75">Joined recently</p>
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
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((zone.devices / 700) * 100, 100)}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{Math.min(((zone.devices / 700) * 100), 100).toFixed(0)}%</span>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'admin' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
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