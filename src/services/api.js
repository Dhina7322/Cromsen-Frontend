import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
// In dev, VITE_API_URL is empty so Vite proxy forwards /api → localhost:5001

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to add auth tokens or roles
api.interceptors.request.use((config) => {
  const role = localStorage.getItem('userRole') || 'customer';
  config.headers['x-user-role'] = role;

  const isAuth = sessionStorage.getItem("cromsen_auth");
  if (isAuth) {
    // config.headers['Authorization'] = `Bearer ${sessionStorage.getItem("cromsen_token")}`;
  }

  return config;
});

// Product API
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (formData) => {
  const response = await api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateProduct = async (id, formData) => {
  const response = await api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Category API
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (formData) => {
  const response = await api.post('/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateCategory = async (id, formData) => {
  const response = await api.put(`/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// SubCategory API
export const getSubCategories = async () => {
  const response = await api.get('/subcategories');
  return response.data;
};

export const createSubCategory = async (formData) => {
  const response = await api.post('/subcategories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateSubCategory = async (id, formData) => {
  const response = await api.put(`/subcategories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteSubCategory = async (id) => {
  const response = await api.delete(`/subcategories/${id}`);
  return response.data;
};

// Orders API
export const getOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}`, { status });
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};

// Users API
export const getUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.put(`/users/${id}/role`, { role });
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await api.put(`/users/${id}/toggle-status`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Sub-Admin API
export const getSubAdmins = async () => {
  const response = await api.get('/admin/subadmins');
  return response.data;
};

export const createSubAdmin = async (data) => {
  const response = await api.post('/admin/subadmins', data);
  return response.data;
};

export const updateSubAdmin = async (id, data) => {
  const response = await api.put(`/admin/subadmins/${id}`, data);
  return response.data;
};

export const deleteSubAdmin = async (id) => {
  const response = await api.delete(`/admin/subadmins/${id}`);
  return response.data;
};

// Admin Settings API
export const changeAdminPassword = async (data) => {
  const response = await api.put('/admin/change-password', data);
  return response.data;
};

export const changeAdminUsername = async (data) => {
  const response = await api.put('/admin/change-username', data);
  return response.data;
};

// Admin Auth
export const adminLogin = (credentials) => api.post('/admin/login', credentials);
export const getAdminStats = () => api.get('/admin/stats');

export default api;
