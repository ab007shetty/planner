// CreateTaskModal.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { Task, TaskCategory } from '../utils/tasks';
import { formatDate, differenceInDays } from '../utils/dateUtils';

interface CreateTaskModalProps {
  isOpen: boolean;
  startDate: Date | null;
  endDate: Date | null;
  onClose: () => void;
  onCreate: (task: Omit<Task, 'id'>) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  startDate,
  endDate,
  onClose,
  onCreate
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('To Do');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCategory('To Do');
    }
  }, [isOpen]);

  if (!isOpen || !startDate || !endDate) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;

    const actualStart = startDate <= endDate ? startDate : endDate;
    const actualEnd = startDate <= endDate ? endDate : startDate;

    onCreate({
      title: title.trim(),
      startDate: actualStart,
      endDate: actualEnd,
      category
    });

    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Create New Task</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-semibold text-gray-700">Duration:</span>
            <span className="ml-2 text-blue-600 font-medium">
              {formatDate(startDate <= endDate ? startDate : endDate, 'MMM d')} - {' '}
              {formatDate(startDate <= endDate ? endDate : startDate, 'MMM d')}
            </span>
            <span className="ml-2 text-gray-600">
              ({differenceInDays(startDate <= endDate ? endDate : startDate, startDate <= endDate ? startDate : endDate) + 1} day{differenceInDays(startDate <= endDate ? endDate : startDate, startDate <= endDate ? startDate : endDate) !== 0 ? 's' : ''})
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Task Name *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter a descriptive task name"
              autoFocus
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {(['To Do', 'In Progress', 'Review', 'Completed'] as TaskCategory[]).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;