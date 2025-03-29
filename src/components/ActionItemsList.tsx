
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, ActionItem } from '@/types';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActionItemsListProps {
  actionItems: ActionItem[];
  users: User[];
  isHost: boolean;
  onUpdateStatus: (itemId: string, progress: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked') => Promise<void>;
}

const ActionItemsList: React.FC<ActionItemsListProps> = ({
  actionItems,
  users,
  isHost,
  onUpdateStatus,
}) => {
  if (actionItems.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        No action items have been created for this meeting yet.
      </div>
    );
  }

  // Find user by ID
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  return (
    <div className="space-y-4">
      {actionItems.map((item) => {
        const assignees = item.assignees.map(id => 
          getUserById(id)?.name || 'Unknown'
        ).join(', ');
        
        return (
          <Card key={item.id} className="border shadow-sm">
            <CardContent className="p-4">
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
                    onValueChange={(value) => onUpdateStatus(
                      item.id, 
                      value as 'Not Started' | 'In Progress' | 'Completed' | 'Blocked'
                    )}
                    disabled={!isHost && !item.assignees.includes(users.find(u => u.name === 'John Doe')?.id || '')}
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
  );
};

export default ActionItemsList;
