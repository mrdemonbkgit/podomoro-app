import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsModal } from '../SettingsModal';
import { DEFAULT_SETTINGS } from '../../types/settings';

describe('SettingsModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the modal backdrop', () => {
      const { container } = render(
        <SettingsModal onClose={mockOnClose} isDark={false}>
          <div>Test Content</div>
        </SettingsModal>
      );
      
      const backdrop = container.querySelector('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <SettingsModal onClose={mockOnClose} isDark={false}>
          <div>Test Content</div>
        </SettingsModal>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render modal container', () => {
      const { container } = render(
        <SettingsModal onClose={mockOnClose} isDark={false}>
          <div>Test Content</div>
        </SettingsModal>
      );
      
      const modalContainer = container.querySelector('.bg-white.rounded-lg');
      expect(modalContainer).toBeInTheDocument();
    });
  });

  describe('Backdrop Interaction', () => {
    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      
      const { container } = render(
        <SettingsModal onClose={mockOnClose} isDark={false}>
          <div>Test Content</div>
        </SettingsModal>
      );
      
      const backdrop = container.querySelector('.fixed.inset-0') as HTMLElement;
      await user.click(backdrop);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should NOT call onClose when modal content is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <SettingsModal onClose={mockOnClose} isDark={false}>
          <div>Test Content</div>
        </SettingsModal>
      );
      
      await user.click(screen.getByText('Test Content'));
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Dark Mode', () => {
    it('should apply light mode backdrop', () => {
      const { container } = render(
        <SettingsModal onClose={mockOnClose} isDark={false}>
          <div>Test Content</div>
        </SettingsModal>
      );
      
      const backdrop = container.querySelector('.bg-black');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveClass('bg-opacity-50');
    });

    it('should apply dark mode backdrop', () => {
      const { container } = render(
        <SettingsModal onClose={mockOnClose} isDark={true}>
          <div>Test Content</div>
        </SettingsModal>
      );
      
      const backdrop = container.querySelector('.bg-black');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveClass('bg-opacity-70');
    });

    it('should apply light mode modal background', () => {
      const { container } = render(
        <SettingsModal onClose={mockOnClose} isDark={false}>
          <div>Test Content</div>
        </SettingsModal>
      );
      
      const modal = container.querySelector('.bg-white');
      expect(modal).toBeInTheDocument();
    });

    it('should apply dark mode modal background', () => {
      const { container } = render(
        <SettingsModal onClose={mockOnClose} isDark={true}>
          <div>Test Content</div>
        </SettingsModal>
      );
      
      const modal = container.querySelector('.bg-gray-800');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Modal Positioning', () => {
    it('should center the modal', () => {
      const { container } = render(
        <SettingsModal onClose={mockOnClose} isDark={false}>
          <div>Test Content</div>
        </SettingsModal>
      );
      
      const modalContainer = container.querySelector('.fixed.inset-0.flex.items-center.justify-center');
      expect(modalContainer).toBeInTheDocument();
    });
  });
});

