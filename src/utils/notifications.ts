/**
 * Desktop Notification Utility
 * Handles browser notification permissions and displays desktop notifications
 */

export type NotificationPermissionState = 'granted' | 'denied' | 'default';

/**
 * Check if the browser supports notifications
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermissionState => {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Request notification permission from the user
 * Returns the permission state after user response
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionState> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Show a desktop notification
 * Automatically requests permission if not already granted
 */
export const showNotification = async ({
  title,
  body,
  icon = '🍅',
  tag = 'pomodoro-timer',
  requireInteraction = false,
}: NotificationOptions): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported');
    return false;
  }

  // Request permission if needed
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon,
      tag,
      requireInteraction,
      badge: icon,
    });

    // Auto-close notification after 5 seconds if not require interaction
    if (!requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Focus window when notification is clicked
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
};

/**
 * Notification messages for different session types
 */
export const NotificationMessages = {
  workComplete: {
    title: 'Work Session Complete! 🎉',
    body: 'Great job! Time to take a break and recharge.',
  },
  shortBreakComplete: {
    title: 'Break Over! 💪',
    body: 'Feeling refreshed? Time to get back to work!',
  },
  longBreakComplete: {
    title: 'Long Break Complete! 🌟',
    body: 'Ready for the next round? Let\'s keep the momentum going!',
  },
} as const;

/**
 * Show notification for session completion
 */
export const notifySessionComplete = async (
  sessionType: 'work' | 'shortBreak' | 'longBreak'
): Promise<boolean> => {
  let message;
  
  switch (sessionType) {
    case 'work':
      message = NotificationMessages.workComplete;
      break;
    case 'shortBreak':
      message = NotificationMessages.shortBreakComplete;
      break;
    case 'longBreak':
      message = NotificationMessages.longBreakComplete;
      break;
  }

  return showNotification({
    title: message.title,
    body: message.body,
    icon: '🍅',
    tag: `pomodoro-${sessionType}`,
    requireInteraction: false,
  });
};

