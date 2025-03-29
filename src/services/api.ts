
import axios from 'axios';

const usersApi = {
  getAll: async () => {
    try {
      const response = await axios.get('/api/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },
  getById: async (id) => {
    try {
      const response = await axios.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  },
  getByOrganisation: async (organisation) => {
    try {
      const response = await axios.get(`/api/users?organisation=${organisation}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching users for organisation ${organisation}:`, error);
      return [];
    }
  },
  create: async (user) => {
    try {
      const response = await axios.post('/api/users', user);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  update: async (id, user) => {
    try {
      const response = await axios.put(`/api/users/${id}`, user);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await axios.delete(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
};

const meetingsApi = {
  getAll: async () => {
    try {
      const response = await axios.get('/api/meetings');
      return response.data;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      return [];
    }
  },
  getById: async (id) => {
    try {
      const response = await axios.get(`/api/meetings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching meeting ${id}:`, error);
      return null;
    }
  },
  create: async (meeting) => {
    try {
      const response = await axios.post('/api/meetings', meeting);
      return response.data;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  },
  update: async (id, meeting) => {
    try {
      const response = await axios.put(`/api/meetings/${id}`, meeting);
      return response.data;
    } catch (error) {
      console.error(`Error updating meeting ${id}:`, error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await axios.delete(`/api/meetings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting meeting ${id}:`, error);
      throw error;
    }
  },
  getActionItems: async (meetingId) => {
    try {
      const response = await axios.get(`/api/action-items?meetingId=${meetingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching action items for meeting ${meetingId}:`, error);
      return [];
    }
  },
  generateMeetingPDF: async (meetingId) => {
    try {
      const response = await axios.get(`/api/meetings/${meetingId}/pdf`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `meeting-${meetingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error(`Error generating PDF for meeting ${meetingId}:`, error);
      throw error;
    }
  }
};

const actionItemsApi = {
  getAll: async () => {
    try {
      const response = await axios.get('/api/action-items');
      return response.data;
    } catch (error) {
      console.error('Error fetching action items:', error);
      return [];
    }
  },
  getById: async (id) => {
    try {
      const response = await axios.get(`/api/action-items/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching action item ${id}:`, error);
      return null;
    }
  },
  create: async (actionItem) => {
    try {
      const response = await axios.post('/api/action-items', actionItem);
      return response.data;
    } catch (error) {
      console.error('Error creating action item:', error);
      throw error;
    }
  },
  update: async (id, actionItem) => {
    try {
      const response = await axios.put(`/api/action-items/${id}`, actionItem);
      return response.data;
    } catch (error) {
      console.error(`Error updating action item ${id}:`, error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await axios.delete(`/api/action-items/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting action item ${id}:`, error);
      throw error;
    }
  }
};

const backendConfigApi = {
  get: async () => {
    try {
      const response = await axios.get('/api/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching backend config:', error);
      return null;
    }
  }
};

const authApi = {
  login: async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },
  forgotPassword: async (email) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error during forgot password:', error);
      throw error;
    }
  },
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post('/api/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      console.error('Error during password reset:', error);
      throw error;
    }
  }
};

const aiApi = {
  generateSummary: async (meetingId) => {
    try {
      const response = await axios.post(`/api/ai/summarize`, { meetingId });
      return response.data;
    } catch (error) {
      console.error('Error generating meeting summary:', error);
      throw error;
    }
  },
  generateActionItems: async (meetingId) => {
    try {
      const response = await axios.post(`/api/ai/action-items`, { meetingId });
      return response.data;
    } catch (error) {
      console.error('Error generating action items:', error);
      throw error;
    }
  }
};

const filesApi = {
  upload: async (file, meetingId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('meetingId', meetingId);
      
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
  getByMeeting: async (meetingId) => {
    try {
      const response = await axios.get(`/api/files?meetingId=${meetingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching files for meeting ${meetingId}:`, error);
      return [];
    }
  },
  delete: async (fileId) => {
    try {
      const response = await axios.delete(`/api/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting file ${fileId}:`, error);
      throw error;
    }
  }
};

export const api = {
  users: usersApi,
  meetings: meetingsApi,
  actionItems: actionItemsApi,
  config: backendConfigApi,
  auth: authApi,
  ai: aiApi,
  files: filesApi
};
