
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Meeting, ActionItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart4, Calendar, Clock, Users, MapPin, Link as LinkIcon, MessageSquare } from 'lucide-react';

const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!id || !user) return;
      
      try {
        const [fetchedMeeting, fetchedTasks] = await Promise.all([
          api.meetings.getById(id),
          api.actionItems.getByMeeting(id)
        ]);
        
        setMeeting(fetchedMeeting);
        setActionItems(fetchedTasks);
      } catch (error) {
        console.error('Error fetching meeting:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeeting();
  }, [id, user]);

  if (loading) {
    return <div className="text-center py-10">Loading meeting details...</div>;
  }

  if (!meeting) {
    return <div className="text-center py-10">Meeting not found or you don't have access to view it.</div>;
  }

  const meetingDate = new Date(meeting.dateTime);
  const isHost = meeting.attendees.some(a => a.userId === user?.id && a.role === 'host');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{meeting.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organized by {meeting.attendees.find(a => a.role === 'host')?.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/meetings/${id}/dashboard`}>
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart4 className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
          {isHost && (
            <Button className="bg-synchro-600 hover:bg-synchro-700">Edit Meeting</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Meeting Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-synchro-600 mt-0.5" />
                <div>
                  <div className="font-medium">Date</div>
                  <div>{meetingDate.toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-synchro-600 mt-0.5" />
                <div>
                  <div className="font-medium">Time</div>
                  <div>{meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-5 w-5 text-synchro-600 mt-0.5" />
                <div>
                  <div className="font-medium">Attendees</div>
                  <div>{meeting.attendees.length} people</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                {meeting.isOnline ? (
                  <LinkIcon className="h-5 w-5 text-synchro-600 mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 text-synchro-600 mt-0.5" />
                )}
                <div>
                  <div className="font-medium">{meeting.isOnline ? 'Meeting Link' : 'Location'}</div>
                  {meeting.isOnline ? (
                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-synchro-600 hover:underline break-all">
                      {meeting.meetingLink}
                    </a>
                  ) : (
                    <div>In-person meeting</div>
                  )}
                </div>
              </div>
            </div>

            {meeting.additionalComments && (
              <div className="mt-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-5 w-5 text-synchro-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Additional Comments</div>
                    <div className="mt-1 whitespace-pre-line">{meeting.additionalComments}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {meeting.attendees.map((attendee) => (
                <li key={attendee.userId} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{attendee.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{attendee.email}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {attendee.role === 'host' ? 'Host' : 'Attendee'}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          {actionItems.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No action items have been created for this meeting yet.
            </div>
          ) : (
            <div className="space-y-4">
              {actionItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{item.taskName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Due: {new Date(item.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.progress === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        item.progress === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                        item.progress === 'Blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}>
                        {item.progress}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.priority <= 3 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                        item.priority <= 6 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        Priority {item.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {isHost && (
            <div className="mt-6 flex justify-center">
              <Button className="bg-synchro-600 hover:bg-synchro-700">
                {actionItems.length === 0 ? 'Create Action Items' : 'Manage Action Items'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingDetail;
