// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ==================== AUTH ENDPOINTS ====================
  
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  // ==================== PLANT ENDPOINTS (User) ====================
  
  async createPlant(plantData) {
    return this.request('/plants', {
      method: 'POST',
      body: JSON.stringify(plantData),
    });
  }

  async getPlants() {
    return this.request('/plants');
  }

  async getPlant(id) {
    return this.request(`/plants/${id}`);
  }

  async updatePlant(id, plantData) {
    return this.request(`/plants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plantData),
    });
  }

  async deletePlant(id) {
    return this.request(`/plants/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ZONE ENDPOINTS (User) ====================
  
  async createZone(zoneData) {
    return this.request('/zones', {
      method: 'POST',
      body: JSON.stringify(zoneData),
    });
  }

  async getZonesByPlant(plantId) {
    return this.request(`/zones/plant/${plantId}`);
  }

  async getZone(id) {
    return this.request(`/zones/${id}`);
  }

  async updateZone(id, zoneData) {
    return this.request(`/zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(zoneData),
    });
  }

  async deleteZone(id) {
    return this.request(`/zones/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== DEVICE ENDPOINTS (User) ====================
  
  async registerDevice(deviceData) {
    return this.request('/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  async getDevicesByZone(zoneId) {
    return this.request(`/devices/zone/${zoneId}`);
  }

  async getDevicesByPlant(plantId) {
    return this.request(`/devices/plant/${plantId}`);
  }

  async getDevice(id) {
    return this.request(`/devices/${id}`);
  }

  async updateDevice(id, deviceData) {
    return this.request(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deviceData),
    });
  }

  async deleteDevice(id) {
    return this.request(`/devices/${id}`, {
      method: 'DELETE',
    });
  }

  async updateDeviceReading(deviceId, readingData) {
    return this.request(`/devices/${deviceId}/reading`, {
      method: 'POST',
      body: JSON.stringify(readingData),
    });
  }

  // ==================== ADMIN DASHBOARD ENDPOINTS ====================
  
  // Dashboard Stats
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminGrowthData() {
    return this.request('/admin/growth-data');
  }

  async getAdminRecentUsers() {
    return this.request('/admin/recent-users');
  }

  // ==================== ADMIN USER MANAGEMENT ====================
  
  async getAdminUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/users${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminUser(id) {
    return this.request(`/admin/users/${id}`);
  }

  async createAdminUser(userData) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateAdminUser(id, userData) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteAdminUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleAdminUserStatus(id) {
    return this.request(`/admin/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // ==================== ADMIN ZONE MANAGEMENT ====================
  
  async getAdminZones() {
    return this.request('/admin/zones');
  }

  async createAdminZone(zoneData) {
    return this.request('/admin/zones', {
      method: 'POST',
      body: JSON.stringify(zoneData),
    });
  }

  async updateAdminZone(id, zoneData) {
    return this.request(`/admin/zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(zoneData),
    });
  }

  async deleteAdminZone(id) {
    return this.request(`/admin/zones/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ADMIN PLANT MANAGEMENT ====================
  
  async getAdminPlants() {
    return this.request('/admin/plants');
  }

  async createAdminPlant(plantData) {
    return this.request('/admin/plants', {
      method: 'POST',
      body: JSON.stringify(plantData),
    });
  }

  async updateAdminPlant(id, plantData) {
    return this.request(`/admin/plants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plantData),
    });
  }

  async deleteAdminPlant(id) {
    return this.request(`/admin/plants/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ADMIN DEVICE MANAGEMENT ====================
  
  async getAdminDevices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/devices${queryString ? `?${queryString}` : ''}`);
  }

  async registerAdminDevice(deviceData) {
    return this.request('/admin/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  async updateAdminDevice(id, deviceData) {
    return this.request(`/admin/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deviceData),
    });
  }

  async deleteAdminDevice(id) {
    return this.request(`/admin/devices/${id}`, {
      method: 'DELETE',
    });
  }

  async updateAdminDeviceStatus(id, status) {
    return this.request(`/admin/devices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // ==================== LEGACY ZONE ENDPOINTS ====================
  
  async getLegacyZone() {
    return this.request('/zones');
  }

  async updateZoneSettings(settings) {
    return this.request('/zones/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // ==================== UTILITY METHODS ====================
  
  async downloadReport(endpoint, filename) {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Download failed');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

  clearUserData() {
    this.setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    sessionStorage.clear();
  }
}

export default new ApiService();