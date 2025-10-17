import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getDB } from '../utils/db';

interface LevelProgress {
  level: number;
  totalWords: number;
  learnedWords: number;
  newCount: number;
  learningCount: number;
  familiarCount: number;
  masteredCount: number;
  progressPercentage: number;
}

export function useLevelProgress(level: number): LevelProgress {
  const { currentUser } = useUser();
  const [progress, setProgress] = useState<LevelProgress>({
    level,
    totalWords: 0,
    learnedWords: 0,
    newCount: 0,
    learningCount: 0,
    familiarCount: 0,
    masteredCount: 0,
    progressPercentage: 0,
  });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    async function loadLevelProgress() {
      try {
        const db = await getDB();

        // Get all word progress for this user and level
        const allProgress = await db.getAllFromIndex('wordProgress', 'by-userId-level', [
          currentUser!.userId,
          level,
        ]);

        // Calculate statistics
        const stats = {
          level,
          totalWords: 0, // Will be set from manifest
          learnedWords: allProgress.length,
          newCount: allProgress.filter(p => p.proficiencyLevel === 'new').length,
          learningCount: allProgress.filter(p => p.proficiencyLevel === 'learning').length,
          familiarCount: allProgress.filter(p => p.proficiencyLevel === 'familiar').length,
          masteredCount: allProgress.filter(p => p.proficiencyLevel === 'mastered').length,
          progressPercentage: 0,
        };

        // Load level manifest to get total word count
        try {
          const response = await fetch(`${import.meta.env.BASE_URL}data/level_${level}_manifest.json`);
          if (response.ok) {
            const manifest = await response.json();
            stats.totalWords = manifest.totalWords || manifest.results?.length || 0;
            stats.progressPercentage = stats.totalWords > 0
              ? (stats.learnedWords / stats.totalWords) * 100
              : 0;
          }
        } catch (error) {
          console.error(`Failed to load manifest for level ${level}:`, error);
        }

        setProgress(stats);
      } catch (error) {
        console.error(`Failed to load progress for level ${level}:`, error);
      }
    }

    loadLevelProgress();
  }, [currentUser, level]);

  return progress;
}
