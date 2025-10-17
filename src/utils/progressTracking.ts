import type { WordProgress, ProficiencyLevel, InputMethod, LearningHistory, DailyStats } from '../types/learning';
import { getDB } from './db';

/**
 * Calculate next review time based on proficiency level (spaced repetition)
 */
export function calculateNextReview(proficiencyLevel: ProficiencyLevel, correctStreak: number): Date {
  const now = new Date();
  let hoursToAdd = 0;

  switch (proficiencyLevel) {
    case 'new':
      hoursToAdd = 1; // Review in 1 hour
      break;
    case 'learning':
      hoursToAdd = 4 + correctStreak * 2; // 4, 6, 8, 10... hours
      break;
    case 'familiar':
      hoursToAdd = 24 + correctStreak * 12; // 1, 1.5, 2 days...
      break;
    case 'mastered':
      hoursToAdd = 168 + correctStreak * 168; // 1, 2, 3... weeks
      break;
  }

  return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
}

/**
 * Determine proficiency level based on performance
 */
export function determineProficiencyLevel(
  correctCount: number,
  incorrectCount: number,
  correctStreak: number
): ProficiencyLevel {
  const totalAttempts = correctCount + incorrectCount;
  const accuracy = totalAttempts > 0 ? correctCount / totalAttempts : 0;

  // Mastered: 90%+ accuracy, 5+ correct streak, 10+ total attempts
  if (accuracy >= 0.9 && correctStreak >= 5 && totalAttempts >= 10) {
    return 'mastered';
  }

  // Familiar: 75%+ accuracy, 3+ correct streak, 6+ total attempts
  if (accuracy >= 0.75 && correctStreak >= 3 && totalAttempts >= 6) {
    return 'familiar';
  }

  // Learning: has some attempts
  if (totalAttempts >= 2) {
    return 'learning';
  }

  // New: first time or very few attempts
  return 'new';
}

/**
 * Record a learning attempt for a word
 */
export async function recordAttempt(
  userId: string,
  wordId: string,
  word: string,
  level: number,
  isCorrect: boolean,
  inputMethod: InputMethod
): Promise<WordProgress> {
  const db = await getDB();
  const progressId = `${userId}_${level}_${wordId}`;

  // Get existing progress or create new
  let progress = await db.get('wordProgress', progressId);
  const now = new Date();

  if (!progress) {
    // Create new progress entry
    progress = {
      id: progressId,
      userId,
      wordId,
      word,
      level,
      totalAttempts: 0,
      correctCount: 0,
      incorrectCount: 0,
      proficiencyLevel: 'new',
      firstLearnedAt: now,
      lastReviewedAt: now,
      nextReviewAt: calculateNextReview('new', 0),
      correctStreak: 0,
      inputMethods: {
        speech: { correct: 0, incorrect: 0 },
        keyboard: { correct: 0, incorrect: 0 },
      },
    };
  }

  // Update statistics
  progress.totalAttempts += 1;
  progress.lastReviewedAt = now;

  if (isCorrect) {
    progress.correctCount += 1;
    progress.correctStreak += 1;
    progress.inputMethods[inputMethod].correct += 1;
  } else {
    progress.incorrectCount += 1;
    progress.correctStreak = 0; // Reset streak on incorrect answer
    progress.inputMethods[inputMethod].incorrect += 1;
  }

  // Recalculate proficiency level
  progress.proficiencyLevel = determineProficiencyLevel(
    progress.correctCount,
    progress.incorrectCount,
    progress.correctStreak
  );

  // Calculate next review time
  progress.nextReviewAt = calculateNextReview(progress.proficiencyLevel, progress.correctStreak);

  // Save to database
  await db.put('wordProgress', progress);

  // Record individual learning attempt
  const attempt: LearningHistory = {
    id: `${progressId}_${now.getTime()}`,
    userId,
    wordId,
    word,
    level,
    timestamp: now,
    isCorrect,
    inputMethod,
  };
  await db.add('learningHistory', attempt);

  // Update daily stats
  await updateDailyStats(userId, isCorrect);

  // Update user profile total words learned
  await updateUserStats(userId);

  return progress;
}

/**
 * Update daily statistics
 */
async function updateDailyStats(userId: string, isCorrect: boolean): Promise<void> {
  const db = await getDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateKey = today.toISOString().split('T')[0];
  const statsId = `${userId}_${dateKey}`;

  let stats = await db.get('dailyStats', statsId);

  if (!stats) {
    stats = {
      id: statsId,
      userId,
      date: dateKey,
      totalWords: 0,
      newWords: 0,
      reviewWords: 0,
      correctCount: 0,
      incorrectCount: 0,
      studyTime: 0,
      levels: [],
    };
  }

  stats.totalWords += 1;
  if (isCorrect) {
    stats.correctCount += 1;
  } else {
    stats.incorrectCount += 1;
  }

  await db.put('dailyStats', stats);
}

