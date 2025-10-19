import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Task } from '../types/task';

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onUpdateTask: (id: string, text: string) => void;
  onToggleTask: (id: string) => void;
  onReset: () => void;
  isDark: boolean;
}

export const TasksModal = ({
  isOpen,
  onClose,
  tasks,
  onUpdateTask,
  onToggleTask,
  onReset,
  isDark,
}: TasksModalProps) => {
  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key closes the modal
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute inset-0 ${
              isDark ? 'bg-black/80' : 'bg-black/60'
            } backdrop-blur-sm`}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className={`relative w-full max-w-2xl ${
              isDark ? 'bg-gray-900' : 'bg-white'
            } rounded-3xl shadow-2xl p-8`}
          >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${
              isDark
                ? 'hover:bg-white/10 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            } transition-colors`}
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className={`px-4 py-2 rounded-full border-2 ${
              isDark
                ? 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                : 'border-red-500 text-red-600 hover:bg-red-50'
            } transition-colors font-medium`}
          >
            Reset
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2
            className={`text-4xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Focus Priorities
          </h2>
          <p
            className={`text-lg ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Set your priorities for the day
          </p>
        </div>

        {/* Task Inputs */}
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${
                isDark
                  ? 'border-gray-700 bg-gray-800/50'
                  : 'border-gray-200 bg-gray-50'
              } transition-all hover:border-blue-500/50`}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggleTask(task.id)}
                className={`flex-shrink-0 w-6 h-6 rounded border-2 ${
                  task.completed
                    ? 'bg-blue-500 border-blue-500'
                    : isDark
                    ? 'border-gray-600'
                    : 'border-gray-300'
                } flex items-center justify-center transition-all`}
                aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {task.completed && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              {/* Input */}
              <input
                type="text"
                value={task.text}
                onChange={(e) => onUpdateTask(task.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Move focus to next input or blur current one
                    const inputs = document.querySelectorAll('input[type="text"]');
                    const currentIndex = Array.from(inputs).indexOf(e.currentTarget);
                    if (currentIndex < inputs.length - 1) {
                      (inputs[currentIndex + 1] as HTMLInputElement).focus();
                    } else {
                      e.currentTarget.blur();
                    }
                  }
                }}
                placeholder="Type your priority"
                className={`flex-1 bg-transparent ${
                  isDark ? 'text-white' : 'text-gray-900'
                } placeholder-gray-500 outline-none text-lg ${
                  task.completed ? 'line-through opacity-50' : ''
                }`}
              />

              {/* Drag Handle */}
              <div
                className={`flex-shrink-0 ${
                  isDark ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="9" cy="6" r="1.5" />
                  <circle cx="15" cy="6" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" />
                  <circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="18" r="1.5" />
                  <circle cx="15" cy="18" r="1.5" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

