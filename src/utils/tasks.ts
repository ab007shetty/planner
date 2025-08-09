// tasks.ts
export type TaskCategory = 'To Do' | 'In Progress' | 'Review' | 'Completed';

export interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  category: TaskCategory;
}

export interface TaskState {
  tasks: Task[];
  filters: {
    categories: TaskCategory[];
    timeRange: '1week' | '2weeks' | '3weeks' | null;
  };
}

export const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Project Planning Phase',
    startDate: new Date(2025, 7, 10),
    endDate: new Date(2025, 7, 14),
    category: 'To Do'
  },
  {
    id: '2',
    title: 'Development Sprint 1',
    startDate: new Date(2025, 7, 12),
    endDate: new Date(2025, 7, 18),
    category: 'In Progress'
  },
  {
    id: '3',
    title: 'Design Review',
    startDate: new Date(2025, 7, 16),
    endDate: new Date(2025, 7, 17),
    category: 'Review'
  },
  {
    id: '4',
    title: 'Testing Phase',
    startDate: new Date(2025, 7, 10),
    endDate: new Date(2025, 7, 12),
    category: 'Completed'
  },
  {
    id: '5',
    title: 'Documentation Update',
    startDate: new Date(2025, 7, 10),
    endDate: new Date(2025, 7, 11),
    category: 'Review'
  }
];

export const categoryStyles = {
  'To Do': { bg: 'from-blue-500 to-blue-600', text: 'text-white', border: 'border-blue-300' },
  'In Progress': { bg: 'from-orange-500 to-orange-600', text: 'text-white', border: 'border-orange-300' },
  'Review': { bg: 'from-purple-500 to-purple-600', text: 'text-white', border: 'border-purple-300' },
  'Completed': { bg: 'from-green-500 to-green-600', text: 'text-white', border: 'border-green-300' }
};