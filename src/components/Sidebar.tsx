import React, { useState, useMemo } from 'react';
import { X, Calendar, Search } from 'lucide-react';
import { Task, TaskState, TaskCategory, categoryStyles } from '../utils/tasks';
import TaskList from './TaskList';

interface SidebarProps {
  isOpen: boolean;
  state: TaskState;
  setState: React.Dispatch<React.SetStateAction<TaskState>>;
  filteredTasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  state, 
  setState, 
  filteredTasks,
  onEditTask,
  onDeleteTask
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks by search query
  const searchFilteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return filteredTasks;
    
    const query = searchQuery.toLowerCase().trim();
    return filteredTasks.filter(task => 
      task.title.toLowerCase().includes(query)
    );
  }, [filteredTasks, searchQuery]);

  // Count tasks by category
  const categoryCounts = useMemo(() => {
    return {
      'To Do': state.tasks.filter(task => task.category === 'To Do').length,
      'In Progress': state.tasks.filter(task => task.category === 'In Progress').length,
      'Review': state.tasks.filter(task => task.category === 'Review').length,
      'Completed': state.tasks.filter(task => task.category === 'Completed').length,
    };
  }, [state.tasks]);

  return (
    <div 
      className={`${
        isOpen ? 'w-80' : 'w-0'
      } transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden flex flex-col shadow-lg`}
      style={{ zIndex: 40 }} // Behind header (z-50)
    >
      {isOpen && (
        <>
          {/* Compact Header - No title or close button */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">

            {/* Category Filters - More Compact */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-600 mb-2">Categories</h3>
              <div className="space-y-1.5">
                {(['To Do', 'In Progress', 'Review', 'Completed'] as TaskCategory[]).map(category => (
                  <label key={category} className="flex items-center p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.filters.categories.includes(category)}
                      onChange={(e) => {
                        setState(prev => ({
                          ...prev,
                          filters: {
                            ...prev.filters,
                            categories: e.target.checked
                              ? [...prev.filters.categories, category]
                              : prev.filters.categories.filter(c => c !== category)
                          }
                        }));
                      }}
                      className="mr-2.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${categoryStyles[category].bg} mr-2`}></div>
                    <span className="text-sm text-gray-700 flex-1">{category}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-2">
                      {categoryCounts[category]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Compact Time Range Filter */}
            <div className="mt-4">
              <h3 className="text-xs font-medium text-gray-600 mb-2">Time Range</h3>
              <select
                value={state.filters.timeRange || ''}
                onChange={(e) => {
                  setState(prev => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      timeRange: (e.target.value as '1week' | '2weeks' | '3weeks') || null
                    }
                  }));
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Time</option>
                <option value="1week">Last Week</option>
                <option value="2weeks">Last 2 Weeks</option>
                <option value="3weeks">Last 3 Weeks</option>
              </select>
            </div>
          </div>

          {/* Tasks Section - Maximum Space */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
            {/* Search Input */}
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Tasks Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                <h3 className="text-base font-semibold text-gray-800">Tasks</h3>
              </div>
              <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                {searchFilteredTasks.length}
              </div>
            </div>
            
            {/* Tasks List - Takes remaining space */}
            <div className="flex-1 overflow-hidden">
              <TaskList
                tasks={searchFilteredTasks}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                showDateInfo={true}
                maxHeight="100%"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;