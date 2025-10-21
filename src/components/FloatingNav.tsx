import { Link, useLocation } from 'react-router-dom';

interface FloatingNavProps {
  onSettingsClick: () => void;
  onSoundsClick: () => void;
  onThemeToggle: () => void;
  isDark: boolean;
}

export const FloatingNav = ({ onSettingsClick, onSoundsClick, onThemeToggle, isDark }: FloatingNavProps) => {
  const location = useLocation();
  const isTimerPage = location.pathname === '/' || location.pathname === '/timer';
  const isKamehamehaPage = location.pathname === '/kamehameha';

  return (
    <nav 
      className="fixed bottom-8 right-8 z-50 animate-slide-up"
      aria-label="Main navigation"
    >
      <div className={`flex items-center gap-2 px-4 py-3 ${isDark ? 'glass-panel' : 'glass-panel-light'} rounded-full shadow-2xl glass-transition`}>
        {/* Timer Icon */}
        <Link
          to="/timer"
          className={`p-3 rounded-full ${isTimerPage ? (isDark ? 'bg-white/10' : 'bg-gray-900/10') : ''} transition-all hover:scale-110`}
          aria-label={isTimerPage ? 'Timer (current)' : 'Timer'}
          aria-current={isTimerPage ? 'page' : undefined}
          title="Timer"
        >
          <span className="text-2xl" role="img" aria-label="Timer">
            🍅
          </span>
        </Link>

        {/* Kamehameha Icon */}
        <Link
          to="/kamehameha"
          className={`p-3 rounded-full ${isKamehamehaPage ? (isDark ? 'bg-white/10' : 'bg-gray-900/10') : ''} transition-all hover:scale-110`}
          aria-label={isKamehamehaPage ? 'Kamehameha (current)' : 'Kamehameha'}
          aria-current={isKamehamehaPage ? 'page' : undefined}
          title="Kamehameha Recovery Tool"
        >
          <span className="text-2xl" role="img" aria-label="Kamehameha">
            🔥
          </span>
        </Link>

        {/* Divider */}
        <div className={`w-px h-8 ${isDark ? 'bg-white/10' : 'bg-gray-900/10'}`} />

        {/* Settings Icon */}
        <button
          onClick={onSettingsClick}
          className={`p-3 rounded-full hover:${isDark ? 'bg-white/10' : 'bg-gray-900/10'} transition-all hover:scale-110`}
          aria-label="Settings"
          title="Settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        {/* Sounds Icon */}
        <button
          onClick={onSoundsClick}
          className={`p-3 rounded-full hover:${isDark ? 'bg-white/10' : 'bg-gray-900/10'} transition-all hover:scale-110`}
          aria-label="Ambient sounds"
          title="Ambient sounds"
        >
          <span className="text-2xl" role="img" aria-label="Sounds">
            🎵
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className={`p-3 rounded-full hover:${isDark ? 'bg-white/10' : 'bg-gray-900/10'} transition-all hover:scale-110`}
          aria-label="Toggle theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isDark ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            )}
          </svg>
        </button>

        {/* Future: Stats Icon (Placeholder) */}
        <button
          className={`p-3 rounded-full hover:${isDark ? 'bg-white/10' : 'bg-gray-900/10'} transition-all hover:scale-110 opacity-50 cursor-not-allowed`}
          aria-label="Stats (coming soon)"
          title="Stats (coming soon)"
          disabled
        >
          <span className="text-2xl" role="img" aria-label="Stats">
            📊
          </span>
        </button>
      </div>
    </nav>
  );
};

