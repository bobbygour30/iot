// src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    address: '',
    state: '',
    city: '',
    pinCode: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pinCode.trim()) newErrors.pinCode = 'PIN code is required';
    else if (!/^\d{6}$/.test(formData.pinCode)) newErrors.pinCode = 'PIN code must be 6 digits';
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
      setIsLoading(true);
      try {
        const registrationData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          companyName: formData.companyName,
          address: formData.address,
          state: formData.state,
          city: formData.city,
          pinCode: formData.pinCode,
        };
        
        await register(registrationData);
        navigate('/dashboard');
      } catch (error) {
        setApiError(error.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/50 backdrop-blur-sm shadow-lg mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-700">Create Account</h1>
          <p className="text-gray-500 mt-2">Register your company account</p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-white/40">
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {apiError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-pink-300 rounded-full"></span>
                Company Information
              </h2>
              <div className="grid grid-cols-1 gap-4">
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 rounded-xl border border-blue-200 bg-blue-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all resize-none"
                    placeholder="Enter complete address"
                  />
                  {errors.address && <p className="text-xs text-pink-500 mt-1">{errors.address}</p>}
                </div>
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
            </div>

            {/* User Credentials Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-300 rounded-full"></span>
                User Credentials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-purple-200 bg-purple-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="text-xs text-pink-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-purple-200 bg-purple-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className="text-xs text-pink-500 mt-1">{errors.lastName}</p>}
                </div>
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

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <p className="text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-500 hover:text-purple-600 font-medium transition-colors">
                  Login →
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