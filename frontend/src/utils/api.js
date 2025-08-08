import axios from 'axios';
import { getToken, removeToken } from './auth';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const booksAPI = {
  getAll: () => api.get('/books'),
  getMyBooks: () => api.get('/books/my'),
  add: (bookData) => api.post('/books', bookData),
  update: (bookId, bookData) => api.put(`/books/${bookId}`, bookData),
  delete: (bookId) => api.delete(`/books/${bookId}`),
  search: (query) => api.get(`/books/search?q=${query}`),
};

export const exchangeAPI = {
  create: (exchangeData) => api.post('/exchanges', exchangeData),
  getReceived: () => api.get('/exchanges/received'),
  getSent: () => api.get('/exchanges/sent'),
  respond: (exchangeId, action) => api.put(`/exchanges/${exchangeId}/respond`, { action }),
};

export default api;
