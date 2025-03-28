
import backendConfig from '@/config/backend';

// Helper function to make API calls to the notification service
const callNotificationService = async <T>(endpoint: string, data: T): Promise<boolean> => {
  try {
    // In development or when the notification service is not available, just log and return success
    if (!import.meta.env.PROD || !backendConfig.emailServiceEnabled) {
      console.log(`[MOCK] Notification service call to ${endpoint}:`, data);
      return true;
    }
    
    const response = await fetch(`${backendConfig.apiUrl}/notifications/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Notification service error: ${response.statusText}`);
    }
    
    return (await response.json()).success;
  } catch (error) {
    console.error(`Error calling notification service endpoint ${endpoint}:`, error);
    return false;
  }
};

// Notification Service API
export const notificationService = {
  sendMeetingReminder: async (meetingId: string, attendeeEmails: string[]): Promise<boolean> => {
    return await callNotificationService('meeting-reminder', {
      meetingId,
      attendeeEmails
    });
  },
  
  sendTaskReminder: async (taskId: string, assigneeEmails: string[], taskName: string, deadline: string): Promise<boolean> => {
    return await callNotificationService('task-reminder', {
      taskId,
      assigneeEmails,
      taskName,
      deadline
    });
  },
  
  sendMeetingMinutes: async (meetingId: string, meetingName: string, attendeeEmails: string[], pdfUrl: string): Promise<boolean> => {
    return await callNotificationService('meeting-minutes', {
      meetingId,
      meetingName,
      attendeeEmails,
      pdfUrl
    });
  },
  
  sendProgressReport: async (hostEmail: string, meetingId: string, meetingName: string, reportText: string): Promise<boolean> => {
    return await callNotificationService('progress-report', {
      hostEmail,
      meetingId,
      meetingName,
      reportText
    });
  }
};
