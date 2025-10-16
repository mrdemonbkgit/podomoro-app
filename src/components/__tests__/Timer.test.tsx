import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timer } from '../Timer';

describe('Timer Component', () => {
  describe('Rendering', () => {
    it('should render the timer with initial time', () => {
      render(<Timer time={1500} isDark={false} />);
      
      expect(screen.getByText('25:00')).toBeInTheDocument();
    });

    it('should format time correctly for single digit minutes', () => {
      render(<Timer time={540} isDark={false} />);
      
      expect(screen.getByText('09:00')).toBeInTheDocument();
    });

    it('should format time correctly for single digit seconds', () => {
      render(<Timer time={65} isDark={false} />);
      
      expect(screen.getByText('01:05')).toBeInTheDocument();
    });

    it('should handle zero time', () => {
      render(<Timer time={0} isDark={false} />);
      
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });

    it('should handle maximum time (59:59)', () => {
      render(<Timer time={3599} isDark={false} />);
      
      expect(screen.getByText('59:59')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('should apply light mode styles', () => {
      const { container } = render(<Timer time={1500} isDark={false} />);
      
      const timerElement = container.querySelector('.text-8xl');
      expect(timerElement).toHaveClass('text-gray-800');
    });

    it('should apply dark mode styles', () => {
      const { container } = render(<Timer time={1500} isDark={true} />);
      
      const timerElement = container.querySelector('.text-8xl');
      expect(timerElement).toHaveClass('text-gray-100');
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative time as zero', () => {
      render(<Timer time={-10} isDark={false} />);
      
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });

    it('should render without crashing for large values', () => {
      render(<Timer time={10000} isDark={false} />);
      
      expect(screen.getByText('166:40')).toBeInTheDocument();
    });
  });
});

