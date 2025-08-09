import React from 'react';
import { ChevronLeft, ChevronRight, Info, Menu, X, Calendar } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

interface HeaderProps {
  currentDate: Date;
  onSidebarToggle: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onShowGuide: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  currentDate, 
  onSidebarToggle, 
  onPrevMonth, 
  onNextMonth, 
  onToday, 
  onShowGuide,
  sidebarOpen
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4 shadow-lg" style={{ zIndex: 50 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onSidebarToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Task Planner
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-700">
            {formatDate(currentDate, 'MMMM yyyy')}
          </h2>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onToday}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Today
            </button>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={onPrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={onNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={onShowGuide}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-blue-200 bg-white shadow-sm"
              title="Show Quick Guide"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;