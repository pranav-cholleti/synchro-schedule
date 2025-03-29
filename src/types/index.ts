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
  extractedMinutesText?: string;
  formattedMinutesText?: string;
  uploadedMinutes?: {
    originalFilename: string;
    storagePath: string;
    mimeType: string;
    uploadedAt: string;
  };
  aiSummary?: string;
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

// Backend configuration types
export type BackendConfig = {
  apiUrl: string;
  aiServiceUrl: string;
  emailServiceEnabled: boolean;
};

// AI service types
export type TextExtractionRequest = {
  filePath: string;
  fileType: 'pdf' | 'docx' | 'txt';
};

export type TextExtractionResponse = {
  extractedText: string;
  success: boolean;
  error?: string;
};

export type FormattedMinutesRequest = {
  rawText: string;
};

export type FormattedMinutesResponse = {
  formattedText: string;
  success: boolean;
  error?: string;
};

export type ActionItemExtractionRequest = {
  minutesText: string;
};

export type ActionItemSuggestion = {
  taskName: string;
  suggestedAssignees: string[];
  deadline?: string;
  priority: number;
  context: string;
};

export type ActionItemExtractionResponse = {
  suggestions: ActionItemSuggestion[];
  success: boolean;
  error?: string;
};

export type MeetingSummaryRequest = {
  minutesText: string;
};

export type MeetingSummaryResponse = {
  summary: string;
  success: boolean;
  error?: string;
};

export type ProgressAnalysisRequest = {
  meetingId: string;
  tasks: Array<{
    id: string;
    taskName: string;
    status: string;
    deadline: string;
    assigneeName: string;
  }>;
};

export type ProgressAnalysisResponse = {
  analysisReport: string;
  completionPercentage: number;
  riskItems: string[];
  success: boolean;
  error?: string;
};
