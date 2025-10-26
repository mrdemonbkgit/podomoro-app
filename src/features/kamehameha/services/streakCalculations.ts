/**
 * Kamehameha - Streak Calculation Utilities
 * 
 * This module handles all time calculations and formatting for streaks.
 */

import type { StreakDisplay } from '../types/kamehameha.types';

// ============================================================================
// Time Constants
// ============================================================================

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Calculate the current streak duration from a start date
 * 
 * @param startDate Unix timestamp (milliseconds) when streak started
 * @returns Formatted streak display object
 */
export function calculateStreakFromStart(startDate: number): StreakDisplay {
  const now = Date.now();
  const elapsedMs = now - startDate;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  
  return parseStreakDisplay(elapsedSeconds);
}

/**
 * Get time elapsed since a specific timestamp
 * 
 * @param startDate Unix timestamp (milliseconds)
 * @returns Elapsed time in seconds
 */
export function getTimeSince(startDate: number): number {
  const now = Date.now();
  const elapsedMs = now - startDate;
  return Math.floor(elapsedMs / 1000);
}

/**
 * Parse seconds into a structured display object
 * 
 * @param seconds Total seconds to parse
 * @returns StreakDisplay object with days, hours, minutes, seconds
 */
export function parseStreakDisplay(seconds: number): StreakDisplay {
  // Ensure non-negative
  const totalSeconds = Math.max(0, seconds);
  
  // Calculate components
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  return {
    days,
    hours,
    minutes,
    seconds: secs,
    totalSeconds,
    formatted: formatStreakTime(totalSeconds),
    humanReadable: formatHumanReadable(days, hours, minutes, secs),
  };
}

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format seconds into compact string: "15d 4h 23m 15s"
 * 
 * @param seconds Total seconds
 * @returns Formatted string
 */
export function formatStreakTime(seconds: number): string {
  const totalSeconds = Math.max(0, seconds);
  
  // Calculate components directly (avoid recursion)
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  // If less than 1 minute, show only seconds
  if (days === 0 && hours === 0 && minutes === 0) {
    return `${secs}s`;
  }
  
  // If less than 1 hour, show minutes and seconds
  if (days === 0 && hours === 0) {
    return `${minutes}m ${secs}s`;
  }
  
  // If less than 1 day, show hours, minutes, seconds
  if (days === 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  
  // Show all components
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

/**
 * Format into human-readable string: "15 days, 4 hours, 23 minutes"
 * 
 * @param days Number of days
 * @param hours Number of hours
 * @param minutes Number of minutes
 * @param seconds Number of seconds
 * @returns Human-readable string
 */
export function formatHumanReadable(
  days: number,
  hours: number,
  minutes: number,
  seconds: number
): string {
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  }
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }
  if (seconds > 0 && days === 0 && hours === 0) {
    // Only show seconds if less than 1 hour
    parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
  }
  
  if (parts.length === 0) {
    return '0 seconds';
  }
  
  return parts.join(', ');
}

/**
 * Format seconds into "X days" format (simplified)
 * 
 * @param seconds Total seconds
 * @returns "X days" string
 */
export function formatDays(seconds: number): string {
  const days = Math.floor(seconds / (24 * 3600));
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

// ============================================================================
// Milestone Functions
// ============================================================================

/**
 * Get milestone days (1, 3, 7, 14, 30, 60, 90, 180, 365)
 */
export const MILESTONE_DAYS = [1, 3, 7, 14, 30, 60, 90, 180, 365];

/**
 * Calculate next milestone
 * 
 * @param currentSeconds Current streak in seconds
 * @returns Next milestone in days, or null if max reached
 */
export function getNextMilestone(currentSeconds: number): number | null {
  const currentDays = Math.floor(currentSeconds / (24 * 3600));
  
  for (const milestone of MILESTONE_DAYS) {
    if (currentDays < milestone) {
      return milestone;
    }
  }
  
  return null; // Max milestone reached
}

/**
 * Calculate progress to next milestone (0-100%)
 * 
 * @param currentSeconds Current streak in seconds
 * @returns Progress percentage (0-100)
 */
export function getMilestoneProgress(currentSeconds: number): number {
  const currentDays = currentSeconds / (24 * 3600);
  
  let previousMilestone = 0;
  for (const milestone of MILESTONE_DAYS) {
    if (currentDays < milestone) {
      const range = milestone - previousMilestone;
      const progress = currentDays - previousMilestone;
      return Math.min(100, Math.max(0, (progress / range) * 100));
    }
    previousMilestone = milestone;
  }
  
  return 100; // Max reached
}

// ============================================================================
// Export All
// ============================================================================

export {
  SECOND,
  MINUTE,
  HOUR,
  DAY,
};

