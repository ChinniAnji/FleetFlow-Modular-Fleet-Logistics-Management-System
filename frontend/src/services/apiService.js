import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },
};

export const vehicleService = {
  getAll: async (params) => {
    const response = await api.get('/vehicles', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/vehicles/stats');
    return response.data;
  },
};

export const driverService = {
  getAll: async (params) => {
    const response = await api.get('/drivers', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/drivers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/drivers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/drivers/stats');
    return response.data;
  },
};

export const deliveryService = {
  getAll: async (params) => {
    const response = await api.get('/deliveries', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/deliveries/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/deliveries', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/deliveries/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/deliveries/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/deliveries/stats');
    return response.data;
  },
};

export const routeService = {
  getAll: async (params) => {
    const response = await api.get('/routes', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/routes/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/routes', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/routes/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/routes/${id}`);
    return response.data;
  },
};

export const maintenanceService = {
  getAll: async (params) => {
    const response = await api.get('/maintenance', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/maintenance', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  },
};

export const fuelService = {
  getAll: async (params) => {
    const response = await api.get('/fuel', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/fuel', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/fuel/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/fuel/${id}`);
    return response.data;
  },

  getStats: async (params) => {
    const response = await api.get('/fuel/stats', { params });
    return response.data;
  },
};

export const analyticsService = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  getRevenue: async (params) => {
    const response = await api.get('/analytics/revenue', { params });
    return response.data;
  },

  getFleetPerformance: async () => {
    const response = await api.get('/analytics/fleet-performance');
    return response.data;
  },
};
