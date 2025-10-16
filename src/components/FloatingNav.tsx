interface FloatingNavProps {
  onSettingsClick: () => void;
  isDark: boolean;
}

export const FloatingNav = ({ onSettingsClick, isDark }: FloatingNavProps) => {
  return (
    <nav 
      className="fixed bottom-8 right-8 z-50 animate-slide-up"
      aria-label="Main navigation"
    >
      <div className={`flex items-center gap-2 px-4 py-3 ${isDark ? 'glass-panel' : 'glass-panel-light'} rounded-full shadow-2xl glass-transition`}>
        {/* Timer Icon (Active) */}
        <button
          className={`p-3 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-900/10'} transition-all hover:scale-110`}
          aria-label="Timer (current)"
          aria-current="page"
          title="Timer"
        >
          <span className="text-2xl" role="img" aria-label="Timer">
            🍅
          </span>
        </button>

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

        {/* Future: Sounds Icon (Placeholder) */}
        <button
          className={`p-3 rounded-full hover:${isDark ? 'bg-white/10' : 'bg-gray-900/10'} transition-all hover:scale-110 opacity-50 cursor-not-allowed`}
          aria-label="Sounds (coming soon)"
          title="Sounds (coming soon)"
          disabled
        >
          <span className="text-2xl" role="img" aria-label="Sounds">
            💡
          </span>
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

