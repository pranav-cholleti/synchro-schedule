import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Meeting, ActionItem, User, ActionItemSuggestion } from '@/types';
import { format } from 'date-fns';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttendeeSelector } from '@/components/AttendeeSelector';

const actionItemSchema = z.object({
  taskName: z.string().min(3, {
    message: "Task name must be at least 3 characters.",
  }),
  assignees: z.array(z.string()).min(1, {
    message: "Please select at least one assignee.",
  }),
  deadline: z.string().min(1, {
    message: "Please select a deadline.",
  }),
  priority: z.coerce.number().min(1).max(10),
  additionalComments: z.string().optional(),
});

const ManageActionItems = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [minutesText, setMinutesText] = useState('');
  const [suggestions, setSuggestions] = useState<ActionItemSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState('current');

  const form = useForm<z.infer<typeof actionItemSchema>>({
    resolver: zodResolver(actionItemSchema),
    defaultValues: {
      taskName: "",
      assignees: [],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // One week from now
      priority: 5,
      additionalComments: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      
      try {
        const [fetchedMeeting, fetchedTasks, fetchedUsers] = await Promise.all([
          api.meetings.getById(id),
          api.actionItems.getByMeeting(id),
          api.users.getByOrganisation(user.organisation)
        ]);
        
        setMeeting(fetchedMeeting);
        setActionItems(fetchedTasks);
        setUsers(fetchedUsers);

        // If meeting has formatted minutes, initialize the text field with it
        if (fetchedMeeting.formattedMinutesText) {
          setMinutesText(fetchedMeeting.formattedMinutesText);
        }
        
        // Check if user is authorized (is the host)
        if (!fetchedMeeting.attendees.some(a => a.userId === user.id && a.role === 'host')) {
          toast({
            title: "Access denied",
            description: "Only the meeting host can manage action items.",
            variant: "destructive",
          });
          navigate(`/meetings/${id}`);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Could not fetch meeting details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user, toast, navigate]);

  const onSubmit = async (values: z.infer<typeof actionItemSchema>) => {
    if (!user || !meeting) return;
    
    setSubmitLoading(true);
    try {
      const newActionItem = await api.actionItems.create({
        meetingId: meeting.id,
        taskName: values.taskName,
        assignees: values.assignees,
        deadline: new Date(values.deadline).toISOString(),
        priority: values.priority,
        progress: 'Not Started',
        additionalComments: values.additionalComments,
        createdBy: user.id,
      });
      
      setActionItems(prev => [...prev, newActionItem]);
      
      form.reset({
        taskName: "",
        assignees: [],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        priority: 5,
        additionalComments: "",
      });
      
      toast({
        title: "Action item created",
        description: "Your action item has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating action item:', error);
      toast({
        title: "Error",
        description: "Could not create the action item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const updateActionItemStatus = async (itemId: string, progress: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked') => {
    try {
      const updatedItem = await api.actionItems.update(itemId, { progress });
      setActionItems(prev => prev.map(item => 
        item.id === itemId ? updatedItem : item
      ));
      
      toast({
        title: "Status updated",
        description: `Action item status changed to ${progress}.`,
      });
    } catch (error) {
      console.error('Error updating action item:', error);
      toast({
        title: "Error",
        description: "Could not update the action item status.",
        variant: "destructive",
      });
    }
  };

  const extractActionItems = async () => {
    if (!minutesText.trim()) {
      toast({
        title: "Error",
        description: "Please enter meeting minutes text to extract action items.",
        variant: "destructive",
      });
      return;
    }
    
    setAiLoading(true);
    try {
      // Use the AI service to extract action items
      const response = await api.ai.extractActionItems(minutesText);
      
      if (response.suggestions && response.suggestions.length > 0 && users.length > 0) {
        setSuggestions(response.suggestions);
        setActiveTab('suggestions');
        
        toast({
          title: "Success",
          description: `Found ${response.suggestions.length} potential action items.`,
        });
      } else {
        toast({
          title: "No action items found",
          description: "The AI couldn't identify any clear action items in the text.",
        });
      }
    } catch (error) {
      console.error('Error extracting action items:', error);
      toast({
        title: "Error",
        description: "An error occurred while processing the meeting minutes.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const createActionItemFromSuggestion = (suggestion: ActionItemSuggestion) => {
    form.reset({
      taskName: suggestion.taskName,
      assignees: suggestion.suggestedAssignees,
      deadline: suggestion.deadline ? new Date(suggestion.deadline).toISOString().slice(0, 10) : 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      priority: suggestion.priority,
      additionalComments: suggestion.context,
    });
    
    setActiveTab('new');
  };

  const saveAllActionItems = async () => {
    if (!id || actionItems.length === 0) return;

    setSubmitLoading(true);
    try {
      // Format the action items for the batch update endpoint
      const formattedItems = actionItems.map(item => ({
        id: item.id,
        taskName: item.taskName,
        assignees: item.assignees,
        deadline: item.deadline,
        priority: item.priority,
        progress: item.progress,
        additionalComments: item.additionalComments
      }));

      // Call batch update API
      await api.actionItems.batchUpdate(id, formattedItems);
      
      toast({
        title: "All action items saved",
        description: "Your changes have been saved successfully.",
      });
      
      // Navigate back to meeting detail
      navigate(`/meetings/${id}`);
    } catch (error) {
      console.error('Error saving action items:', error);
      toast({
        title: "Error",
        description: "Could not save all action items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!meeting) {
    return <div className="text-center py-10">Meeting not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{meeting.name} - Action Items</h1>
          <p className="text-muted-foreground">
            Manage tasks and follow-ups from this meeting
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/meetings/${id}`)}
          >
            Cancel
          </Button>
          <Button 
            className="bg-synchro-600 hover:bg-synchro-700"
            onClick={saveAllActionItems}
            disabled={submitLoading}
          >
            {submitLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save All Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">
            Current Items ({actionItems.length})
          </TabsTrigger>
          <TabsTrigger value="new">
            Add New Item
          </TabsTrigger>
          <TabsTrigger value="extract">
            Extract from Minutes
          </TabsTrigger>
          <TabsTrigger value="suggestions" disabled={suggestions.length === 0}>
            Suggestions ({suggestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {actionItems.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No action items have been created for this meeting yet.</p>
                <Button 
                  onClick={() => setActiveTab('new')} 
                  className="mt-4 bg-synchro-600 hover:bg-synchro-700"
                >
                  Create Your First Action Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {actionItems.map(item => {
                const assignees = item.assignees.map(id => 
                  users.find(user => user.id === id)?.name || 'Unknown'
                ).join(', ');
                
                return (
                  <Card key={item.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-medium text-lg">{item.taskName}</h3>
                          <div className="text-sm text-muted-foreground">
                            Assigned to: {assignees}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due: {format(new Date(item.deadline), 'PP')}
                          </div>
                          {item.additionalComments && (
                            <div className="text-sm mt-2">
                              {item.additionalComments}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Badge className={`${
                            item.priority <= 3 ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                            item.priority <= 6 ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 
                            'bg-green-100 text-green-800 hover:bg-green-100'
                          }`}>
                            Priority {item.priority}
                          </Badge>
                          
                          <Select
                            defaultValue={item.progress}
                            onValueChange={(value) => updateActionItemStatus(
                              item.id, 
                              value as 'Not Started' | 'In Progress' | 'Completed' | 'Blocked'
                            )}
                          >
                            <SelectTrigger className={`w-[140px] ${
                              item.progress === 'Completed' ? 'bg-green-100' :
                              item.progress === 'In Progress' ? 'bg-blue-100' :
                              item.progress === 'Blocked' ? 'bg-red-100' :
                              'bg-gray-100'
                            }`}>
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Not Started">Not Started</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Blocked">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Create New Action Item</CardTitle>
              <CardDescription>
                Add tasks and assignments from this meeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="taskName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Name</FormLabel>
                        <FormControl>
                          <Input placeholder="What needs to be done?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assignees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignees</FormLabel>
                        <FormControl>
                          <AttendeeSelector 
                            users={users} 
                            selectedUserIds={field.value} 
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Who is responsible for completing this task?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority (1-10)</FormLabel>
                          <div className="grid grid-cols-6 gap-2">
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1} 
                                max={10} 
                                {...field} 
                                className="col-span-2"
                              />
                            </FormControl>
                            <div className="col-span-4 flex items-center text-sm text-muted-foreground">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    field.value <= 3 ? 'bg-red-500' : 
                                    field.value <= 6 ? 'bg-yellow-500' : 
                                    'bg-green-500'
                                  }`} 
                                  style={{ width: `${field.value * 10}%` }}
                                ></div>
                              </div>
                              <span className="ml-2">
                                {field.value <= 3 ? 'High' : 
                                 field.value <= 6 ? 'Medium' : 
                                 'Low'}
                              </span>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="additionalComments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Comments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add context or details about this task..."
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-synchro-600 hover:bg-synchro-700"
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Action Item"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extract">
          <Card>
            <CardHeader>
              <CardTitle>Extract Action Items</CardTitle>
              <CardDescription>
                Paste your meeting minutes and our AI will identify potential action items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="minutes">Meeting Minutes</Label>
                  <Textarea
                    id="minutes"
                    placeholder="Paste your meeting notes or minutes here..."
                    className="min-h-[200px] mt-1.5"
                    value={minutesText}
                    onChange={(e) => setMinutesText(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={extractActionItems}
                    className="bg-synchro-600 hover:bg-synchro-700"
                    disabled={aiLoading || !minutesText.trim()}
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Extract Action Items"
                    )}
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground mt-2">
                  <p>Tips:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Include clear action items in your minutes</li>
                    <li>Mention who is responsible for each task</li>
                    <li>Include deadlines when possible</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>AI Suggested Action Items</CardTitle>
              <CardDescription>
                Review and create action items suggested by our AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suggestions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No suggestions available.</p>
                  <p className="text-sm mt-2">
                    Go to "Extract from Minutes" tab to generate suggestions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <Card key={index} className="bg-slate-50">
                      <CardContent className="pt-6">
                        <div className="flex flex-col gap-2">
                          <h3 className="font-medium">{suggestion.taskName}</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Suggested Assignees:</span>{" "}
                              {suggestion.suggestedAssignees.length > 0 
                                ? suggestion.suggestedAssignees.map(id => 
                                    users.find(user => user.id === id)?.name || 'Unknown'
                                  ).join(', ')
                                : 'None specified'
                              }
                            </div>
                            
                            <div>
                              <span className="font-medium">Suggested Deadline:</span>{" "}
                              {suggestion.deadline 
                                ? format(new Date(suggestion.deadline), 'PP')
                                : 'None specified'
                              }
                            </div>
                            
                            <div>
                              <span className="font-medium">Priority:</span>{" "}
                              <Badge className={`
                                ${suggestion.priority <= 3 ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                                  suggestion.priority <= 6 ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 
                                  'bg-green-100 text-green-800 hover:bg-green-100'}
                              `}>
                                {suggestion.priority <= 3 ? 'High' : 
                                  suggestion.priority <= 6 ? 'Medium' : 'Low'} 
                                ({suggestion.priority})
                              </Badge>
                            </div>
                          </div>
                          
                          {suggestion.context && (
                            <div className="text-sm mt-2">
                              <span className="font-medium">Context:</span>
                              <div className="bg-white p-2 rounded border mt-1">
                                {suggestion.context}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end mt-2">
                            <Button
                              variant="outline"
                              onClick={() => createActionItemFromSuggestion(suggestion)}
                            >
                              Use This Suggestion
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageActionItems;
