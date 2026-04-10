import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    state: '',
    city: '',
    pinCode: '',
    plantName: '',
    zoneName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pinCode.trim()) newErrors.pinCode = 'PIN code is required';
    else if (!/^\d{6}$/.test(formData.pinCode)) newErrors.pinCode = 'PIN code must be 6 digits';
    if (!formData.plantName.trim()) newErrors.plantName = 'Plant name is required';
    if (!formData.zoneName.trim()) newErrors.zoneName = 'Zone name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Registration data:', formData);
      alert('Registration successful! (Demo)');
      setFormData({
        companyName: '',
        state: '',
        city: '',
        pinCode: '',
        plantName: '',
        zoneName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/50 backdrop-blur-sm shadow-lg mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-700">Zone Access Registration</h1>
          <p className="text-gray-500 mt-2">Create your zone-level account</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-white/40">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-pink-300 rounded-full"></span>
                Company Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-pink-200 bg-pink-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                    placeholder="Enter company name"
                  />
                  {errors.companyName && <p className="text-xs text-pink-500 mt-1">{errors.companyName}</p>}
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-300 rounded-full"></span>
                Location Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-blue-200 bg-blue-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                    placeholder="Enter state"
                  />
                  {errors.state && <p className="text-xs text-pink-500 mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-blue-200 bg-blue-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                    placeholder="Enter city"
                  />
                  {errors.city && <p className="text-xs text-pink-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    maxLength={6}
                    className="w-full px-4 py-2 rounded-xl border border-blue-200 bg-blue-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                    placeholder="6-digit PIN"
                  />
                  {errors.pinCode && <p className="text-xs text-pink-500 mt-1">{errors.pinCode}</p>}
                </div>
              </div>
            </div>

            {/* Plant & Zone Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-300 rounded-full"></span>
                Facility Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Plant Name *</label>
                  <input
                    type="text"
                    name="plantName"
                    value={formData.plantName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-green-200 bg-green-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
                    placeholder="Enter plant name"
                  />
                  {errors.plantName && <p className="text-xs text-pink-500 mt-1">{errors.plantName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Zone Name *</label>
                  <input
                    type="text"
                    name="zoneName"
                    value={formData.zoneName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-green-200 bg-green-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
                    placeholder="Enter zone name"
                  />
                  {errors.zoneName && <p className="text-xs text-pink-500 mt-1">{errors.zoneName}</p>}
                </div>
              </div>
            </div>

            {/* User Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-300 rounded-full"></span>
                User Credentials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-purple-200 bg-purple-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-xs text-pink-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    className="w-full px-4 py-2 rounded-xl border border-purple-200 bg-purple-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                    placeholder="10-digit mobile number"
                  />
                  {errors.phone && <p className="text-xs text-pink-500 mt-1">{errors.phone}</p>}
                </div>
                
                {/* Password Field with Eye Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 pr-10 rounded-xl border border-purple-200 bg-purple-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                      placeholder="Min. 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:opacity-70 transition-opacity text-gray-400 hover:text-purple-500"
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-pink-500 mt-1">{errors.password}</p>}
                </div>
                
                {/* Confirm Password Field with Eye Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 pr-10 rounded-xl border border-purple-200 bg-purple-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:opacity-70 transition-opacity text-gray-400 hover:text-purple-500"
                    >
                      {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-pink-500 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                Create Zone Account
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-gray-500">
                Already have an account?{' '}
                <Link to={'/login'} className="text-purple-500 hover:text-purple-600 font-medium transition-colors">
                  Zone Login →
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;