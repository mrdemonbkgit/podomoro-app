interface ControlsProps {
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const Controls = ({ isActive, onStart, onPause, onReset }: ControlsProps) => {
  return (
    <div className="flex gap-4 justify-center mt-12">
      {isActive ? (
        <button
          onClick={onPause}
          className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg text-xl transition-colors duration-200 shadow-lg"
        >
          Pause
        </button>
      ) : (
        <button
          onClick={onStart}
          className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-xl transition-colors duration-200 shadow-lg"
        >
          Start
        </button>
      )}
      <button
        onClick={onReset}
        className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg text-xl transition-colors duration-200 shadow-lg"
      >
        Reset
      </button>
    </div>
  );
};

