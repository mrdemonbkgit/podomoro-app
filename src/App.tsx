import { useState, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { SessionInfo } from './components/SessionInfo';
import { ResumePrompt } from './components/ResumePrompt';
import { SettingsPanel } from './components/SettingsPanel';
import { MotivationalQuote } from './components/MotivationalQuote';
import { FloatingNav } from './components/FloatingNav';
import { SoundsPanel } from './components/SoundsPanel';
import { Greeting } from './components/Greeting';
import { getBuildNumberShort, getGitInfo } from './buildInfo';
import './App.css';
import './styles/glass.css';

function App() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { isDark, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSoundsOpen, setIsSoundsOpen] = useState(false);
  
  const { time, isActive, sessionType, completedSessions, hasResumableState, elapsedWhileAway, start, pause, reset, dismissResume, skipBreak } = useTimer({ settings });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't trigger shortcuts when modals are open
      if (hasResumableState || isSettingsOpen) {
        // ESC to close settings
        if (event.key === 'Escape' && isSettingsOpen) {
          setIsSettingsOpen(false);
        }
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
        case 'spacebar':
          event.preventDefault();
          if (isActive) {
            pause();
          } else {
            start();
          }
          break;
        case 'r':
          event.preventDefault();
          reset();
          break;
        case 's':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            setIsSettingsOpen(true);
          }
          break;
        case 'k':
          if (sessionType !== 'work') {
            event.preventDefault();
            skipBreak();
          }
          break;
        case 't':
          event.preventDefault();
          toggleTheme();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, sessionType, hasResumableState, isSettingsOpen, start, pause, reset, skipBreak, toggleTheme]);

  const getBackgroundGradient = () => {
    switch (sessionType) {
      case 'work':
        return isDark 
          ? 'gradient-work-dark'
          : 'gradient-work-light';
      case 'shortBreak':
        return isDark
          ? 'gradient-break-dark'
          : 'gradient-break-light';
      case 'longBreak':
        return isDark
          ? 'gradient-longbreak-dark'
          : 'gradient-longbreak-light';
      default:
        return isDark ? 'bg-gray-900' : 'bg-gray-50';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundGradient()} animate-gradient transition-all duration-500 flex items-center justify-center`}>
      {/* Resume Prompt Modal */}
      {hasResumableState && (
        <ResumePrompt
          time={time}
          sessionType={sessionType}
          elapsedWhileAway={elapsedWhileAway}
          onResume={start}
          onStartFresh={dismissResume}
          isDark={isDark}
        />
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isActive ? 'Timer is running' : 'Timer is paused'}
        {', '}
        {sessionType === 'work' ? 'Work session' : sessionType === 'shortBreak' ? 'Short break' : 'Long break'}
      </div>

      <div className="container mx-auto px-4">
        <main className="max-w-2xl mx-auto">
          <header className="flex items-center justify-between mb-12">
            <h1 className={`text-4xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              🍅 Pomodoro Timer
            </h1>
            <div className="flex gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-all hover:scale-105`}
                aria-label="Toggle theme"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  // Sun icon (for light mode)
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
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  // Moon icon (for dark mode)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
              
              {/* Settings */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`p-3 rounded-full ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-all hover:scale-105`}
                aria-label="Open settings"
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
            </div>
          </header>
          
          <div className={`${isDark ? 'glass-panel' : 'glass-panel-light'} rounded-3xl p-12 glass-transition animate-fade-in`}>
            {/* Personalized Greeting */}
            <Greeting isDark={isDark} />
            
            <SessionInfo 
              sessionType={sessionType} 
              completedSessions={completedSessions}
              sessionsUntilLongBreak={settings.sessionsUntilLongBreak}
              isDark={isDark}
            />
            
            <MotivationalQuote 
              sessionType={sessionType}
              isDark={isDark}
            />
            
            <div className="flex justify-center mb-8">
              <Timer 
                time={time} 
                initialTime={
                  sessionType === 'work' ? settings.workDuration * 60 :
                  sessionType === 'shortBreak' ? settings.shortBreakDuration * 60 :
                  settings.longBreakDuration * 60
                }
                sessionType={sessionType} 
                isDark={isDark} 
              />
            </div>
            
            <Controls 
              isActive={isActive}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onSkip={skipBreak}
              sessionType={sessionType}
              isDark={isDark}
            />
          </div>
          
          <div className={`mt-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-2 transition-colors duration-200`}>
            <p className="text-sm">
              Work: {settings.workDuration} min · Short Break: {settings.shortBreakDuration} min · Long Break: {settings.longBreakDuration} min
            </p>
            <details className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} mt-2`}>
              <summary className="cursor-pointer hover:underline inline-block">
                ⌨️ Keyboard Shortcuts
              </summary>
              <div className="mt-2 space-y-1">
                <p><kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Space</kbd> Start/Pause</p>
                <p><kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">R</kbd> Reset</p>
                <p><kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">S</kbd> Settings</p>
                <p><kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">K</kbd> Skip Break</p>
                <p><kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">T</kbd> Toggle Theme</p>
                <p><kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">ESC</kbd> Close Modal</p>
              </div>
            </details>
            <p className="text-xs text-gray-500">
              v2.0.0 · Build {getBuildNumberShort()} · {getGitInfo()}
            </p>
          </div>
        </main>
      </div>

      {/* Floating Navigation */}
      <FloatingNav 
        onSettingsClick={() => setIsSettingsOpen(true)}
        onSoundsClick={() => setIsSoundsOpen(true)}
        isDark={isDark}
      />

      {/* Sounds Panel */}
      <SoundsPanel
        isOpen={isSoundsOpen}
        onClose={() => setIsSoundsOpen(false)}
        isDark={isDark}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
        settings={settings}
        onSave={updateSettings}
        onReset={resetSettings}
      />
    </div>
  );
}

export default App;

