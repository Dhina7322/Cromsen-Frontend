  import axios from 'axios';

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const api = axios.create({
    baseURL: API_URL,
  });

  // Interceptor to add auth tokens or roles
  api.interceptors.request.use((config) => {
    const role = localStorage.getItem('userRole') || 'customer';
    config.headers['x-user-role'] = role;
    
    // Try to get admin token if it exists
    const isAuth = localStorage.getItem("cromsen_auth") || sessionStorage.getItem("cromsen_auth");
    if (isAuth) {
      // For now we use a mock token or session-based auth logic
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

  // Homepage Config API
  export const getHomepageConfig = async () => {
    const response = await api.get('/homepage');
    return response.data;
  };

  export const updateHomepageConfig = async (config) => {
    const response = await api.put('/homepage', config);
    return response.data;
  };

  // Reviews API
  export const getReviewsByProduct = async (productId) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  };

  export const createReview = async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  };

  // Blog API
  export const getBlogs = async () => {
    const response = await api.get('/blogs');
    return response.data;
  };

  export const getBlogBySlug = async (slug) => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
  };

  export const getAdminBlogs = async () => {
    const response = await api.get('/blogs/admin');
    return response.data;
  };

  export const createBlog = async (formData) => {
    const response = await api.post('/blogs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  };

  export const updateBlog = async (id, formData) => {
    const response = await api.put(`/blogs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  };

  export const deleteBlog = async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  };

  // Inquiry API
  export const createInquiry = async (inquiryData) => {
    const response = await api.post('/inquiries', inquiryData);
    return response.data;
  };

  // Policies API
  export const getPolicies = async () => {
    const response = await api.get('/policies');
    return response.data;
  };

  export default api;
