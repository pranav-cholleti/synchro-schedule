import axios from 'axios';
import { User, Meeting, ActionItem, BackendConfig } from '@/types';

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
};

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
  }
};

const backendConfigApi = {
  get: async () => {
    const response = await axios.get<BackendConfig>('/api/config');
    return response.data;
  },
};

export const api = {
  users: usersApi,
  meetings: meetingsApi,
  actionItems: actionItemsApi,
  config: backendConfigApi,
};
