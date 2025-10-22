import { useState, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { useTasks } from './hooks/useTasks';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { SessionInfo } from './components/SessionInfo';
import { ResumePrompt } from './components/ResumePrompt';
import { SettingsPanel } from './components/SettingsPanel';
import { MotivationalQuote } from './components/MotivationalQuote';
import { FloatingNav } from './components/FloatingNav';
import { SoundsPanel } from './components/SoundsPanel';
import { TasksModal } from './components/TasksModal';
import { StreakBadge } from './shared/components/StreakBadge';
import { useAuth } from './features/auth/context/AuthContext';
import { StreaksProvider, useStreaksContext } from './features/kamehameha/context/StreaksContext';
import './App.css';
import './styles/glass.css';

// Wrapper component to display streak badge (uses shared context)
function StreakBadgeWrapper() {
  const { mainDisplay } = useStreaksContext();
  return <StreakBadge display={mainDisplay} isVisible={true} />;
}

function App() {
  const { user } = useAuth();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { isDark, toggleTheme } = useTheme();
  const { tasks, updateTask, toggleTask, resetTasks } = useTasks();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSoundsOpen, setIsSoundsOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  
  const { time, isActive, sessionType, completedSessions, hasResumableState, elapsedWhileAway, start, pause, reset, dismissResume, skipBreak } = useTimer({ settings });

  // Get the first unfinished task to display
  const currentTask = tasks.find(task => !task.completed && task.text.trim() !== '')?.text;

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

  const appContent = (
    <div className={`min-h-screen ${getBackgroundGradient()} animate-gradient transition-all duration-500 relative overflow-hidden`}>
      {/* Streak Badge (top-left, visible when authenticated) */}
      {user && <StreakBadgeWrapper />}

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

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-start justify-between pointer-events-none">
        {/* Logo */}
        <div className="text-white flex items-center gap-3 pointer-events-auto">
          {/* Zen Circle Logo */}
          <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3" opacity="0.9"/>
            <path d="M 30 50 Q 50 20, 70 50" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.7"/>
            <path d="M 30 55 Q 50 70, 70 55" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.7"/>
            <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.8"/>
          </svg>
          <div>
            <h1 className="text-3xl font-bold tracking-wide">ZenFocus</h1>
            <p className="text-xs opacity-70 tracking-wide">Find Your Flow</p>
          </div>
        </div>
      </div>
      
      {/* Quote - Separate positioned element */}
      <div className="fixed top-8 right-8 z-40 max-w-xl text-right hidden lg:block">
        <MotivationalQuote 
          sessionType={sessionType}
          isDark={true}
        />
      </div>

      {/* Main Content - Centered */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6">
        <main className="w-full max-w-4xl flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 3rem)' }}>
          {/* Session Type Question */}
          <SessionInfo 
            sessionType={sessionType} 
            completedSessions={completedSessions}
            sessionsUntilLongBreak={settings.sessionsUntilLongBreak}
            isDark={isDark}
            onEditTasks={() => setIsTasksOpen(true)}
            currentTask={currentTask}
          />
          
          {/* Timer */}
          <div className="flex justify-center my-6 md:my-8">
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
          
          {/* Controls */}
          <Controls 
            isActive={isActive}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSkip={skipBreak}
            sessionType={sessionType}
            isDark={isDark}
          />
        </main>
      </div>

      {/* Floating Navigation */}
      <FloatingNav 
        onSettingsClick={() => setIsSettingsOpen(true)}
        onSoundsClick={() => setIsSoundsOpen(true)}
        onThemeToggle={toggleTheme}
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

      {/* Tasks Modal */}
      <TasksModal
        isOpen={isTasksOpen}
        onClose={() => setIsTasksOpen(false)}
        tasks={tasks}
        onUpdateTask={updateTask}
        onToggleTask={toggleTask}
        onReset={resetTasks}
        isDark={isDark}
      />
    </div>
  );
  
  // Wrap with StreaksProvider only when authenticated to share streak data
  return user ? (
    <StreaksProvider>
      {appContent}
    </StreaksProvider>
  ) : appContent;
}

export default App;

