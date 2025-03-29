
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Meeting, ActionItem } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus, CalendarClock, CheckSquare, Clock, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch meetings and tasks
        const [fetchedMeetings, fetchedTasks] = await Promise.all([
          api.meetings.getAll(),
          api.actionItems.getAssignedToUser(user.id)
        ]);
        
        setMeetings(Array.isArray(fetchedMeetings) ? fetchedMeetings : []);
        setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setMeetings([]);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Filter for upcoming meetings (next 7 days)
  const upcomingMeetings = meetings && Array.isArray(meetings) 
    ? meetings
        .filter(meeting => {
          const meetingDate = new Date(meeting.dateTime);
          const today = new Date();
          const oneWeekFromNow = new Date();
          oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
          
          return meetingDate >= today && meetingDate <= oneWeekFromNow;
        })
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
        .slice(0, 3) // Show max 3 upcoming meetings
    : [];
  
  // Filter for high priority pending tasks
  const pendingTasks = tasks && Array.isArray(tasks)
    ? tasks
        .filter(task => task.progress !== 'Completed')
        .sort((a, b) => a.priority - b.priority) // Lower number = higher priority
        .slice(0, 5) // Show max 5 pending tasks
    : [];
  
  if (!user) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome, {user.name}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {user.position} at {user.organisation}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/meetings/create">
              <Button className="w-full bg-synchro-600 hover:bg-synchro-700">
                <CalendarPlus className="mr-2 h-4 w-4" /> Create New Meeting
              </Button>
            </Link>
            <Link to="/meetings">
              <Button variant="outline" className="w-full">
                <CalendarClock className="mr-2 h-4 w-4" /> View My Meetings
              </Button>
            </Link>
            <Link to="/tasks">
              <Button variant="outline" className="w-full">
                <CheckSquare className="mr-2 h-4 w-4" /> Manage My Tasks
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        {/* Upcoming Meetings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>Your schedule for the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-gray-500">Loading meetings...</p>
            ) : upcomingMeetings.length > 0 ? (
              <ul className="space-y-3">
                {upcomingMeetings.map((meeting) => {
                  const meetingDate = new Date(meeting.dateTime);
                  return (
                    <li key={meeting.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <Clock className="h-5 w-5 text-synchro-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{meeting.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {meetingDate.toLocaleDateString()} at {meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {meeting.attendees?.length || 0} attendees
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center py-4 text-gray-500">No upcoming meetings</p>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/meetings" className="w-full">
              <Button variant="ghost" className="w-full text-synchro-600">View All Meetings</Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Pending Tasks Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Your highest priority action items</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-gray-500">Loading tasks...</p>
            ) : pendingTasks.length > 0 ? (
              <ul className="space-y-3">
                {pendingTasks.map((task) => {
                  const deadline = new Date(task.deadline);
                  const isUrgent = deadline.getTime() - new Date().getTime() < 86400000; // Less than 24 hours
                  
                  return (
                    <li key={task.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {isUrgent ? (
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      ) : (
                        <CheckSquare className="h-5 w-5 text-synchro-600 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{task.taskName}</p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            task.priority <= 3 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : task.priority <= 6 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            Priority {task.priority}
                          </span>
                          <span className="mx-1 text-gray-500">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Due {deadline.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center py-4 text-gray-500">No pending tasks</p>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/tasks" className="w-full">
              <Button variant="ghost" className="w-full text-synchro-600">View All Tasks</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Profile Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Account details and information</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Personal Information</h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">Name:</span> {user.name}</p>
              <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">Email:</span> {user.email}</p>
              <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">Mobile:</span> {user.mobile || 'Not provided'}</p>
              <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">Age:</span> {user.age}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Professional Details</h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">Organisation:</span> {user.organisation}</p>
              <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">Position:</span> {user.position}</p>
              <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">Member since:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