/**
 * Update user profile statistics
 */
async function updateUserStats(userId: string): Promise<void> {
  const db = await getDB();
  const profile = await db.get('userProfiles', userId);

  if (!profile) return;

  // Count unique words with at least one correct answer
  const allProgress = await db.getAllFromIndex('wordProgress', 'by-userId', userId);
  const wordsLearned = allProgress.filter(p => p.correctCount > 0).length;

  // Calculate streak
  const streak = await calculateStreak(userId);

  profile.totalWordsLearned = wordsLearned;
  profile.currentStreak = streak.current;
  profile.longestStreak = Math.max(profile.longestStreak, streak.current);

  await db.put('userProfiles', profile);
}

/**
 * Calculate learning streak (consecutive days)
 */
async function calculateStreak(userId: string): Promise<{ current: number; longest: number }> {
  const db = await getDB();
  const allStats = await db.getAllFromIndex('dailyStats', 'by-userId', userId);

  if (allStats.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Sort by date descending (YYYY-MM-DD format sorts lexicographically)
  const sorted = allStats.sort((a, b) => b.date.localeCompare(a.date));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let previousDateStr: string | null = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  for (const stat of sorted) {
    if (!previousDateStr) {
      // First entry - check if it's today
      if (stat.date === todayStr) {
        currentStreak = 1;
        tempStreak = 1;
      }
      previousDateStr = stat.date;
      continue;
    }

    // Calculate day difference between consecutive dates
    const prevDate = new Date(previousDateStr);
    const statDate = new Date(stat.date);
    const dayDiff = Math.round((prevDate.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      // Consecutive day
      tempStreak += 1;
      if (currentStreak > 0) {
        currentStreak += 1;
      }
    } else {
      // Streak broken
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
      currentStreak = 0;
    }

    previousDateStr = stat.date;
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Get word progress for a specific word
 */
export async function getWordProgress(
  userId: string,
  wordId: string,
  level: number
): Promise<WordProgress | undefined> {
  const db = await getDB();
  const progressId = `${userId}_${level}_${wordId}`;
  return db.get('wordProgress', progressId);
}

/**
 * Get all progress for a user
 */
export async function getUserProgress(userId: string): Promise<WordProgress[]> {
  const db = await getDB();
  return db.getAllFromIndex('wordProgress', 'by-userId', userId);
}

/**
 * Get words due for review
 */
export async function getWordsForReview(userId: string, limit: number = 20): Promise<WordProgress[]> {
  const db = await getDB();
  const allProgress = await db.getAllFromIndex('wordProgress', 'by-userId', userId);
  const now = new Date();

  // Filter words that are due for review
  const dueWords = allProgress.filter(p => p.nextReviewAt <= now);

  // Sort by priority: new words first, then by next review time
  dueWords.sort((a, b) => {
    if (a.proficiencyLevel === 'new' && b.proficiencyLevel !== 'new') return -1;
    if (a.proficiencyLevel !== 'new' && b.proficiencyLevel === 'new') return 1;
    return a.nextReviewAt.getTime() - b.nextReviewAt.getTime();
  });

  return dueWords.slice(0, limit);
}

/**
 * Get learning statistics for a user
 */
export async function getLearningStats(userId: string) {
  const db = await getDB();
  const allProgress = await getUserProgress(userId);

  const stats = {
    totalWords: allProgress.length,
    new: allProgress.filter(p => p.proficiencyLevel === 'new').length,
    learning: allProgress.filter(p => p.proficiencyLevel === 'learning').length,
    familiar: allProgress.filter(p => p.proficiencyLevel === 'familiar').length,
    mastered: allProgress.filter(p => p.proficiencyLevel === 'mastered').length,
    totalAttempts: allProgress.reduce((sum, p) => sum + p.totalAttempts, 0),
    correctAnswers: allProgress.reduce((sum, p) => sum + p.correctCount, 0),
    incorrectAnswers: allProgress.reduce((sum, p) => sum + p.incorrectCount, 0),
    averageAccuracy: 0,
  };

  if (stats.totalAttempts > 0) {
    stats.averageAccuracy = (stats.correctAnswers / stats.totalAttempts) * 100;
  }

  return stats;
}
