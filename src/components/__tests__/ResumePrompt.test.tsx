import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResumePrompt } from '../ResumePrompt';

describe('ResumePrompt Component', () => {
  const mockOnResume = vi.fn();
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the title', () => {
      render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={1500}
          savedSessionType="work"
          isDark={false}
        />
      );
      
      expect(screen.getByText('Resume Previous Session?')).toBeInTheDocument();
    });

    it('should display work session info', () => {
      render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={1500}
          savedSessionType="work"
          isDark={false}
        />
      );
      
      expect(screen.getByText('Work Session')).toBeInTheDocument();
      expect(screen.getByText('25:00')).toBeInTheDocument();
    });

    it('should display short break info', () => {
      render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={300}
          savedSessionType="shortBreak"
          isDark={false}
        />
      );
      
      expect(screen.getByText('Short Break')).toBeInTheDocument();
      expect(screen.getByText('05:00')).toBeInTheDocument();
    });

    it('should display long break info', () => {
      render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={900}
          savedSessionType="longBreak"
          isDark={false}
        />
      );
      
      expect(screen.getByText('Long Break')).toBeInTheDocument();
      expect(screen.getByText('15:00')).toBeInTheDocument();
    });

    it('should display elapsed time message when provided', () => {
      render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={1500}
          savedSessionType="work"
          elapsedTime={25}
          isDark={false}
        />
      );
      
      expect(screen.getByText(/25 seconds have passed/)).toBeInTheDocument();
    });

    it('should render both action buttons', () => {
      render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={1500}
          savedSessionType="work"
          isDark={false}
        />
      );
      
      expect(screen.getByText('Resume')).toBeInTheDocument();
      expect(screen.getByText('Start Fresh')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onResume when Resume button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={1500}
          savedSessionType="work"
          isDark={false}
        />
      );
      
      await user.click(screen.getByText('Resume'));
      
      expect(mockOnResume).toHaveBeenCalledTimes(1);
      expect(mockOnDismiss).not.toHaveBeenCalled();
    });

    it('should call onDismiss when Start Fresh button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={1500}
          savedSessionType="work"
          isDark={false}
        />
      );
      
      await user.click(screen.getByText('Start Fresh'));
      
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      expect(mockOnResume).not.toHaveBeenCalled();
    });
  });

  describe('Dark Mode', () => {
    it('should apply light mode styles', () => {
      const { container } = render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={1500}
          savedSessionType="work"
          isDark={false}
        />
      );
      
      const modal = container.querySelector('.bg-white');
      expect(modal).toBeInTheDocument();
    });

    it('should apply dark mode styles', () => {
      const { container } = render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={1500}
          savedSessionType="work"
          isDark={true}
        />
      );
      
      const modal = container.querySelector('.bg-gray-800');
      expect(modal).toBeInTheDocument();
    });

    it('should apply correct session colors in light mode', () => {
      render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={1500}
          savedSessionType="work"
          isDark={false}
        />
      );
      
      const sessionLabel = screen.getByText('Work Session');
      expect(sessionLabel).toHaveClass('text-red-600');
    });

    it('should apply correct session colors in dark mode', () => {
      render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={1500}
          savedSessionType="work"
          isDark={true}
        />
      );
      
      const sessionLabel = screen.getByText('Work Session');
      expect(sessionLabel).toHaveClass('text-red-400');
    });
  });

  describe('Time Formatting', () => {
    it('should format time correctly', () => {
      render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={125}
          savedSessionType="work"
          isDark={false}
        />
      );
      
      expect(screen.getByText('02:05')).toBeInTheDocument();
    });

    it('should handle zero time', () => {
      render(
        <ResumePrompt
          onResume={mockOnResume}
          onDismiss={mockOnDismiss}
          savedTime={0}
          savedSessionType="work"
          isDark={false}
        />
      );
      
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });
  });
});

