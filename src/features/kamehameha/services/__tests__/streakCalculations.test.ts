/**
 * Tests for streak calculation utilities
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  calculateStreakFromStart,
  getTimeSince,
  parseStreakDisplay,
  formatStreakTime,
  formatHumanReadable,
  formatDays,
  getNextMilestone,
  getMilestoneProgress,
  MILESTONE_DAYS,
  SECOND,
  MINUTE,
  HOUR,
  DAY,
} from '../streakCalculations';

describe('streakCalculations', () => {
  // Mock Date.now() for consistent testing
  const NOW = 1729900000000; // Fixed timestamp
  
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  
  describe('Time Constants', () => {
    test('exports correct time constants', () => {
      expect(SECOND).toBe(1000);
      expect(MINUTE).toBe(60 * 1000);
      expect(HOUR).toBe(60 * 60 * 1000);
      expect(DAY).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('calculateStreakFromStart', () => {
    test('calculates correct duration for 1 day ago', () => {
      const startDate = NOW - DAY;
      const result = calculateStreakFromStart(startDate);
      
      expect(result.totalSeconds).toBe(86400); // 24 hours
      expect(result.days).toBe(1);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });
    
    test('calculates correct duration for 1 hour ago', () => {
      const startDate = NOW - HOUR;
      const result = calculateStreakFromStart(startDate);
      
      expect(result.totalSeconds).toBe(3600);
      expect(result.days).toBe(0);
      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });
    
    test('calculates correct duration for 1 minute ago', () => {
      const startDate = NOW - MINUTE;
      const result = calculateStreakFromStart(startDate);
      
      expect(result.totalSeconds).toBe(60);
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(1);
      expect(result.seconds).toBe(0);
    });
    
    test('handles future start date (clamps to 0)', () => {
      const startDate = NOW + DAY;
      const result = calculateStreakFromStart(startDate);
      
      expect(result.totalSeconds).toBe(0);
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });
    
    test('calculates complex duration (15d 4h 23m 15s)', () => {
      const duration = (15 * DAY) + (4 * HOUR) + (23 * MINUTE) + (15 * SECOND);
      const startDate = NOW - duration;
      const result = calculateStreakFromStart(startDate);
      
      // 15 * 86400 + 4 * 3600 + 23 * 60 + 15 = 1296000 + 14400 + 1380 + 15 = 1311795
      expect(result.totalSeconds).toBe(1311795);
      expect(result.days).toBe(15);
      expect(result.hours).toBe(4);
      expect(result.minutes).toBe(23);
      expect(result.seconds).toBe(15);
    });
  });

  describe('getTimeSince', () => {
    test('returns correct elapsed time in seconds', () => {
      const startDate = NOW - (60 * SECOND);
      const elapsed = getTimeSince(startDate);
      
      expect(elapsed).toBe(60);
    });
    
    test('returns 0 for current time', () => {
      const elapsed = getTimeSince(NOW);
      
      expect(elapsed).toBe(0);
    });
    
    test('handles negative elapsed time', () => {
      const startDate = NOW + (60 * SECOND);
      const elapsed = getTimeSince(startDate);
      
      expect(elapsed).toBe(-60);
    });
  });

  describe('parseStreakDisplay', () => {
    test('parses 0 seconds', () => {
      const result = parseStreakDisplay(0);
      
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.totalSeconds).toBe(0);
      expect(result.formatted).toBe('0s');
      expect(result.humanReadable).toBe('0 seconds');
    });
    
    test('parses 30 seconds', () => {
      const result = parseStreakDisplay(30);
      
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(30);
      expect(result.totalSeconds).toBe(30);
      expect(result.formatted).toBe('30s');
      expect(result.humanReadable).toBe('30 seconds');
    });
    
    test('parses 1 minute 30 seconds', () => {
      const result = parseStreakDisplay(90);
      
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(1);
      expect(result.seconds).toBe(30);
      expect(result.totalSeconds).toBe(90);
      expect(result.formatted).toBe('1m 30s');
      expect(result.humanReadable).toBe('1 minute, 30 seconds');
    });
    
    test('parses 1 hour 1 minute 1 second', () => {
      const result = parseStreakDisplay(3661);
      
      expect(result.days).toBe(0);
      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(1);
      expect(result.seconds).toBe(1);
      expect(result.totalSeconds).toBe(3661);
      expect(result.formatted).toBe('1h 1m 1s');
      expect(result.humanReadable).toBe('1 hour, 1 minute');
    });
    
    test('parses 1 day 1 hour 1 minute 1 second', () => {
      const result = parseStreakDisplay(90061);
      
      expect(result.days).toBe(1);
      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(1);
      expect(result.seconds).toBe(1);
      expect(result.totalSeconds).toBe(90061);
      expect(result.formatted).toBe('1d 1h 1m 1s');
      expect(result.humanReadable).toBe('1 day, 1 hour, 1 minute');
    });
    
    test('parses 7 days (milestone)', () => {
      const result = parseStreakDisplay(7 * 24 * 3600);
      
      expect(result.days).toBe(7);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.totalSeconds).toBe(604800);
      expect(result.formatted).toBe('7d 0h 0m 0s');
      expect(result.humanReadable).toBe('7 days');
    });
    
    test('clamps negative seconds to 0', () => {
      const result = parseStreakDisplay(-100);
      
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.totalSeconds).toBe(0);
    });
  });

  describe('formatStreakTime', () => {
    test('formats 0 seconds', () => {
      expect(formatStreakTime(0)).toBe('0s');
    });
    
    test('formats 45 seconds', () => {
      expect(formatStreakTime(45)).toBe('45s');
    });
    
    test('formats 1 minute 30 seconds', () => {
      expect(formatStreakTime(90)).toBe('1m 30s');
    });
    
    test('formats 1 hour', () => {
      expect(formatStreakTime(3600)).toBe('1h 0m 0s');
    });
    
    test('formats 1 day', () => {
      expect(formatStreakTime(86400)).toBe('1d 0h 0m 0s');
    });
    
    test('formats complex duration', () => {
      expect(formatStreakTime(90061)).toBe('1d 1h 1m 1s');
    });
    
    test('clamps negative seconds to 0s', () => {
      expect(formatStreakTime(-100)).toBe('0s');
    });
  });

  describe('formatHumanReadable', () => {
    test('formats 0 seconds', () => {
      expect(formatHumanReadable(0, 0, 0, 0)).toBe('0 seconds');
    });
    
    test('formats 30 seconds', () => {
      expect(formatHumanReadable(0, 0, 0, 30)).toBe('30 seconds');
    });
    
    test('formats 1 second (singular)', () => {
      expect(formatHumanReadable(0, 0, 0, 1)).toBe('1 second');
    });
    
    test('formats 1 minute 30 seconds', () => {
      expect(formatHumanReadable(0, 0, 1, 30)).toBe('1 minute, 30 seconds');
    });
    
    test('formats 2 minutes (plural)', () => {
      expect(formatHumanReadable(0, 0, 2, 0)).toBe('2 minutes');
    });
    
    test('formats 1 hour (does not show seconds)', () => {
      expect(formatHumanReadable(0, 1, 0, 30)).toBe('1 hour');
    });
    
    test('formats 1 day (does not show seconds)', () => {
      expect(formatHumanReadable(1, 0, 0, 30)).toBe('1 day');
    });
    
    test('formats 1 day 1 hour 1 minute', () => {
      expect(formatHumanReadable(1, 1, 1, 1)).toBe('1 day, 1 hour, 1 minute');
    });
    
    test('formats 7 days (plural)', () => {
      expect(formatHumanReadable(7, 0, 0, 0)).toBe('7 days');
    });
  });

  describe('formatDays', () => {
    test('formats 0 seconds as 0 days', () => {
      expect(formatDays(0)).toBe('0 days');
    });
    
    test('formats 1 day (singular)', () => {
      expect(formatDays(86400)).toBe('1 day');
    });
    
    test('formats 7 days (plural)', () => {
      expect(formatDays(604800)).toBe('7 days');
    });
    
    test('formats partial day (rounds down)', () => {
      expect(formatDays(86400 + 3600)).toBe('1 day');
    });
  });

  describe('getNextMilestone', () => {
    test('returns 1 day for 0 seconds', () => {
      expect(getNextMilestone(0)).toBe(1);
    });
    
    test('returns 1 day for 12 hours', () => {
      expect(getNextMilestone(43200)).toBe(1);
    });
    
    test('returns 3 days after 1 day milestone', () => {
      expect(getNextMilestone(86400)).toBe(3);
    });
    
    test('returns 7 days after 3 days milestone', () => {
      expect(getNextMilestone(259200)).toBe(7);
    });
    
    test('returns null after max milestone (365 days)', () => {
      expect(getNextMilestone(365 * 86400)).toBeNull();
    });
    
    test('verifies all milestones are reachable', () => {
      const milestones = MILESTONE_DAYS;
      expect(milestones).toEqual([1, 3, 7, 14, 30, 60, 90, 180, 365]);
      
      // Test progression
      expect(getNextMilestone(0)).toBe(1);
      expect(getNextMilestone(1 * 86400)).toBe(3);
      expect(getNextMilestone(3 * 86400)).toBe(7);
      expect(getNextMilestone(7 * 86400)).toBe(14);
      expect(getNextMilestone(14 * 86400)).toBe(30);
      expect(getNextMilestone(30 * 86400)).toBe(60);
      expect(getNextMilestone(60 * 86400)).toBe(90);
      expect(getNextMilestone(90 * 86400)).toBe(180);
      expect(getNextMilestone(180 * 86400)).toBe(365);
      expect(getNextMilestone(365 * 86400)).toBeNull();
    });
  });

  describe('getMilestoneProgress', () => {
    test('returns 0% at start of journey', () => {
      expect(getMilestoneProgress(0)).toBe(0);
    });
    
    test('returns 50% halfway to 1 day milestone', () => {
      const progress = getMilestoneProgress(43200); // 12 hours
      expect(progress).toBeCloseTo(50, 1);
    });
    
    test('returns 0% at 1 day milestone (progress to next milestone starts)', () => {
      // When you've just reached 1 day, progress to the NEXT milestone (3 days) is 0%
      const progress = getMilestoneProgress(86400);
      expect(progress).toBe(0);
    });
    
    test('calculates progress between 1 day and 3 days', () => {
      const progress = getMilestoneProgress(86400 + 43200); // 1.5 days
      // Range is 2 days (1 to 3), progress is 0.5 days
      expect(progress).toBeCloseTo(25, 1); // 0.5 / 2 = 25%
    });
    
    test('returns 100% after max milestone', () => {
      expect(getMilestoneProgress(400 * 86400)).toBe(100);
    });
    
    test('never returns negative progress', () => {
      const progress = getMilestoneProgress(-100);
      expect(progress).toBeGreaterThanOrEqual(0);
    });
    
    test('never returns progress > 100%', () => {
      const progress = getMilestoneProgress(1000 * 86400);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });
});

