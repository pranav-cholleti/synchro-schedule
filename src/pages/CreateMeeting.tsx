import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, CheckSquare2 } from 'lucide-react';

// Assuming AttendeeSelector is a correctly implemented component
import AttendeeSelector from '@/components/AttendeeSelector';

const CreateMeeting = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeHour, setTimeHour] = useState("12");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timeAMPM, setTimeAMPM] = useState("PM");
  const [isOnline, setIsOnline] = useState(true);
  const [name, setName] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Fetch users from the same organisation for attendees selection
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.organisation) return;
      
      try {
        const response = await api.users.getByOrganisation(user.organisation);
        if (response.success && response.data) {
          // Filter out the current user
          const filteredUsers = response.data.filter(u => u.id !== user.id);
          setUsers(filteredUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load potential attendees',
          variant: 'destructive',
        });
      }
    };
    
    fetchUsers();
  }, [user]);
  
  // Handle time input changes
  const handleTimeHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeHour(e.target.value);
  };
  
  const handleTimeMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeMinute(e.target.value);
  };
  
  const handleTimeAMPMChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeAMPM(e.target.value);
  };
  
  // Combine date and time into a single Date object
  const getDateTime = (): Date => {
    if (!date) return new Date();
    
    const newDate = new Date(date);
    let hours = parseInt(timeHour);
    
    // Convert 12-hour format to 24-hour
    if (timeAMPM === "PM" && hours < 12) {
      hours += 12;
    } else if (timeAMPM === "AM" && hours === 12) {
      hours = 0;
    }
    
    newDate.setHours(hours);
    newDate.setMinutes(parseInt(timeMinute));
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    
    return newDate;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Meeting name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (isOnline && !meetingLink.trim()) {
      toast({
        title: 'Error',
        description: 'Meeting link is required for online meetings',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare meeting data
      const meetingData = {
        name: name.trim(),
        dateTime: getDateTime().toISOString(),
        isOnline,
        meetingLink: isOnline ? meetingLink.trim() : "",
        additionalComments: additionalComments.trim(),
        attendees: selectedAttendees
      };
      
      // Create meeting
      const response = await api.meetings.create(meetingData);
      
      if (response.success && response.data) {
        toast({
          title: 'Success',
          description: 'Meeting created successfully',
        });
        
        // Redirect to the meeting details page
        navigate(`/meetings/${response.data._id}`);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create meeting',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Create New Meeting</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Schedule a meeting and invite attendees</p>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Meeting Details</CardTitle>
            <CardDescription>Fill in the information below to create your meeting</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Meeting Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Meeting Name</Label>
              <Input
                id="name"
                placeholder="Quarterly Review, Project Kickoff, etc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Time</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <select 
                    value={timeHour} 
                    onChange={handleTimeHourChange}
                    className="rounded-md border border-gray-300 p-2"
                  >
                    {Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0')).map(hour => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </select>
                  <span>:</span>
                  <select 
                    value={timeMinute} 
                    onChange={handleTimeMinuteChange}
                    className="rounded-md border border-gray-300 p-2"
                  >
                    {Array.from({length: 12}, (_, i) => String(i * 5).padStart(2, '0')).map(minute => (
                      <option key={minute} value={minute}>{minute}</option>
                    ))}
                  </select>
                  <select 
                    value={timeAMPM} 
                    onChange={handleTimeAMPMChange}
                    className="rounded-md border border-gray-300 p-2"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Online/In-Person Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="online-meeting">Online Meeting</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle if this is an online meeting
                </p>
              </div>
              <Switch
                id="online-meeting"
                checked={isOnline}
                onCheckedChange={setIsOnline}
              />
            </div>
            
            {/* Meeting Link (conditional) */}
            {isOnline && (
              <div className="space-y-2">
                <Label htmlFor="meeting-link">Meeting Link</Label>
                <Input
                  id="meeting-link"
                  placeholder="https://zoom.us/j/123456789"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  required={isOnline}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Paste a Zoom, Google Meet, or Microsoft Teams link
                </p>
              </div>
            )}
            
            {/* Additional Comments */}
            <div className="space-y-2">
              <Label htmlFor="additional-comments">Additional Comments</Label>
              <Textarea
                id="additional-comments"
                placeholder="Agenda, preparation instructions, or other details..."
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                rows={4}
              />
            </div>
            
            {/* Attendees Selection */}
            <div className="space-y-2">
              <Label>Attendees</Label>
              <AttendeeSelector 
                users={users}
                selectedAttendees={selectedAttendees}
                setSelectedAttendees={setSelectedAttendees}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select users from your organisation to invite
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-synchro-600 hover:bg-synchro-700" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></span>
                  Creating...
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckSquare2 className="mr-2 h-4 w-4" />
                  Create Meeting
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateMeeting;
