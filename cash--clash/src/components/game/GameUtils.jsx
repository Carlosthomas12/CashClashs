// XP & Leveling System
export const XP_PER_LEVEL = 500;
export const MAX_LEVEL = 50;

export function getLevelFromXP(xp) {
  return Math.min(Math.floor((xp || 0) / XP_PER_LEVEL) + 1, MAX_LEVEL);
}

export function getXPForCurrentLevel(xp) {
  return (xp || 0) % XP_PER_LEVEL;
}

export function getXPProgress(xp) {
  return ((xp || 0) % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
}

export function getRankTitle(level) {
  if (level >= 40) return 'Cash Legend';
  if (level >= 30) return 'Money Master';
  if (level >= 20) return 'Budget Boss';
  if (level >= 15) return 'Savings Pro';
  if (level >= 10) return 'Smart Spender';
  if (level >= 5) return 'Penny Pincher';
  return 'Rookie Saver';
}

export function getRankColor(level) {
  if (level >= 40) return 'from-amber-400 to-yellow-500';
  if (level >= 30) return 'from-violet-500 to-purple-600';
  if (level >= 20) return 'from-blue-500 to-cyan-500';
  if (level >= 15) return 'from-emerald-500 to-green-500';
  if (level >= 10) return 'from-teal-400 to-emerald-500';
  if (level >= 5) return 'from-slate-400 to-slate-500';
  return 'from-stone-400 to-stone-500';
}

// XP Awards
export const XP_ACTIONS = {
  LOG_TRANSACTION: 10,
  STAY_UNDER_BUDGET: 50,
  DAILY_LOGIN: 5,
  WIN_CHALLENGE: 100,
  COMPLETE_CHALLENGE: 50,
  SAVE_10_PERCENT: 30,
  SAVE_20_PERCENT: 60,
  FIRST_TRANSACTION: 25,
  WEEK_STREAK: 75,
};

// Badges
export const ALL_BADGES = [
  { id: 'first_track', name: 'First Track', description: 'Log your first transaction', icon: '🎯', xpReward: 25, condition: (stats) => stats.totalTransactions >= 1 },
  { id: 'penny_wise', name: 'Penny Wise', description: 'Log 10 transactions', icon: '💰', xpReward: 50, condition: (stats) => stats.totalTransactions >= 10 },
  { id: 'budget_keeper', name: 'Budget Keeper', description: 'Stay under budget for a month', icon: '🛡️', xpReward: 100, condition: (stats) => stats.monthsUnderBudget >= 1 },
  { id: 'savings_starter', name: 'Savings Starter', description: 'Save $100 total', icon: '🌱', xpReward: 50, condition: (stats) => stats.totalSaved >= 100 },
  { id: 'savings_pro', name: 'Savings Pro', description: 'Save $500 total', icon: '🏆', xpReward: 150, condition: (stats) => stats.totalSaved >= 500 },
  { id: 'savings_legend', name: 'Savings Legend', description: 'Save $2,000 total', icon: '👑', xpReward: 300, condition: (stats) => stats.totalSaved >= 2000 },
  { id: 'streak_3', name: '3-Day Streak', description: 'Track spending 3 days in a row', icon: '🔥', xpReward: 30, condition: (stats) => stats.streakDays >= 3 },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day tracking streak', icon: '⚡', xpReward: 75, condition: (stats) => stats.streakDays >= 7 },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day tracking streak', icon: '🌟', xpReward: 200, condition: (stats) => stats.streakDays >= 30 },
  { id: 'clash_winner', name: 'Clash Victor', description: 'Win your first 1v1 challenge', icon: '⚔️', xpReward: 100, condition: (stats) => stats.challengesWon >= 1 },
  { id: 'clash_champ', name: 'Clash Champion', description: 'Win 5 challenges', icon: '🏅', xpReward: 250, condition: (stats) => stats.challengesWon >= 5 },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐', xpReward: 0, condition: (stats) => stats.level >= 5 },
  { id: 'level_10', name: 'Smart Spender', description: 'Reach level 10', icon: '💎', xpReward: 0, condition: (stats) => stats.level >= 10 },
  { id: 'level_20', name: 'Budget Boss', description: 'Reach level 20', icon: '🎖️', xpReward: 0, condition: (stats) => stats.level >= 20 },
  { id: 'diversified', name: 'Diversified', description: 'Track 5+ categories', icon: '🎨', xpReward: 40, condition: (stats) => stats.categoriesUsed >= 5 },
  { id: 'big_saver', name: 'Big Saver', description: 'Save 20% of income in a month', icon: '🚀', xpReward: 100, condition: (stats) => stats.savingsRate >= 20 },
];

export function getUnlockedBadges(earnedBadgeIds) {
  return ALL_BADGES.filter(b => (earnedBadgeIds || []).includes(b.id));
}

export function getLockedBadges(earnedBadgeIds) {
  return ALL_BADGES.filter(b => !(earnedBadgeIds || []).includes(b.id));
}