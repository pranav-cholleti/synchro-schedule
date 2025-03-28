
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { User, Meeting } from '@/types';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendeeSelector } from '@/components/AttendeeSelector';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Meeting name must be at least 2 characters.",
  }),
  dateTime: z.date({
    required_error: "Please select a date and time for the meeting.",
  }),
  attendees: z.array(z.string()),
  isOnline: z.boolean().default(true),
  meetingLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  additionalComments: z.string().optional(),
});

const EditMeeting = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      attendees: [],
      isOnline: true,
      meetingLink: "",
      additionalComments: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;
      
      try {
        const [fetchedMeeting, fetchedUsers] = await Promise.all([
          api.meetings.getById(id),
          api.users.getByOrganisation(user.organisation)
        ]);
        
        setMeeting(fetchedMeeting);
        setUsers(fetchedUsers);
        
        // Only update form if the user is the host
        if (fetchedMeeting.hostId === user.id) {
          // Convert attendees list to just IDs, excluding the host
          const attendeeIds = fetchedMeeting.attendees
            .filter(a => a.role === 'attendee')
            .map(a => a.userId);
          
          form.reset({
            name: fetchedMeeting.name,
            dateTime: new Date(fetchedMeeting.dateTime),
            attendees: attendeeIds,
            isOnline: fetchedMeeting.isOnline,
            meetingLink: fetchedMeeting.meetingLink || "",
            additionalComments: fetchedMeeting.additionalComments || "",
          });
        } else {
          toast({
            title: "Access denied",
            description: "You don't have permission to edit this meeting.",
            variant: "destructive",
          });
          navigate(`/meetings/${id}`);
        }
      } catch (error) {
        console.error('Error fetching meeting data:', error);
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
  }, [id, user, toast, navigate, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !meeting) return;
    
    setLoading(true);
    try {
      // Format the datetime properly
      const formattedValues = {
        name: values.name,
        dateTime: values.dateTime.toISOString(),
        attendees: meeting.attendees
          .filter(a => a.role === 'host')
          .map(a => a.userId)
          .concat(values.attendees),
        isOnline: values.isOnline,
        meetingLink: values.isOnline ? values.meetingLink : undefined,
        additionalComments: values.additionalComments,
      };
      
      const updatedMeeting = await api.meetings.update(id!, formattedValues);
      
      toast({
        title: "Meeting updated",
        description: "Your meeting has been updated successfully.",
      });
      
      navigate(`/meetings/${updatedMeeting.id}`);
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast({
        title: "Error",
        description: "Could not update the meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading meeting details...</div>;
  }

  if (!meeting) {
    return <div className="text-center py-10">Meeting not found.</div>;
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Meeting</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Meeting Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Team Weekly Sync" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date and Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP p")
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              const date = new Date(field.value || new Date());
                              const [hours, minutes] = e.target.value.split(':');
                              date.setHours(parseInt(hours, 10));
                              date.setMinutes(parseInt(minutes, 10));
                              field.onChange(date);
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="attendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attendees</FormLabel>
                    <FormControl>
                      <AttendeeSelector 
                        users={users} 
                        selectedUserIds={field.value} 
                        onChange={field.onChange}
                        excludeUserId={user?.id}
                      />
                    </FormControl>
                    <FormDescription>
                      Select the people who should attend this meeting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isOnline"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Online Meeting</FormLabel>
                      <FormDescription>
                        Toggle if this is an online or in-person meeting.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("isOnline") && (
                <FormField
                  control={form.control}
                  name="meetingLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Link</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://meet.google.com/xxx-xxxx-xxx" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a link for online meeting (Zoom, Google Meet, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="additionalComments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Comments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Agenda, notes, or additional information about the meeting..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/meetings/${id}`)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-synchro-600 hover:bg-synchro-700" 
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Meeting"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMeeting;
