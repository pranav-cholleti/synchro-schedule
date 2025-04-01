
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Meeting, ActionItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ListTodo, ArrowUpRight, CheckCircle, AlertCircle, Clock3 } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Get upcoming meetings
        const meetingsResponse = await api.meetings.getAll();
        
        if (Array.isArray(meetingsResponse)) {
          const now = new Date();
          const upcoming = meetingsResponse
            .filter(meeting => new Date(meeting.dateTime) > now)
            .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
            .slice(0, 5);  // Get only the next 5 meetings
          
          setUpcomingMeetings(upcoming);
        }
        
        // Get assigned tasks
        const tasksResponse = await api.actionItems.getAssignedToUser();
        
        if (Array.isArray(tasksResponse)) {
          const pendingTasks = tasksResponse
            .filter(task => task.progress !== 'Completed')
            .sort((a, b) => {
              // Sort by deadline (closest first)
              if (a.deadline && b.deadline) {
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
              }
              return 0;
            })
            .slice(0, 5);  // Get only the top 5 tasks
          
          setTasks(pendingTasks);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, toast]);
  
  const formatMeetingDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return format(date, 'EEEE, MMMM d');
  };
  
  const formatMeetingTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return format(date, 'h:mm a');
  };
  
  const formatTaskDeadline = (dateTimeString: string) => {
    if (!dateTimeString) return 'No deadline';
    
    const date = new Date(dateTimeString);
    const now = new Date();
    
    const isToday = (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
    
    if (isToday) {
      return `Today, ${format(date, 'h:mm a')}`;
    }
    
    return format(date, 'MMM d, yyyy');
  };
  
  const getTaskIcon = (progress: string) => {
    switch (progress) {
      case 'Completed':
        return <CheckCircle className="text-green-500" />;
      case 'Blocked':
        return <AlertCircle className="text-red-500" />;
      case 'In Progress':
        return <Clock3 className="text-blue-500" />;
      default:
        return <Clock3 className="text-gray-500" />;
    }
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-synchro-600 border-opacity-50 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Upcoming Meetings Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Meetings</CardTitle>
                <CardDescription>Your next scheduled meetings</CardDescription>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate('/meetings')}
                className="text-sm"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length > 0 ? (
                <ul className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <li key={meeting.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <Link to={`/meetings/${meeting.id}`} className="font-medium hover:text-synchro-600 transition-colors">
                          {meeting.name}
                        </Link>
                        <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-4">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatMeetingDate(meeting.dateTime)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatMeetingTime(meeting.dateTime)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate(`/meetings/${meeting.id}`)}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No upcoming meetings</p>
                  <Button 
                    className="mt-4 bg-synchro-600 hover:bg-synchro-700"
                    onClick={() => navigate('/meetings/create')}
                  >
                    Create Meeting
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Action Items Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Action Items</CardTitle>
                <CardDescription>Tasks assigned to you</CardDescription>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate('/tasks')}
                className="text-sm"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <ul className="space-y-4">
                  {tasks.map((task) => (
                    <li key={task.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{task.taskName}</p>
                        <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <ListTodo className="h-3 w-3 mr-1" />
                            {task.progress}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Due: {formatTaskDeadline(task.deadline)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTaskIcon(task.progress)}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending action items</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
