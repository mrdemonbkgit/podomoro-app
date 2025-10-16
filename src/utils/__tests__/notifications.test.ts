import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isNotificationSupported,
  getNotificationPermission,
} from '../notifications';

describe('Notification Utilities', () => {
  let originalNotification: any;

  beforeEach(() => {
    // Save original Notification
    originalNotification = global.Notification;

    // Mock Notification API
    (global.Notification as any) = vi.fn().mockImplementation((title, options) => ({
      title,
      ...options,
      close: vi.fn(),
    }));

    global.Notification.permission = 'granted';
    global.Notification.requestPermission = vi.fn().mockResolvedValue('granted');
  });

  afterEach(() => {
    // Restore original
    global.Notification = originalNotification;
    vi.clearAllMocks();
  });

  describe('isNotificationSupported', () => {
    it('should return true when Notification API is available', () => {
      expect(isNotificationSupported()).toBe(true);
    });
  });

  describe('getNotificationPermission', () => {
    it('should return current permission when supported', () => {
      global.Notification.permission = 'granted';
      
      expect(getNotificationPermission()).toBe('granted');
    });

    it('should handle denied permission', () => {
      global.Notification.permission = 'denied';
      
      expect(getNotificationPermission()).toBe('denied');
    });

    it('should handle default permission', () => {
      global.Notification.permission = 'default';
      
      expect(getNotificationPermission()).toBe('default');
    });
  });
});
