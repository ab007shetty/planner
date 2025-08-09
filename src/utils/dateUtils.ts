// dateUtils.ts
export const formatDate = (date: Date, format: string): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  if (format === 'MMMM yyyy') return `${months[date.getMonth()]} ${date.getFullYear()}`;
  if (format === 'MMM d') return `${monthsShort[date.getMonth()]} ${date.getDate()}`;
  if (format === 'd') return date.getDate().toString();
  return date.toString();
};

export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);
export const endOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth() + 1, 0);
export const startOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.getFullYear(), date.getMonth(), diff);
};
export const endOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() + (6 - day);
  return new Date(date.getFullYear(), date.getMonth(), diff);
};

export const eachDayOfInterval = (interval: { start: Date; end: Date }): Date[] => {
  const days: Date[] = [];
  const current = new Date(interval.start);
  current.setHours(0, 0, 0, 0);
  while (current <= interval.end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export const isSameMonth = (date1: Date, date2: Date): boolean => 
  date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export const isSameDay = (date1: Date, date2: Date): boolean =>
  date1.getDate() === date2.getDate() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getFullYear() === date2.getFullYear();

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const subMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const subWeeks = (date: Date, weeks: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - (weeks * 7));
  result.setHours(0, 0, 0, 0);
  return result;
};

export const differenceInDays = (date1: Date, date2: Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(d1.getTime() - d2.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};