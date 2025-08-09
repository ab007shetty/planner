import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import ViewTaskModal from './ViewTaskModal';
import QuickGuideModal from './QuickGuideModal';
import { useMemoryStorage } from '../utils/localStorage';
import { Task, TaskState, initialTasks, categoryStyles } from '../utils/tasks';
import { 
  formatDate, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay, 
  addDays, 
  addMonths, 
  subMonths, 
  subWeeks, 
  differenceInDays 
} from '../utils/dateUtils';

// Floating Task Bar Component for dragging
const FloatingTaskBar: React.FC<{
  task: Task;
  mousePos: { x: number; y: number };
  categoryStyles: any;
}> = ({ task, mousePos, categoryStyles }) => {
  const categoryStyle = categoryStyles[task.category];
  
  return (
    <div
      className={`fixed pointer-events-none z-[9999] text-xs p-2 bg-gradient-to-r ${categoryStyle.bg} ${categoryStyle.text} rounded-md border-l-4 border-r-4 border-white shadow-lg opacity-80`}
      style={{
        left: mousePos.x - 100,
        top: mousePos.y - 14,
        width: '200px',
        height: '28px'
      }}
    >
      <div className="flex items-center justify-between h-full">
        <div className="truncate flex-1">{task.title}</div>
      </div>
    </div>
  );
};

