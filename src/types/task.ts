export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export const DEFAULT_TASKS: Task[] = [
  { id: '1', text: '', completed: false },
  { id: '2', text: '', completed: false },
  { id: '3', text: '', completed: false },
];

export const MAX_TASKS = 3;

