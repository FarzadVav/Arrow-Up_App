import { TodoType } from './schemas';

export const TODO_TYPES: { value: TodoType; label: string }[] = [
  { value: 'Daily', label: 'Daily' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Mission', label: 'Mission' },
];
