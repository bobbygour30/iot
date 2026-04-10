import React, { useState } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaMicrochip,
  FaThermometerHalf,
  FaLeaf,
  FaVolumeUp,
  FaEye,
  FaWrench,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaPowerOff,
  FaChartLine,
  FaTimes,
  FaSave
} from 'react-icons/fa';

const Equipment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'thermal',
    status: 'active',
    zone: '',
    plant: '',
    location: '',
    lastMaintenance: '',
    nextMaintenance: '',
    temperature: '',
    aqi: '',
    efficiency: '',
    uptime: '',
    manufacturer: '',
    model: '',
    purchaseDate: '',
    warrantyUntil: ''
  });

  // Sample Equipment Data
  const [equipmentList, setEquipmentList] = useState([
    {
      id: 1,
      name: 'Thermal Scanner T-1000',
      type: 'thermal',
      status: 'active',
      zone: 'Zone A',
      plant: 'Plant 1',
      location: 'Manufacturing Floor',
      lastMaintenance: '2024-02-15',
      nextMaintenance: '2024-03-15',
      temperature: 42,
      aqi: 156,
      efficiency: 94,
      uptime: '99.8%',
      manufacturer: 'ThermoTech',
      model: 'T-1000',
      purchaseDate: '2023-01-10',
      warrantyUntil: '2026-01-10',
      icon: <FaThermometerHalf />,
      color: 'orange'
    },
    {
      id: 2,
      name: 'AQI Monitor Pro',
      type: 'aqi',
      status: 'active',
      zone: 'Zone B',
      plant: 'Plant 1',
      location: 'Quality Control',
      lastMaintenance: '2024-02-10',
      nextMaintenance: '2024-03-10',
      temperature: 28,
      aqi: 68,
      efficiency: 97,
      uptime: '99.9%',
      manufacturer: 'AirSense',
      model: 'AQI-Pro',
      purchaseDate: '2023-03-15',
      warrantyUntil: '2026-03-15',
      icon: <FaLeaf />,
      color: 'green'
    },
    {
      id: 3,
      name: 'Acoustic Sensor AS-200',
      type: 'acoustic',
      status: 'maintenance',
      zone: 'Zone C',
      plant: 'Plant 2',
      location: 'Engine Room',
      lastMaintenance: '2024-02-20',
      nextMaintenance: '2024-03-05',
      temperature: 35,
      aqi: 45,
      efficiency: 78,
      uptime: '95.2%',
      manufacturer: 'SoundTech',
      model: 'AS-200',
      purchaseDate: '2023-06-20',
      warrantyUntil: '2025-06-20',
      icon: <FaVolumeUp />,
      color: 'blue'
    },
    {
      id: 4,
      name: 'Visual Camera System',
      type: 'visual',
      status: 'inactive',
      zone: 'Zone A',
      plant: 'Plant 1',
      location: 'Security Room',
      lastMaintenance: '2024-01-25',
      nextMaintenance: '2024-02-25',
      temperature: 22,
      aqi: 52,
      efficiency: 88,
      uptime: '97.5%',
      manufacturer: 'VisionPro',
      model: 'VC-400',
      purchaseDate: '2023-08-05',
      warrantyUntil: '2025-08-05',
      icon: <FaEye />,
      color: 'purple'
    },
    {
      id: 5,
      name: 'HPI Monitor H-500',
      type: 'hpi',
      status: 'active',
      zone: 'Zone D',
      plant: 'Plant 3',
      location: 'Control Room',
      lastMaintenance: '2024-02-18',
      nextMaintenance: '2024-03-18',
      temperature: 31,
      aqi: 62,
      efficiency: 96,
      uptime: '99.7%',
      manufacturer: 'HealthIndex',
      model: 'H-500',
      purchaseDate: '2023-04-12',
      warrantyUntil: '2026-04-12',
      icon: <FaChartLine />,
      color: 'pink'
    },
    {
      id: 6,
      name: 'Thermal Scanner T-2000',
      type: 'thermal',
      status: 'warning',
      zone: 'Zone B',
      plant: 'Plant 2',
      location: 'Production Line',
      lastMaintenance: '2024-02-01',
      nextMaintenance: '2024-03-01',
      temperature: 48,
      aqi: 89,
      efficiency: 72,
      uptime: '92.3%',
      manufacturer: 'ThermoTech',
      model: 'T-2000',
      purchaseDate: '2023-10-18',
      warrantyUntil: '2025-10-18',
      icon: <FaThermometerHalf />,
      color: 'orange'
    }
  ]);

  const equipmentTypes = [
    { id: 'all', name: 'All Types', icon: <FaMicrochip />, color: 'gray' },
    { id: 'thermal', name: 'Thermal', icon: <FaThermometerHalf />, color: 'orange' },
    { id: 'aqi', name: 'AQI', icon: <FaLeaf />, color: 'green' },
    { id: 'acoustic', name: 'Acoustic', icon: <FaVolumeUp />, color: 'blue' },
    { id: 'visual', name: 'Visual', icon: <FaEye />, color: 'purple' },
    { id: 'hpi', name: 'HPI', icon: <FaChartLine />, color: 'pink' }
  ];

  const statusOptions = [
    { id: 'all', name: 'All Status', color: 'gray' },
    { id: 'active', name: 'Active', color: 'green' },
    { id: 'maintenance', name: 'Maintenance', color: 'orange' },
    { id: 'warning', name: 'Warning', color: 'red' },
    { id: 'inactive', name: 'Inactive', color: 'gray' }
  ];

  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
  const plants = ['Plant 1', 'Plant 2', 'Plant 3'];

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-600',
      maintenance: 'bg-orange-100 text-orange-600',
      warning: 'bg-red-100 text-red-600',
      inactive: 'bg-gray-100 text-gray-600'
    };
    const icons = {
      active: <FaCheckCircle className="text-xs" />,
      maintenance: <FaWrench className="text-xs" />,
      warning: <FaExclamationTriangle className="text-xs" />,
      inactive: <FaPowerOff className="text-xs" />
    };
    return {
      style: styles[status] || styles.inactive,
      icon: icons[status] || icons.inactive
    };
  };

  const getTypeColor = (type) => {
    const colors = {
      thermal: 'orange',
      aqi: 'green',
      acoustic: 'blue',
      visual: 'purple',
      hpi: 'pink'
    };
    return colors[type] || 'gray';
  };

  const filteredEquipment = equipmentList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.zone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: equipmentList.length,
    active: equipmentList.filter(e => e.status === 'active').length,
    maintenance: equipmentList.filter(e => e.status === 'maintenance').length,
    warning: equipmentList.filter(e => e.status === 'warning').length,
    avgEfficiency: Math.round(equipmentList.reduce((acc, e) => acc + e.efficiency, 0) / equipmentList.length)
  };

  const handleAddEquipment = () => {
    const newEquipment = {
      id: equipmentList.length + 1,
      ...formData,
      temperature: parseInt(formData.temperature),
      aqi: parseInt(formData.aqi),
      efficiency: parseInt(formData.efficiency),
      icon: equipmentTypes.find(t => t.id === formData.type)?.icon || <FaMicrochip />,
      color: getTypeColor(formData.type)
    };
    setEquipmentList([...equipmentList, newEquipment]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditEquipment = () => {
    const updatedList = equipmentList.map(item => 
      item.id === selectedEquipment.id 
        ? { ...selectedEquipment, ...formData, temperature: parseInt(formData.temperature), aqi: parseInt(formData.aqi), efficiency: parseInt(formData.efficiency) }
        : item
    );
    setEquipmentList(updatedList);
    setShowEditModal(false);
    resetForm();
  };

  const handleDeleteEquipment = () => {
    setEquipmentList(equipmentList.filter(item => item.id !== selectedEquipment.id));
    setShowDeleteModal(false);
    setSelectedEquipment(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'thermal',
      status: 'active',
      zone: '',
      plant: '',
      location: '',
      lastMaintenance: '',
      nextMaintenance: '',
      temperature: '',
      aqi: '',
      efficiency: '',
      uptime: '',
      manufacturer: '',
      model: '',
      purchaseDate: '',
      warrantyUntil: ''
    });
  };

  const openEditModal = (equipment) => {
    setSelectedEquipment(equipment);
    setFormData({
      name: equipment.name,
      type: equipment.type,
      status: equipment.status,
      zone: equipment.zone,
      plant: equipment.plant,
      location: equipment.location,
      lastMaintenance: equipment.lastMaintenance,
      nextMaintenance: equipment.nextMaintenance,
      temperature: equipment.temperature,
      aqi: equipment.aqi,
      efficiency: equipment.efficiency,
      uptime: equipment.uptime,
      manufacturer: equipment.manufacturer || '',
      model: equipment.model || '',
      purchaseDate: equipment.purchaseDate || '',
      warrantyUntil: equipment.warrantyUntil || ''
    });
    setShowEditModal(true);
  };

  // Equipment Form Modal Component (Defined INSIDE component but BEFORE return)
  const EquipmentModal = ({ title, isOpen, onClose, onSave }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
          
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                    placeholder="Enter equipment name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                  >
                    {equipmentTypes.filter(t => t.id !== 'all').map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                  >
                    {statusOptions.filter(s => s.id !== 'all').map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({...formData, zone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="">Select Zone</option>
                    {zones.map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plant *</label>
                  <select
                    value={formData.plant}
                    onChange={(e) => setFormData({...formData, plant: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="">Select Plant</option>
                    {plants.map(plant => (
                      <option key={plant} value={plant}>{plant}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                    placeholder="Enter location"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                    placeholder="Enter manufacturer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                    placeholder="Enter model number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                    placeholder="Enter temperature"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AQI Value</label>
                  <input
                    type="number"
                    value={formData.aqi}
                    onChange={(e) => setFormData({...formData, aqi: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                    placeholder="Enter AQI"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Efficiency (%)</label>
                  <input
                    type="number"
                    value={formData.efficiency}
                    onChange={(e) => setFormData({...formData, efficiency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                    placeholder="Enter efficiency"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uptime (%)</label>
                  <input
                    type="text"
                    value={formData.uptime}
                    onChange={(e) => setFormData({...formData, uptime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                    placeholder="Enter uptime"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Maintenance</label>
                  <input
                    type="date"
                    value={formData.lastMaintenance}
                    onChange={(e) => setFormData({...formData, lastMaintenance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance</label>
                  <input
                    type="date"
                    value={formData.nextMaintenance}
                    onChange={(e) => setFormData({...formData, nextMaintenance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Until</label>
                  <input
                    type="date"
                    value={formData.warrantyUntil}
                    onChange={(e) => setFormData({...formData, warrantyUntil: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-300"
                  />
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={onSave} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg flex items-center gap-2">
                <FaSave /> Save Equipment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal Component (Defined INSIDE component but BEFORE return)
  const DeleteModal = () => {
    if (!showDeleteModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-500 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Equipment</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedEquipment?.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleDeleteEquipment} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // MAIN RETURN STATEMENT
  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Equipment Management</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all industrial equipment</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <FaPlus /> Add Equipment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Total Equipment</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-500">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Maintenance</p>
          <p className="text-2xl font-bold text-orange-500">{stats.maintenance}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Warning</p>
          <p className="text-2xl font-bold text-red-500">{stats.warning}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Avg. Efficiency</p>
          <p className="text-2xl font-bold text-purple-500">{stats.avgEfficiency}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {equipmentTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                  selectedType === type.id 
                    ? `bg-${type.color}-100 text-${type.color}-600 border-2 border-${type.color}-300`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type.icon}
                <span className="text-sm">{type.name}</span>
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            {statusOptions.map(status => (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id)}
                className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  selectedStatus === status.id
                    ? `bg-${status.color}-100 text-${status.color}-600 border-2 border-${status.color}-300`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.name}
              </button>
            ))}
          </div>
          
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

      {/* Equipment Grid/List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((equipment) => {
            const statusBadge = getStatusBadge(equipment.status);
            return (
              <div key={equipment.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                <div className={`bg-${equipment.color}-50 p-4 border-b border-${equipment.color}-100`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-${equipment.color}-100 flex items-center justify-center text-${equipment.color}-600`}>
                        {equipment.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{equipment.name}</h3>
                        <p className="text-xs text-gray-500">{equipment.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditModal(equipment)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg">
                        <FaEdit />
                      </button>
                      <button onClick={() => {
                        setSelectedEquipment(equipment);
                        setShowDeleteModal(true);
                      }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.style}`}>
                      {statusBadge.icon}
                      {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FaClock className="text-xs" />
                      Next: {equipment.nextMaintenance}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <p className="text-xs text-gray-500">Zone</p>
                      <p className="text-sm font-medium">{equipment.zone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Plant</p>
                      <p className="text-sm font-medium">{equipment.plant}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Efficiency</p>
                      <p className="text-sm font-medium text-green-600">{equipment.efficiency}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-sm font-medium">{equipment.uptime}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Performance</span>
                      <span>{equipment.efficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`bg-${equipment.color}-500 rounded-full h-2 transition-all`} style={{ width: `${equipment.efficiency}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 flex justify-between text-xs">
                  <button className="text-purple-600 hover:text-purple-700 flex items-center gap-1">
                    <FaChartLine /> Details
                  </button>
                  <button className="text-gray-500 hover:text-gray-600 flex items-center gap-1">
                    <FaWrench /> Maintenance
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Equipment</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Zone/Plant</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Efficiency</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Next Maintenance</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEquipment.map((equipment) => {
                const statusBadge = getStatusBadge(equipment.status);
                return (
                  <tr key={equipment.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-${equipment.color}-100 flex items-center justify-center text-${equipment.color}-600`}>
                          {equipment.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{equipment.name}</p>
                          <p className="text-xs text-gray-500">{equipment.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm">{equipment.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusBadge.style}`}>
                        {statusBadge.icon}
                        {equipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{equipment.zone}</p>
                      <p className="text-xs text-gray-500">{equipment.plant}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{equipment.efficiency}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div className={`bg-${equipment.color}-500 rounded-full h-1.5`} style={{ width: `${equipment.efficiency}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{equipment.nextMaintenance}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEditModal(equipment)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                          <FaEdit />
                        </button>
                        <button onClick={() => {
                          setSelectedEquipment(equipment);
                          setShowDeleteModal(true);
                        }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredEquipment.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <FaMicrochip className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Equipment Found</h3>
          <p className="text-gray-400 mb-4">Try adjusting your filters or add new equipment</p>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-purple-500 text-white rounded-lg">
            + Add Equipment
          </button>
        </div>
      )}

      {/* Modals - Now components are defined above, so no error */}
      <EquipmentModal
        title="Add New Equipment"
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddEquipment}
      />
      
      <EquipmentModal
        title="Edit Equipment"
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditEquipment}
      />
      
      <DeleteModal />
    </div>
  );
};

export default Equipment;