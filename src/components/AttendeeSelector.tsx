
import React, { useState } from 'react';
import { User } from '@/types';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X, Check } from 'lucide-react';

interface AttendeeSelectorProps {
  users: User[];
  selectedUserIds: string[];
  onChange: (selectedIds: string[]) => void;
  excludeUserId?: string;
}

export const AttendeeSelector = ({ 
  users, 
  selectedUserIds, 
  onChange, 
  excludeUserId 
}: AttendeeSelectorProps) => {
  const [search, setSearch] = useState('');
  
  // Filter out the excluded user (usually the current user/host)
  const filteredUsers = users
    .filter(user => !excludeUserId || user.id !== excludeUserId)
    .filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.position.toLowerCase().includes(search.toLowerCase())
    );
  
  const handleSelect = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };
  
  const removeAttendee = (userId: string) => {
    onChange(selectedUserIds.filter(id => id !== userId));
  };
  
  // Find user by ID
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedUserIds.map(userId => {
          const user = getUserById(userId);
          if (!user) return null;
          
          return (
            <Badge 
              key={userId} 
              variant="secondary"
              className="py-1 px-2 gap-1 text-sm"
            >
              {user.name}
              <button 
                type="button"
                onClick={() => removeAttendee(userId)}
                className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </button>
            </Badge>
          );
        })}
      </div>
      
      <Command className="border rounded-md">
        <CommandInput 
          placeholder="Search for people..." 
          onValueChange={setSearch}
          value={search}
          className="h-9"
        />
        <CommandEmpty>No people found.</CommandEmpty>
        <CommandGroup className="max-h-44 overflow-auto">
          {filteredUsers.map(user => (
            <CommandItem
              key={user.id}
              value={user.id}
              onSelect={() => handleSelect(user.id)}
              className="flex items-center justify-between cursor-pointer px-2 py-1 hover:bg-accent"
            >
              <div>
                <div>{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              {selectedUserIds.includes(user.id) ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : null}
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </div>
  );
};
