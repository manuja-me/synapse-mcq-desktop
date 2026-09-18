// Gamification & Reward Engine: Scoring, Multipliers, Streaks, and Achievements

export interface RewardResult {
  isCorrect: boolean;
  pointsEarned: number;
  basePoints: number;
  streakMultiplier: number;
  speedBonus: number;
  newStreak: number;
  milestoneReached?: string;
  comboTitle?: string;
}

export const BASE_CORRECT_POINTS = 100;
export const SPEED_BONUS_THRESHOLD_SECONDS = 15;
export const SPEED_BONUS_POINTS = 25;

/**
 * Calculates reward points, streak multiplier, and milestone achievements
 */
export function calculateReward(
  isCorrect: boolean,
  currentStreak: number,
  timeSpentSeconds: number = 0
): RewardResult {
  if (!isCorrect) {
    return {
      isCorrect: false,
      pointsEarned: 0,
      basePoints: 0,
      streakMultiplier: 1.0,
      speedBonus: 0,
      newStreak: 0,
    };
  }

  const newStreak = currentStreak + 1;
  let streakMultiplier = 1.0;
  let comboTitle: string | undefined;

  if (newStreak >= 10) {
    streakMultiplier = 2.0;
    comboTitle = 'HYPER-ACCURACY 10X';
  } else if (newStreak >= 5) {
    streakMultiplier = 1.5;
    comboTitle = 'ON FIRE 5X';
  } else if (newStreak >= 3) {
    streakMultiplier = 1.25;
    comboTitle = 'COMBO 3X';
  }

  // Speed bonus if answered in under 15 seconds
  const speedBonus =
    timeSpentSeconds > 0 && timeSpentSeconds <= SPEED_BONUS_THRESHOLD_SECONDS
      ? SPEED_BONUS_POINTS
      : 0;

  const pointsEarned = Math.round(BASE_CORRECT_POINTS * streakMultiplier) + speedBonus;

  // Check for milestone notifications
  let milestoneReached: string | undefined;
  if (newStreak === 3) {
    milestoneReached = '3-STREAK COMBO UNLOCKED!';
  } else if (newStreak === 5) {
    milestoneReached = '5-STREAK FIREWALL BREACHED!';
  } else if (newStreak === 10) {
    milestoneReached = '10-STREAK MASTER OF KNOWLEDGE!';
  } else if (newStreak % 10 === 0 && newStreak > 10) {
    milestoneReached = `${newStreak}-STREAK UNSTOPPABLE DOMINANCE!`;
  }

  return {
    isCorrect: true,
    pointsEarned,
    basePoints: BASE_CORRECT_POINTS,
    streakMultiplier,
    speedBonus,
    newStreak,
    milestoneReached,
    comboTitle,
  };
}

/**
 * Get visual badge colors based on streak level
 */
export function getStreakBadgeConfig(streak: number): {
  colorClass: string;
  bgClass: string;
  borderClass: string;
  label: string;
} {
  if (streak >= 10) {
    return {
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10',
      borderClass: 'border-cyan-500',
      label: 'GODLIKE',
    };
  }
  if (streak >= 5) {
    return {
      colorClass: 'text-orange-400',
      bgClass: 'bg-orange-500/10',
      borderClass: 'border-orange-500',
      label: 'ON FIRE',
    };
  }
  if (streak >= 3) {
    return {
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-500',
      label: 'COMBO',
    };
  }
  if (streak >= 1) {
    return {
      colorClass: 'text-[#10B981]',
      bgClass: 'bg-[#10B981]/10',
      borderClass: 'border-[#10B981]/40',
      label: 'STREAK',
    };
  }
  return {
    colorClass: 'text-zinc-500',
    bgClass: 'bg-[#18181B]',
    borderClass: 'border-[#27272A]',
    label: 'NO STREAK',
  };
}
