import axios from 'axios';
import { Destination, Festival, EcoSite } from '../types';

const api = axios.create({
  baseURL: 'https://capstone-project-szpy.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          if (parsed.token) {
            config.headers.Authorization = `Bearer ${parsed.token}`;
          }
        } catch (e) {
          console.error("Error parsing user info", e);
        }
      }
    }
    // Remove default Content-Type if sending FormData so browser can set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data?.message);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error: No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const destinationApi = {
  getAll: async (params?: { type?: string }) => {
    const response = await api.get<{ success: boolean; count: number; data: Destination[] }>('/destinations', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Destination }>(`/destinations/${id}`);
    return response.data;
  },
  getCultural: async () => {
    const response = await api.get<{ success: boolean; count: number; data: Destination[] }>('/cultural');
    return response.data;
  },
};

export const ecoApi = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; count: number; data: EcoSite[] }>('/ecotourism');
    return response.data;
  },
};

export const festivalApi = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; count: number; data: Festival[] }>('/festivals');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Festival }>(`/festivals/${id}`);
    return response.data;
  },
};

export const recommendationApi = {
  get: async (params: { travelType?: string; budget?: string; season?: string; interests?: string[] }) => {
    const response = await api.get<{ success: boolean; count: number; data: Destination[] }>('/recommendations', { params });
    return response.data;
  },
};

export interface ItineraryData {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  days: {
    day: number;
    activities: {
      time?: string;
      location?: string;
      description?: string;
      destinationId?: string;
    }[];
  }[];
  totalBudget?: number;
}

export const itineraryApi = {
  create: async (data: ItineraryData) => {
    const response = await api.post<{ success: boolean; data: any }>('/itineraries', data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get<{ success: boolean; count: number; data: any[] }>('/itineraries');
    return response.data;
  },
  getMyItineraries: async () => {
    const response = await api.get<{ success: boolean; count: number; data: any[] }>('/itineraries/my');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: any }>(`/itineraries/${id}`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/itineraries/${id}`);
    return response.data;
  }
};

export const authApi = {
  resetPasswordRequest: async (email: string) => {
    const response = await api.post('/auth/reset-password-request', { email });
    return response.data;
  },
  resetPassword: async (token: string, userId: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, userId, newPassword });
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

export const adminApi = {
  // Destinations
  addDestination: async (data: any) => {
    const response = await api.post('/admin/add-destination', data);
    return response.data;
  },
  updateDestination: async (id: string, data: any) => {
    const response = await api.put(`/admin/update-destination/${id}`, data);
    return response.data;
  },
  deleteDestination: async (id: string) => {
    const response = await api.delete(`/admin/delete-destination/${id}`);
    return response.data;
  },
  // Festivals
  addFestival: async (data: any) => {
    const response = await api.post('/festivals', data);
    return response.data;
  },
  updateFestival: async (id: string, data: any) => {
    const response = await api.put(`/festivals/${id}`, data);
    return response.data;
  },
  deleteFestival: async (id: string) => {
    const response = await api.delete(`/festivals/${id}`);
    return response.data;
  },
  // Users
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  updateUserRole: async (id: string, role: string) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  // Reviews
  getAllReviews: async () => {
    const response = await api.get('/admin/reviews');
    return response.data;
  },
  deleteReview: async (id: string) => {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
  },
  // Analytics
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },
  // Posts
  deletePost: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  // Comments
  deleteComment: async (postId: string, commentId: string) => {
    const response = await api.delete(`/posts/${postId}/comment/${commentId}`);
    return response.data;
  },
};

export const userApi = {
  updateProfile: async (data: { name?: string; email?: string; password?: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};

export const weatherApi = {
  getCurrent: async (lat: number, lng: number) => {
    const response = await api.get('/weather/current', { params: { lat, lng } });
    return response.data;
  },
  getRecommendation: async (month: string) => {
    const response = await api.get('/weather/recommendation', { params: { month } });
    return response.data;
  },
};

export const bookingApi = {
  create: async (data: any) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },
  getBooking: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  cancelBooking: async (id: string) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },
};

export const issueApi = {
  create: async (data: { subject: string; category: string; message: string }) => {
    const response = await api.post('/issues', data);
    return response.data;
  },
  getMyIssues: async () => {
    const response = await api.get('/issues/my');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/issues');
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/issues/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/issues/${id}`);
    return response.data;
  },
};

export default api;
