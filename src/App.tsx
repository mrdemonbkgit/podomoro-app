import { useTimer } from './hooks/useTimer';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { SessionInfo } from './components/SessionInfo';
import { ResumePrompt } from './components/ResumePrompt';
import './App.css';

function App() {
  const { time, isActive, sessionType, completedSessions, hasResumableState, elapsedWhileAway, start, pause, reset, dismissResume } = useTimer();

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
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
            🍅 Pomodoro Timer
          </h1>
          
          <div className="bg-white rounded-2xl shadow-2xl p-12">
            <SessionInfo 
              sessionType={sessionType} 
              completedSessions={completedSessions} 
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
          
          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              Work: 25 min · Short Break: 5 min · Long Break: 15 min
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

