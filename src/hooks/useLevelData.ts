import { useState, useEffect } from 'react';
import { loadLevelFlashCards } from '../utils/dataLoader';
import type { FlashCardData } from '../types/vocabulary';

export function useLevelData(level: number | null) {
  const [cards, setCards] = useState<FlashCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!level) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    loadLevelFlashCards(level)
      .then((data) => {
        if (mounted) {
          setCards(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [level]);

  return { cards, loading, error };
}