// Sortable Task Component with reduced opacity
const SortableTask: React.FC<{
  task: Task;
  weekStartDate: Date;
  layerIndex: number;
  categoryStyles: any;
  handleTaskClick: (task: Task) => void;
  handleTaskMouseDown: (taskId: string, e: React.MouseEvent) => void;
  handleResizeMouseDown: (taskId: string, edge: 'start' | 'end', e: React.MouseEvent) => void;
  getTaskPositionInWeek: (task: Task, weekStartDate: Date) => any;
  draggedTask: string | null;
}> = ({ 
  task, 
  weekStartDate, 
  layerIndex, 
  categoryStyles, 
  handleTaskClick, 
  handleTaskMouseDown, 
  handleResizeMouseDown, 
  getTaskPositionInWeek, 
  draggedTask 
}) => {
  const position = getTaskPositionInWeek(task, weekStartDate);
  const leftPercent = (position.startDayOfWeek / 7) * 100;
  const widthPercent = (position.duration / 7) * 100;
  const categoryStyle = categoryStyles[task.category];

  // Hide the original task when it's being dragged
  const isBeingDragged = draggedTask === task.id;

  const style = {
    top: `${layerIndex * 32 + 8}px`,
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    height: '28px',
    opacity: isBeingDragged ? 0.3 : 0.85, // Reduced opacity for all tasks
    zIndex: isBeingDragged ? 999 : 1
  };

  return (
    <div
      style={style}
      className={`absolute text-xs p-2 cursor-pointer bg-gradient-to-r ${categoryStyle.bg} ${categoryStyle.text} rounded-md border-l-4 border-r-4 border-white pointer-events-auto hover:shadow-lg hover:opacity-100 transition-all duration-200`}
      onMouseDown={(e) => handleTaskMouseDown(task.id, e)}
      onClick={(e) => {
        e.stopPropagation();
        handleTaskClick(task);
      }}
      title={`${task.title}\nDuration: ${differenceInDays(task.endDate, task.startDate) + 1} day${differenceInDays(task.endDate, task.startDate) > 0 ? 's' : ''}\nClick to edit`}
    >
      <div className="flex items-center justify-between h-full">
        <div className="truncate flex-1">{task.title}</div>
      </div>
      {position.isTaskStart && (
        <div
          className="absolute -left-1 top-0 w-2 h-full cursor-ew-resize flex items-center justify-center bg-black bg-opacity-10 rounded-l-md z-10"
          onMouseDown={(e) => handleResizeMouseDown(task.id, 'start', e)}
          onClick={(e) => e.stopPropagation()}
          title="Drag to change start date"
        >
          <div className="w-0.5 h-3 bg-white bg-opacity-80 rounded-full"></div>
        </div>
      )}
      {position.isTaskEnd && (
        <div
          className="absolute -right-1 top-0 w-2 h-full cursor-ew-resize flex items-center justify-center bg-black bg-opacity-10 rounded-r-md z-10"
          onMouseDown={(e) => handleResizeMouseDown(task.id, 'end', e)}
          onClick={(e) => e.stopPropagation()}
          title="Drag to change end date"
        >
          <div className="w-0.5 h-3 bg-white bg-opacity-80 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

// Main Task Planner Component
const TaskPlanner: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [state, setState] = useMemoryStorage<TaskState>({
    tasks: initialTasks,
    filters: {
      categories: ['To Do', 'In Progress', 'Review', 'Completed'],
      timeRange: null
    }
  });

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [resizingTask, setResizingTask] = useState<{ id: string; edge: 'start' | 'end' } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewTaskModal, setShowViewTaskModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open
  const [selectedDateTasks, setSelectedDateTasks] = useState<{ date: Date; tasks: Task[] } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Navigation functions
  const navigatePrevious = () => setCurrentDate(prev => subMonths(prev, 1));
  const navigateNext = () => setCurrentDate(prev => addMonths(prev, 1));
  const navigateToday = () => setCurrentDate(new Date());

  // Get calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Filter tasks
  const filteredTasks = state.tasks.filter(task => {
    if (!state.filters.categories.includes(task.category)) return false;

    if (state.filters.timeRange) {
      const now = new Date();
      const weeksMap = { '1week': 1, '2weeks': 2, '3weeks': 3 };
      const cutoffDate = subWeeks(now, weeksMap[state.filters.timeRange]);
      if (task.startDate < cutoffDate) return false;
    }

    return true;
  });

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateTasks = filteredTasks.filter(task =>
      date >= task.startDate && date <= task.endDate
    );
    
    return dateTasks.sort((a, b) => {
      if (a.startDate.getTime() !== b.startDate.getTime()) {
        return a.startDate.getTime() - b.startDate.getTime();
      }
      return a.title.localeCompare(b.title);
    });
  };

  // Calculate position of a task within a week row for continuous display
  const getTaskPositionInWeek = (task: Task, weekStartDate: Date) => {
    const taskStart = task.startDate >= weekStartDate ? task.startDate : weekStartDate;
    const weekEndDate = addDays(weekStartDate, 6);
    const taskEnd = task.endDate <= weekEndDate ? task.endDate : weekEndDate;
    
    const startDayOfWeek = taskStart.getDay();
    const endDayOfWeek = taskEnd.getDay();
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    return {
      startDayOfWeek,
      endDayOfWeek,
      duration,
      isTaskStart: isSameDay(task.startDate, taskStart),
      isTaskEnd: isSameDay(task.endDate, taskEnd),
      taskStart,
      taskEnd
    };
  };

  // Group calendar days by weeks for proper task rendering
  const calendarWeeks: Date[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    calendarWeeks.push(calendarDays.slice(i, i + 7));
  }

  // Handle mouse events for task creation
  const handleMouseDown = useCallback((date: Date, e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('date-cell-content')) {
      setIsSelecting(true);
      setSelectionStart(date);
      setSelectionEnd(date);
    }
  }, []);

  const handleMouseEnter = useCallback((date: Date) => {
    if (isSelecting && selectionStart) {
      setSelectionEnd(date);
    }
  }, [isSelecting, selectionStart]);

  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectionStart && selectionEnd) {
      setShowCreateModal(true);
      setIsSelecting(false);
    }
  }, [isSelecting, selectionStart, selectionEnd]);

  // Get selection range
  const getSelectionRange = () => {
    if (!selectionStart || !selectionEnd) return [];
    
    const start = selectionStart <= selectionEnd ? selectionStart : selectionEnd;
    const end = selectionStart <= selectionEnd ? selectionEnd : selectionStart;
    
    return eachDayOfInterval({ start, end });
  };

  // Handle task creation with localStorage update
  const handleCreateTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...newTaskData
    };

    setState(prev => {
      const updatedState = {
        ...prev,
        tasks: [...prev.tasks, newTask]
      };
      // Save to localStorage
      localStorage.setItem('taskPlannerState', JSON.stringify(updatedState));
      return updatedState;
    });

    resetCreateModal();
  };

  // Handle task editing
  const handleTaskClick = (task: Task) => {
    // Close view modal if open, then open edit modal
    if (showViewTaskModal) {
      setShowViewTaskModal(false);
      setSelectedDateTasks(null);
      // Small delay to ensure view modal closes first
      setTimeout(() => {
        setEditingTask(task);
        setShowEditModal(true);
      }, 100);
    } else {
      setEditingTask(task);
      setShowEditModal(true);
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setState(prev => {
      const updatedState = {
        ...prev,
        tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
      };
      // Save to localStorage
      localStorage.setItem('taskPlannerState', JSON.stringify(updatedState));
      return updatedState;
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setState(prev => {
      const updatedState = {
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== taskId)
      };
      // Save to localStorage
      localStorage.setItem('taskPlannerState', JSON.stringify(updatedState));
      return updatedState;
    });
  };

  const resetCreateModal = () => {
    setShowCreateModal(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  // Handle showing task list for a date
  const handleShowTaskList = (date: Date) => {
    const tasks = getTasksForDate(date);
    setSelectedDateTasks({ date, tasks });
    setShowViewTaskModal(true);
  };

  // Handle task drag and drop with real-time cursor following
  const handleTaskMouseDown = useCallback((taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggedTask(taskId);
    setIsDragging(true);
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  // Track mouse movement during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedTask || resizingTask) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    if (draggedTask || resizingTask) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [draggedTask, resizingTask]);

  const handleTaskDrop = useCallback((date: Date) => {
    if (!draggedTask) return;

    const task = state.tasks.find(t => t.id === draggedTask);
    if (!task) return;

    const duration = differenceInDays(task.endDate, task.startDate);
    const newEndDate = addDays(date, duration);

    setState(prev => {
      const updatedState = {
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === draggedTask
            ? { ...t, startDate: date, endDate: newEndDate }
            : t
        )
      };
      // Save to localStorage
      localStorage.setItem('taskPlannerState', JSON.stringify(updatedState));
      return updatedState;
    });

    setDraggedTask(null);
    setIsDragging(false);
  }, [draggedTask, state.tasks, setState]);

  // Handle task resize
  const handleResizeMouseDown = useCallback((taskId: string, edge: 'start' | 'end', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingTask({ id: taskId, edge });
    setIsDragging(true);
  }, []);

  const handleResizeDrop = useCallback((date: Date) => {
    if (!resizingTask) return;

    setState(prev => {
      const updatedState = {
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === resizingTask.id
            ? { ...t, [resizingTask.edge === 'start' ? 'startDate' : 'endDate']: date }
            : t
        )
      };
      // Save to localStorage
      localStorage.setItem('taskPlannerState', JSON.stringify(updatedState));
      return updatedState;
    });

    setResizingTask(null);
    setIsDragging(false);
  }, [resizingTask, setState]);

  // Global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsSelecting(false);
      setDraggedTask(null);
      setResizingTask(null);
      setIsDragging(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('taskPlannerState');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        // Convert date strings back to Date objects
        parsedState.tasks = parsedState.tasks.map((task: any) => ({
          ...task,
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate)
        }));
        setState(parsedState);
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  }, []);

  // Check if date is in selection
  const isDateInSelection = (date: Date) => {
    const selectionRange = getSelectionRange();
    return selectionRange.some(d => isSameDay(d, date));
  };

  // Get dragged task for floating display
  const draggedTaskData = draggedTask ? state.tasks.find(t => t.id === draggedTask) : null;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        state={state}
        setState={setState}
        filteredTasks={filteredTasks}
        onEditTask={handleTaskClick}
        onDeleteTask={handleDeleteTask}
      />

      <div className="flex-1 flex flex-col">
        <Header
          currentDate={currentDate}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          onPrevMonth={navigatePrevious}
          onNextMonth={navigateNext}
          onToday={navigateToday}
          onShowGuide={() => setShowGuideModal(true)}
          sidebarOpen={sidebarOpen}
        />

        <div className="flex-1 p-6 overflow-auto">
          <div 
            ref={gridRef}
            className="bg-white rounded-xl shadow-xl overflow-hidden select-none" // Enhanced shadow
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setIsSelecting(false);
              setIsDragging(false);
            }}
          >
            {/* Day headers - removed bold */}
            <div className="grid grid-cols-7">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="p-4 text-center text-gray-600 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-200">
                  <div className="text-lg">{day}</div>
                </div>
              ))}
            </div>

            {/* Calendar weeks with continuous task bars */}
            {calendarWeeks.map((week, weekIndex) => {
              const weekStartDate = week[0];
              
              // Get all tasks that appear in this week
              const weekTasks = filteredTasks.filter(task => {
                const weekEndDate = week[6];
                return task.startDate <= weekEndDate && task.endDate >= weekStartDate;
              });

              // Group tasks by their vertical position (stack level)
              const taskLayers: Task[][] = [];
              weekTasks.forEach(task => {
                let placed = false;
                for (let layer = 0; layer < taskLayers.length; layer++) {
                  const hasConflict = taskLayers[layer].some(existingTask => {
                    return !(task.endDate < existingTask.startDate || task.startDate > existingTask.endDate);
                  });
                  if (!hasConflict) {
                    taskLayers[layer].push(task);
                    placed = true;
                    break;
                  }
                }
                if (!placed) {
                  taskLayers.push([task]);
                }
              });

              return (
                <div key={weekIndex} className="relative">
                  {/* Date cells */}
                  <div className="grid grid-cols-7">
                    {week.map((date, dayIndex) => {
                      const isCurrentMonth = isSameMonth(date, currentDate);
                      const isCurrentDay = isToday(date);
                      const inSelection = isDateInSelection(date);
                      const dateTasks = getTasksForDate(date);
                      const maxTasksToShow = 2;

                      return (
                        <div
                          key={date.toISOString()}
                          className={`
                            min-h-32 p-2 cursor-pointer relative border-r border-b border-gray-100 transition-all duration-200
                            ${!isCurrentMonth ? 'text-gray-300 bg-gray-50/50' : 'bg-white hover:bg-gray-50'} 
                            ${inSelection ? 'bg-blue-100 ring-4 ring-blue-200 ring-inset' : ''}
                            ${isDragging ? 'hover:bg-yellow-50 hover:ring-2 hover:ring-yellow-200' : ''}
                            ${dayIndex === 6 ? '' : 'border-r'}
                          `}
                          onMouseDown={(e) => handleMouseDown(date, e)}
                          onMouseEnter={() => handleMouseEnter(date)}
                          onMouseUp={() => {
                            if (draggedTask || resizingTask) {
                              if (draggedTask) handleTaskDrop(date);
                              if (resizingTask) handleResizeDrop(date);
                            }
                          }}
                        >
                          <div className="date-cell-content flex items-center justify-between mb-2 relative z-10">
                            <div className={`
                              text-lg relative
                              ${isCurrentDay 
                                ? 'text-white bg-black rounded-full w-8 h-8 flex items-center justify-center' 
                                : isCurrentMonth 
                                  ? 'text-gray-600' 
                                  : 'text-gray-300'
                              }
                            `}>
                              <span className="relative z-10">{formatDate(date, 'd')}</span>
                            </div>
                            {dateTasks.length > maxTasksToShow && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowTaskList(date);
                                }}
                                className="text-xs text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-md px-2 py-1 transition-colors z-10 border border-teal-300"
                              >
                                +{dateTasks.length - maxTasksToShow} more
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Task bars */}
                  <div className="absolute inset-0 pointer-events-none" style={{ top: '48px' }}>
                    {taskLayers.slice(0, 2).map((layer, layerIndex) =>
                      layer.map(task => (
                        <SortableTask
                          key={`${task.id}-week-${weekIndex}`}
                          task={task}
                          weekStartDate={weekStartDate}
                          layerIndex={layerIndex}
                          categoryStyles={categoryStyles}
                          handleTaskClick={handleTaskClick}
                          handleTaskMouseDown={handleTaskMouseDown}
                          handleResizeMouseDown={handleResizeMouseDown}
                          getTaskPositionInWeek={getTaskPositionInWeek}
                          draggedTask={draggedTask}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating task during drag */}
        {draggedTask && draggedTaskData && (
          <FloatingTaskBar
            task={draggedTaskData}
            mousePos={mousePos}
            categoryStyles={categoryStyles}
          />
        )}

        {/* Modals */}
        <CreateTaskModal
          isOpen={showCreateModal}
          startDate={selectionStart}
          endDate={selectionEnd}
          onClose={resetCreateModal}
          onCreate={handleCreateTask}
        />

        <EditTaskModal
          isOpen={showEditModal}
          task={editingTask}
          onClose={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />

        <ViewTaskModal
          isOpen={showViewTaskModal}
          date={selectedDateTasks?.date || null}
          tasks={selectedDateTasks?.tasks || []}
          onClose={() => {
            setShowViewTaskModal(false);
            setSelectedDateTasks(null);
          }}
          onEditTask={handleTaskClick}
          onDeleteTask={handleDeleteTask}
        />

        <QuickGuideModal
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
        />
      </div>
    </div>
  );
};

export default TaskPlanner;