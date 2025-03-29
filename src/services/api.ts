
import axios from 'axios';
import { User, Meeting, ActionItem, BackendConfig } from '@/types';

// Auth API
const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await axios.post('/api/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: Omit<User, "id" | "createdAt"> & { password: string }) => {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  }
};

// Users API
const usersApi = {
  getAll: async () => {
    const response = await axios.get<User[]>('/api/users');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get<User>(`/api/users/${id}`);
    return response.data;
  },

  getByOrganisation: async (organisation: string) => {
    const response = await axios.get<User[]>(`/api/users?organisation=${organisation}`);
    return response.data;
  },

  create: async (user: Omit<User, 'id' | 'createdAt'>) => {
    const response = await axios.post<User>('/api/users', user);
    return response.data;
  },

  update: async (id: string, user: Partial<User>) => {
    const response = await axios.put<User>(`/api/users/${id}`, user);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`/api/users/${id}`);
    return response.data;
  }
};

// Meetings API
const meetingsApi = {
  getAll: async () => {
    const response = await axios.get<Meeting[]>('/api/meetings');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await axios.get<Meeting>(`/api/meetings/${id}`);
    return response.data;
  },
  
  create: async (meeting: Omit<Meeting, 'id' | 'hostId' | 'organisation' | 'attendees' | 'createdAt' | 'updatedAt'> & { attendees: string[] }) => {
    const response = await axios.post<Meeting>('/api/meetings', meeting);
    return response.data;
  },
  
  update: async (id: string, meeting: Partial<Meeting> | { 
    name?: string; 
    dateTime?: string; 
    attendees?: string[]; 
    isOnline?: boolean; 
    meetingLink?: string; 
    additionalComments?: string; 
  }) => {
    const response = await axios.put<Meeting>(`/api/meetings/${id}`, meeting);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await axios.delete(`/api/meetings/${id}`);
    return response.data;
  },

  getActionItems: async (meetingId: string) => {
    const response = await axios.get<ActionItem[]>(`/api/action-items?meetingId=${meetingId}`);
    return response.data;
  },
  
  // Add missing methods based on errors
  getMeetingStats: async (meetingId: string) => {
    const response = await axios.get(`/api/meetings/${meetingId}/dashboard`);
    return response.data;
  },
  
  uploadMinutes: async (meetingId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      `/api/meetings/${meetingId}/minutes/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
  
  updateMinutesText: async (meetingId: string, formattedMinutesText: string) => {
    const response = await axios.put(`/api/meetings/${meetingId}/minutes`, { formattedMinutesText });
    return response.data;
  },
  
  generateMinutesPdf: async (meetingId: string) => {
    const response = await axios.post(`/api/meetings/${meetingId}/minutes/generate-pdf`);
    return response.data;
  },
  
  addAttendee: async (meetingId: string, userId: string) => {
    const response = await axios.post(`/api/meetings/${meetingId}/attendees`, { userId });
    return response.data;
  },
  
  promoteAttendee: async (meetingId: string, userId: string) => {
    const response = await axios.put(`/api/meetings/${meetingId}/attendees/${userId}/promote`);
    return response.data;
  },
  
  removeAttendee: async (meetingId: string, userId: string) => {
    const response = await axios.delete(`/api/meetings/${meetingId}/attendees/${userId}`);
    return response.data;
  }
};

// Action Items API
const actionItemsApi = {
  getAll: async () => {
    const response = await axios.get<ActionItem[]>('/api/action-items');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get<ActionItem>(`/api/action-items/${id}`);
    return response.data;
  },

  create: async (actionItem: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await axios.post<ActionItem>('/api/action-items', actionItem);
    return response.data;
  },

  update: async (id: string, actionItem: Partial<ActionItem>) => {
    const response = await axios.put<ActionItem>(`/api/action-items/${id}`, actionItem);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axios.delete(`/api/action-items/${id}`);
    return response.data;
  },
  
  // Add missing methods based on errors
  getByMeeting: async (meetingId: string) => {
    const response = await axios.get<ActionItem[]>(`/api/meetings/${meetingId}/action-items`);
    return response.data;
  },
  
  batchUpdate: async (meetingId: string, actionItems: Array<Partial<ActionItem> & { id?: string }>) => {
    const response = await axios.put(`/api/meetings/${meetingId}/action-items`, { actionItems });
    return response.data;
  },
  
  getAssignedToUser: async (userId: string) => {
    const response = await axios.get<ActionItem[]>(`/api/tasks/assigned`);
    return response.data;
  },
  
  getScheduledByUser: async (userId: string) => {
    const response = await axios.get<ActionItem[]>(`/api/tasks/scheduled`);
    return response.data;
  }
};

// Config API
const backendConfigApi = {
  get: async () => {
    const response = await axios.get<BackendConfig>('/api/config');
    return response.data;
  },
};

// AI API
const aiApi = {
  extractActionItems: async (meetingId: string) => {
    const response = await axios.post(`/api/meetings/${meetingId}/extract-actions`);
    return response.data;
  },
  
  generateSummary: async (meetingId: string) => {
    const response = await axios.post(`/api/meetings/${meetingId}/generate-summary`);
    return response.data;
  }
};

// Files API
const filesApi = {
  uploadMeetingMinutes: async (meetingId: string, file: File) => {
    return meetingsApi.uploadMinutes(meetingId, file);
  },
  
  downloadMinutesPdf: async (meetingId: string) => {
    const response = await axios.get(`/api/meetings/${meetingId}/minutes/pdf`, { 
      responseType: 'blob' 
    });
    return response.data;
  },
  
  generateMeetingPDF: async (meetingId: string) => {
    return meetingsApi.generateMinutesPdf(meetingId);
  }
};

export const api = {
  auth: authApi,
  users: usersApi,
  meetings: meetingsApi,
  actionItems: actionItemsApi,
  config: backendConfigApi,
  ai: aiApi,
  files: filesApi
};
