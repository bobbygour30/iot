import React, { useState } from 'react';
import { 
  FaUsers, 
  FaUserPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaUserCheck,
  FaUserTimes,
  FaCrown,
  FaUserTie,
  FaUser,
  FaTimes,
  FaSave,
  FaDownload,
  FaUpload,
  FaFilter
} from 'react-icons/fa';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    zone: '',
    plant: '',
    department: '',
    location: '',
    joinDate: '',
    password: '',
    confirmPassword: ''
  });

  const itemsPerPage = 10;

  // Sample Users Data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 98765 43210',
      role: 'admin',
      status: 'active',
      zone: 'Zone A',
      plant: 'Plant 1',
      department: 'Management',
      location: 'Mumbai',
      joinDate: '2023-01-15',
      lastLogin: '2024-03-15 09:30:00',
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+91 98765 43211',
      role: 'manager',
      status: 'active',
      zone: 'Zone B',
      plant: 'Plant 1',
      department: 'Operations',
      location: 'Pune',
      joinDate: '2023-02-20',
      lastLogin: '2024-03-15 08:45:00',
      avatar: 'SJ'
    },
    {
      id: 3,
      name: 'Mike Smith',
      email: 'mike.smith@example.com',
      phone: '+91 98765 43212',
      role: 'technician',
      status: 'active',
      zone: 'Zone C',
      plant: 'Plant 2',
      department: 'Maintenance',
      location: 'Nagpur',
      joinDate: '2023-03-10',
      lastLogin: '2024-03-14 16:20:00',
      avatar: 'MS'
    }
  ]);

  const roles = [
    { id: 'all', name: 'All Roles', color: 'gray' },
    { id: 'admin', name: 'Admin', color: 'purple' },
    { id: 'manager', name: 'Manager', color: 'blue' },
    { id: 'technician', name: 'Technician', color: 'green' },
    { id: 'viewer', name: 'Viewer', color: 'orange' }
  ];

  const statusOptions = [
    { id: 'all', name: 'All Status', color: 'gray' },
    { id: 'active', name: 'Active', color: 'green' },
    { id: 'inactive', name: 'Inactive', color: 'red' },
    { id: 'suspended', name: 'Suspended', color: 'orange' }
  ];

  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
  const plants = ['Plant 1', 'Plant 2', 'Plant 3'];
  const departments = ['Management', 'Operations', 'Maintenance', 'Quality', 'IT', 'Safety', 'Production'];

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-600',
      manager: 'bg-blue-100 text-blue-600',
      technician: 'bg-green-100 text-green-600',
      viewer: 'bg-orange-100 text-orange-600'
    };
    return styles[role] || 'bg-gray-100 text-gray-600';
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-600',
      inactive: 'bg-red-100 text-red-600',
      suspended: 'bg-orange-100 text-orange-600'
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <FaCheckCircle className="text-xs" />,
      inactive: <FaTimesCircle className="text-xs" />,
      suspended: <FaBan className="text-xs" />
    };
    return icons[status] || <FaUser className="text-xs" />;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active',
      zone: '',
      plant: '',
      department: '',
      location: '',
      joinDate: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill all required fields');
      return;
    }
    
    const newUser = {
      id: users.length + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: formData.status,
      zone: formData.zone,
      plant: formData.plant,
      department: formData.department,
      location: formData.location,
      joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      avatar: formData.name.split(' ').map(n => n[0]).join('')
    };
    
    setUsers([...users, newUser]);
    setShowAddModal(false);
    resetForm();
    alert('User added successfully!');
  };

  const handleEditUser = () => {
    const updatedUsers = users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, 
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            status: formData.status,
            zone: formData.zone,
            plant: formData.plant,
            department: formData.department,
            location: formData.location,
            avatar: formData.name.split(' ').map(n => n[0]).join('')
          }
        : user
    );
    setUsers(updatedUsers);
    setShowEditModal(false);
    resetForm();
    alert('User updated successfully!');
  };

  const handleDeleteUser = () => {
    setUsers(users.filter(user => user.id !== selectedUser.id));
    setShowDeleteModal(false);
    setSelectedUser(null);
    alert('User deleted successfully!');
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      zone: user.zone,
      plant: user.plant,
      department: user.department,
      location: user.location,
      joinDate: user.joinDate,
      password: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleExportUsers = () => {
    alert('Exporting users data...');
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 mt-1">Manage system users and their permissions</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={handleExportUsers}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all"
          >
            <FaDownload /> <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <FaUserPlus /> <span className="hidden sm:inline">Add User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-500">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Inactive</p>
          <p className="text-2xl font-bold text-red-500">{stats.inactive}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Suspended</p>
          <p className="text-2xl font-bold text-orange-500">{stats.suspended}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Admins</p>
          <p className="text-2xl font-bold text-purple-500">{stats.admins}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-300"
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-purple-300"
          >
            {roles.map(role => (
              <option key={role.id} value={role.id}>Role: {role.name}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-purple-300"
          >
            {statusOptions.map(status => (
              <option key={status.id} value={status.id}>Status: {status.name}</option>
            ))}
          </select>
          
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                      {user.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-purple-100">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openViewModal(user)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30">
                      <FaEye className="text-sm" />
                    </button>
                    <button onClick={() => openEditModal(user)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30">
                      <FaEdit className="text-sm" />
                    </button>
                    <button onClick={() => {
                      setSelectedUser(user);
                      setShowDeleteModal(true);
                    }} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30">
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm"><FaEnvelope className="text-purple-400" /><span className="truncate">{user.email}</span></div>
                <div className="flex items-center gap-2 text-sm"><FaPhone className="text-purple-400" /><span>{user.phone}</span></div>
                <div className="flex items-center gap-2 text-sm"><FaMapMarkerAlt className="text-purple-400" /><span>{user.zone} | {user.plant}</span></div>
                <div className="flex justify-between items-center pt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(user.status)}`}>
                    {getStatusIcon(user.status)} {user.status}
                  </span>
                  <span className="text-xs text-gray-400">Joined: {user.joinDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">{user.avatar}</div>
                      <div><p className="text-sm font-medium">{user.name}</p><p className="text-xs text-gray-500">{user.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${getRoleBadge(user.role)}`}>{user.role}</span></td>
                  <td className="px-4 py-3 text-sm">{user.phone}</td>
                  <td className="px-4 py-3 text-sm">{user.zone}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${getStatusBadge(user.status)}`}>{getStatusIcon(user.status)} {user.status}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => openViewModal(user)} className="text-blue-500"><FaEye /></button><button onClick={() => openEditModal(user)} className="text-green-500"><FaEdit /></button><button onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }} className="text-red-500"><FaTrash /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b"><h2 className="text-xl font-bold">Add New User</h2></div>
              <div className="p-6 space-y-3">
                <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="admin">Admin</option><option value="manager">Manager</option><option value="technician">Technician</option><option value="viewer">Viewer</option></select>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select>
                <select value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Select Zone</option>{zones.map(z => <option key={z}>{z}</option>)}</select>
              </div>
              <div className="p-6 border-t flex gap-3 justify-end">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={handleAddUser} className="px-4 py-2 bg-purple-500 text-white rounded-lg">Add User</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b"><h2 className="text-xl font-bold">Edit User</h2></div>
              <div className="p-6 space-y-3">
                <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="admin">Admin</option><option value="manager">Manager</option><option value="technician">Technician</option><option value="viewer">Viewer</option></select>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select>
                <select value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Select Zone</option>{zones.map(z => <option key={z}>{z}</option>)}</select>
              </div>
              <div className="p-6 border-t flex gap-3 justify-end">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={handleEditUser} className="px-4 py-2 bg-purple-500 text-white rounded-lg">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaTrash className="text-red-500 text-2xl" /></div>
              <h3 className="text-lg font-semibold mb-2">Delete User</h3>
              <p className="text-gray-500 mb-4">Are you sure you want to delete <strong>{selectedUser.name}</strong>?</p>
              <div className="flex gap-3"><button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button><button onClick={handleDeleteUser} className="flex-1 py-2 bg-red-500 text-white rounded-lg">Delete</button></div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowViewModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b"><h2 className="text-xl font-bold">User Details</h2></div>
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3"><div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl">{selectedUser.avatar}</div><div><h3 className="font-bold text-lg">{selectedUser.name}</h3><p className="text-gray-500">{selectedUser.role}</p></div></div>
                <div className="border-t pt-3 space-y-2"><p><strong>Email:</strong> {selectedUser.email}</p><p><strong>Phone:</strong> {selectedUser.phone}</p><p><strong>Zone:</strong> {selectedUser.zone}</p><p><strong>Plant:</strong> {selectedUser.plant}</p><p><strong>Department:</strong> {selectedUser.department}</p><p><strong>Join Date:</strong> {selectedUser.joinDate}</p><p><strong>Last Login:</strong> {selectedUser.lastLogin}</p></div>
              </div>
              <div className="p-6 border-t flex justify-end"><button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-purple-500 text-white rounded-lg">Close</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;