// TaskList.tsx
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Task, categoryStyles } from '../utils/tasks';
import { formatDate, differenceInDays } from '../utils/dateUtils';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  showDateInfo?: boolean;
  maxHeight?: string;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  showDateInfo = true,
  maxHeight = "300px" 
}) => {
  // Sort tasks by start date (nearest first)
  const sortedTasks = [...tasks].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return (
    <div 
      className="space-y-2 overflow-y-auto pr-2"
      style={{ 
        maxHeight,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <style >{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {sortedTasks.map(task => {
        const categoryStyle = categoryStyles[task.category];
        return (
          <div
            key={task.id}
            className={`group p-3 rounded-lg bg-gradient-to-r ${categoryStyle.bg} ${categoryStyle.text} relative hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-semibold mb-1 truncate pr-2">{task.title}</div>
                {showDateInfo && (
                  <div className="text-sm opacity-90 flex items-center justify-between">
                    <span>{formatDate(task.startDate, 'MMM d')} - {formatDate(task.endDate, 'MMM d')}</span>
                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded ml-2 whitespace-nowrap">
                      {differenceInDays(task.endDate, task.startDate) + 1} day{differenceInDays(task.endDate, task.startDate) > 0 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTask(task);
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  title="Edit Task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  className="p-2 hover:bg-red-500 hover:bg-opacity-80 rounded transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
      
      {sortedTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No tasks found</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;