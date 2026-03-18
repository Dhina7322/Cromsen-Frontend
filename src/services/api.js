  import axios from 'axios';

  const API_URL = '/api';

  const api = axios.create({
    baseURL: API_URL,
  });

  // Interceptor to add auth tokens or roles
  api.interceptors.request.use((config) => {
    const role = localStorage.getItem('userRole') || 'customer';
    config.headers['x-user-role'] = role;
    
    // Try to get admin token if it exists
    const isAuth = sessionStorage.getItem("cromsen_auth");
    if (isAuth) {
      // For now we use a mock token or session-basedauth logic 
      // If you add real JWT, include it here:
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

  // Admin Auth
  export const adminLogin = (credentials) => api.post('/admin/login', credentials);
  export const getAdminStats = () => api.get('/admin/stats');

  export default api;
