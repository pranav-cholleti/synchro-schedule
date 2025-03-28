
export type User = {
  id: string;
  name: string;
  age: number;
  organisation: string;
  position: string;
  email: string;
  mobile?: string;
  createdAt: string;
};

export type AuthUser = User & {
  token: string;
};

export type Meeting = {
  id: string;
  name: string;
  dateTime: string;
  hostId: string;
  organisation: string;
  attendees: Array<{
    userId: string;
    role: 'host' | 'attendee';
    name: string;
    email: string;
  }>;
  meetingLink?: string;
  isOnline: boolean;
  additionalComments?: string;
  createdAt: string;
  updatedAt: string;
};

export type MeetingFormData = {
  name: string;
  dateTime: string;
  attendees: string[];
  isOnline: boolean;
  meetingLink?: string;
  additionalComments?: string;
};

export type ActionItem = {
  id: string;
  meetingId: string;
  taskName: string;
  assignees: string[];
  deadline: string;
  priority: number;
  progress: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  additionalComments?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};
