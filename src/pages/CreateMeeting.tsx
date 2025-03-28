
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { User, MeetingFormData } from '@/types';

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(3, { message: "Meeting name must be at least 3 characters" }),
  dateTime: z.date({
    required_error: "Meeting date and time is required",
  }),
  attendees: z.array(z.string()).min(0),
  isOnline: z.boolean().default(false),
  meetingLink: z.string().url({ message: "Please enter a valid URL for the meeting link" }).optional().or(z.literal('')),
  additionalComments: z.string().max(500, { message: "Comments must be less than 500 characters" }).optional(),
}).refine((data) => {
  // If it's an online meeting, meeting link is required
  if (data.isOnline) {
    return !!data.meetingLink;
  }
  return true;
}, {
  message: "Meeting link is required for online meetings",
  path: ["meetingLink"],
});

const CreateMeeting = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [organizationUsers, setOrganizationUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      dateTime: new Date(),
      attendees: [],
      isOnline: false,
      meetingLink: "",
      additionalComments: "",
    },
  });

  // Watch the isOnline field to conditionally display meeting link field
  const isOnline = form.watch("isOnline");

  // Fetch organization users for the attendee selection
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      try {
        const users = await api.users.getByOrganisation(user.organisation);
        // Filter out the current user from the list
        setOrganizationUsers(users.filter(u => u.id !== user.id));
      } catch (error) {
        console.error('Error fetching organization users:', error);
        toast({
          title: "Failed to load colleagues",
          description: "Could not fetch users from your organization",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [user, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Format the datetime properly and ensure all required fields are present
      const formattedValues: MeetingFormData = {
        name: values.name, // This is now explicitly non-optional
        dateTime: values.dateTime.toISOString(),
        attendees: values.attendees,
        isOnline: values.isOnline,
        meetingLink: values.meetingLink,
        additionalComments: values.additionalComments,
      };
      
      const meeting = await api.meetings.create(
        formattedValues, 
        user.id,
        user.name,
        user.email,
        user.organisation
      );
      
      toast({
        title: "Meeting created",
        description: "Your meeting has been scheduled successfully",
      });
      
      navigate('/meetings');
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Failed to create meeting",
        description: "There was an error scheduling your meeting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Meeting</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Meeting Details</CardTitle>
          <CardDescription>Schedule a new meeting with your colleagues</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Weekly Team Sync" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a descriptive name for the meeting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date and Time*</FormLabel>
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
                              <span>Select date and time</span>
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
                          className={cn("p-3 pointer-events-auto")}
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = new Date(field.value);
                              newDate.setHours(parseInt(hours || "0", 10));
                              newDate.setMinutes(parseInt(minutes || "0", 10));
                              field.onChange(newDate);
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select the date and time for your meeting
                    </FormDescription>
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
                    <div className="space-y-2">
                      {isLoadingUsers ? (
                        <p className="text-sm text-muted-foreground">Loading colleagues...</p>
                      ) : organizationUsers.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                          {organizationUsers.map((orgUser) => (
                            <div key={orgUser.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`user-${orgUser.id}`}
                                checked={field.value.includes(orgUser.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, orgUser.id]);
                                  } else {
                                    field.onChange(field.value.filter(id => id !== orgUser.id));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`user-${orgUser.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {orgUser.name} ({orgUser.position})
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No colleagues found in your organization</p>
                      )}
                    </div>
                    <FormDescription>
                      Select colleagues from your organization to attend this meeting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isOnline"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        This is an online meeting
                      </FormLabel>
                      <FormDescription>
                        Check this if the meeting will be held online instead of in-person
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {isOnline && (
                <FormField
                  control={form.control}
                  name="meetingLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Link*</FormLabel>
                      <FormControl>
                        <Input placeholder="https://meet.google.com/abc-defg-hij" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide the link for attendees to join the meeting
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
                        placeholder="Meeting agenda, preparation required, etc."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add any extra information participants should know (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <Button type="submit" className="w-full bg-synchro-600 hover:bg-synchro-700" disabled={loading}>
                  {loading ? "Creating meeting..." : "Schedule Meeting"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMeeting;
