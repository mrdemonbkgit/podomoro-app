import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePersistedState } from '../hooks/usePersistedState';

interface GreetingProps {
  isDark: boolean;
}

const USER_NAME_KEY = 'pomodoro_user_name';

export const Greeting = ({ isDark }: GreetingProps) => {
  const [userName, setUserName] = usePersistedState<string>(USER_NAME_KEY, '');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);

  // Get greeting based on time of day
  const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  const [greeting, setGreeting] = useState(getGreeting());

  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleSaveName = () => {
    setUserName(tempName.trim());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setTempName(userName);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-2">
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSaveName}
            placeholder="Your name"
            autoFocus
            maxLength={20}
            className={`px-4 py-2 rounded-lg border-2 text-center text-lg font-medium ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:outline-none transition-colors`}
          />
        </div>
        <p
          className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
        >
          Press Enter to save, Esc to cancel
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="text-center mb-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1
        className={`text-2xl md:text-3xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}
      >
        {greeting}
        {userName && (
          <span>
            ,{' '}
            <button
              onClick={() => {
                setIsEditing(true);
                setTempName(userName);
              }}
              className={`hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
            >
              {userName}
            </button>
          </span>
        )}
        {!userName && (
          <span>
            ,{' '}
            <button
              onClick={() => setIsEditing(true)}
              className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
            >
              add your name
            </button>
          </span>
        )}
      </h1>
      <p
        className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
      >
        {userName ? 'Make it count!' : 'Stay focused, stay productive'}
      </p>
    </motion.div>
  );
};
