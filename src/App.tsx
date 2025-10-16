import { useState } from 'react';
import { useTimer } from './hooks/useTimer';
import { useSettings } from './hooks/useSettings';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { SessionInfo } from './components/SessionInfo';
import { ResumePrompt } from './components/ResumePrompt';
import { SettingsModal } from './components/SettingsModal';
import { Settings } from './components/Settings';
import './App.css';

function App() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { time, isActive, sessionType, completedSessions, hasResumableState, elapsedWhileAway, start, pause, reset, dismissResume } = useTimer({ settings });

  const getBackgroundColor = () => {
    switch (sessionType) {
      case 'work':
        return 'bg-red-50';
      case 'shortBreak':
        return 'bg-green-50';
      case 'longBreak':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundColor()} transition-colors duration-500 flex items-center justify-center`}>
      {/* Resume Prompt Modal */}
      {hasResumableState && (
        <ResumePrompt
          time={time}
          sessionType={sessionType}
          elapsedWhileAway={elapsedWhileAway}
          onResume={start}
          onStartFresh={dismissResume}
        />
      )}

      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-4xl font-bold text-gray-800">
              🍅 Pomodoro Timer
            </h1>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              aria-label="Open settings"
              title="Settings"
            >
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
          
          <div className="bg-white rounded-2xl shadow-2xl p-12">
            <SessionInfo 
              sessionType={sessionType} 
              completedSessions={completedSessions}
              sessionsUntilLongBreak={settings.sessionsUntilLongBreak}
            />
            
            <div className="flex justify-center mb-8">
              <Timer time={time} sessionType={sessionType} />
            </div>
            
            <Controls 
              isActive={isActive}
              onStart={start}
              onPause={pause}
              onReset={reset}
            />
          </div>
          
          <div className="mt-8 text-center text-gray-600 space-y-2">
            <p className="text-sm">
              Work: {settings.workDuration} min · Short Break: {settings.shortBreakDuration} min · Long Break: {settings.longBreakDuration} min
            </p>
            <p className="text-xs text-gray-500">
              v2.2.0
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
        <Settings
          settings={settings}
          onSave={updateSettings}
          onReset={resetSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      </SettingsModal>
    </div>
  );
}

export default App;

