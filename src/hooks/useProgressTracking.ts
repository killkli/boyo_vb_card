import { useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { recordAttempt } from '../utils/progressTracking';
import type { InputMethod } from '../types/learning';

/**
 * Hook for tracking learning progress
 */
export function useProgressTracking() {
  const { currentUser } = useUser();

  const trackAttempt = useCallback(
    async (
      wordId: string,
      word: string,
      level: number,
      isCorrect: boolean,
      inputMethod: InputMethod
    ) => {
      if (!currentUser) {
        console.warn('No current user - cannot track progress');
        return null;
      }

      try {
        const progress = await recordAttempt(
          currentUser.userId,
          wordId,
          word,
          level,
          isCorrect,
          inputMethod
        );
        return progress;
      } catch (error) {
        console.error('Failed to track attempt:', error);
        return null;
      }
    },
    [currentUser]
  );

  return {
    trackAttempt,
    isReady: !!currentUser,
  };
}
