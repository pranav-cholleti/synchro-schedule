
import { AuthUser, Meeting, User, MeetingFormData, ActionItem } from '@/types';

// For demo purposes, we'll use localStorage to store data
// In a real app, these would be API calls to a backend

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    age: 32,
    organisation: 'Acme Corp',
    position: 'Product Manager',
    email: 'john@example.com',
    mobile: '555-1234',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    age: 28,
    organisation: 'Acme Corp',
    position: 'Frontend Developer',
    email: 'jane@example.com',
    mobile: '555-5678',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Bob Johnson',
    age: 35,
    organisation: 'Acme Corp',
    position: 'UX Designer',
    email: 'bob@example.com',
    createdAt: new Date().toISOString(),
  },
];

// Mock meetings data
const mockMeetings: Meeting[] = [
  {
    id: '1',
    name: 'Weekly Sprint Planning',
    dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    hostId: '1',
    organisation: 'Acme Corp',
    attendees: [
      { userId: '1', role: 'host', name: 'John Doe', email: 'john@example.com' },
      { userId: '2', role: 'attendee', name: 'Jane Smith', email: 'jane@example.com' },
    ],
    isOnline: true,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    additionalComments: 'Discuss next sprint goals',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Design Review',
    dateTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    hostId: '1',
    organisation: 'Acme Corp',
    attendees: [
      { userId: '1', role: 'host', name: 'John Doe', email: 'john@example.com' },
      { userId: '3', role: 'attendee', name: 'Bob Johnson', email: 'bob@example.com' },
    ],
    isOnline: false,
    additionalComments: 'Review latest UI mockups',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock action items
const mockActionItems: ActionItem[] = [
  {
    id: '1',
    meetingId: '1',
    taskName: 'Update user dashboard wireframes',
    assignees: ['3'],
    deadline: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    priority: 2,
    progress: 'In Progress',
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    meetingId: '1',
    taskName: 'Fix login page responsiveness',
    assignees: ['2'],
    deadline: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    priority: 1,
    progress: 'Not Started',
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    meetingId: '2',
    taskName: 'Create brand style guide',
    assignees: ['3'],
    deadline: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
    priority: 3,
    progress: 'Not Started',
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    meetingId: '2',
    taskName: 'Implement new header component',
    assignees: ['2'],
    deadline: new Date(Date.now() + 345600000).toISOString(), // 4 days from now
    priority: 2,
    progress: 'Completed',
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
];

// Initialize localStorage with mock data if not already present
const initializeLocalStorage = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem('meetings')) {
    localStorage.setItem('meetings', JSON.stringify(mockMeetings));
  }
  if (!localStorage.getItem('actionItems')) {
    localStorage.setItem('actionItems', JSON.stringify(mockActionItems));
  }
};

initializeLocalStorage();

// Helper functions to get and set data from localStorage
const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

const getMeetings = (): Meeting[] => {
  return JSON.parse(localStorage.getItem('meetings') || '[]');
};

const getActionItems = (): ActionItem[] => {
  return JSON.parse(localStorage.getItem('actionItems') || '[]');
};

const saveUsers = (users: User[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

const saveMeetings = (meetings: Meeting[]) => {
  localStorage.setItem('meetings', JSON.stringify(meetings));
};

const saveActionItems = (actionItems: ActionItem[]) => {
  localStorage.setItem('actionItems', JSON.stringify(actionItems));
};

// API functions
export const api = {
  // Auth API
  auth: {
    login: async (email: string, password: string): Promise<AuthUser> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const users = getUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // In a real app, we would validate the password
      // For demo, we'll just assume it's correct if the email exists
      
      return {
        ...user,
        token: 'mock-jwt-token',
      };
    },
    
    register: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<AuthUser> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const users = getUsers();
      if (users.some(u => u.email === userData.email)) {
        throw new Error('Email already in use');
      }
      
      const newUser: User = {
        ...userData,
        id: (users.length + 1).toString(),
        createdAt: new Date().toISOString(),
      };
      
      saveUsers([...users, newUser]);
      
      return {
        ...newUser,
        token: 'mock-jwt-token',
      };
    },
  },
  
  // Meetings API
  meetings: {
    create: async (meetingData: MeetingFormData, userId: string, userName: string, userEmail: string, organisation: string): Promise<Meeting> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const meetings = getMeetings();
      const newMeeting: Meeting = {
        ...meetingData,
        id: (meetings.length + 1).toString(),
        hostId: userId,
        organisation,
        attendees: [
          { userId, role: 'host' as const, name: userName, email: userEmail },
          ...meetingData.attendees.map(attendeeId => {
            const user = getUsers().find(u => u.id === attendeeId);
            return { 
              userId: attendeeId, 
              role: 'attendee' as const,
              name: user?.name || 'Unknown',
              email: user?.email || 'unknown@example.com'
            };
          })
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      saveMeetings([...meetings, newMeeting]);
      
      return newMeeting;
    },
    
    getAll: async (userId: string): Promise<Meeting[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const meetings = getMeetings();
      return meetings.filter(meeting => 
        meeting.attendees.some(attendee => attendee.userId === userId)
      );
    },
    
    getById: async (meetingId: string): Promise<Meeting> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const meetings = getMeetings();
      const meeting = meetings.find(m => m.id === meetingId);
      
      if (!meeting) {
        throw new Error('Meeting not found');
      }
      
      return meeting;
    },
    
    update: async (meetingId: string, updatedData: Partial<Meeting>): Promise<Meeting> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const meetings = getMeetings();
      const meetingIndex = meetings.findIndex(m => m.id === meetingId);
      
      if (meetingIndex === -1) {
        throw new Error('Meeting not found');
      }
      
      const updatedMeeting: Meeting = {
        ...meetings[meetingIndex],
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
      
      meetings[meetingIndex] = updatedMeeting;
      saveMeetings(meetings);
      
      return updatedMeeting;
    },

    getMeetingStats: async (meetingId: string): Promise<any> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const actionItems = getActionItems().filter(item => item.meetingId === meetingId);
      
      const tasksByStatus = {
        'Not Started': actionItems.filter(item => item.progress === 'Not Started').length,
        'In Progress': actionItems.filter(item => item.progress === 'In Progress').length,
        'Completed': actionItems.filter(item => item.progress === 'Completed').length,
        'Blocked': actionItems.filter(item => item.progress === 'Blocked').length,
      };
      
      const priorityDistribution = actionItems.reduce((acc, item) => {
        const priorityGroup = item.priority <= 3 ? 'High' : item.priority <= 6 ? 'Medium' : 'Low';
        acc[priorityGroup] = (acc[priorityGroup] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Get unique assignees
      const uniqueAssignees = [...new Set(actionItems.flatMap(item => item.assignees))];
      const assigneeStats = uniqueAssignees.map(assigneeId => {
        const user = getUsers().find(u => u.id === assigneeId);
        const tasksForAssignee = actionItems.filter(item => item.assignees.includes(assigneeId));
        
        return {
          assignee: user?.name || 'Unknown',
          totalTasks: tasksForAssignee.length,
          completedTasks: tasksForAssignee.filter(t => t.progress === 'Completed').length,
          inProgressTasks: tasksForAssignee.filter(t => t.progress === 'In Progress').length,
          notStartedTasks: tasksForAssignee.filter(t => t.progress === 'Not Started').length,
          blockedTasks: tasksForAssignee.filter(t => t.progress === 'Blocked').length,
        };
      });
      
      // Simple AI summary (mocked)
      const aiSummary = `Meeting has ${actionItems.length} total tasks: ${tasksByStatus['Completed']} completed, ${tasksByStatus['In Progress']} in progress, ${tasksByStatus['Not Started']} not started, and ${tasksByStatus['Blocked']} blocked. There are ${priorityDistribution['High'] || 0} high-priority tasks requiring immediate attention.`;
      
      return {
        tasksByStatus,
        priorityDistribution,
        assigneeStats,
        aiSummary,
        totalTasks: actionItems.length,
      };
    }
  },
  
  // Users API
  users: {
    getByOrganisation: async (organisation: string): Promise<User[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const users = getUsers();
      return users.filter(user => user.organisation === organisation);
    },
  },
  
  // Action Items API
  actionItems: {
    getByMeeting: async (meetingId: string): Promise<ActionItem[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const actionItems = getActionItems();
      return actionItems.filter(item => item.meetingId === meetingId);
    },
    
    getAssignedToUser: async (userId: string): Promise<ActionItem[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const actionItems = getActionItems();
      return actionItems.filter(item => item.assignees.includes(userId));
    },

    create: async (actionItemData: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionItem> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const actionItems = getActionItems();
      const newActionItem: ActionItem = {
        ...actionItemData,
        id: (actionItems.length + 1).toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      saveActionItems([...actionItems, newActionItem]);
      
      return newActionItem;
    },
    
    update: async (actionItemId: string, updatedData: Partial<ActionItem>): Promise<ActionItem> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const actionItems = getActionItems();
      const itemIndex = actionItems.findIndex(item => item.id === actionItemId);
      
      if (itemIndex === -1) {
        throw new Error('Action item not found');
      }
      
      // If updating progress to Completed, add completedAt date
      const completedAt = updatedData.progress === 'Completed' 
        ? new Date().toISOString() 
        : updatedData.progress !== 'Completed' 
          ? undefined 
          : actionItems[itemIndex].completedAt;
      
      const updatedItem: ActionItem = {
        ...actionItems[itemIndex],
        ...updatedData,
        completedAt,
        updatedAt: new Date().toISOString(),
      };
      
      actionItems[itemIndex] = updatedItem;
      saveActionItems(actionItems);
      
      return updatedItem;
    },
  },
};
