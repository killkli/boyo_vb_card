import { useState, useCallback } from 'react';
import type { FlashCardData } from '../types/vocabulary';

export function useFlashCards(cards: FlashCardData[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex] || null;
  const totalCards = cards.length;
  const hasNext = currentIndex < totalCards - 1;
  const hasPrevious = currentIndex > 0;

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const nextCard = useCallback(() => {
    if (hasNext) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false); // Reset to front side
    }
  }, [hasNext]);

  const previousCard = useCallback(() => {
    if (hasPrevious) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false); // Reset to front side
    }
  }, [hasPrevious]);

  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < totalCards) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  }, [totalCards]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  return {
    currentCard,
    currentIndex,
    totalCards,
    isFlipped,
    hasNext,
    hasPrevious,
    flipCard,
    nextCard,
    previousCard,
    goToCard,
    reset,
  };
}
