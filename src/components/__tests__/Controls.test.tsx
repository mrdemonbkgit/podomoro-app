import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controls } from '../Controls';

describe('Controls Component', () => {
  const mockOnStart = vi.fn();
  const mockOnPause = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Button Rendering', () => {
    it('should render Start button when timer is not active', () => {
      render(
        <Controls
          isActive={false}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="work"
          isDark={false}
        />
      );
      
      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.queryByText('Pause')).not.toBeInTheDocument();
    });

    it('should render Pause button when timer is active', () => {
      render(
        <Controls
          isActive={true}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="work"
          isDark={false}
        />
      );
      
      expect(screen.getByText('Pause')).toBeInTheDocument();
      expect(screen.queryByText('Start')).not.toBeInTheDocument();
    });

    it('should always render Reset button', () => {
      render(
        <Controls
          isActive={false}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="work"
          isDark={false}
        />
      );
      
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });
  });

  describe('Skip Button Visibility', () => {
    it('should NOT show Skip button during work session', () => {
      render(
        <Controls
          isActive={false}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="work"
          isDark={false}
        />
      );
      
      expect(screen.queryByText('Skip Break')).not.toBeInTheDocument();
    });

    it('should show Skip button during short break', () => {
      render(
        <Controls
          isActive={false}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="shortBreak"
          isDark={false}
        />
      );
      
      expect(screen.getByText('Skip Break')).toBeInTheDocument();
    });

    it('should show Skip button during long break', () => {
      render(
        <Controls
          isActive={false}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="longBreak"
          isDark={false}
        />
      );
      
      expect(screen.getByText('Skip Break')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onStart when Start button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Controls
          isActive={false}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="work"
          isDark={false}
        />
      );
      
      await user.click(screen.getByText('Start'));
      
      expect(mockOnStart).toHaveBeenCalledTimes(1);
    });

    it('should call onPause when Pause button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Controls
          isActive={true}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="work"
          isDark={false}
        />
      );
      
      await user.click(screen.getByText('Pause'));
      
      expect(mockOnPause).toHaveBeenCalledTimes(1);
    });

    it('should call onReset when Reset button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Controls
          isActive={false}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="work"
          isDark={false}
        />
      );
      
      await user.click(screen.getByText('Reset'));
      
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('should call onSkip when Skip Break button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Controls
          isActive={false}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="shortBreak"
          isDark={false}
        />
      );
      
      await user.click(screen.getByText('Skip Break'));
      
      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button Sizing', () => {
    it('should have consistent sizing for Start/Pause buttons', () => {
      const { rerender } = render(
        <Controls
          isActive={false}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="work"
          isDark={false}
        />
      );
      
      const startButton = screen.getByText('Start');
      expect(startButton).toHaveClass('min-w-[140px]');
      
      rerender(
        <Controls
          isActive={true}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="work"
          isDark={false}
        />
      );
      
      const pauseButton = screen.getByText('Pause');
      expect(pauseButton).toHaveClass('min-w-[140px]');
    });
  });

  describe('Dark Mode', () => {
    it('should apply light mode button styles', () => {
      render(
        <Controls
          isActive={false}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="work"
          isDark={false}
        />
      );
      
      const startButton = screen.getByText('Start');
      expect(startButton).toHaveClass('bg-green-500');
    });

    it('should apply dark mode button styles', () => {
      render(
        <Controls
          isActive={false}
          onStart={mockOnStart}
          onPause={mockOnPause}
          onReset={mockOnReset}
          onSkip={mockOnSkip}
          sessionType="work"
          isDark={true}
        />
      );
      
      const startButton = screen.getByText('Start');
      expect(startButton).toHaveClass('bg-green-600');
    });
  });
});

