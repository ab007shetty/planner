import React, { useState, useCallback, useRef, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay, addDays, subWeeks } from 'date-fns'

interface Task {
  id: string
  title: string
  startDate: Date
  endDate: Date
  category: 'To Do' | 'In Progress' | 'Review' | 'Completed'
}

interface TaskState {
  tasks: Task[]
  filters: {
    categories: string[]
    timeRange: '1week' | '2weeks' | '3weeks' | null
  }
}

const TaskPlanner: React.FC = () => {
  const [currentDate] = useState(new Date())
  const [state, setState] = useState<TaskState>({
    tasks: [
      // Sample tasks for demonstration
      {
        id: '1',
        title: 'Sample Task 1',
        startDate: new Date(2025, 7, 10),
        endDate: new Date(2025, 7, 12),
        category: 'To Do'
      },
      {
        id: '2',
        title: 'Sample Task 2', 
        startDate: new Date(2025, 7, 15),
        endDate: new Date(2025, 7, 17),
        category: 'In Progress'
      }
    ],
    filters: {
      categories: ['To Do', 'In Progress', 'Review', 'Completed'],
      timeRange: null
    }
  })
  
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<Date | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [resizingTask, setResizingTask] = useState<{id: string, edge: 'start' | 'end'} | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalTask, setModalTask] = useState<{title: string, category: Task['category']}>({
    title: '',
    category: 'To Do'
  })

  const gridRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Get calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Category colors
  const categoryColors = {
    'To Do': 'bg-blue-500',
    'In Progress': 'bg-orange-500',
    'Review': 'bg-purple-500',
    'Completed': 'bg-green-500'
  }

  // Filter tasks
  const filteredTasks = state.tasks.filter(task => {
    if (!state.filters.categories.includes(task.category)) {
      return false
    }

    if (state.filters.timeRange) {
      const now = new Date()
      const weeksMap = { '1week': 1, '2weeks': 2, '3weeks': 3 }
      const cutoffDate = subWeeks(now, weeksMap[state.filters.timeRange])
      
      if (task.startDate < cutoffDate) {
        return false
      }
    }

    return true
  })

  // Handle mouse events for task creation
  const handleMouseDown = useCallback((date: Date, e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsSelecting(true)
      setSelectionStart(date)
      setSelectionEnd(date)
    }
  }, [])

  const handleMouseEnter = useCallback((date: Date) => {
    if (isSelecting && selectionStart) {
      setSelectionEnd(date)
    }
  }, [isSelecting, selectionStart])

  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectionStart && selectionEnd) {
      setShowModal(true)
      setIsSelecting(false)
    }
  }, [isSelecting, selectionStart, selectionEnd])

  // Get selection range
  const getSelectionRange = () => {
    if (!selectionStart || !selectionEnd) return []
    
    const start = selectionStart <= selectionEnd ? selectionStart : selectionEnd
    const end = selectionStart <= selectionEnd ? selectionEnd : selectionStart
    
    return eachDayOfInterval({ start, end })
  }

  // Handle task creation
  const handleCreateTask = () => {
    if (!selectionStart || !selectionEnd || !modalTask.title.trim()) return

    const start = selectionStart <= selectionEnd ? selectionStart : selectionEnd
    const end = selectionStart <= selectionEnd ? selectionEnd : selectionStart

    const newTask: Task = {
      id: Date.now().toString(),
      title: modalTask.title.trim(),
      startDate: start,
      endDate: end,
      category: modalTask.category
    }

    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }))

    setShowModal(false)
    setSelectionStart(null)
    setSelectionEnd(null)
    setModalTask({ title: '', category: 'To Do' })
  }

  // Handle task drag and drop
  const handleTaskMouseDown = useCallback((taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDraggedTask(taskId)
    setIsDragging(true)
  }, [])

  const handleTaskDrop = useCallback((date: Date) => {
    if (!draggedTask) return

    const task = state.tasks.find(t => t.id === draggedTask)
    if (!task) return

    const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24))
    const newEndDate = addDays(date, duration)

    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === draggedTask
          ? { ...t, startDate: date, endDate: newEndDate }
          : t
      )
    }))

    setDraggedTask(null)
    setIsDragging(false)
  }, [draggedTask, state.tasks])

  // Handle task resize
  const handleResizeMouseDown = useCallback((taskId: string, edge: 'start' | 'end', e: React.MouseEvent) => {
    e.stopPropagation()
    setResizingTask({ id: taskId, edge })
    setIsDragging(true)
  }, [])

  const handleResizeDrop = useCallback((date: Date) => {
    if (!resizingTask) return

    const task = state.tasks.find(t => t.id === resizingTask.id)
    if (!task) return

    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === resizingTask.id
          ? {
              ...t,
              [resizingTask.edge === 'start' ? 'startDate' : 'endDate']: date
            }
          : t
      )
    }))

    setResizingTask(null)
    setIsDragging(false)
  }, [resizingTask])

  // Global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsSelecting(false)
      setDraggedTask(null)
      setResizingTask(null)
      setIsDragging(false)
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return filteredTasks.filter(task =>
      date >= task.startDate && date <= task.endDate
    )
  }

  // Check if date is in selection
  const isDateInSelection = (date: Date) => {
    const selectionRange = getSelectionRange()
    return selectionRange.some(d => isSameDay(d, date))
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Filter Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4 border-r">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        
        {/* Category Filters */}
        <div className="mb-6">
          <h4 className="font-medium mb-2">Categories</h4>
          {['To Do', 'In Progress', 'Review', 'Completed'].map(category => (
            <label key={category} className="flex items-center mb-2">
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
                  }))
                }}
                className="mr-2"
              />
              <span className={`inline-block w-3 h-3 rounded mr-2 ${categoryColors[category as keyof typeof categoryColors]}`}></span>
              {category}
            </label>
          ))}
        </div>

        {/* Time Range Filters */}
        <div>
          <h4 className="font-medium mb-2">Time Range</h4>
          {[
            { value: null, label: 'All tasks' },
            { value: '1week', label: 'Within 1 week' },
            { value: '2weeks', label: 'Within 2 weeks' },
            { value: '3weeks', label: 'Within 3 weeks' }
          ].map(option => (
            <label key={option.label} className="flex items-center mb-2">
              <input
                type="radio"
                name="timeRange"
                checked={state.filters.timeRange === option.value}
                onChange={() => {
                  setState(prev => ({
                    ...prev,
                    filters: {
                      ...prev.filters,
                      timeRange: option.value as any
                    }
                  }))
                }}
                className="mr-2"
              />
              {option.label}
            </label>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-3 bg-gray-50 rounded-lg text-sm">
          <h4 className="font-medium mb-2">How to use:</h4>
          <ul className="space-y-1 text-gray-600">
            <li>• Drag across days to create tasks</li>
            <li>• Drag tasks to move them</li>
            <li>• Drag task edges to resize</li>
            <li>• Use filters to organize tasks</li>
          </ul>
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-1 p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
          <p className="text-gray-600 mt-1">Drag across days to create tasks, drag tasks to move them</p>
        </div>

        {/* Calendar Grid */}
        <div 
          ref={gridRef}
          className="grid grid-cols-7 gap-1 bg-white rounded-lg shadow p-4 select-none"
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsSelecting(false)
            setIsDragging(false)
          }}
        >
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 font-semibold text-center text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date) => {
            const tasks = getTasksForDate(date)
            const isCurrentMonth = isSameMonth(date, currentDate)
            const isCurrentDay = isToday(date)
            const inSelection = isDateInSelection(date)

            return (
              <div
                key={date.toISOString()}
                className={`
                  min-h-24 p-1 border-2 cursor-pointer relative
                  ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : 'bg-white'}
                  ${isCurrentDay ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}
                  ${inSelection ? 'bg-blue-100 border-blue-400' : ''}
                  ${isDragging ? 'hover:bg-yellow-50 hover:border-yellow-300' : 'hover:bg-gray-100'}
                  transition-colors duration-150
                `}
                onMouseDown={(e) => handleMouseDown(date, e)}
                onMouseEnter={() => {
                  handleMouseEnter(date)
                }}
                onMouseUp={() => {
                  if (draggedTask) handleTaskDrop(date)
                  if (resizingTask) handleResizeDrop(date)
                }}
              >
                <div className="text-sm font-medium mb-1">
                  {format(date, 'd')}
                </div>

                {/* Tasks */}
                <div className="space-y-1">
                  {tasks.slice(0, 3).map(task => {
                    const isTaskStart = isSameDay(task.startDate, date)
                    const isTaskEnd = isSameDay(task.endDate, date)
                    const isBeingDragged = draggedTask === task.id
                    const isBeingResized = resizingTask?.id === task.id

                    return (
                      <div
                        key={`${task.id}-${date.toISOString()}`}
                        className={`
                          text-xs p-1 text-white rounded cursor-move relative group
                          ${categoryColors[task.category]}
                          ${isBeingDragged ? 'opacity-50 z-10' : ''}
                          ${isBeingResized ? 'ring-2 ring-white ring-opacity-50' : ''}
                          transition-all duration-150
                        `}
                        onMouseDown={(e) => handleTaskMouseDown(task.id, e)}
                        title={`${task.title} (${task.category})`}
                      >
                        {/* Resize handle - start */}
                        {isTaskStart && (
                          <div
                            className="absolute -left-1 top-0 w-2 h-full bg-white bg-opacity-0 cursor-ew-resize hover:bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-150"
                            onMouseDown={(e) => handleResizeMouseDown(task.id, 'start', e)}
                            title="Drag to change start date"
                          />
                        )}

                        <div className="truncate px-1">
                          {isTaskStart ? task.title : (task.title.length > 10 ? '...' : '')}
                        </div>

                        {/* Resize handle - end */}
                        {isTaskEnd && (
                          <div
                            className="absolute -right-1 top-0 w-2 h-full bg-white bg-opacity-0 cursor-ew-resize hover:bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-150"
                            onMouseDown={(e) => handleResizeMouseDown(task.id, 'end', e)}
                            title="Drag to change end date"
                          />
                        )}
                      </div>
                    )
                  })}
                  {tasks.length > 3 && (
                    <div className="text-xs text-gray-500 bg-gray-100 rounded px-1">
                      +{tasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Task Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            
            {selectionStart && selectionEnd && (
              <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
                <span className="font-medium">Duration:</span>{' '}
                {format(selectionStart <= selectionEnd ? selectionStart : selectionEnd, 'MMM d')} - {' '}
                {format(selectionStart <= selectionEnd ? selectionEnd : selectionStart, 'MMM d')}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Task Name</label>
              <input
                type="text"
                value={modalTask.title}
                onChange={(e) => setModalTask(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter task name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && modalTask.title.trim()) {
                    handleCreateTask()
                  }
                  if (e.key === 'Escape') {
                    setShowModal(false)
                    setSelectionStart(null)
                    setSelectionEnd(null)
                    setModalTask({ title: '', category: 'To Do' })
                  }
                }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={modalTask.category}
                onChange={(e) => setModalTask(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {['To Do', 'In Progress', 'Review', 'Completed'].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectionStart(null)
                  setSelectionEnd(null)
                  setModalTask({ title: '', category: 'To Do' })
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!modalTask.title.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskPlanner