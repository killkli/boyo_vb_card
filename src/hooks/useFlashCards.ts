import { useState, useCallback, useEffect } from 'react';
import type { FlashCardData } from '../types/vocabulary';
import { preloadAdjacentImages } from '../utils/imagePreloader';

export function useFlashCards(cards: FlashCardData[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const currentCard = cards[currentIndex] || null;
  const totalCards = cards.length;
  const hasNext = currentIndex < totalCards - 1;
  const hasPrevious = currentIndex > 0;

  // Preload adjacent images whenever index changes
  useEffect(() => {
    if (cards.length > 0) {
      setIsImageLoading(true);
      preloadAdjacentImages(cards, currentIndex, 2).finally(() => {
        setIsImageLoading(false);
      });
    }
  }, [currentIndex, cards]);

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const nextCard = useCallback(() => {
    if (hasNext && !isImageLoading) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false); // Reset to front side
    }
  }, [hasNext, isImageLoading]);

  const previousCard = useCallback(() => {
    if (hasPrevious && !isImageLoading) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false); // Reset to front side
    }
  }, [hasPrevious, isImageLoading]);

  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < totalCards && !isImageLoading) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  }, [totalCards, isImageLoading]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  return {
    currentCard,
    currentIndex,
    totalCards,
    isFlipped,
    isImageLoading,
    hasNext,
    hasPrevious,
    flipCard,
    nextCard,
    previousCard,
    goToCard,
    reset,
  };
}
