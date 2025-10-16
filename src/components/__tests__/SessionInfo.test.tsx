import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionInfo } from '../SessionInfo';

describe('SessionInfo Component', () => {
  describe('Session Type Display', () => {
    it('should display work session correctly', () => {
      render(
        <SessionInfo
          sessionType="work"
          completedSessions={0}
          sessionsUntilLongBreak={4}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Work Session')).toBeInTheDocument();
      expect(screen.getByText('Session 1 of 4')).toBeInTheDocument();
    });

    it('should display short break correctly', () => {
      render(
        <SessionInfo
          sessionType="shortBreak"
          completedSessions={1}
          sessionsUntilLongBreak={4}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Short Break')).toBeInTheDocument();
    });

    it('should display long break correctly', () => {
      render(
        <SessionInfo
          sessionType="longBreak"
          completedSessions={0}
          sessionsUntilLongBreak={4}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Long Break')).toBeInTheDocument();
    });
  });

  describe('Session Counter', () => {
    it('should show correct session count', () => {
      render(
        <SessionInfo
          sessionType="work"
          completedSessions={2}
          sessionsUntilLongBreak={4}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Session 3 of 4')).toBeInTheDocument();
    });

    it('should handle first session', () => {
      render(
        <SessionInfo
          sessionType="work"
          completedSessions={0}
          sessionsUntilLongBreak={4}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Session 1 of 4')).toBeInTheDocument();
    });

    it('should handle last session before long break', () => {
      render(
        <SessionInfo
          sessionType="work"
          completedSessions={3}
          sessionsUntilLongBreak={4}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Session 4 of 4')).toBeInTheDocument();
    });

    it('should respect custom sessionsUntilLongBreak', () => {
      render(
        <SessionInfo
          sessionType="work"
          completedSessions={0}
          sessionsUntilLongBreak={6}
          isDark={false}
        />
      );
      
      expect(screen.getByText('Session 1 of 6')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('should apply light mode styles for work session', () => {
      const { container } = render(
        <SessionInfo
          sessionType="work"
          completedSessions={0}
          sessionsUntilLongBreak={4}
          isDark={false}
        />
      );
      
      const sessionLabel = screen.getByText('Work Session');
      expect(sessionLabel).toHaveClass('text-red-600');
    });

    it('should apply dark mode styles for work session', () => {
      const { container } = render(
        <SessionInfo
          sessionType="work"
          completedSessions={0}
          sessionsUntilLongBreak={4}
          isDark={true}
        />
      );
      
      const sessionLabel = screen.getByText('Work Session');
      expect(sessionLabel).toHaveClass('text-red-400');
    });

    it('should apply correct colors for short break', () => {
      render(
        <SessionInfo
          sessionType="shortBreak"
          completedSessions={1}
          sessionsUntilLongBreak={4}
          isDark={false}
        />
      );
      
      const sessionLabel = screen.getByText('Short Break');
      expect(sessionLabel).toHaveClass('text-green-600');
    });

    it('should apply correct colors for long break', () => {
      render(
        <SessionInfo
          sessionType="longBreak"
          completedSessions={0}
          sessionsUntilLongBreak={4}
          isDark={false}
        />
      );
      
      const sessionLabel = screen.getByText('Long Break');
      expect(sessionLabel).toHaveClass('text-blue-600');
    });
  });
});

