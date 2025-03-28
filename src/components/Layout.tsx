
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6 flex-grow">
        <Outlet />
      </main>
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-2 sm:mb-0">
              <span className="text-synchro-600 dark:text-synchro-400 font-semibold mr-2">SynchroSchedule</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">© {new Date().getFullYear()} All rights reserved</span>
            </div>
            <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-synchro-600 dark:hover:text-synchro-400">Privacy Policy</a>
              <a href="#" className="hover:text-synchro-600 dark:hover:text-synchro-400">Terms of Service</a>
              <a href="#" className="hover:text-synchro-600 dark:hover:text-synchro-400">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
