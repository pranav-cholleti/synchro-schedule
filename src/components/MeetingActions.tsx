
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4, Edit, ListTodo } from 'lucide-react';

interface MeetingActionsProps {
  meetingId: string;
  isHost: boolean;
  hasActionItems: boolean;
}

const MeetingActions: React.FC<MeetingActionsProps> = ({
  meetingId,
  isHost,
  hasActionItems
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Link to={`/meetings/${meetingId}/dashboard`}>
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
        </Link>
        {isHost && (
          <>
            <Link to={`/meetings/${meetingId}/edit`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <span>Edit Meeting</span>
              </Button>
            </Link>
            <Link to={`/meetings/${meetingId}/action-items`}>
              <Button className="bg-synchro-600 hover:bg-synchro-700 flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                <span>{hasActionItems ? 'Manage Action Items' : 'Create Action Items'}</span>
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingActions;
