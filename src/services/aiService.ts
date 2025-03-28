import { 
  TextExtractionRequest, 
  TextExtractionResponse,
  FormattedMinutesRequest,
  FormattedMinutesResponse,
  ActionItemExtractionRequest,
  ActionItemExtractionResponse,
  MeetingSummaryRequest,
  MeetingSummaryResponse,
  ProgressAnalysisRequest,
  ProgressAnalysisResponse,
  ActionItemSuggestion
} from '@/types';
import backendConfig from '@/config/backend';

// Helper function to make API calls to the AI service
const callAiService = async <T, U>(endpoint: string, data: T): Promise<U> => {
  try {
    // In development or when the AI service is not available, use mock responses
    if (!import.meta.env.PROD || import.meta.env.VITE_USE_MOCK_AI === 'true') {
      return getMockResponse<T, U>(endpoint, data);
    }
    
    const response = await fetch(`${backendConfig.aiServiceUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_AI_SERVICE_API_KEY || 'dummy-key'}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }
    
    return await response.json() as U;
  } catch (error) {
    console.error(`Error calling AI service endpoint ${endpoint}:`, error);
    // Return a mock response as fallback
    return getMockResponse<T, U>(endpoint, data);
  }
};

// Mock responses for development
const getMockResponse = <T, U>(endpoint: string, data: T): U => {
  switch (endpoint) {
    case 'extract-text':
      return {
        extractedText: `# Meeting Minutes\n\n## Attendees\n- John Doe (Host)\n- Jane Smith\n- Bob Johnson\n\n## Agenda\n1. Project status update\n2. Task assignments\n3. Timeline review\n\n## Discussion\nJohn presented the current project status. We're on track for the Q3 launch but need to address the UI concerns raised by the QA team. Jane suggested implementing a new component library to improve consistency.\n\nBob mentioned the need for updated wireframes for the dashboard before next sprint. He will send examples of what he's looking for by Friday.\n\nTeam agreed that we need to fix the login page responsiveness issues before the next release. Jane will take ownership of this task.\n\n## Action Items\n- Bob to update user dashboard wireframes by next Wednesday\n- Jane to fix login page responsiveness issues by Friday\n- John to schedule a design review meeting next week\n- Team to review the brand style guide by end of month`,
        success: true
      } as unknown as U;
      
    case 'format-minutes':
      return {
        formattedText: (data as unknown as FormattedMinutesRequest).rawText.replace(/##/g, '### ').replace(/\n\n/g, '\n\n'),
        success: true
      } as unknown as U;
      
    case 'extract-action-items':
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
        ],
        success: true
      } as unknown as U;
      
    case 'summarize':
      return {
        summary: 'The team discussed project status for Q3 launch, with UI concerns raised by QA. Jane proposed a new component library for consistency. Bob requested updated dashboard wireframes. The team agreed to prioritize fixing login page responsiveness issues. Key action items were assigned with specific deadlines.',
        success: true
      } as unknown as U;
      
    case 'analyze-progress':
      return {
        analysisReport: 'Your team has completed 1 out of 4 tasks (25%). There are 0 blocked tasks that need attention. The highest priority incomplete task is "Fix login page responsiveness issues".',
        completionPercentage: 25,
        riskItems: ['Fix login page responsiveness issues'],
        success: true
      } as unknown as U;
      
    default:
      return { success: false, error: 'Unknown endpoint' } as unknown as U;
  }
};

// AI Service API
export const aiService = {
  extractTextFromFile: async (file: File): Promise<TextExtractionResponse> => {
    // In a real implementation, this would upload the file to the backend
    // For mock purposes, we'll just simulate the response
    
    // Create a mock request
    const mockRequest: TextExtractionRequest = {
      filePath: file.name,
      fileType: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'txt'
    };
    
    return await callAiService<TextExtractionRequest, TextExtractionResponse>('extract-text', mockRequest);
  },
  
  formatMinutes: async (rawText: string): Promise<FormattedMinutesResponse> => {
    const request: FormattedMinutesRequest = { rawText };
    return await callAiService<FormattedMinutesRequest, FormattedMinutesResponse>('format-minutes', request);
  },
  
  extractActionItems: async (minutesText: string): Promise<ActionItemExtractionResponse> => {
    const request: ActionItemExtractionRequest = { minutesText };
    return await callAiService<ActionItemExtractionRequest, ActionItemExtractionResponse>('extract-action-items', request);
  },
  
  summarizeMeeting: async (minutesText: string): Promise<MeetingSummaryResponse> => {
    const request: MeetingSummaryRequest = { minutesText };
    return await callAiService<MeetingSummaryRequest, MeetingSummaryResponse>('summarize', request);
  },
  
  analyzeProgress: async (meetingId: string, tasks: Array<{
    id: string;
    taskName: string;
    status: string;
    deadline: string;
    assigneeName: string;
  }>): Promise<ProgressAnalysisResponse> => {
    const request: ProgressAnalysisRequest = { meetingId, tasks };
    return await callAiService<ProgressAnalysisRequest, ProgressAnalysisResponse>('analyze-progress', request);
  },
  
  mapSuggestedAssigneesToUserIds: async (suggestions: ActionItemSuggestion[], users: any[]): Promise<ActionItemSuggestion[]> => {
    // Simple mapping function to convert suggested assignee names to user IDs
    return suggestions.map(suggestion => {
      const assigneeUserIds = suggestion.suggestedAssignees
        .map(name => {
          // Try to find a user with a name that includes the suggested name
          const user = users.find(u => 
            u.name.toLowerCase().includes(name.toLowerCase()) || 
            name.toLowerCase().includes(u.name.toLowerCase().split(' ')[0])
          );
          return user?.id;
        })
        .filter(id => id !== undefined) as string[];
      
      return {
        ...suggestion,
        suggestedAssignees: assigneeUserIds
      };
    });
  }
};
