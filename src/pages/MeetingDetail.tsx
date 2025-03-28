
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Meeting, ActionItem } from '@/types';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  Users, 
  ExternalLink, 
  MapPin, 
  FileText,
  CheckSquare
} from 'lucide-react';

const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      
      try {
        // Fetch meeting and tasks
        const [fetchedMeeting, fetchedActionItems] = await Promise.all([
          api.meetings.getById(id),
          api.actionItems.getByMeeting(id)
        ]);
        
        setMeeting(fetchedMeeting);
        setActionItems(fetchedActionItems);
      } catch (error) {
        console.error('Error fetching meeting data:', error);
        toast({
          title: "Error",
          description: "Could not load meeting details",
          variant: "destructive",
        });
        navigate('/meetings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user, navigate, toast]);
  
  if (!user) return null;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Loading meeting details...</p>
      </div>
    );
  }
  
  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-bold mb-2">Meeting Not Found</h2>
        <p className="text-muted-foreground mb-4">The meeting you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to="/meetings">
          <Button variant="outline">Back to Meetings</Button>
        </Link>
      </div>
    );
  }
  
  const isHost = meeting.attendees.some(a => a.userId === user.id && a.role === 'host');
  const meetingDate = new Date(meeting.dateTime);
  const isPast = meetingDate < new Date();
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">{meeting.name}</h1>
            <Badge variant={isPast ? "secondary" : "default"} className={isPast ? "bg-gray-200 text-gray-800" : "bg-synchro-100 text-synchro-800"}>
              {isPast ? "Past" : "Upcoming"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Created on {new Date(meeting.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link to="/meetings">
            <Button variant="outline">Back to Meetings</Button>
          </Link>
          {isHost && (
            <Link to={`/meetings/${meeting.id}/edit`}>
              <Button variant="default" className="bg-synchro-600 hover:bg-synchro-700">Edit Meeting</Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Meeting Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Details</CardTitle>
          <CardDescription>Information about the meeting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-synchro-600 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">{meetingDate.toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-synchro-600 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">{meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                {meeting.isOnline ? (
                  <ExternalLink className="h-5 w-5 text-synchro-600 mr-3 mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 text-synchro-600 mr-3 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">Meeting Type</p>
                  <p className="text-sm text-muted-foreground">
                    {meeting.isOnline ? 'Online Meeting' : 'In-Person Meeting'}
                  </p>
                  {meeting.isOnline && meeting.meetingLink && (
                    <a 
                      href={meeting.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-synchro-600 hover:underline mt-1 inline-block"
                    >
                      Join Meeting
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <Users className="h-5 w-5 text-synchro-600 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Attendees ({meeting.attendees.length})</p>
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    {meeting.attendees.map((attendee) => (
                      <div key={attendee.userId} className="flex items-center">
                        <span className="truncate">{attendee.name}</span>
                        {attendee.role === 'host' && (
                          <Badge variant="outline" className="ml-2 text-xs">Host</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {meeting.additionalComments && (
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-synchro-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Additional Comments</p>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                      {meeting.additionalComments}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-synchro-600 mr-2" />
              <h3 className="text-lg font-medium">Meeting Minutes</h3>
            </div>
            
            {isHost ? (
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
                <p className="text-muted-foreground mb-4">Upload meeting minutes to extract key information</p>
                <div className="flex justify-center space-x-3">
                  <Button className="bg-synchro-600 hover:bg-synchro-700">
                    Upload Minutes
                  </Button>
                  <Button variant="outline">
                    Edit Minutes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
                <p className="text-muted-foreground">The meeting host will upload minutes after the meeting</p>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 text-synchro-600 mr-2" />
                <h3 className="text-lg font-medium">Action Items</h3>
              </div>
              
              {isHost && (
                <Button className="bg-synchro-600 hover:bg-synchro-700">
                  Create Action Item
                </Button>
              )}
            </div>
            
            {actionItems.length > 0 ? (
              <div className="space-y-3">
                {actionItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{item.taskName}</h4>
                          <div className="flex items-center mt-1 space-x-2">
                            <Badge variant={
                              item.priority <= 3 
                                ? "destructive" 
                                : item.priority <= 6 
                                  ? "default"
                                  : "outline"
                            }>
                              Priority {item.priority}
                            </Badge>
                            <Badge variant="outline" className={
                              item.progress === 'Completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : item.progress === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : item.progress === 'Blocked'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : ''
                            }>
                              {item.progress}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Due: {new Date(item.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">Update</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
                <p className="text-muted-foreground">No action items have been created for this meeting yet</p>
                {isHost && (
                  <p className="mt-2 text-sm">
                    After uploading meeting minutes, you can extract action items automatically or create them manually
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <Link to="/meetings">
            <Button variant="outline">Back to Meetings</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MeetingDetail;
