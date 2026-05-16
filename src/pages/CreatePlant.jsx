import React, { useState, useEffect } from 'react';
import {
  FaIndustry,
  FaPlus,
  FaTrash,
  FaSpinner,
  FaEdit
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Static list of Indian states and cities (you can expand this)
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const citiesByState = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Kurnool', 'Kakinada', 'Rajahmundry', 'Kadapa', 'Anantapur', 'Eluru', 'Vizianagaram'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Tezu'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Sivasagar'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Nalanda'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Ambikapur', 'Raigarh'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Bharuch', 'Vapi'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Sirsa'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Hamirpur', 'Bilaspur', 'Chamba', 'Una'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Phusro'],
  'Karnataka': ['Bengaluru', 'Hubballi-Dharwad', 'Mysuru', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Davangere', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru', 'Udupi'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Alappuzha', 'Palakkad', 'Malappuram', 'Kannur', 'Kottayam', 'Kasaragod'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Pimpri-Chinchwad', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad', 'Navi Mumbai', 'Solapur', 'Mira-Bhayandar', 'Bhiwandi', 'Amravati', 'Kolhapur', 'Akola', 'Jalgaon'],
  'Manipur': ['Imphal', 'Churachandpur', 'Thoubal', 'Kakching', 'Ukhrul'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Cherrapunji'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib'],
  'Nagaland': ['Dimapur', 'Kohima', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot', 'Moga', 'Abohar', 'Phagwara'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Sri Ganganagar', 'Pali'],
  'Sikkim': ['Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Singtam'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Tiruppur', 'Salem', 'Erode', 'Tirunelveli', 'Vellore', 'Thoothukudi', 'Nagercoil', 'Thanjavur', 'Dindigul'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad'],
  'Tripura': ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar', 'Belonia'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Varanasi', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Ayodhya'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh'],
  'West Bengal': ['Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni'],
  
  // Union Territories
  'Andaman and Nicobar Islands': ['Port Blair', 'Garacharma', 'Bambooflat'],
  'Chandigarh': ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  'Delhi': ['New Delhi', 'Delhi Cantt', 'Narela', 'Dwarka', 'Rohini', 'Vasant Kunj', 'Karol Bagh'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Samba', 'Udhampur'],
  'Ladakh': ['Leh', 'Kargil'],
  'Lakshadweep': ['Kavaratti', 'Agatti', 'Amini', 'Andrott'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Yanam', 'Mahe']
};

const CreatePlant = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [plants, setPlants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [currentPlant, setCurrentPlant] = useState({
    name: '',
    city: '',
    state: '',
    address: '',
    description: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPlants();
  }, []);

  // Update available cities when state changes
  useEffect(() => {
    if (currentPlant.state) {
      setAvailableCities(citiesByState[currentPlant.state] || []);
      // Reset city if current city not in new state's cities
      if (!citiesByState[currentPlant.state]?.includes(currentPlant.city)) {
        setCurrentPlant(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
    }
  }, [currentPlant.state]);

  const fetchPlants = async () => {
    setFetching(true);
    try {
      const response = await api.getPlants();
      const plantsData = response.data || response;
      if (Array.isArray(plantsData)) {
        setPlants(plantsData);
      } else if (plantsData && Array.isArray(plantsData.data)) {
        setPlants(plantsData.data);
      } else {
        setPlants([]);
      }
    } catch (error) {
      console.error('Error fetching plants:', error);
      setMessage({ type: 'error', text: 'Failed to fetch plants' });
    } finally {
      setFetching(false);
    }
  };

  const handleAddPlant = async () => {
    if (!currentPlant.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter plant name' });
      return;
    }

    if (!currentPlant.state) {
      setMessage({ type: 'error', text: 'Please select a state' });
      return;
    }

    if (!currentPlant.city) {
      setMessage({ type: 'error', text: 'Please select a city' });
      return;
    }

    setLoading(true);
    try {
      if (editingPlant) {
        const response = await api.updatePlant(editingPlant._id, currentPlant);
        const updatedPlant = response.data || response;
        setPlants(plants.map(p => p._id === editingPlant._id ? updatedPlant : p));
        setMessage({ type: 'success', text: 'Plant updated successfully!' });
      } else {
        const response = await api.createPlant(currentPlant);
        const newPlant = response.data || response;
        setPlants([newPlant, ...plants]);
        setMessage({ type: 'success', text: 'Plant created successfully!' });
      }
      resetForm();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save plant' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlant = async (id) => {
    if (window.confirm('Are you sure you want to delete this plant? This will also delete all zones and devices under it.')) {
      try {
        await api.deletePlant(id);
        setPlants(plants.filter(p => p._id !== id));
        setMessage({ type: 'success', text: 'Plant deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete plant' });
      }
    }
  };

  const handleEditPlant = (plant) => {
    setEditingPlant(plant);
    setCurrentPlant({
      name: plant.name || '',
      city: plant.city || '',
      state: plant.state || '',
      address: plant.address || '',
      description: plant.description || ''
    });
    setSelectedState(plant.state || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setCurrentPlant({
      name: '',
      city: '',
      state: '',
      address: '',
      description: ''
    });
    setSelectedState('');
    setEditingPlant(null);
    setShowForm(false);
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <FaSpinner className="animate-spin text-5xl text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Plant Management</h1>
          <p className="text-gray-500 mt-2">Create and manage your industrial plants</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <FaPlus /> Create New Plant
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <h2 className="text-xl text-white font-bold">
                {editingPlant ? 'Edit Plant' : 'Create New Plant'}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plant Name */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Plant Name *</label>
                  <input
                    type="text"
                    value={currentPlant.name}
                    onChange={(e) => setCurrentPlant({ ...currentPlant, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter plant name"
                  />
                </div>

                {/* State Dropdown */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">State *</label>
                  <select
                    value={currentPlant.state}
                    onChange={(e) => setCurrentPlant({ ...currentPlant, state: e.target.value, city: '' })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {indianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* City Dropdown (depends on state) */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">City *</label>
                  <select
                    value={currentPlant.city}
                    onChange={(e) => setCurrentPlant({ ...currentPlant, city: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!currentPlant.state}
                  >
                    <option value="">Select City</option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Plant Address</label>
                  <input
                    type="text"
                    value={currentPlant.address}
                    onChange={(e) => setCurrentPlant({ ...currentPlant, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter full address"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-700">Additional Information</label>
                  <textarea
                    rows="3"
                    value={currentPlant.description}
                    onChange={(e) => setCurrentPlant({ ...currentPlant, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Any additional details about the plant"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPlant}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                  {editingPlant ? 'Update Plant' : 'Create Plant'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plant Cards */}
        {plants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <FaIndustry className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Plants Yet</h3>
            <p className="text-gray-400">Click "Create New Plant" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <div key={plant._id} className="bg-white rounded-2xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <FaIndustry className="text-purple-500 text-2xl" />
                  <h3 className="font-bold text-lg text-gray-800">{plant.name}</h3>
                </div>

                {(plant.city || plant.state) && (
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {plant.city}{plant.city && plant.state ? ', ' : ''}{plant.state}
                  </p>
                )}

                {plant.address && (
                  <p className="text-sm text-gray-500 mb-2">🏢 {plant.address}</p>
                )}

                {plant.description && (
                  <p className="text-sm text-gray-500 mb-3">{plant.description}</p>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleEditPlant(plant)}
                    className="flex-1 py-2 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center gap-2 hover:bg-yellow-100 transition-all"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlant(plant._id)}
                    className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePlant;