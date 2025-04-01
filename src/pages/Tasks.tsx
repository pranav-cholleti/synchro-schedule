import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { ActionItem } from '@/types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare, 
  Clock, 
  Calendar,
  AlertTriangle,
  Search,
  SortDesc,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TaskCard = ({ task }: { task: ActionItem }) => {
  const deadline = new Date(task.deadline);
  const today = new Date();
  const isOverdue = deadline < today && task.progress !== 'Completed';
  const isPriority = task.priority <= 3; // Top priority (lower number = higher priority)
  
  return (
    <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`border-l-4 ${
        task.progress === 'Completed' 
          ? 'border-green-500' 
          : isOverdue 
            ? 'border-red-500' 
            : isPriority 
              ? 'border-orange-500' 
              : 'border-synchro-500'
      }`}>
        <CardContent className="p-0">
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {task.progress === 'Completed' ? (
                    <CheckSquare className="h-5 w-5 text-green-500" />
                  ) : isOverdue ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-synchro-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{task.taskName}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant={
                      task.priority <= 3 
                        ? "destructive" 
                        : task.priority <= 6 
                          ? "default"
                          : "outline"
                    }>
                      Priority {task.priority}
                    </Badge>
                    <Badge variant="outline" className={
                      task.progress === 'Completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200' 
                        : task.progress === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200'
                          : task.progress === 'Blocked'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200'
                    }>
                      {task.progress}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Due: {deadline.toLocaleDateString()}</span>
                      {isOverdue && task.progress !== 'Completed' && (
                        <span className="text-red-500 ml-1">(Overdue)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {task.additionalComments && (
                <div className="ml-8 mt-2 text-sm text-gray-600 line-clamp-2">
                  {task.additionalComments}
                </div>
              )}
            </div>
            
            <div className="flex justify-end items-center space-x-3">
              <Link to={`/meetings/${task.meetingId}`}>
                <Button variant="outline" size="sm">View Meeting</Button>
              </Link>
              <Button variant="default" size="sm" className="bg-synchro-600 hover:bg-synchro-700">
                {task.progress === 'Completed' ? 'View Details' : 'Update Progress'}
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

const Tasks = () => {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState<ActionItem[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ActionItem[]>([]);
  const [filteredAssigned, setFilteredAssigned] = useState<ActionItem[]>([]);
  const [filteredScheduled, setFilteredScheduled] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [prioritySort, setPrioritySort] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      
      try {
        // Get tasks assigned to the current user
        const assignedResponse = await api.actionItems.getAssignedToUser();
        
        if (assignedResponse && assignedResponse.tasks) {
          setAssignedTasks(assignedResponse.tasks);
        } else {
          console.log('No assigned tasks found or unexpected response structure');
          setAssignedTasks([]);
        }
        
        // Get tasks scheduled by the current user
        const scheduledResponse = await api.actionItems.getScheduledByUser();
        
        if (scheduledResponse && scheduledResponse.tasks) {
          setScheduledTasks(scheduledResponse.tasks);
        } else {
          console.log('No scheduled tasks found or unexpected response structure');
          setScheduledTasks([]);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setAssignedTasks([]);
        setScheduledTasks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [user]);
  
  useEffect(() => {
    // Filter and sort assigned tasks
    let result = [...assignedTasks];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(task => 
        task.taskName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.progress === statusFilter);
    }
    
    // Apply priority sort
    result = result.sort((a, b) => {
      if (prioritySort === 'asc') {
        return a.priority - b.priority; // Lower number = higher priority
      } else {
        return b.priority - a.priority;
      }
    });
    
    setFilteredAssigned(result);
    
    // Filter and sort scheduled tasks (similar logic)
    result = [...scheduledTasks];
    
    if (searchTerm) {
      result = result.filter(task => 
        task.taskName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(task => task.progress === statusFilter);
    }
    
    result = result.sort((a, b) => {
      if (prioritySort === 'asc') {
        return a.priority - b.priority;
      } else {
        return b.priority - a.priority;
      }
    });
    
    setFilteredScheduled(result);
  }, [assignedTasks, scheduledTasks, searchTerm, statusFilter, prioritySort]);
  
  if (!user) return null;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Tasks</h1>
      
      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find specific tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Button
                variant="outline"
                onClick={() => setPrioritySort(prioritySort === 'asc' ? 'desc' : 'asc')}
                className="w-full text-sm flex items-center justify-center"
              >
                {prioritySort === 'asc' ? (
                  <>
                    <SortDesc className="h-4 w-4 mr-1" /> Sort by priority (highest first)
                  </>
                ) : (
                  <>
                    <ArrowUpDown className="h-4 w-4 mr-1" /> Sort by priority (lowest first)
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Task Tabs */}
      <Tabs defaultValue="assigned" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled by Me</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assigned" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex justify-center items-center py-8">
                <p className="text-gray-500">Loading your tasks...</p>
              </CardContent>
            </Card>
          ) : filteredAssigned.length > 0 ? (
            <div>
              {filteredAssigned.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col justify-center items-center py-12">
                <p className="text-gray-500 mb-4">No tasks assigned to you matching your filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="scheduled" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex justify-center items-center py-8">
                <p className="text-gray-500">Loading tasks you scheduled...</p>
              </CardContent>
            </Card>
          ) : filteredScheduled.length > 0 ? (
            <div>
              {filteredScheduled.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col justify-center items-center py-12">
                <p className="text-gray-500 mb-4">No tasks scheduled by you matching your filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
