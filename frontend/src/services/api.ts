import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Course service functions
export const courseService = {
  getAllCourses: () => api.get('/courses'),
  getCourseById: (id: string) => api.get(`/courses/${id}`),
  getEnrolledCourses: () => api.get('/courses/enrolled'),
  enrollInCourse: (courseId: string) => api.post(`/courses/${courseId}/enroll`),
};

// Recommendations service
export const recommendationsService = {
  getRecommendations: () => api.get('/recommendations'),
};

export default api;