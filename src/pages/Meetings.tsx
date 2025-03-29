import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Meeting } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  CalendarPlus, 
  Calendar, 
  Search, 
  ArrowUpDown, 
  Users, 
  VideoIcon, 
  MapPin,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Meetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dateTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      // Note: Removed userId parameter
      const response = await api.meetings.getAll();
      if (response.success && response.data) {
        setMeetings(response.data.meetings || []);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
      } else {
        setMeetings([]);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMeetings();
    }
  }, [user, searchTerm, sortBy, sortOrder, filter, currentPage]);

  // Function to handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Function to handle sort
  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc for date, asc for others
      setSortBy(field);
      setSortOrder(field === 'dateTime' ? 'desc' : 'asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Function to handle filter
  const handleFilter = (value: string) => {
    setFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Meetings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage all meetings you're involved in</p>
        </div>
        <Link to="/meetings/create">
          <Button className="bg-synchro-600 hover:bg-synchro-700">
            <CalendarPlus className="mr-2 h-4 w-4" /> Create New Meeting
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Meetings List</CardTitle>
          <CardDescription>All meetings where you're a host or attendee</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search meetings..."
                className="pl-9"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <Select value={filter} onValueChange={handleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Meetings</SelectItem>
                <SelectItem value="host">Meetings I Host</SelectItem>
                <SelectItem value="attendee">Meetings I Attend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-synchro-600"></div>
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No meetings found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {searchTerm || filter 
                  ? "Try adjusting your search or filter" 
                  : "You don't have any meetings scheduled yet"}
              </p>
              <div className="mt-6">
                <Link to="/meetings/create">
                  <Button className="bg-synchro-600 hover:bg-synchro-700">
                    <CalendarPlus className="mr-2 h-4 w-4" /> Schedule a Meeting
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Meeting Name
                        {sortBy === 'name' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleSort('dateTime')}
                    >
                      <div className="flex items-center">
                        Date & Time
                        {sortBy === 'dateTime' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Your Role</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((meeting) => {
                    const meetingDate = new Date(meeting.dateTime);
                    return (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium">{meeting.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            <span>
                              {meetingDate.toLocaleDateString()}, {' '}
                              {meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            meeting.userRole === 'host' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            <Users className="mr-1 h-3 w-3" />
                            {meeting.userRole === 'host' ? 'Host' : 'Attendee'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {meeting.isOnline ? (
                            <span className="inline-flex items-center text-synchro-600 dark:text-synchro-400">
                              <VideoIcon className="mr-1 h-4 w-4" /> Online
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-gray-600 dark:text-gray-400">
                              <MapPin className="mr-1 h-4 w-4" /> In Person
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link to={`/meetings/${meeting.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button>
                            </Link>
                            {meeting.userRole === 'host' && (
                              <Link to={`/meetings/${meeting.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <Pencil className="h-4 w-4 mr-1" /> Edit
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && meetings.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPrevPage}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Meetings;
