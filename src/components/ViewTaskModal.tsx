// ViewTaskModal.tsx
import React from 'react';
import { Calendar, X } from 'lucide-react';
import { Task } from '../utils/tasks';
import { formatDate } from '../utils/dateUtils';
import TaskList from './TaskList';

interface ViewTaskModalProps {
  isOpen: boolean;
  date: Date | null;
  tasks: Task[];
  onClose: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({
  isOpen,
  date,
  tasks,
  onClose,
  onEditTask,
  onDeleteTask
}) => {
  if (!isOpen || !date) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Tasks for</h3>
              <p className="text-sm text-gray-600">{formatDate(date, 'MMM d')}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 p-6 overflow-hidden">
          <TaskList
            tasks={tasks}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            showDateInfo={true}
            maxHeight="400px"
          />
        </div>
        
        <div className="p-4 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">Click edit button to modify tasks</p>
        </div>
      </div>
    </div>
  );
};

export default ViewTaskModal;