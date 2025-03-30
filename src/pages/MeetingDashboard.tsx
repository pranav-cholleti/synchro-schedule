import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Meeting, ActionItem } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, CheckSquare, AlertTriangle, BarChart4, FileText, Download } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Color config for charts
const COLORS = ['#8B5CF6', '#EC4899', '#F97316', '#10B981', '#6366F1'];
const TASK_STATUS_COLORS = {
  'Completed': '#10B981',
  'In Progress': '#6366F1',
  'Not Started': '#F97316',
  'Blocked': '#EF4444'
};

const PRIORITY_COLORS = {
  'High': '#EF4444',
  'Medium': '#F97316',
  'Low': '#10B981'
};

// Chart configs
const taskStatusConfig = {
  'Not Started': { label: 'Not Started', color: TASK_STATUS_COLORS['Not Started'] },
  'In Progress': { label: 'In Progress', color: TASK_STATUS_COLORS['In Progress'] },
  'Completed': { label: 'Completed', color: TASK_STATUS_COLORS['Completed'] },
  'Blocked': { label: 'Blocked', color: TASK_STATUS_COLORS['Blocked'] },
};

const priorityConfig = {
  'High': { label: 'High', color: PRIORITY_COLORS['High'] },
  'Medium': { label: 'Medium', color: PRIORITY_COLORS['Medium'] },
  'Low': { label: 'Low', color: PRIORITY_COLORS['Low'] },
};

const MeetingDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetingData = async () => {
      if (!id || !user) return;

      try {
        const fetchedMeeting = await api.meetings.getById(id);
        setMeeting(fetchedMeeting);
        
        // Only proceed with other API calls if meeting exists
        if (fetchedMeeting) {
          try {
            const [fetchedTasks, fetchedStats] = await Promise.all([
              api.actionItems.getByMeeting(id),
              api.meetings.getMeetingStats(id)
            ]);
            
            if (fetchedTasks) setTasks(fetchedTasks);
            if (fetchedStats) setStats(fetchedStats);
          } catch (error) {
            console.error('Error fetching tasks or stats:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching meeting data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingData();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Meeting Dashboard</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Meeting not found or you don't have access to view this dashboard.
          </AlertDescription>
        </Alert>
        <Link to="/meetings">
          <Button>Back to Meetings</Button>
        </Link>
      </div>
    );
  }

  const meetingDate = new Date(meeting.dateTime);
  // Safe check for user and meeting attendees
  const isHost = meeting.attendees && Array.isArray(meeting.attendees) && user ? 
    meeting.attendees.some(a => a.userId === user.id && a.role === 'host') : false;

  // Prepare chart data with null checks
  const taskStatusData = stats && stats.tasksByStatus ? 
    Object.entries(stats.tasksByStatus).map(([status, count]) => ({
      name: status,
      value: count,
    })) : [];

  const priorityData = stats && stats.priorityDistribution ? 
    Object.entries(stats.priorityDistribution).map(([priority, count]) => ({
      name: priority,
      value: count,
    })) : [];

  const assigneeData = stats && stats.assigneeStats ? 
    stats.assigneeStats.map((stat: any) => ({
      name: stat.assignee,
      Completed: stat.completedTasks,
      'In Progress': stat.inProgressTasks,
      'Not Started': stat.notStartedTasks,
      Blocked: stat.blockedTasks,
    })) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart4 className="mr-2 h-6 w-6 text-synchro-600" />
            Meeting Dashboard
          </h1>
          <p className="text-lg font-medium mt-1">{meeting.name}</p>
        </div>
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <Link to={`/meetings/${id}`}>
            <Button variant="outline">View Meeting Details</Button>
          </Link>
          {isHost && (
            <Button className="bg-synchro-600 hover:bg-synchro-700">Generate Report</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Overview</CardTitle>
          <CardDescription>General information about this meeting</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-synchro-600" />
              <span className="font-medium">Date:</span>
              <span className="ml-2">{meetingDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-synchro-600" />
              <span className="font-medium">Time:</span>
              <span className="ml-2">{meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-synchro-600" />
              <span className="font-medium">Attendees:</span>
              <span className="ml-2">{meeting.attendees ? meeting.attendees.length : 0} participants</span>
            </div>
            {meeting.isOnline && (
              <div className="flex items-start">
                <span className="font-medium flex-shrink-0">Meeting Link:</span>
                <a 
                  href={meeting.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-synchro-600 hover:underline break-all"
                >
                  {meeting.meetingLink}
                </a>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <h3 className="font-medium mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              AI Summary
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {stats && stats.aiSummary ? stats.aiSummary : "No AI summary available yet."}
            </p>
            {isHost && (
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Minutes
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {stats ? (
        <Tabs defaultValue="progress">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="progress">Task Progress</TabsTrigger>
            <TabsTrigger value="priority">Priority Distribution</TabsTrigger>
            <TabsTrigger value="assignees">Assignee Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Progress Overview</CardTitle>
                <CardDescription>Current status of all tasks from this meeting</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Status Distribution</h3>
                  <div className="h-64">
                    {taskStatusData.length > 0 ? (
                      <ChartContainer config={taskStatusConfig}>
                        <PieChart>
                          <Pie
                            data={taskStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {taskStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={TASK_STATUS_COLORS[entry.name as keyof typeof TASK_STATUS_COLORS] || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No task data available
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium mb-4">Task Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <div className="text-green-600 dark:text-green-400 font-medium">Completed</div>
                        <div className="text-3xl font-bold">{stats.tasksByStatus && stats.tasksByStatus['Completed'] ? stats.tasksByStatus['Completed'] : 0}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="text-blue-600 dark:text-blue-400 font-medium">In Progress</div>
                        <div className="text-3xl font-bold">{stats.tasksByStatus && stats.tasksByStatus['In Progress'] ? stats.tasksByStatus['In Progress'] : 0}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                      <CardContent className="p-4">
                        <div className="text-orange-600 dark:text-orange-400 font-medium">Not Started</div>
                        <div className="text-3xl font-bold">{stats.tasksByStatus && stats.tasksByStatus['Not Started'] ? stats.tasksByStatus['Not Started'] : 0}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 border-red-200 dark:border-red-800">
                      <CardContent className="p-4">
                        <div className="text-red-600 dark:text-red-400 font-medium">Blocked</div>
                        <div className="text-3xl font-bold">{stats.tasksByStatus && stats.tasksByStatus['Blocked'] ? stats.tasksByStatus['Blocked'] : 0}</div>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-gray-700 dark:text-gray-300 font-medium mb-2">Overall Progress</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div
                          className="bg-synchro-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                          style={{
                            width: `${stats.tasksByStatus && stats.tasksByStatus['Completed'] && stats.totalTasks ? 
                              (stats.tasksByStatus['Completed'] / stats.totalTasks * 100) : 0}%`
                          }}
                        ></div>
                      </div>
                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {stats.tasksByStatus && stats.tasksByStatus['Completed'] ? stats.tasksByStatus['Completed'] : 0} of {stats.totalTasks || 0} tasks completed
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="priority" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Priority Distribution</CardTitle>
                <CardDescription>Overview of task priorities from this meeting</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Priority Breakdown</h3>
                  <div className="h-64">
                    <ChartContainer config={priorityConfig}>
                      <PieChart>
                        <Pie
                          data={priorityData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium mb-4">Priority Insights</h3>
                  {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
                    <Card key={priority} className={`border-l-4`} style={{ borderLeftColor: color }}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium" style={{ color }}>{priority} Priority</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">
                              {priority === 'High' && 'Requires immediate attention'}
                              {priority === 'Medium' && 'Should be addressed soon'}
                              {priority === 'Low' && 'Can be scheduled later'}
                            </div>
                          </div>
                          <div className="text-2xl font-bold">{stats.priorityDistribution[priority] || 0}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {stats.priorityDistribution['High'] > 0 && (
                    <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        There {stats.priorityDistribution['High'] === 1 ? 'is' : 'are'} {stats.priorityDistribution['High']} high-priority {stats.priorityDistribution['High'] === 1 ? 'task' : 'tasks'} that need immediate attention.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assignees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assignee Performance</CardTitle>
                <CardDescription>Breakdown of tasks by assignees and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={assigneeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Completed" stackId="a" fill={TASK_STATUS_COLORS['Completed']} />
                      <Bar dataKey="In Progress" stackId="a" fill={TASK_STATUS_COLORS['In Progress']} />
                      <Bar dataKey="Not Started" stackId="a" fill={TASK_STATUS_COLORS['Not Started']} />
                      <Bar dataKey="Blocked" stackId="a" fill={TASK_STATUS_COLORS['Blocked']} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <Separator className="my-6" />
                
                <h3 className="text-lg font-medium mb-4">Individual Performance</h3>
                <div className="space-y-4">
                  {stats.assigneeStats.map((stat: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                          <div className="font-medium text-lg">{stat.assignee}</div>
                          <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                              {stat.completedTasks} Completed
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                              {stat.inProgressTasks} In Progress
                            </Badge>
                            <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                              {stat.notStartedTasks} Not Started
                            </Badge>
                            {stat.blockedTasks > 0 && (
                              <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                                {stat.blockedTasks} Blocked
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Progress</div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-synchro-600 h-2.5 rounded-full"
                              style={{
                                width: `${stat.totalTasks ? (stat.completedTasks / stat.totalTasks * 100) : 0}%`
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {stat.completedTasks} of {stat.totalTasks} tasks completed ({stat.totalTasks ? Math.round(stat.completedTasks / stat.totalTasks * 100) : 0}%)
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Dashboard Data Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Statistics for this meeting are not available yet. This could be because:
            </p>
            <ul className="text-left text-gray-600 dark:text-gray-400 space-y-1 mb-4 mx-auto max-w-md">
              <li>• The meeting was just created</li>
              <li>• No action items have been assigned yet</li>
              <li>• The server is still processing dashboard data</li>
            </ul>
            <Link to={`/meetings/${id}`}>
              <Button variant="outline">Go to Meeting Details</Button>
            </Link>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckSquare className="mr-2 h-5 w-5 text-synchro-600" />
            Task Management
          </CardTitle>
          <CardDescription>Manage action items from this meeting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No action items have been created for this meeting yet.
              </div>
            ) : (
              <div className="grid gap-4">
                {tasks.slice(0, 5).map((task) => (
                  <Card key={task.id} className="overflow-hidden">
                    <div className={`h-1 ${
                      task.priority <= 3 
                        ? 'bg-red-500' 
                        : task.priority <= 6 
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                    }`}></div>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">{task.taskName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={task.progress === 'Completed' ? 'default' : 'outline'} className={`
                            ${task.progress === 'Completed' ? 'bg-green-500' : ''}
                            ${task.progress === 'In Progress' ? 'border-blue-500 text-blue-500' : ''}
                            ${task.progress === 'Not Started' ? 'border-orange-500 text-orange-500' : ''}
                            ${task.progress === 'Blocked' ? 'border-red-500 text-red-500' : ''}
                          `}>
                            {task.progress}
                          </Badge>
                          <Badge variant="outline">Priority {task.priority}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {tasks.length > 5 && (
                  <div className="text-center">
                    <Button variant="ghost" className="text-synchro-600">
                      View all {tasks.length} tasks
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {isHost && (
              <div className="flex justify-center mt-4">
                <Link to={`/meetings/${id}/manage-action-items`}>
                  <Button>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Manage Tasks
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingDashboard;
