import { useState, useEffect, useCallback, useRef } from 'react';
import type { FlashCardData } from '../types/vocabulary';
import type { WordProgress } from '../types/learning';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useProgressTracking } from '../hooks/useProgressTracking';
import { useUser } from '../contexts/UserContext';
import { getWordProgress } from '../utils/progressTracking';
import { speakText, isTTSSupported } from '../utils/textToSpeech';
import { strictCompare } from '../utils/textNormalization';
import { ProficiencyBadge } from './ProficiencyBadge';

interface FlashCardProps {
  card: FlashCardData;
  level: number;
  isFlipped: boolean;
  onFlip: () => void;
  isLoading?: boolean;
}

export function FlashCard({ card, level, isFlipped, onFlip, isLoading = false }: FlashCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [streakMilestone, setStreakMilestone] = useState(0);
  const [ttsSupported] = useState(isTTSSupported());
  const [inputMode, setInputMode] = useState<'speech' | 'keyboard'>('speech');
  const [keyboardInput, setKeyboardInput] = useState('');
  const [wordProgress, setWordProgress] = useState<WordProgress | null>(null);
  const isFlippedRef = useRef(isFlipped);
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useUser();
  const { trackAttempt, isReady } = useProgressTracking();

  // Update ref when isFlipped changes
  useEffect(() => {
    isFlippedRef.current = isFlipped;
  }, [isFlipped]);

  // Load word progress when card changes
  useEffect(() => {
    async function loadProgress() {
      if (currentUser) {
        const progress = await getWordProgress(currentUser.userId, String(card.id), level);
        setWordProgress(progress || null);
      }
    }
    loadProgress();
  }, [card.id, level, currentUser]);

  // Check for streak milestones
  const checkStreakMilestone = useCallback((progress: WordProgress) => {
    const streak = progress.correctStreak;
    const milestones = [3, 5, 10, 20, 50];

    for (const milestone of milestones) {
      if (streak === milestone) {
        setStreakMilestone(milestone);
        setShowStreakCelebration(true);

        // Auto-hide celebration after 3 seconds
        setTimeout(() => {
          setShowStreakCelebration(false);
        }, 3000);
        break;
      }
    }
  }, []);

  // Reset states when card changes
  useEffect(() => {
    setShowSuccess(false);
    setShowError(false);
    setImageLoaded(false);
    setImageError(false);
    setKeyboardInput('');

    // Clear any pending flip timeout
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = null;
    }
  }, [card.id]);

  // Handle successful speech recognition match
  const handleMatch = useCallback(() => {
    // Only proceed if card is not flipped and no success animation is showing
    if (isFlippedRef.current || showSuccess) {
      return;
    }

    // Track progress - speech recognition correct answer
    if (isReady) {
      trackAttempt(String(card.id), card.word, level, true, 'speech').then(async (progress) => {
        if (progress) {
          setWordProgress(progress);
          checkStreakMilestone(progress);
        }
      }).catch(err => {
        console.error('Failed to track speech attempt:', err);
      });
    }

    setShowSuccess(true);

    // Clear any existing timeout
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
    }

    // Trigger flip after animation
    flipTimeoutRef.current = setTimeout(() => {
      if (!isFlippedRef.current) {
        onFlip();
      }
      // Clear success state after flip
      flipTimeoutRef.current = setTimeout(() => {
        setShowSuccess(false);
        flipTimeoutRef.current = null;
      }, 100);
    }, 1500);
  }, [onFlip, showSuccess, card.id, card.word, level, isReady, trackAttempt]);

  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    toggleListening,
  } = useSpeechRecognition({
    targetWord: card.word,
    onMatch: handleMatch,
  });

  // Stop listening when card flips or changes
  useEffect(() => {
    if (isFlipped && isListening) {
      toggleListening();
    }
  }, [isFlipped, isListening, toggleListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) {
        clearTimeout(flipTimeoutRef.current);
      }
    };
  }, []);

  // Handle keyboard input submission
  const handleKeyboardSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!keyboardInput.trim() || isFlippedRef.current || showSuccess) {
      return;
    }

    // Strict comparison for keyboard input
    const isCorrect = strictCompare(keyboardInput, card.word);

    // Track progress - keyboard input attempt
    if (isReady) {
      trackAttempt(String(card.id), card.word, level, isCorrect, 'keyboard').then(async (progress) => {
        if (progress) {
          setWordProgress(progress);
          if (isCorrect) {
            checkStreakMilestone(progress);
          }
        }
      }).catch(err => {
        console.error('Failed to track keyboard attempt:', err);
      });
    }

    if (isCorrect) {
      // Correct answer
      setShowSuccess(true);
      setKeyboardInput('');

      // Clear any existing timeout
      if (flipTimeoutRef.current) {
        clearTimeout(flipTimeoutRef.current);
      }

      // Trigger flip after animation
      flipTimeoutRef.current = setTimeout(() => {
        if (!isFlippedRef.current) {
          onFlip();
        }
        // Clear success state after flip
        flipTimeoutRef.current = setTimeout(() => {
          setShowSuccess(false);
          flipTimeoutRef.current = null;
        }, 100);
      }, 1500);
    } else {
      // Wrong answer - show error feedback
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 1000);
    }
  }, [keyboardInput, card.word, card.id, level, onFlip, showSuccess, isReady, trackAttempt]);

  // Handle pronunciation on back side
  const handleSpeak = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(card.word, 'en-US');
  }, [card.word]);

  // Handle input mode toggle
  const toggleInputMode = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setInputMode(prev => prev === 'speech' ? 'keyboard' : 'speech');
    setKeyboardInput('');
  }, []);

  // Handle card click with protection during success animation
  const handleCardClick = useCallback(() => {
    if (!showSuccess && !isLoading) {
      onFlip();
    }
  }, [showSuccess, isLoading, onFlip]);

  // Get proficiency border color
  const getProficiencyBorderColor = () => {
    if (!wordProgress) return '';

    switch (wordProgress.proficiencyLevel) {
      case 'new':
        return 'ring-4 ring-gray-300/50';
      case 'learning':
        return 'ring-4 ring-yellow-400/50';
      case 'familiar':
        return 'ring-4 ring-green-400/50';
      case 'mastered':
        return 'ring-4 ring-purple-500/50';
      default:
        return '';
    }
  };

  return (
    <div className="card-flip-container w-full h-full flex items-center justify-center px-4">
      <div
        className={`card-flip relative w-full max-w-md h-[85vh] max-h-[600px] ${
          showSuccess || isLoading ? 'cursor-default' : 'cursor-pointer'
        } ${isFlipped ? 'flipped' : ''} ${getProficiencyBorderColor()}`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !showSuccess && !isLoading) {
            e.preventDefault();
            onFlip();
          }
        }}
        aria-label={isFlipped ? '點擊翻回正面' : '點擊翻卡查看英文'}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm md:text-base font-medium">載入中...</p>
            </div>
          </div>
        )}

        {/* Success overlay */}
        {showSuccess && (
          <div className="absolute inset-0 z-40 bg-green-500/90 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white text-2xl md:text-3xl font-bold">答對了！🎉</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {showError && (
          <div className="absolute inset-0 z-40 bg-red-500/90 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-white text-2xl md:text-3xl font-bold">再試一次！</p>
            </div>
          </div>
        )}

        {/* Streak Celebration overlay */}
        {showStreakCelebration && (
          <div className="absolute inset-0 z-50 bg-gradient-to-br from-yellow-400/95 to-orange-500/95 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center animate-bounce">
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl md:text-8xl animate-spin-slow">🎉</div>
              <div className="text-center">
                <p className="text-white text-3xl md:text-4xl font-bold mb-2">
                  連續答對 {streakMilestone} 次！
                </p>
                <p className="text-white text-xl md:text-2xl font-semibold">
                  {streakMilestone >= 20 ? '太厲害了！🏆' : streakMilestone >= 10 ? '真棒！⭐' : '繼續加油！🔥'}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-4xl animate-bounce" style={{ animationDelay: '0ms' }}>🎊</span>
                <span className="text-4xl animate-bounce" style={{ animationDelay: '100ms' }}>✨</span>
                <span className="text-4xl animate-bounce" style={{ animationDelay: '200ms' }}>🌟</span>
              </div>
            </div>
          </div>
        )}

        {/* Front Side - 中文意思 + 圖片 */}
        <div className="card-front absolute inset-0 rounded-xl md:rounded-2xl shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 flex flex-col items-center justify-between overflow-hidden">
          {/* Proficiency Badge - Top Right Corner */}
          {wordProgress && (
            <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10">
              <ProficiencyBadge level={wordProgress.proficiencyLevel} size="small" />
            </div>
          )}

          {/* Image - 佔更大空間 */}
          <div className="flex-1 flex items-center justify-center w-full min-h-0">
            {!imageError ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={card.imagePath}
                  alt={card.meaning}
                  className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <svg
                  className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm">圖片載入失敗</p>
              </div>
            )}
          </div>

          {/* Chinese Meaning */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg px-4 py-3 md:px-6 md:py-4 mt-4 w-full">
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 text-center break-words">
              {card.meaning}
            </p>
          </div>

          {/* Input Controls - Speech or Keyboard */}
          <div className="w-full flex flex-col items-center gap-3 mt-3">
            {/* Mode Toggle Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleInputMode}
                className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                {inputMode === 'speech' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    切換到鍵盤輸入
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    切換到語音輸入
                  </>
                )}
              </button>
            </div>

            {/* Speech Recognition Mode */}
            {inputMode === 'speech' && speechSupported && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleListening();
                  }}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-indigo-500 hover:bg-indigo-600'
                  }`}
                  aria-label={isListening ? '停止錄音' : '開始語音辨識'}
                >
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                <div className="text-center">
                  {isListening ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-red-600 text-sm md:text-base font-semibold">🎤 正在聽...</p>
                      {transcript && (
                        <p className="text-gray-600 text-xs md:text-sm">聽到: {transcript}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-indigo-600 text-xs md:text-sm">點擊麥克風說出英文單字</p>
                  )}
                </div>
              </>
            )}

            {/* Keyboard Input Mode */}
            {inputMode === 'keyboard' && (
              <form onSubmit={handleKeyboardSubmit} className="w-full px-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={keyboardInput}
                      onChange={(e) => setKeyboardInput(e.target.value)}
                      placeholder="輸入英文單字..."
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-indigo-300 focus:border-indigo-500 focus:outline-none text-base md:text-lg"
                      autoComplete="off"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!keyboardInput.trim()}
                    >
                      送出
                    </button>
                  </div>
                  <p className="text-indigo-600 text-xs md:text-sm text-center">⌨️ 請輸入完整拼字（區分大小寫）</p>
                </div>
              </form>
            )}
          </div>

          {/* Hint */}
          <div className="text-indigo-600 text-xs md:text-sm flex items-center gap-2 mt-2">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>或點擊卡片查看英文</span>
          </div>
        </div>

        {/* Back Side - 英文單字 + 詳細解釋 */}
        <div className="card-back absolute inset-0 rounded-xl md:rounded-2xl shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6 flex flex-col items-center justify-start overflow-y-auto">
          {/* English Word with Pronunciation */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg px-6 py-4 md:px-8 md:py-6 mb-4 md:mb-6 w-full">
            <div className="flex items-center justify-center gap-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-center break-words">
                {card.word}
              </h2>
              {ttsSupported && (
                <button
                  onClick={handleSpeak}
                  className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
                  aria-label="發音"
                  title="點擊發音"
                >
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Detailed Explanation Section */}
          <div className="w-full space-y-3 md:space-y-4 flex-1">
            {/* 詳細解釋 */}
            <div className="bg-white rounded-lg shadow p-3 md:p-4">
              <div className="flex items-start gap-2 md:gap-3">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-700 text-sm md:text-base mb-1 md:mb-2">📖 詳細解釋:</h3>
                  <p className="text-gray-600 text-sm md:text-base break-words">
                    {card.meaning}
                  </p>
                </div>
              </div>
            </div>

            {/* 例句 (簡單範例) */}
            <div className="bg-white rounded-lg shadow p-3 md:p-4">
              <div className="flex items-start gap-2 md:gap-3">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-700 text-sm md:text-base mb-1 md:mb-2">📝 例句:</h3>
                  <p className="text-gray-600 text-sm md:text-base italic mb-1 break-words">
                    "I use <span className="font-semibold text-green-700">{card.word}</span> every day."
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm break-words">
                    「我每天都使用{card.meaning}」
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hint */}
          <div className="text-green-600 text-xs md:text-sm flex items-center gap-2 mt-3 md:mt-4">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            <span>點擊翻回正面</span>
          </div>
        </div>
      </div>
    </div>
  );
}
