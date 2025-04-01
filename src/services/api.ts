import axios from 'axios';
import getBackendConfig from '@/config/backend';
import { ApiResponse } from '@/types';

// Configure axios with base URL and interceptors
const baseURL = getBackendConfig.apiUrl;
const axiosInstance = axios.create({ baseURL });

// Add request interceptor to add auth token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorResponse = error.response;
    
    // If 401 Unauthorized, redirect to login
    if (errorResponse && errorResponse.status === 401) {
      // Clear token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
const authApi = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }
};

// Users API
const usersApi = {
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/users/me');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  getByOrganisation: async (search = '') => {
    try {
      const response = await axiosInstance.get(`/users/organisation${search ? `?search=${search}` : ''}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching organisation users:', error);
      return [];
    }
  },
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }
};

// Meetings API
const meetingsApi = {
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/meetings', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      return { meetings: [], totalPages: 0, currentPage: 1, totalMeetings: 0 };
    }
  },
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/meetings/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching meeting ${id}:`, error);
      return null;
    }
  },
  getActionItems: async (meetingId) => {
    try {
      const response = await axiosInstance.get(`/meetings/${meetingId}/action-items`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching action items for meeting ${meetingId}:`, error);
      return [];
    }
  },
  getMeetingStats: async (meetingId) => {
    try {
      const response = await axiosInstance.get(`/meetings/${meetingId}/dashboard`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching meeting stats for meeting ${meetingId}:`, error);
      return null;
    }
  },
  create: async (meeting) => {
    try {
      const response = await axiosInstance.post('/meetings', meeting);
      return response.data.data;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  },
  update: async (id, meeting) => {
    try {
      const response = await axiosInstance.put(`/meetings/${id}`, meeting);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating meeting ${id}:`, error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/meetings/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting meeting ${id}:`, error);
      throw error;
    }
  },
  addAttendee: async (meetingId, userId) => {
    try {
      const response = await axiosInstance.post(`/meetings/${meetingId}/attendees`, { userId });
      return response.data.data;
    } catch (error) {
      console.error(`Error adding attendee to meeting ${meetingId}:`, error);
      throw error;
    }
  },
  removeAttendee: async (meetingId, userId) => {
    try {
      const response = await axiosInstance.delete(`/meetings/${meetingId}/attendees/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error removing attendee from meeting ${meetingId}:`, error);
      throw error;
    }
  },
  promoteAttendee: async (meetingId, userId) => {
    try {
      const response = await axiosInstance.put(`/meetings/${meetingId}/attendees/${userId}/promote`);
      return response.data.data;
    } catch (error) {
      console.error(`Error promoting attendee in meeting ${meetingId}:`, error);
      throw error;
    }
  },
  uploadMinutes: async (meetingId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axiosInstance.post(`/meetings/${meetingId}/minutes/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error uploading minutes for meeting ${meetingId}:`, error);
      throw error;
    }
  },
  updateMinutes: async (meetingId, formattedMinutesText) => {
    try {
      const response = await axiosInstance.put(`/meetings/${meetingId}/minutes`, { formattedMinutesText });
      return response.data;
    } catch (error) {
      console.error(`Error updating minutes for meeting ${meetingId}:`, error);
      throw error;
    }
  },
  extractActionItems: async (meetingId) => {
    try {
      const response = await axiosInstance.post(`/meetings/${meetingId}/extract-actions`);
      return response.data.data;
    } catch (error) {
      console.error(`Error extracting action items for meeting ${meetingId}:`, error);
      throw error;
    }
  },
  generateMeetingPDF: async (meetingId) => {
    try {
      const response = await axiosInstance.post(`/meetings/${meetingId}/minutes/generate-pdf`);
      return response.data;
    } catch (error) {
      console.error(`Error generating PDF for meeting ${meetingId}:`, error);
      throw error;
    }
  },
  getMeetingDashboard: async (meetingId) => {
    try {
      const response = await axiosInstance.get(`/meetings/${meetingId}/dashboard`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching dashboard for meeting ${meetingId}:`, error);
      return null;
    }
  },
  saveActionItems: async (meetingId, actionItems) => {
    try {
      const response = await axiosInstance.put(`/meetings/${meetingId}/action-items`, { actionItems });
      return response.data;
    } catch (error) {
      console.error(`Error saving action items for meeting ${meetingId}:`, error);
      throw error;
    }
  }
};

// Tasks (Action Items) API
const actionItemsApi = {
  getAssignedToUser: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/tasks/assigned', { 
        params: typeof params === 'object' ? params : {} 
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
      return { tasks: [], totalPages: 0, currentPage: 1, totalTasks: 0 };
    }
  },
  getScheduledByUser: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/tasks/scheduled', { 
        params: typeof params === 'object' ? params : {} 
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching scheduled tasks:', error);
      return { tasks: [], totalPages: 0, currentPage: 1, totalTasks: 0 };
    }
  },
  getByMeeting: async (meetingId) => {
    try {
      const response = await axiosInstance.get(`/meetings/${meetingId}/action-items`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching action items for meeting ${meetingId}:`, error);
      return [];
    }
  },
  create: async (task) => {
    try {
      const response = await axiosInstance.post('/tasks', task);
      return response.data.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },
  update: async (id, task) => {
    try {
      const response = await axiosInstance.put(`/tasks/${id}`, task);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  },
  batchUpdate: async (meetingId, tasks) => {
    try {
      const response = await axiosInstance.put(`/meetings/${meetingId}/action-items`, { actionItems: tasks });
      return response.data;
    } catch (error) {
      console.error(`Error batch updating tasks for meeting ${meetingId}:`, error);
      throw error;
    }
  },
  updateProgress: async (id, progress) => {
    try {
      const response = await axiosInstance.put(`/tasks/${id}`, { progress });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating progress for task ${id}:`, error);
      throw error;
    }
  }
};

// AI API service
const aiApi = {
  extractActionItems: async (text) => {
    try {
      const response = await axiosInstance.post('/ai/extract-action-items', { text });
      return response.data;
    } catch (error) {
      console.error('Error extracting action items with AI:', error);
      throw error;
    }
  }
};

export const api = {
  users: usersApi,
  meetings: meetingsApi,
  actionItems: actionItemsApi,
  auth: authApi,
  ai: aiApi
};
