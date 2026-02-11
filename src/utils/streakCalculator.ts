import { getToday, addDays } from './datetime';

export interface StreakResult {
  current: number;
  longest: number;
}

export function calculateStreak(completedDates: string[]): StreakResult {
  if (completedDates.length === 0) return { current: 0, longest: 0 };

  const sorted = [...new Set(completedDates)].sort().reverse();
  const today = getToday();
  const yesterday = addDays(today, -1);

  let current = 0;
  let longest = 0;

  // Check if current streak is active (practiced today or yesterday)
  if (sorted[0] === today || sorted[0] === yesterday) {
    current = 1;
    for (let i = 1; i < sorted.length; i++) {
      const expected = addDays(sorted[i - 1], -1);
      if (sorted[i] === expected) {
        current++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let tempStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const expected = addDays(sorted[i - 1], -1);
    if (sorted[i] === expected) {
      tempStreak++;
    } else {
      longest = Math.max(longest, tempStreak);
      tempStreak = 1;
    }
  }
  longest = Math.max(longest, tempStreak, current);

  return { current, longest };
}

export function getNextMilestone(currentStreak: number, milestones: readonly number[]): number | null {
  for (const milestone of milestones) {
    if (currentStreak < milestone) return milestone;
  }
  return null;
}

export function isMilestone(streak: number, milestones: readonly number[]): boolean {
  return milestones.includes(streak);
}
