import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FlashCard } from '../components/FlashCard';
import { useLevelData } from '../hooks/useLevelData';
import { useFlashCards } from '../hooks/useFlashCards';

export function Learn() {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const levelNum = level ? parseInt(level, 10) : null;

  const { cards, loading, error } = useLevelData(levelNum);
  const {
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
  } = useFlashCards(cards);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          flipCard();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousCard();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextCard();
          break;
        case 'Escape':
          navigate('/');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipCard, nextCard, previousCard, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-base md:text-lg">載入單字資料中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-md mx-auto">
          <svg
            className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">載入失敗</h2>
          <p className="text-gray-600 text-sm md:text-base mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm md:text-base"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 text-base md:text-lg mb-4">沒有找到單字資料</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* 簡潔的返回按鈕 - 左上角 */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow-lg hover:shadow-xl transition-all text-gray-700 hover:text-indigo-600 hover:scale-110"
        aria-label="返回首頁"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </button>

      {/* 進度顯示 - 右上角 */}
      <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur px-3 py-2 md:px-4 md:py-2 rounded-full shadow-lg text-xs md:text-sm font-medium text-gray-700">
        <span className="hidden sm:inline">Level {levelNum} • </span>
        {currentIndex + 1} / {totalCards}
      </div>

      {/* Flash Card - 填滿整個空間 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <FlashCard card={currentCard} isFlipped={isFlipped} onFlip={flipCard} isLoading={isImageLoading} />
      </div>

      {/* Navigation Controls - 底部中央，更緊湊 */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 md:gap-3 bg-white/90 backdrop-blur rounded-full shadow-lg px-2 py-2">
        {/* 上一張 */}
        <button
          onClick={previousCard}
          disabled={!hasPrevious || isImageLoading}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-indigo-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 hover:text-indigo-600 disabled:hover:text-gray-700 disabled:hover:bg-transparent"
          aria-label="上一張"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* 翻卡按鈕 */}
        <button
          onClick={flipCard}
          className="px-6 py-2 md:px-8 md:py-3 bg-indigo-600 text-white rounded-full shadow-md hover:shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105 text-sm md:text-base font-medium"
        >
          翻卡
        </button>

        {/* 下一張 */}
        <button
          onClick={nextCard}
          disabled={!hasNext || isImageLoading}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-indigo-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 hover:text-indigo-600 disabled:hover:text-gray-700 disabled:hover:bg-transparent"
          aria-label="下一張"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
