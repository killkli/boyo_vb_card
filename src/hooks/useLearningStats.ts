import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getLearningStats } from '../utils/progressTracking';

export function useLearningStats() {
  const { currentUser } = useUser();
  const [stats, setStats] = useState({
    totalWords: 0,
    new: 0,
    learning: 0,
    familiar: 0,
    mastered: 0,
    totalAttempts: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    averageAccuracy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadStats() {
      try {
        const userStats = await getLearningStats(currentUser!.userId);
        if (mounted) {
          setStats(userStats);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load learning stats:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const refresh = async () => {
    if (!currentUser) return;

    try {
      const userStats = await getLearningStats(currentUser.userId);
      setStats(userStats);
    } catch (error) {
      console.error('Failed to refresh learning stats:', error);
    }
  };

  return { stats, loading, refresh };
}
