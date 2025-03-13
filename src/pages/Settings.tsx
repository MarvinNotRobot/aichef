import React from 'react';
import { useUIStore } from '../lib/ui/ui.store';

export function Settings() {
  const { isLogPanelVisible, setLogPanelVisible } = useUIStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Application Logs</h3>
              <p className="text-sm text-gray-500">Show or hide the application logs panel at the bottom of the screen</p>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isLogPanelVisible}
                  onChange={(e) => setLogPanelVisible(e.target.checked)}
                  data-testid="log-panel-toggle"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {isLogPanelVisible ? 'Visible' : 'Hidden'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">About</h2>
        <p className="text-gray-600">Recipe Cost Analysis Application</p>
        <p className="text-gray-600 mt-2">Version 1.0.0</p>
      </div>
    </div>
  );
}