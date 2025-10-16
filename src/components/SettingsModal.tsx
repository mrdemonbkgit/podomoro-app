import { ReactNode } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  isDark?: boolean;
}

export const SettingsModal = ({ isOpen, onClose, children, isDark = false }: SettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${isDark ? 'bg-black/70' : 'bg-black/50'} transition-opacity`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors duration-200`}>
        {children}
      </div>
    </div>
  );
};

