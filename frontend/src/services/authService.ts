import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  role: 'student' | 'instructor' | 'admin';
}

const authService = {
  login: async (data: LoginData) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const response = await axios.post(`${API_URL}/login`, formData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default authService;