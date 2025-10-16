import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from '../Settings';
import { DEFAULT_SETTINGS } from '../../types/settings';

// Mock the sound utilities
vi.mock('../../utils/sounds', () => ({
  playSound: vi.fn(),
  SOUND_OPTIONS: [
    { id: 'chime', name: 'Chime', description: 'Pleasant two-tone chime', icon: '🔔' },
    { id: 'bell', name: 'Bell', description: 'Classic bell ring', icon: '🛎️' },
    { id: 'beep', name: 'Beep', description: 'Simple digital beep', icon: '📟' },
    { id: 'piano', name: 'Piano', description: 'Soft piano notes', icon: '🎹' },
    { id: 'gentle', name: 'Gentle', description: 'Calm ambient tone', icon: '🌊' },
  ],
}));

describe('Settings Component', () => {
  const mockOnSave = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the settings form', () => {
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Timer Settings')).toBeInTheDocument();
    });

    it('should display all duration inputs with default values', () => {
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      expect(screen.getByLabelText(/Work Duration/i)).toHaveValue(25);
      expect(screen.getByLabelText(/Short Break/i)).toHaveValue(5);
      expect(screen.getByLabelText(/Long Break/i)).toHaveValue(15);
      expect(screen.getByLabelText(/Sessions Until Long Break/i)).toHaveValue(4);
    });

    it('should display notification toggle', () => {
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Desktop Notifications')).toBeInTheDocument();
    });

    it('should display sound selection', () => {
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Notification Sound')).toBeInTheDocument();
      expect(screen.getByText('Chime')).toBeInTheDocument();
    });

    it('should display volume control', () => {
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Volume')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Save Settings')).toBeInTheDocument();
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    it('should show error for work duration below minimum', async () => {
      const user = userEvent.setup();
      
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      const workInput = screen.getByLabelText(/Work Duration/i);
      await user.clear(workInput);
      await user.type(workInput, '0');
      await user.click(screen.getByText('Save Settings'));
      
      expect(await screen.findByText(/Minimum 1 minute/i)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should show error for work duration above maximum', async () => {
      const user = userEvent.setup();
      
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      const workInput = screen.getByLabelText(/Work Duration/i);
      await user.clear(workInput);
      await user.type(workInput, '61');
      await user.click(screen.getByText('Save Settings'));
      
      expect(await screen.findByText(/Maximum 60 minutes/i)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should show error for sessions below minimum', async () => {
      const user = userEvent.setup();
      
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      const sessionsInput = screen.getByLabelText(/Sessions Until Long Break/i);
      await user.clear(sessionsInput);
      await user.type(sessionsInput, '1');
      await user.click(screen.getByText('Save Settings'));
      
      expect(await screen.findByText(/Minimum 2 sessions/i)).toBeInTheDocument();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should accept valid values', async () => {
      const user = userEvent.setup();
      
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      await user.click(screen.getByText('Save Settings'));
      
      expect(mockOnSave).toHaveBeenCalledWith(DEFAULT_SETTINGS);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Settings Modification', () => {
    it('should update work duration', async () => {
      const user = userEvent.setup();
      
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      const workInput = screen.getByLabelText(/Work Duration/i);
      await user.clear(workInput);
      await user.type(workInput, '30');
      await user.click(screen.getByText('Save Settings'));
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ workDuration: 30 })
      );
    });

    it('should toggle notifications', async () => {
      const user = userEvent.setup();
      
      render(
        <Settings
          settings={{ ...DEFAULT_SETTINGS, notificationsEnabled: true }}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      const toggle = screen.getByRole('checkbox');
      await user.click(toggle);
      await user.click(screen.getByText('Save Settings'));
      
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ notificationsEnabled: false })
      );
    });
  });

  describe('Reset Confirmation', () => {
    it('should show confirmation dialog when reset is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      await user.click(screen.getByText('Reset to Defaults'));
      
      expect(screen.getByText('Reset Settings?')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to reset/i)).toBeInTheDocument();
    });

    it('should call onReset when confirmed', async () => {
      const user = userEvent.setup();
      
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      await user.click(screen.getByText('Reset to Defaults'));
      await user.click(screen.getByText('Yes, Reset'));
      
      expect(mockOnReset).toHaveBeenCalled();
    });

    it('should cancel reset when cancel is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      await user.click(screen.getByText('Reset to Defaults'));
      
      // Click the Cancel button in the confirmation dialog
      const cancelButtons = screen.getAllByText('Cancel');
      await user.click(cancelButtons[cancelButtons.length - 1]);
      
      expect(mockOnReset).not.toHaveBeenCalled();
      expect(screen.queryByText('Reset Settings?')).not.toBeInTheDocument();
    });
  });

  describe('Cancel Action', () => {
    it('should call onClose when cancel is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      await user.click(screen.getByText('Cancel'));
      
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('Dark Mode', () => {
    it('should apply light mode styles', () => {
      const { container } = render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      const title = screen.getByText('Timer Settings');
      expect(title).toHaveClass('text-gray-800');
    });

    it('should apply dark mode styles', () => {
      const { container } = render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={true}
        />
      );
      
      const title = screen.getByText('Timer Settings');
      expect(title).toHaveClass('text-gray-100');
    });
  });

  describe('Sound Selection', () => {
    it('should display all sound options', () => {
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Chime')).toBeInTheDocument();
      expect(screen.getByText('Bell')).toBeInTheDocument();
      expect(screen.getByText('Beep')).toBeInTheDocument();
      expect(screen.getByText('Piano')).toBeInTheDocument();
      expect(screen.getByText('Gentle')).toBeInTheDocument();
    });

    it('should highlight selected sound', () => {
      const { container } = render(
        <Settings
          settings={{ ...DEFAULT_SETTINGS, soundType: 'bell' }}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      const bellCard = screen.getByText('Bell').closest('button');
      expect(bellCard).toHaveClass('border-blue-500');
    });
  });

  describe('Volume Control', () => {
    it('should display volume slider', () => {
      render(
        <Settings
          settings={DEFAULT_SETTINGS}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('100');
    });

    it('should show mute indicator when volume is 0', () => {
      render(
        <Settings
          settings={{ ...DEFAULT_SETTINGS, volume: 0 }}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      expect(screen.getByText('🔇')).toBeInTheDocument();
    });

    it('should disable test button when volume is 0', () => {
      render(
        <Settings
          settings={{ ...DEFAULT_SETTINGS, volume: 0 }}
          onSave={mockOnSave}
          onReset={mockOnReset}
          onClose={mockOnClose}
          isDark={false}
        />
      );
      
      const testButton = screen.getByText('Test');
      expect(testButton).toBeDisabled();
    });
  });
});

