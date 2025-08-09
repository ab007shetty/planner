// QuickGuideModal.tsx
import React, { useRef } from 'react';
import { Info, X, MousePointer, Move, Edit, Calendar, Filter } from 'lucide-react';

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickGuideModal: React.FC<QuickGuideModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const instructions = [
    {
      icon: <MousePointer className="w-5 h-5 text-blue-500" />,
      title: "Create Tasks",
      description: "Click and drag on empty calendar cells to select a date range, then create your task."
    },
    {
      icon: <Move className="w-5 h-5 text-green-500" />,
      title: "Move Tasks",
      description: "Click and drag task bars to move them to different dates. Drop on any calendar cell."
    },
    {
      icon: <Edit className="w-5 h-5 text-purple-500" />,
      title: "Resize Tasks",
      description: "Drag the left or right edges of task bars to change their duration."
    },
    {
      icon: <Calendar className="w-5 h-5 text-orange-500" />,
      title: "Edit Tasks",
      description: "Click on any task bar to open the edit dialog and modify title or category."
    },
    {
      icon: <Filter className="w-5 h-5 text-indigo-500" />,
      title: "Filter Tasks",
      description: "Use the sidebar to filter tasks by category and time range. Toggle sidebar with menu button."
    }
  ];

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl transform transition-all max-w-5xl w-full mx-6 my-12"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Quick Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Horizontal Layout */}
        <div className="p-4 flex flex-wrap gap-4 justify-center">
          {instructions.map((instruction, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-64"
            >
              <div className="flex-shrink-0 mt-0.5">{instruction.icon}</div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">{instruction.title}</h4>
                <p className="text-sm text-gray-600">{instruction.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tips */}
        <div className="px-4 pb-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Pro Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Hold and drag to create multi-day tasks</li>
              <li>• Tasks automatically stack when overlapping</li>
              <li>• Use keyboard shortcuts: Enter to confirm, Escape to cancel</li>
              <li>• Today's date is highlighted with a special indicator</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickGuideModal;
