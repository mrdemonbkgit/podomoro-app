import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'pomodoro-theme';

/**
 * Gets the effective theme based on user preference and system settings
 */
const getEffectiveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
};

/**
 * Loads theme preference from localStorage
 */
const loadTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme;
    }
  } catch (error) {
    console.error('Failed to load theme:', error);
  }
  return 'system'; // Default to system preference
};

/**
 * Saves theme preference to localStorage
 */
const saveTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
};

/**
 * Applies or removes dark class on document element
 */
const applyTheme = (isDark: boolean): void => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

/**
 * Hook to manage dark/light theme with system preference detection
 */
export const useTheme = (): UseThemeReturn => {
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const initialTheme = loadTheme();
    return getEffectiveTheme(initialTheme) === 'dark';
  });

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme(theme);
    setIsDark(effectiveTheme === 'dark');
    applyTheme(effectiveTheme === 'dark');
    saveTheme(theme);
  }, [theme]);

  // Listen to system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const effectiveTheme = e.matches ? 'dark' : 'light';
      setIsDark(effectiveTheme === 'dark');
      applyTheme(effectiveTheme === 'dark');
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  /**
   * Toggle between light and dark modes
   * (Simplified toggle: light <-> dark, ignoring system)
   */
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    isDark,
    toggleTheme,
  };
};

