import { AuthUser, Meeting, User, MeetingFormData, ActionItem, ActionItemSuggestion } from '@/types';

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
      let completedAt = actionItems[itemIndex].completedAt;
      if (updatedData.progress === 'Completed' && actionItems[itemIndex].progress !== 'Completed') {
        completedAt = new Date().toISOString();
      } else if (updatedData.progress && updatedData.progress !== 'Completed') {
        completedAt = undefined;
      }
      
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
    
    batchUpdate: async (meetingId: string, actionItems: Partial<ActionItem>[]): Promise<{ created: number, updated: number, deleted: number }> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const existingItems = getActionItems();
      const meetingItems = existingItems.filter(item => item.meetingId === meetingId);
      
      // Track counts for response
      let created = 0;
      let updated = 0;
      let deleted = 0;
      
      // Items to keep (will be updated with new values)
      const updatedItems = existingItems.filter(item => item.meetingId !== meetingId);
      
      // Process each incoming item
      for (const item of actionItems) {
        if (item.id) {
          // Update existing item
          const existingItem = meetingItems.find(i => i.id === item.id);
          if (existingItem) {
            const updatedItem: ActionItem = {
              ...existingItem,
              ...item,
              updatedAt: new Date().toISOString(),
              // If status changed to Completed, add completedAt date
              completedAt: item.progress === 'Completed' && existingItem.progress !== 'Completed' 
                ? new Date().toISOString() 
                : existingItem.completedAt
            };
            
            // If status changed from Completed, remove completedAt
            if (item.progress && item.progress !== 'Completed' && existingItem.progress === 'Completed') {
              updatedItem.completedAt = undefined;
            }
            
            updatedItems.push(updatedItem);
            updated++;
          }
        } else if (item.taskName && item.assignees && item.deadline && item.priority) {
          // Create new item
          const newItem: ActionItem = {
            id: (existingItems.length + created + 1).toString(),
            meetingId,
            taskName: item.taskName,
            assignees: item.assignees as string[],
            deadline: item.deadline as string,
            priority: item.priority as number,
            progress: item.progress || 'Not Started',
            additionalComments: item.additionalComments,
            createdBy: 'current-user', // This would come from the authenticated user
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          updatedItems.push(newItem);
          created++;
        }
      }
      
      // Count deleted items
      deleted = meetingItems.length - updated;
      
      // Save all items
      saveActionItems(updatedItems);
      
      return { created, updated, deleted };
    },
  },
  
  // AI service API - these would call the Python backend in a real implementation
  ai: {
    extractTextFromFile: async (file: File): Promise<string> => {
      // In a real implementation, this would upload the file to the backend
      // and process it with PyPDF2/python-docx
      // For now, we'll simulate text extraction
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Longer delay to simulate processing
      
      return `# Meeting Minutes\n\n## Attendees\n- John Doe (Host)\n- Jane Smith\n- Bob Johnson\n\n## Agenda\n1. Project status update\n2. Task assignments\n3. Timeline review\n\n## Discussion\nJohn presented the current project status. We're on track for the Q3 launch but need to address the UI concerns raised by the QA team. Jane suggested implementing a new component library to improve consistency.\n\nBob mentioned the need for updated wireframes for the dashboard before next sprint. He will send examples of what he's looking for by Friday.\n\nTeam agreed that we need to fix the login page responsiveness issues before the next release. Jane will take ownership of this task.\n\n## Action Items\n- Bob to update user dashboard wireframes by next Wednesday\n- Jane to fix login page responsiveness issues by Friday\n- John to schedule a design review meeting next week\n- Team to review the brand style guide by end of month`;
    },
    
    formatMinutes: async (rawText: string): Promise<string> => {
      // In a real implementation, this would call the Gemini API
      // For now, just return the text with minimal formatting
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple formatting - in real implementation, Gemini would do much better
      return rawText.replace(/##/g, '### ').replace(/\n\n/g, '\n\n');
    },
    
    extractActionItems: async (minutesText: string): Promise<{ suggestions: ActionItemSuggestion[] }> => {
      // In a real implementation, this would call the Gemini API
      // For now, return predefined suggestions
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return {
        suggestions: [
          {
            taskName: 'Update user dashboard wireframes',
            suggestedAssignees: ['Bob'],
            deadline: new Date(Date.now() + 604800000).toISOString(), // 1 week from now
            priority: 2,
            context: 'Bob mentioned the need for updated wireframes for the dashboard before next sprint.',
          },
          {
            taskName: 'Fix login page responsiveness issues',
            suggestedAssignees: ['Jane'],
            deadline: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
            priority: 1,
            context: 'Team agreed that we need to fix the login page responsiveness issues before the next release. Jane will take ownership of this task.',
          },
          {
            taskName: 'Schedule design review meeting',
            suggestedAssignees: ['John'],
            deadline: new Date(Date.now() + 432000000).toISOString(), // 5 days from now
            priority: 3,
            context: 'John to schedule a design review meeting next week',
          },
          {
            taskName: 'Review brand style guide',
            suggestedAssignees: ['Team'],
            deadline: new Date(Date.now() + 1728000000).toISOString(), // End of month
            priority: 5,
            context: 'Team to review the brand style guide by end of month',
          },
        ]
      };
    },
    
    summarizeMeeting: async (minutesText: string): Promise<string> => {
      // In a real implementation, this would call the Gemini API
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return 'The team discussed project status for Q3 launch, with UI concerns raised by QA. Jane proposed a new component library for consistency. Bob requested updated dashboard wireframes. The team agreed to prioritize fixing login page responsiveness issues. Key action items were assigned with specific deadlines.';
    },
    
    analyzeProgress: async (tasks: any[]): Promise<string> => {
      // In a real implementation, this would call the Gemini API
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const completedCount = tasks.filter(t => t.status === 'Completed').length;
      const percentage = Math.round((completedCount / tasks.length) * 100);
      
      return `Your team has completed ${completedCount} out of ${tasks.length} tasks (${percentage}%). There are ${tasks.filter(t => t.status === 'Blocked').length} blocked tasks that need attention. The highest priority incomplete task is "${tasks.find(t => t.status !== 'Completed')?.taskName || 'None'}".`;
    },
  },
  
  // File handling API
  files: {
    uploadMeetingMinutes: async (meetingId: string, file: File): Promise<string> => {
      // In a real implementation, this would upload the file to a storage service
      // For now, simulate uploading and return a mock URL
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Store file metadata in localStorage for demonstration
      const meetings = getMeetings();
      const meetingIndex = meetings.findIndex(m => m.id === meetingId);
      
      if (meetingIndex === -1) {
        throw new Error('Meeting not found');
      }
      
      const mockFileUrl = `https://storage.example.com/meetings/${meetingId}/${file.name}`;
      
      // In a real app, we'd update the meeting record in the database
      // For now, we'll just return the mock URL
      
      return mockFileUrl;
    },
    
    generateMeetingPDF: async (meetingId: string, content: string): Promise<string> => {
      // In a real implementation, this would generate a PDF with the content
      // For now, simulate PDF generation and return a mock URL
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockPdfUrl = `https://storage.example.com/meetings/${meetingId}/minutes.pdf`;
      
      return mockPdfUrl;
    },
  },
  
  // Notification API (would be server-side in a real app)
  notifications: {
    sendMeetingReminder: async (meetingId: string): Promise<boolean> => {
      // In a real implementation, this would send emails via a service like SendGrid
      console.log(`[MOCK] Sending meeting reminder for meeting ${meetingId}`);
      return true;
    },
    
    sendTaskReminder: async (taskId: string): Promise<boolean> => {
      console.log(`[MOCK] Sending task reminder for task ${taskId}`);
      return true;
    },
    
    sendMeetingMinutes: async (meetingId: string, attendeeEmails: string[], pdfUrl: string): Promise<boolean> => {
      console.log(`[MOCK] Sending meeting minutes for meeting ${meetingId} to ${attendeeEmails.join(', ')}`);
      return true;
    },
    
    sendProgressReport: async (hostEmail: string, meetingId: string, reportText: string): Promise<boolean> => {
      console.log(`[MOCK] Sending progress report for meeting ${meetingId} to ${hostEmail}`);
      return true;
    },
  },
};
