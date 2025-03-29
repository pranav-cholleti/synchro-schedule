
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { fileService } from '@/services/fileService';
import { Meeting, ActionItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, MapPin, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MinutesEditor from '@/components/MinutesEditor';
import ActionItemsList from '@/components/ActionItemsList';
import MeetingActions from '@/components/MeetingActions';

const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for minutes and action items
  const [extractedText, setExtractedText] = useState<string>('');
  const [formattedText, setFormattedText] = useState<string>('');
  const [uploadedMinutesUrl, setUploadedMinutesUrl] = useState<string>('');
  const [uploadedMinutesFilename, setUploadedMinutesFilename] = useState<string>('');

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!id || !user) return;
      
      try {
        const [fetchedMeeting, fetchedTasks] = await Promise.all([
          api.meetings.getById(id),
          api.actionItems.getByMeeting(id)
        ]);
        
        setMeeting(fetchedMeeting);
        setActionItems(fetchedTasks);
        
        // Set minutes-related states if available in the meeting data
        if (fetchedMeeting.extractedMinutesText) {
          setExtractedText(fetchedMeeting.extractedMinutesText);
        }
        if (fetchedMeeting.formattedMinutesText) {
          setFormattedText(fetchedMeeting.formattedMinutesText);
        }
        if (fetchedMeeting.uploadedMinutes) {
          setUploadedMinutesUrl(fetchedMeeting.uploadedMinutes.storagePath || '');
          setUploadedMinutesFilename(fetchedMeeting.uploadedMinutes.originalFilename || '');
        }
      } catch (error) {
        console.error('Error fetching meeting:', error);
        toast({
          title: "Error",
          description: "Failed to load meeting details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeeting();
  }, [id, user, toast]);

  const uploadMinutes = async (file: File) => {
    if (!id) return;
    
    try {
      // Use your API to upload the file
      const uploadResponse = await api.files.uploadMeetingMinutes(id, file);
      
      // Update the UI to show the uploaded file
      setUploadedMinutesUrl(uploadResponse);
      setUploadedMinutesFilename(file.name);
      
      // Fetch the updated meeting data after upload processing
      setTimeout(async () => {
        const updatedMeeting = await api.meetings.getById(id);
        setMeeting(updatedMeeting);
        
        if (updatedMeeting.extractedMinutesText) {
          setExtractedText(updatedMeeting.extractedMinutesText);
        }
        if (updatedMeeting.formattedMinutesText) {
          setFormattedText(updatedMeeting.formattedMinutesText);
        }
      }, 3000); // Wait for backend processing
    } catch (error) {
      console.error('Error uploading minutes:', error);
      throw error;
    }
  };

  const saveMinutes = async (text: string) => {
    if (!id) return;
    
    try {
      // Update the meeting with the new formatted text
      await api.meetings.update(id, { formattedMinutesText: text });
      setFormattedText(text);
    } catch (error) {
      console.error('Error saving minutes:', error);
      throw error;
    }
  };

  const extractActionItems = async () => {
    if (!id || !formattedText) return;
    
    try {
      const suggestions = await api.ai.extractActionItems(formattedText);
      
      // Instead of mutating state directly, redirect to the action items page
      // The suggestions will be available through the API there
      window.location.href = `/meetings/${id}/action-items`;
    } catch (error) {
      console.error('Error extracting action items:', error);
      toast({
        title: "Error extracting action items",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const generateMinutesPdf = async () => {
    if (!id || !formattedText) return;
    
    try {
      await api.files.generateMeetingPDF(id, formattedText);
      toast({
        title: "PDF generation initiated",
        description: "Your PDF is being generated and will be available soon.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const updateActionItemStatus = async (itemId: string, progress: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked') => {
    try {
      const updatedItem = await api.actionItems.update(itemId, { progress });
      setActionItems(prev => prev.map(item => 
        item.id === itemId ? updatedItem : item
      ));
      
      toast({
        title: "Status updated",
        description: `Action item status changed to ${progress}.`,
      });
    } catch (error) {
      console.error('Error updating action item:', error);
      toast({
        title: "Error",
        description: "Could not update the action item status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading meeting details...</div>;
  }

  if (!meeting) {
    return <div className="text-center py-10">Meeting not found or you don't have access to view it.</div>;
  }

  const meetingDate = new Date(meeting.dateTime);
  const isHost = meeting.attendees.some(a => a.userId === user?.id && a.role === 'host');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{meeting.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organized by {meeting.attendees.find(a => a.role === 'host')?.name}
          </p>
        </div>
        
        <MeetingActions 
          meetingId={id || ''} 
          isHost={isHost} 
          hasActionItems={actionItems.length > 0} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Meeting Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-synchro-600 mt-0.5" />
                <div>
                  <div className="font-medium">Date</div>
                  <div>{meetingDate.toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-synchro-600 mt-0.5" />
                <div>
                  <div className="font-medium">Time</div>
                  <div>{meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-5 w-5 text-synchro-600 mt-0.5" />
                <div>
                  <div className="font-medium">Attendees</div>
                  <div>{meeting.attendees.length} people</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                {meeting.isOnline ? (
                  <LinkIcon className="h-5 w-5 text-synchro-600 mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 text-synchro-600 mt-0.5" />
                )}
                <div>
                  <div className="font-medium">{meeting.isOnline ? 'Meeting Link' : 'Location'}</div>
                  {meeting.isOnline ? (
                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-synchro-600 hover:underline break-all">
                      {meeting.meetingLink}
                    </a>
                  ) : (
                    <div>In-person meeting</div>
                  )}
                </div>
              </div>
            </div>

            {meeting.additionalComments && (
              <div className="mt-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-5 w-5 text-synchro-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Additional Comments</div>
                    <div className="mt-1 whitespace-pre-line">{meeting.additionalComments}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {meeting.attendees.map((attendee) => (
                <li key={attendee.userId} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{attendee.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{attendee.email}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {attendee.role === 'host' ? 'Host' : 'Attendee'}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Minutes Editor Section */}
      <MinutesEditor
        meetingId={id || ''}
        extractedText={extractedText}
        formattedText={formattedText}
        uploadedMinutesUrl={uploadedMinutesUrl}
        uploadedMinutesFilename={uploadedMinutesFilename}
        isHost={isHost}
        onSaveMinutes={saveMinutes}
        onUploadMinutes={uploadMinutes}
        onExtractActionItems={extractActionItems}
        onGeneratePdf={generateMinutesPdf}
      />

      {/* Action Items Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Action Items</CardTitle>
          {isHost && (
            <Link to={`/meetings/${id}/action-items`}>
              <CardTitle className="text-sm text-blue-600 hover:underline cursor.pointer">
                {actionItems.length > 0 ? 'Manage Action Items' : 'Create Action Items'}
              </CardTitle>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          <ActionItemsList
            actionItems={actionItems}
            users={meeting.attendees.map(a => ({ 
              id: a.userId, 
              name: a.name,
              email: a.email,
              age: 0,
              organisation: meeting.organisation,
              position: '',
              createdAt: ''
            }))}
            isHost={isHost}
            onUpdateStatus={updateActionItemStatus}
          />
          
          {isHost && actionItems.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Link to={`/meetings/${id}/action-items`}>
                <span className="bg-synchro-600 hover:bg-synchro-700 text-white py-2 px-4 rounded">
                  Manage Action Items
                </span>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingDetail;
