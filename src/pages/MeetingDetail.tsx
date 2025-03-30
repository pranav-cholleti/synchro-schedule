
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Download, File, FileText, Calendar, Clock, Globe, Link as LinkIcon, Users, MessageSquare, ChevronLeft } from 'lucide-react';
import MinutesEditor from '@/components/MinutesEditor';
import ActionItemsList from '@/components/ActionItemsList';
import MeetingActions from '@/components/MeetingActions';

const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [meeting, setMeeting] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [minutes, setMinutes] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [savingMinutes, setSavingMinutes] = useState(false);
  
  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!id) return;
      
      try {
        const meetingData = await api.meetings.getById(id);
        
        if (meetingData) {
          setMeeting(meetingData);
          
          // Set attendees directly from the meeting data
          if (meetingData.attendees && meetingData.attendees.length > 0) {
            setAttendees(meetingData.attendees);
          }
          
          // Set minutes if available
          if (meetingData.formattedMinutesText) {
            setMinutes(meetingData.formattedMinutesText);
          }
          
          // Fetch action items
          const actionItemsData = await api.meetings.getActionItems(id);
          if (actionItemsData) {
            setActionItems(actionItemsData);
          }
        } else {
          toast({
            title: 'Error',
            description: 'Meeting not found',
            variant: 'destructive',
          });
          navigate('/meetings');
        }
      } catch (error) {
        console.error('Error fetching meeting details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load meeting details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeetingDetails();
  }, [id, navigate, toast]);
  
  const handleSaveMinutes = async (updatedMinutes) => {
    if (!id || !meeting) return;
    
    setSavingMinutes(true);
    
    try {
      await api.meetings.updateMinutes(id, updatedMinutes);
      setMinutes(updatedMinutes);
      
      toast({
        title: 'Success',
        description: 'Minutes saved successfully',
      });
    } catch (error) {
      console.error('Error saving minutes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save minutes',
        variant: 'destructive',
      });
    } finally {
      setSavingMinutes(false);
    }
  };
  
  const handleDownloadPDF = async () => {
    if (!id) return;
    
    try {
      await api.meetings.generateMeetingPDF(id);
      
      toast({
        title: 'Success',
        description: 'PDF generated successfully',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-synchro-600 border-opacity-50 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!meeting) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Meeting Not Found</h2>
        <p className="mb-4">The requested meeting could not be found.</p>
        <Button variant="outline" onClick={() => navigate('/meetings')}>
          Back to Meetings
        </Button>
      </div>
    );
  }
  
  // Format date and time
  const meetingDate = format(new Date(meeting.dateTime), 'EEEE, MMMM d, yyyy');
  const meetingTime = format(new Date(meeting.dateTime), 'h:mm a');
  const isPastMeeting = new Date(meeting.dateTime) < new Date();
  
  // Check if the current user is the host
  const isHost = meeting.attendees?.some(a => a.userId === user?.id && a.role === 'host') || meeting.hostId === user?.id;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/meetings')}>
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back to Meetings
        </Button>
        <h1 className="text-2xl font-bold">{meeting.name}</h1>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="details" onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="minutes">Minutes</TabsTrigger>
          <TabsTrigger value="action-items">Action Items</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        
        {/* Details Tab */}
        <TabsContent value="details" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold">Meeting Information</h3>
              <div className="space-y-2">
                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{meetingDate}</span>
                </p>
                <p className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{meetingTime}</span>
                </p>
                <p className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  <span>{meeting.isOnline ? 'Online Meeting' : 'In-Person Meeting'}</span>
                </p>
                {meeting.isOnline && meeting.meetingLink && (
                  <p className="flex items-center">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {meeting.meetingLink}
                    </a>
                  </p>
                )}
                <p className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Attendees: {attendees.map(attendee => attendee?.name).join(', ')}</span>
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Additional Comments</h3>
              <p>
                {meeting.additionalComments || 'No additional comments provided.'}
              </p>
            </div>
          </div>
        </TabsContent>
        
        {/* Minutes Tab */}
        <TabsContent value="minutes" className="mt-4">
          <MinutesEditor 
            meetingId={id || ''}
            formattedText={minutes}
            isHost={isHost}
            onSaveMinutes={handleSaveMinutes}
            uploadedMinutesFilename={meeting.uploadedMinutes?.originalFilename}
            uploadedMinutesUrl={meeting.uploadedMinutes?.storagePath}
          />
        </TabsContent>
        
        {/* Action Items Tab */}
        <TabsContent value="action-items" className="mt-4">
          <ActionItemsList 
            actionItems={actionItems} 
            users={attendees}
            isHost={isHost}
            onUpdateStatus={async () => {}}
          />
        </TabsContent>
        
        {/* Files Tab */}
        <TabsContent value="files" className="mt-4">
          <div className="text-center py-10 text-gray-500">
            {meeting.uploadedMinutes ? (
              <div className="flex flex-col items-center">
                <FileText className="h-12 w-12 mb-4" />
                <p className="font-medium">{meeting.uploadedMinutes.originalFilename}</p>
                <p className="text-sm mb-4">Uploaded on {format(new Date(meeting.uploadedMinutes.uploadedAt), 'PPP')}</p>
              </div>
            ) : (
              <p>No files have been uploaded yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Meeting Actions */}
      <MeetingActions 
        meetingId={id || ''} 
        isHost={isHost}
        hasActionItems={actionItems.length > 0}
      />
    </div>
  );
};

export default MeetingDetail;
