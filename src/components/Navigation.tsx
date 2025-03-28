
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarPlus, CalendarClock, CheckSquare, LogOut, User } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-synchro-700 dark:text-synchro-400">SynchroSchedule</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link to="/dashboard">
                <Button variant={isActive('/dashboard') ? "default" : "ghost"} className={isActive('/dashboard') ? "bg-synchro-100 text-synchro-700" : ""}><User className="mr-2 h-4 w-4" /> Dashboard</Button>
              </Link>
              <Link to="/meetings/create">
                <Button variant={isActive('/meetings/create') ? "default" : "ghost"} className={isActive('/meetings/create') ? "bg-synchro-100 text-synchro-700" : ""}><CalendarPlus className="mr-2 h-4 w-4" /> Create Meeting</Button>
              </Link>
              <Link to="/meetings">
                <Button variant={isActive('/meetings') ? "default" : "ghost"} className={isActive('/meetings') ? "bg-synchro-100 text-synchro-700" : ""}><CalendarClock className="mr-2 h-4 w-4" /> My Meetings</Button>
              </Link>
              <Link to="/tasks">
                <Button variant={isActive('/tasks') ? "default" : "ghost"} className={isActive('/tasks') ? "bg-synchro-100 text-synchro-700" : ""}><CheckSquare className="mr-2 h-4 w-4" /> My Tasks</Button>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="ghost" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
          </div>
          
          {/* Mobile menu */}
          <div className="sm:hidden flex items-center space-x-2">
            <div className="p-2">
              <Button variant="ghost" onClick={handleLogout} size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation at bottom */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-10">
        <div className="grid grid-cols-4 h-16">
          <Link to="/dashboard" className={`flex flex-col items-center justify-center ${isActive('/dashboard') ? 'text-synchro-700' : 'text-gray-500'}`}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link to="/meetings/create" className={`flex flex-col items-center justify-center ${isActive('/meetings/create') ? 'text-synchro-700' : 'text-gray-500'}`}>
            <CalendarPlus className="h-5 w-5" />
            <span className="text-xs mt-1">Create</span>
          </Link>
          <Link to="/meetings" className={`flex flex-col items-center justify-center ${isActive('/meetings') ? 'text-synchro-700' : 'text-gray-500'}`}>
            <CalendarClock className="h-5 w-5" />
            <span className="text-xs mt-1">Meetings</span>
          </Link>
          <Link to="/tasks" className={`flex flex-col items-center justify-center ${isActive('/tasks') ? 'text-synchro-700' : 'text-gray-500'}`}>
            <CheckSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Tasks</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
