import React, { useState, useEffect } from 'react';
import { useUIStore } from '../lib/ui/ui.store';

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  location?: {
    file: string;
    component: string;
    function: string;
  };
  meta?: Record<string, unknown>;
}

export function LogPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'error' | 'warn' | 'info' | 'debug' | 'all'>('all');
  const { isLogPanelVisible } = useUIStore();

  useEffect(() => {
    const originalConsole = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };

    function addLog(level: LogEntry['level'], message: string, context?: Record<string, unknown>) {
      const entry: LogEntry = {
        timestamp: context?.timestamp as string || new Date().toISOString(),
        level,
        message,
        location: context?.location as LogEntry['location'],
        meta: context
      };

      setLogs(prev => [...prev, entry]);
    }

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog('error', args[0], args[1]);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog('warn', args[0], args[1]);
    };

    console.info = (...args) => {
      originalConsole.info(...args);
      addLog('info', args[0], args[1]);
    };

    console.debug = (...args) => {
      originalConsole.debug(...args);
      addLog('debug', args[0], args[1]);
    };

    return () => {
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
    };
  }, []);

  const levelColors = {
    error: 'text-red-600',
    warn: 'text-yellow-600',
    info: 'text-blue-600',
    debug: 'text-gray-600'
  };

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.level === filter
  );

  const handleClearLogs = () => {
    setLogs([]);
  };

  // If log panel is not visible in settings, don't render it
  if (!isLogPanelVisible) {
    return null;
  }

  return (
    <div className={`fixed bottom-8 left-8 w-[600px] bg-white rounded-lg shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-2.5rem)]'}`}>
      <div 
        className="p-2 bg-gray-100 rounded-t-lg flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-medium text-gray-700">Application Logs</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            onClick={(e) => e.stopPropagation()}
            className="text-xs border-gray-300 rounded-md"
          >
            <option value="all">All Levels</option>
            <option value="error">Errors</option>
            <option value="warn">Warnings</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearLogs();
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Clear all
          </button>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          {isOpen ? '−' : '+'}
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {filteredLogs.map((log, index) => (
          <div key={index} className="p-2 border-b border-gray-100 text-xs hover:bg-gray-50">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={`font-medium ${levelColors[log.level]}`}>{log.level.toUpperCase()}</span>
              {log.location && (
                <span className="text-gray-500">
                  {log.location.file}:{log.location.component}.{log.location.function}
                </span>
              )}
            </div>
            <div className="mt-1">
              <div className="text-gray-800">{log.message}</div>
              {log.meta && (
                <pre className="mt-1 text-gray-600 bg-gray-50 p-1 rounded overflow-x-auto">
                  {JSON.stringify(log.meta, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}