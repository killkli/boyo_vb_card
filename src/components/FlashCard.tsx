import { useState } from 'react';
import type { FlashCardData } from '../types/vocabulary';

interface FlashCardProps {
  card: FlashCardData;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({ card, isFlipped, onFlip }: FlashCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="card-flip-container w-full h-full flex items-center justify-center px-4">
      <div
        className={`card-flip relative w-full max-w-md h-[85vh] max-h-[600px] cursor-pointer ${
          isFlipped ? 'flipped' : ''
        }`}
        onClick={onFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onFlip();
          }
        }}
        aria-label={isFlipped ? '點擊翻回正面' : '點擊翻卡查看英文'}
      >
        {/* Front Side - 中文意思 + 圖片 */}
        <div className="card-front absolute inset-0 rounded-xl md:rounded-2xl shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 flex flex-col items-center justify-between overflow-hidden">
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

          {/* Hint */}
          <div className="text-indigo-600 text-xs md:text-sm flex items-center gap-2 mt-3">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>點擊翻卡查看英文</span>
          </div>
        </div>

        {/* Back Side - 英文單字 + 詳細解釋 */}
        <div className="card-back absolute inset-0 rounded-xl md:rounded-2xl shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6 flex flex-col items-center justify-start overflow-y-auto">
          {/* English Word */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg px-6 py-4 md:px-8 md:py-6 mb-4 md:mb-6 w-full">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-center break-words">
              {card.word}
            </h2>
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
