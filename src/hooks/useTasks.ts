import { useState, useEffect } from 'react';
import { Task, DEFAULT_TASKS } from '../types/task';

const STORAGE_KEY = 'zenfocus-tasks';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_TASKS;
      }
    }
    return DEFAULT_TASKS;
  });

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const updateTask = (id: string, text: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, text } : task
    ));
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const resetTasks = () => {
    setTasks(DEFAULT_TASKS);
  };

  return {
    tasks,
    updateTask,
    toggleTask,
    resetTasks,
  };
};

