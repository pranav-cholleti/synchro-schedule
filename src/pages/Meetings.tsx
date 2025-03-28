
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Meeting } from '@/types';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Users, 
  ExternalLink, 
  MapPin, 
  MoreHorizontal,
  Search,
  SortAsc,
  SortDesc,
  CalendarRange,
  UserCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

const MeetingCard = ({ meeting }: { meeting: Meeting }) => {
  const { user } = useAuth();
  const isHost = meeting.attendees.some(a => a.userId === user?.id && a.role === 'host');
  const meetingDate = new Date(meeting.dateTime);
  const isPast = meetingDate < new Date();

  return (
    <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow">
      <div className="border-l-4 border-synchro-600">
        <CardContent className="p-0">
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-2">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <Calendar className="h-5 w-5 text-synchro-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{meeting.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {meetingDate.toLocaleDateString()} at {meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="flex items-center mt-2">
                    <Badge variant={isPast ? "secondary" : "default"} className={isPast ? "bg-gray-200 text-gray-800" : "bg-synchro-100 text-synchro-800"}>
                      {isPast ? "Past" : "Upcoming"}
                    </Badge>
                    <Badge variant="outline" className="ml-2 border-synchro-200 text-synchro-800">
                      {isHost ? "Host" : "Attendee"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{meeting.attendees.length} attendees</span>
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                {meeting.isOnline ? (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span>Online Meeting</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>In-Person</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-end items-center space-x-3">
              <Link to={`/meetings/${meeting.id}`}>
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Meeting Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to={`/meetings/${meeting.id}`} className="flex w-full">View Details</Link>
                  </DropdownMenuItem>
                  {isHost && (
                    <DropdownMenuItem>
                      <Link to={`/meetings/${meeting.id}/edit`} className="flex w-full">Edit Meeting</Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

const Meetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterRole, setFilterRole] = useState<'all' | 'host' | 'attendee'>('all');
  const [filterTime, setFilterTime] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) return;
      
      try {
        const fetchedMeetings = await api.meetings.getAll(user.id);
        setMeetings(fetchedMeetings);
        setFilteredMeetings(fetchedMeetings);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeetings();
  }, [user]);

  useEffect(() => {
    if (!meetings.length) return;
    
    // Apply filters
    let result = [...meetings];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(meeting => 
        meeting.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Role filter
    if (filterRole !== 'all') {
      result = result.filter(meeting => 
        meeting.attendees.some(a => 
          a.userId === user?.id && a.role === filterRole
        )
      );
    }
    
    // Time filter
    if (filterTime !== 'all') {
      const now = new Date();
      if (filterTime === 'upcoming') {
        result = result.filter(meeting => new Date(meeting.dateTime) >= now);
      } else {
        result = result.filter(meeting => new Date(meeting.dateTime) < now);
      }
    }
    
    // Apply sorting
    result = result.sort((a, b) => {
      const dateA = new Date(a.dateTime).getTime();
      const dateB = new Date(b.dateTime).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredMeetings(result);
  }, [meetings, searchTerm, filterRole, filterTime, sortOrder, user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">My Meetings</h1>
        <Link to="/meetings/create">
          <Button className="bg-synchro-600 hover:bg-synchro-700">Create New Meeting</Button>
        </Link>
      </div>
      
      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find specific meetings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by meeting name..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Select value={filterRole} onValueChange={(value) => setFilterRole(value as 'all' | 'host' | 'attendee')}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <UserCircle className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="host">As Host</SelectItem>
                  <SelectItem value="attendee">As Attendee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={filterTime} onValueChange={(value) => setFilterTime(value as 'all' | 'upcoming' | 'past')}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <CalendarRange className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by time" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-sm flex items-center"
            >
              {sortOrder === 'asc' ? (
                <>
                  <SortAsc className="h-4 w-4 mr-1" /> Sort by date (earliest first)
                </>
              ) : (
                <>
                  <SortDesc className="h-4 w-4 mr-1" /> Sort by date (latest first)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Meeting List */}
      <div className="space-y-2">
        {loading ? (
          <Card>
            <CardContent className="flex justify-center items-center py-8">
              <p className="text-gray-500">Loading your meetings...</p>
            </CardContent>
          </Card>
        ) : filteredMeetings.length > 0 ? (
          filteredMeetings.map(meeting => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col justify-center items-center py-12">
              <p className="text-gray-500 mb-4">No meetings found matching your filters</p>
              <Link to="/meetings/create">
                <Button variant="outline">Create a New Meeting</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Meetings;
