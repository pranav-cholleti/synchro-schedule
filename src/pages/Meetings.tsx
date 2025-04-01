
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Meeting } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, Globe, Users, CalendarDays, MoreVertical, Trash, Edit, Download } from 'lucide-react';
import { format } from 'date-fns';

const Meetings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) {
        console.error('No user found');
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.meetings.getAll();
        if (response && response.meetings) {
          // Process the meetings array from the response
          const meetingsWithAttendees = response.meetings.map(meeting => ({
            ...meeting,
            id: meeting.meetingId, // Map meetingId to id for consistency
            attendees: meeting.attendees || []
          }));
          setMeetings(meetingsWithAttendees);
          console.log('Meetings fetched:', meetingsWithAttendees);
        } else {
          console.error('Unexpected API response structure:', response);
          setMeetings([]);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load meetings',
          variant: 'destructive',
        });
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeetings();
  }, [user]);
  
  // Filter meetings
  const upcomingMeetings = Array.isArray(meetings) ? meetings.filter(meeting => 
    new Date(meeting.dateTime) >= new Date()
  ).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()) : [];
  
  const pastMeetings = Array.isArray(meetings) ? meetings.filter(meeting => 
    new Date(meeting.dateTime) < new Date()
  ).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()) : [];
  
  // Handle deletion
  const confirmDelete = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!meetingToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      await api.meetings.delete(meetingToDelete.id);
      
      // Remove the deleted meeting from state
      setMeetings(prevMeetings => prevMeetings.filter(m => m.id !== meetingToDelete.id));
      
      toast({
        title: 'Success',
        description: 'Meeting deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete meeting',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setMeetingToDelete(null);
    }
  };
  
  // Download PDF
  const handleDownloadPDF = async (meetingId: string) => {
    try {
      await api.meetings.generateMeetingPDF(meetingId);
      
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
  
  // Utility function to display formatted meeting date
  const formatMeetingDate = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return format(date, 'PPP');
  };
  
  // Utility function to display formatted meeting time
  const formatMeetingTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return format(date, 'p');
  };
  
  // Render a meeting card
  const renderMeetingCard = (meeting: Meeting) => {
    // Ensure attendees exists and defaulting to an empty array if it doesn't
    const attendees = meeting.attendees || [];
    
    // Check if the current user is a host
    const isHost = user && attendees.some(a => {
      // First check attendance by userId if available
      if (a.userId && user.id) {
        return a.userId === user.id && a.role === 'host';
      }
      // Fallback to check by email if userId not available
      return a.email === user.email && a.role === 'host';
    }) || meeting.hostId === user?.id;
    
    // Safely get meeting ID
    const meetingId = meeting.id;
    
    return (
      <Card key={meetingId} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <Link to={`/meetings/${meetingId}`} className="hover:underline">
              <CardTitle className="text-xl hover:text-synchro-600 transition-colors">
                {meeting.name}
              </CardTitle>
            </Link>
            
            {/* Menu for meeting actions (only for host) */}
            {isHost && (
              <div className="relative group">
                <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 hidden group-hover:block">
                  <ul className="py-1">
                    <li>
                      <Link 
                        to={`/meetings/${meetingId}/edit`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Meeting
                      </Link>
                    </li>
                    <li>
                      <button 
                        onClick={() => confirmDelete(meeting)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Meeting
                      </button>
                    </li>
                    
                    {new Date(meeting.dateTime) < new Date() && (
                      <li>
                        <button 
                          onClick={() => handleDownloadPDF(meetingId)}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="space-y-3">
            {/* Meeting details */}
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span>{formatMeetingDate(meeting.dateTime)}</span>
            </div>
            
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formatMeetingTime(meeting.dateTime)}</span>
            </div>
            
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Globe className="h-4 w-4 mr-2" />
              <span>{meeting.isOnline ? 'Online' : 'In Person'}</span>
            </div>
            
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4 mr-2" />
              <span>{attendees.length} attendees</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate(`/meetings/${meetingId}`)}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your meetings and appointments</p>
        </div>
        
        <Button 
          onClick={() => navigate('/meetings/create')}
          className="bg-synchro-600 hover:bg-synchro-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Meeting
        </Button>
      </div>
      
      <Tabs defaultValue="upcoming" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-synchro-600 border-opacity-50 border-t-transparent rounded-full"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading meetings...</p>
            </div>
          ) : upcomingMeetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMeetings.map(meeting => renderMeetingCard(meeting))}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <p className="text-lg text-gray-600 dark:text-gray-400">No upcoming meetings</p>
              <Button 
                onClick={() => navigate('/meetings/create')}
                className="mt-4 bg-synchro-600 hover:bg-synchro-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Meeting
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-synchro-600 border-opacity-50 border-t-transparent rounded-full"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading meetings...</p>
            </div>
          ) : pastMeetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastMeetings.map(meeting => renderMeetingCard(meeting))}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <p className="text-lg text-gray-600 dark:text-gray-400">No past meetings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meeting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this meeting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Meetings;
